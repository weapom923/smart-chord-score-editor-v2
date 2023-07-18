import { Score } from './Score';
import { Bar } from './Bar';
import { bb } from './BarBreak';
import { BarLine, bl } from './BarLine';
import { cl } from './Clef';
import { Chord } from './Chord';
import { Scale } from './Scale';
import { Note } from './Note';
import { NoteValue, nv } from './NoteValue';
import { Section } from './Section';
import { PartInBar } from './PartInBar';
import chordTextParser from './chordTextParser';
import { bre } from './BarRepeatEnding';
import { ScoreMetadata } from './ScoreMetadata';
import { raw } from './utils';

namespace ScoreTextParser {
  export const ParseError = class extends Error {};

  export const separatorTextToBarLinesMap = new Map<string, BarLine[]>([
    [ ':||:', [ bl.start.repeatStart, bl.end.repeatEnd ] ],
    [ '||:',  [ bl.start.repeatStart ] ],
    [ ':||',  [ bl.end.repeatEnd ] ],
    [ '||',   [ bl.end.double ] ],
    [ '|',    [ bl.end.single ] ],
  ]);

  export type BarTextToken = string | BarLine;

  export class SectionText {
    public sectionName: string;
    public sectionContentText: string;
    constructor(sectionName: string, sectionContentText: string) {
      this.sectionName = sectionName;
      this.sectionContentText = sectionContentText;
    }
  }

  export class TemporaryBarArgument {
    public chords: Chord[];
    public barLineStart: BarLine;
    public barLineEnd: BarLine;
    constructor(chords: Chord[], barLineStart: BarLine, barLineEnd: BarLine) {
      this.chords = chords;
      this.barLineStart = barLineStart;
      this.barLineEnd = barLineEnd;
    }
  }
}

export default {
  normalizeScoreText(scoreText: string): string {
    scoreText = scoreText.replace('\r', '\n');
    scoreText = scoreText.replace('[', '\n[');
    scoreText = scoreText.replace(']', ']\n');
    scoreText = scoreText.replace(/^\s+/gm, '');
    scoreText = scoreText.replace(/^\s*[\n]+/gm, '');
    return scoreText.trim();
  },

  splitIntoSectionTexts(scoreText: string) {
    const sectionNameBegin = '[';
    const sectionNameEnd = ']';
    const sectionTexts = [];
    if (scoreText.includes(sectionNameBegin)) {
      let currentReadIdx = 0;
      do {
        const sectionStartIdx = scoreText.indexOf(sectionNameBegin, currentReadIdx);
        const sectionEndIdx = scoreText.indexOf(sectionNameEnd, sectionStartIdx + 1) + 1;
        if (sectionEndIdx < 0) {
          throw new ScoreTextParser.ParseError('end of section is not found.');
        }
        const sectionNameStartIdx = sectionStartIdx + 1;
        const sectionNameEndIdx = sectionEndIdx - 1;
        const sectionName = scoreText.slice(sectionNameStartIdx, sectionNameEndIdx);
        const sectionContentTextStartIdx = sectionEndIdx;
        const nextSectionStartIdx = scoreText.indexOf(sectionNameBegin, sectionContentTextStartIdx);
        const sectionContentTextEndIdx = (nextSectionStartIdx < 0)? scoreText.length : nextSectionStartIdx;
        const sectionContentText = scoreText.slice(sectionContentTextStartIdx, sectionContentTextEndIdx);
        sectionTexts.push(new ScoreTextParser.SectionText(sectionName, sectionContentText.trim()));
        currentReadIdx = sectionContentTextEndIdx;
      }
      while (currentReadIdx >= 0 && currentReadIdx < scoreText.length);
    } else {
      sectionTexts.push(new ScoreTextParser.SectionText('', scoreText));
    }
    return sectionTexts;
  },

  splitIntoBarTextTokensBySystem(sectionContentText: string): ScoreTextParser.BarTextToken[][] {
    return sectionContentText.split('\n').map(tokenizeSectionContentText);

    function tokenizeSectionContentText(sectionContentText: string) {
      let tokens: ScoreTextParser.BarTextToken[] = [ sectionContentText ];
      tokens = retokenizeTokensBy(tokens, ':||:');
      tokens = retokenizeTokensBy(tokens, '||:');
      tokens = retokenizeTokensBy(tokens, ':||');
      tokens = retokenizeTokensBy(tokens, '||');
      tokens = retokenizeTokensBy(tokens, '|');
      return tokens;
    }

    function retokenizeTokensBy(tokens: ScoreTextParser.BarTextToken[] | string, separatorText: string) {
      const tokensTemp: ScoreTextParser.BarTextToken[] = [];
      if (tokens instanceof Array) {
        for (const token of tokens) {
          tokensTemp.push(...retokenizeTokenBy(token, separatorText));
        }
      } else {
        tokensTemp.push(...retokenizeTokenBy(tokens, separatorText));
      }
      return tokensTemp;

      function retokenizeTokenBy(token: ScoreTextParser.BarTextToken, separatorText: string) {
        const tokensTemp: (string | BarLine)[] = [];
        const barLines = ScoreTextParser.separatorTextToBarLinesMap.get(separatorText);
        if (barLines === undefined) throw new ScoreTextParser.ParseError(separatorText);
        if (typeof token === 'string') {
          const [ firstSeparatedToken, ...remianingSeparatedTokens ] = token.split(separatorText);
          const trimmedFirstSeparatedToken = firstSeparatedToken.trim();
          if (trimmedFirstSeparatedToken.length > 0) tokensTemp.push(trimmedFirstSeparatedToken);
          for (const separatedToken of remianingSeparatedTokens) {
            tokensTemp.push(...barLines);
            const trimmedSeparatedToken = separatedToken.trim();
            if (trimmedSeparatedToken.length > 0) tokensTemp.push(trimmedSeparatedToken);
          }
        } else {
          tokensTemp.push(token);
        }
        return tokensTemp;
      }
    }
  },

  packBarTextTokensIntoBars(barTextTokensBySystem: ScoreTextParser.BarTextToken[][], beatValue: NoteValue, scale: Scale) {
    const bars = [];
    for (const barTextTokens of barTextTokensBySystem) {
      const barArgsInSystem = [];
      let currentReadIdx = 0;
      const numBarTextTokens = barTextTokens.length;
      do {
        let barLineStart = bl.start.empty;
        {
          const barLineStartCandidate = barTextTokens[currentReadIdx];
          if (barLineStartCandidate instanceof BarLine) {
            if (Object.values(bl.start).includes(raw(barLineStartCandidate))) {
              barLineStart = barLineStartCandidate;
              ++currentReadIdx;
            }
          }
        }

        const barContentText = barTextTokens[currentReadIdx];
        if (typeof barContentText !== 'string') {
          throw new ScoreTextParser.ParseError(`unexpected bar content: ${barContentText}`);
        }
        const chordTexts = barContentText.split(/ +/);
        const chords = chordTexts.map(chordTextParser.parse);
        ++currentReadIdx;

        const barLineEnd = barTextTokens[currentReadIdx];
        if (!(barLineEnd instanceof BarLine)) {
          throw new ScoreTextParser.ParseError(`unexpected bar content: ${barLineEnd}`);
        }
        ++currentReadIdx;
  
        barArgsInSystem.push(new ScoreTextParser.TemporaryBarArgument(chords, barLineStart, barLineEnd));
      }
      while (currentReadIdx < numBarTextTokens);
      
      const barsInSystem = [];
      for (let barArgIdx = 0; barArgIdx < barArgsInSystem.length; ++barArgIdx) {
        const barArgInSystem = barArgsInSystem[barArgIdx];
        let barNoteValues: NoteValue[];
        switch (barArgInSystem.chords.length) {
          case 1:
            barNoteValues = [ beatValue.clone().reduce() ];
            break;
          case 2:
            barNoteValues = [
              beatValue.clone().subtract(new NoteValue(1, 2)).reduce(),
              new NoteValue(1, 2),
            ];
            break;
          case 3:
            barNoteValues = [
              beatValue.clone().subtract(new NoteValue(1, 2)).reduce(),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
            ];
            break;
          case 4:
            barNoteValues = [
              beatValue.clone().subtract(new NoteValue(3, 4)).reduce(),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
            ];
            break;
          case 5:
            barNoteValues = [
              beatValue.clone().subtract(new NoteValue(3, 4)).reduce(),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
              new NoteValue(1, 8),
              new NoteValue(1, 8),
            ];
            break;
          default:
            throw new ScoreTextParser.ParseError(`unexpected number of bar arguments: ${barArgsInSystem.length}`);
        }
        barsInSystem.push(new Bar(
          beatValue,
          [
            new PartInBar(
              barArgInSystem.chords.map(
                (chord: Chord, chordIdx: number) => new Note(
                  chord,
                  barNoteValues[chordIdx],
                  'normal',
                  false,
                ),
              ),
              'chord',
            ),
          ],
          cl.treble,
          scale,
          bb.empty,
          barArgInSystem.barLineStart,
          barArgInSystem.barLineEnd,
          bre.empty,
          nv.divisible.half,
        ));
      }
      const lastBarInSystem = barsInSystem[barsInSystem.length - 1];
      lastBarInSystem.break = bb.system;
      bars.push(...barsInSystem);
    }
    return bars;
  },

  parse(scoreText: string, beatValue: NoteValue, scale: Scale, scoreMetadata: ScoreMetadata = new ScoreMetadata()): Score {
    scoreText = this.normalizeScoreText(scoreText);
    const sectionTexts = this.splitIntoSectionTexts(scoreText);
    const sections: Section[] = [];
    for (const sectionText of sectionTexts) {
      const sectionName = sectionText.sectionName;
      const sectionContentText = sectionText.sectionContentText;
      const barTextTokensBySystem = this.splitIntoBarTextTokensBySystem(sectionContentText);
      const bars = this.packBarTextTokensIntoBars(barTextTokensBySystem, beatValue, scale);
      sections.push(new Section(sectionName, bars));
    }
    return new Score(scoreMetadata, sections);
  },
}
