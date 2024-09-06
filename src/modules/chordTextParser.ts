import { Chord, ChordTriadType, ChordSixthOrSeventhType } from './Chord';
import { TensionNotePitch, tnp } from './TensionNotePitch';
import { NotePitch, np } from './NotePitch';

namespace ChordTextParser {
  export const ParseError = class extends Error {};

  export const validBassNotes = new Map<string, NotePitch>([
    [ 'A',  np.a ],
    [ 'Ab', np.aFlat ],
    [ 'A#', np.aSharp ],
    [ 'B',  np.b ],
    [ 'Bb', np.bFlat ],
    [ 'B#', np.bSharp ],
    [ 'C',  np.c ],
    [ 'Cb', np.cFlat ],
    [ 'C#', np.cSharp ],
    [ 'D',  np.d ],
    [ 'Db', np.dFlat ],
    [ 'D#', np.dSharp ],
    [ 'E',  np.e ],
    [ 'Eb', np.eFlat ],
    [ 'E#', np.eSharp ],
    [ 'F',  np.f ],
    [ 'Fb', np.fFlat ],
    [ 'F#', np.fSharp ],
    [ 'G',  np.g ],
    [ 'Gb', np.gFlat ],
    [ 'G#', np.gSharp ],
  ]);

  export const validTensionLikeNotes = new Map<string, TensionNotePitch>([
    [ '-5', tnp.sharpEleventh ],
  ]);

  export const validTensionNotes = new Map<string, TensionNotePitch>([
    [ '9',   tnp.ninth ],
    [ '-9',  tnp.flatNinth ],
    [ 'b9',  tnp.flatNinth ],
    [ '+9',  tnp.sharpNinth ],
    [ '#9',  tnp.sharpNinth ],
    [ '11',  tnp.eleventh ],
    [ '+11', tnp.sharpEleventh ],
    [ '#11', tnp.sharpEleventh ],
    [ '13',  tnp.thirteenth ],
    [ '-13', tnp.flatThirteenth ],
    [ 'b13', tnp.flatThirteenth ],
  ]);

  export const validOtherTensionNotes = new Map<string, TensionNotePitch>([
    [ 'add9', tnp.ninth ],
  ]);

  export type TriadSeventhAndNinth = {
    triad: ChordTriadType,
    sixthOrSeventh: ChordSixthOrSeventhType,
    ninth: TensionNotePitch,
  };

  export const validTriadSeventhAndNinths = new Map<string, TriadSeventhAndNinth>([
    [ '9',    { triad: 'major',      sixthOrSeventh: 'dominantSeventh',   ninth: tnp.ninth } ],
    [ 'm9',   { triad: 'minor',      sixthOrSeventh: 'dominantSeventh',   ninth: tnp.ninth } ],
    [ 'M9',   { triad: 'major',      sixthOrSeventh: 'majorSeventh',      ninth: tnp.ninth } ],
    [ 'mM9',  { triad: 'major',      sixthOrSeventh: 'majorSeventh',      ninth: tnp.ninth } ],
    [ 'dim9', { triad: 'diminished', sixthOrSeventh: 'diminishedSeventh', ninth: tnp.ninth } ],
  ]);

  export type TriadAndSeventh = { triad: ChordTriadType, seventh: ChordSixthOrSeventhType };

  export const validTriadAndSevenths = new Map<string, TriadAndSeventh>([
    [ 'dim7', { triad: 'diminished', seventh:'diminishedSeventh' } ],
  ]);

  export const validSixthAndSevenths = new Map<string, ChordSixthOrSeventhType>([
    [ '6',  'sixth' ],
    [ '7',  'dominantSeventh' ],
    [ 'M7', 'majorSeventh' ],
  ]);

  export const validPostTriads = new Map<string, ChordTriadType>([
    [ 'sus4', 'suspendedFourth' ],
    [ 'sus2', 'suspendedSecond' ],
  ]);

  export const validTriads = new Map<string, ChordTriadType>([
    [ 'M',   'major' ],
    [ 'm',   'minor' ],
    [ '-',   'minor' ],
    [ 'aug', 'augumented' ],
    [ '+',   'augumented' ],
    [ 'dim', 'diminished' ],
  ]);

  export const validRoots = new Map<string, NotePitch>([
    [ 'A',  np.a ],
    [ 'Ab', np.aFlat ],
    [ 'A#', np.aSharp ],
    [ 'B',  np.b ],
    [ 'Bb', np.bFlat ],
    [ 'B#', np.bSharp ],
    [ 'C',  np.c ],
    [ 'Cb', np.cFlat ],
    [ 'C#', np.cSharp ],
    [ 'D',  np.d ],
    [ 'Db', np.dFlat ],
    [ 'D#', np.dSharp ],
    [ 'E',  np.e ],
    [ 'Eb', np.eFlat ],
    [ 'E#', np.eSharp ],
    [ 'F',  np.f ],
    [ 'Fb', np.fFlat ],
    [ 'F#', np.fSharp ],
    [ 'G',  np.g ],
    [ 'Gb', np.gFlat ],
    [ 'G#', np.gSharp ],
  ]);
}

export default {
  ParseError: ChordTextParser.ParseError,

  parseBassNote(chordText: string): { chordText: string, bassNote: NotePitch | undefined } {
    const chordWithBassNoteNotationRegexp = new RegExp('(?<remaining>.+)( on |/)(?<bassNoteNotation>.+)');
    const chordWithBassNoteNotation = chordWithBassNoteNotationRegexp.exec(chordText);
    if (chordWithBassNoteNotation === null) {
      return { chordText, bassNote: undefined };
    } else {
      const remainingChordText = chordWithBassNoteNotation.groups?.remaining;
      if (remainingChordText === undefined) throw new ChordTextParser.ParseError(chordWithBassNoteNotation.toString());
      const bassNoteNotationCandidate = chordWithBassNoteNotation.groups?.bassNoteNotation;
      if (bassNoteNotationCandidate === undefined) throw new ChordTextParser.ParseError(chordWithBassNoteNotation.toString());
      const bassNote = ChordTextParser.validBassNotes.get(bassNoteNotationCandidate);
      if (bassNote === undefined) throw new ChordTextParser.ParseError(bassNoteNotationCandidate);
      return { chordText: remainingChordText, bassNote };
    }
  },

  parseTensionNotes(chordText: string): {
    chordText: string,
    tensionNotes: Set<TensionNotePitch>,
    tensionLikeNotes: Set<TensionNotePitch>,
  } {
    const chordWithTensionNotationRegexp = new RegExp('(?<remaining>.+)\\((?<tensionNotations>.+)\\)');
    const chordWithTensionNotation = chordWithTensionNotationRegexp.exec(chordText);
    if (chordWithTensionNotation === null) {
      return { chordText, tensionNotes: new Set(), tensionLikeNotes: new Set() };
    } else {
      const remainingChordText = chordWithTensionNotation.groups?.remaining;
      if (remainingChordText === undefined) throw new ChordTextParser.ParseError(chordWithTensionNotation.toString());
      const tensionNotations = chordWithTensionNotation.groups?.tensionNotations;
      if (tensionNotations === undefined) throw new ChordTextParser.ParseError(chordWithTensionNotation.toString());
      const tensionNotationCandidates = tensionNotations.split(' ').filter(x => x.length);
      const tensionNotationCandidateSet = new Set(tensionNotationCandidates);
      if (tensionNotationCandidateSet.size !== tensionNotationCandidates.length) {
        throw new ChordTextParser.ParseError();
      }
      const tensionLikeNotes = new Set<TensionNotePitch>();
      const tensionNotes = new Set<TensionNotePitch>();
      for (const tensionNoteCandidate of tensionNotationCandidateSet) {
        const tensionLikeNote = ChordTextParser.validTensionLikeNotes.get(tensionNoteCandidate);
        const tensionNote = ChordTextParser.validTensionNotes.get(tensionNoteCandidate);
        if ((tensionLikeNote === undefined) && (tensionNote === undefined)) {
          throw new ChordTextParser.ParseError();
        }
        if (tensionNote !== undefined) {
          tensionNotes.add(tensionNote);
          tensionNotationCandidateSet.delete(tensionNoteCandidate);
          continue;
        }
        if (tensionLikeNote !== undefined) {
          tensionLikeNotes.add(tensionLikeNote);
          tensionNotationCandidateSet.delete(tensionNoteCandidate);
          continue;
        }
      }
      for (const tensionNote of tensionNotes) {
        if (tensionNote === undefined) throw new ChordTextParser.ParseError(tensionNote);
      }
      return {
        chordText: remainingChordText,
        tensionNotes: tensionNotes,
        tensionLikeNotes: tensionLikeNotes,
      };
    }
  },

  parseOtherTension(chordText: string): {
    chordText: string,
    otherTensionNote: TensionNotePitch | undefined,
  } {
    let indexOfOtherTensionNotesNotation = chordText.length;
    if (chordText.endsWith('add9')) {
      indexOfOtherTensionNotesNotation = chordText.lastIndexOf('add9');
    } else {
      return { chordText, otherTensionNote: undefined };
    }
    const remainingChordText = chordText.slice(0, indexOfOtherTensionNotesNotation);
    const otherTensionNote = ChordTextParser.validOtherTensionNotes.get(chordText.slice(indexOfOtherTensionNotesNotation));
    if (otherTensionNote === undefined) throw new ChordTextParser.ParseError(chordText);
    return { chordText: remainingChordText, otherTensionNote };
  },

  parseTriadSeventhAndNinth(chordText: string, tensionLikeNotes: Set<TensionNotePitch>): {
    chordText: string,
    triadSeventhAndNinth: ChordTextParser.TriadSeventhAndNinth | undefined,
  } {
    let indexOfTriadSeventhAndNinthNotation = chordText.length;
    if (chordText.endsWith('dim9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('dim9');
    } else if (chordText.endsWith('m9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('m9');
    } else if (chordText.endsWith('mM9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('mM9');
    } else if (chordText.endsWith('M9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('M9');
    } else if (chordText.endsWith('9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('9');
    } else {
      return { chordText, triadSeventhAndNinth: undefined };
    }
    const remainingChordText = chordText.slice(0, indexOfTriadSeventhAndNinthNotation);
    const triadSeventhAndNinth = ChordTextParser.validTriadSeventhAndNinths.get(chordText.slice(indexOfTriadSeventhAndNinthNotation));
    if (triadSeventhAndNinth === undefined) throw new ChordTextParser.ParseError(chordText);
    if (tensionLikeNotes.has(tnp.sharpEleventh)) {
      switch (triadSeventhAndNinth.triad) {
        case 'minor':
          triadSeventhAndNinth.triad = 'diminished';
          break;
        default:
          throw new ChordTextParser.ParseError(`${chordText}(${Array.from(tensionLikeNotes).join(' ')})`);
      }
    }
    return { chordText: remainingChordText, triadSeventhAndNinth };
  },

  parseTriadAndSeventh(chordText: string, tensionLikeNotes: Set<TensionNotePitch>): {
    chordText: string,
    triadAndSeventh: ChordTextParser.TriadAndSeventh | undefined,
  } {
    let indexOfTriadAndSeventhNotation = chordText.length;
    if (chordText.endsWith('dim7')) {
      indexOfTriadAndSeventhNotation = chordText.lastIndexOf('dim7');
    } else {
      return { chordText, triadAndSeventh: undefined };
    }
    const remainingChordText = chordText.slice(0, indexOfTriadAndSeventhNotation);
    const triadAndSeventh = ChordTextParser.validTriadAndSevenths.get(chordText.slice(indexOfTriadAndSeventhNotation));
    if (triadAndSeventh === undefined) throw new ChordTextParser.ParseError(chordText);
    if (tensionLikeNotes.has(tnp.sharpEleventh)) {
      switch (triadAndSeventh.triad) {
        case 'minor':
          triadAndSeventh.triad = 'diminished';
          break;
        default:
          throw new ChordTextParser.ParseError(`${chordText}(${Array.from(tensionLikeNotes).join(' ')})`);
      }
    }
    return { chordText: remainingChordText, triadAndSeventh };
  },

  parseSixthOrSeventh(chordText: string): {
    chordText: string,
    sixthOrSeventh: ChordSixthOrSeventhType | undefined,
  } {
    let indexOfSixthOrSeventhNotation = chordText.length;
    if (chordText.endsWith('M7')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('M7');
    } else if (chordText.endsWith('7')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('7');
    } else if (chordText.endsWith('6')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('6');
    } else {
      return { chordText, sixthOrSeventh: undefined };
    }
    const remainingChordText = chordText.slice(0, indexOfSixthOrSeventhNotation);
    const sixthOrSeventh = ChordTextParser.validSixthAndSevenths.get(chordText.slice(indexOfSixthOrSeventhNotation));
    if (sixthOrSeventh === undefined) throw new ChordTextParser.ParseError(chordText);
    return { chordText: remainingChordText, sixthOrSeventh };
  },

  parsePostTriad(chordText: string, tensionLikeNotes: Set<TensionNotePitch>): {
    chordText: string,
    postTriad: ChordTriadType | undefined,
    postTriadTensionLikeNote: TensionNotePitch | undefined,
  } {
    let indexOfPostTriadNotation = chordText.length;
    if (chordText.endsWith('-5')) {
      indexOfPostTriadNotation = chordText.lastIndexOf('-5');
    } else if (chordText.endsWith('sus4')) {
      indexOfPostTriadNotation = chordText.lastIndexOf('sus4');
    } else if (chordText.endsWith('sus2')) {
      indexOfPostTriadNotation = chordText.lastIndexOf('sus2');
    } else {
      return { chordText, postTriad: undefined, postTriadTensionLikeNote: undefined };
    }
    if (tensionLikeNotes.size > 0) throw new ChordTextParser.ParseError(`${chordText}(${Array.from(tensionLikeNotes).join(' ')})`);
    const remainingChordText = chordText.slice(0, indexOfPostTriadNotation);
    const postTriad = ChordTextParser.validPostTriads.get(chordText.slice(indexOfPostTriadNotation));
    const postTriadTensionLikeNote = ChordTextParser.validTensionLikeNotes.get(chordText.slice(indexOfPostTriadNotation));
    if ((postTriad === undefined) && (postTriadTensionLikeNote === undefined)) throw new ChordTextParser.ParseError(chordText);
    return { chordText: remainingChordText, postTriad, postTriadTensionLikeNote };
  },

  parseTriad(chordText: string, tensionLikeNotes: Set<TensionNotePitch>): {
    chordText: string,
    triad: ChordTriadType | undefined,
  } {
    let triad: ChordTriadType | undefined = undefined;
    let indexOfTriadNotation = chordText.length;
    if (chordText.endsWith('dim')) {
      indexOfTriadNotation = chordText.lastIndexOf('dim');
    } else if (chordText.endsWith('m')) {
      indexOfTriadNotation = chordText.lastIndexOf('m');
    } else if (chordText.endsWith('M')) {
      indexOfTriadNotation = chordText.lastIndexOf('M');
    } else if (chordText.endsWith('aug')) {
      indexOfTriadNotation = chordText.lastIndexOf('aug');
    } else if (chordText.endsWith('+')) {
      indexOfTriadNotation = chordText.lastIndexOf('+');
    } else if (chordText.endsWith('-')) {
      indexOfTriadNotation = chordText.lastIndexOf('-');
    } else {
      triad = 'major';
    }
    const remainingChordText = chordText.slice(0, indexOfTriadNotation);
    if (triad === undefined) triad = ChordTextParser.validTriads.get(chordText.slice(indexOfTriadNotation));
    if (triad === undefined) throw new ChordTextParser.ParseError(chordText);
    if (tensionLikeNotes.has(tnp.sharpEleventh)) {
      switch (triad) {
        case 'minor':
          triad = 'diminished';
          break;
        default:
          throw new ChordTextParser.ParseError(`${chordText}(${Array.from(tensionLikeNotes).join(' ')})`);
      }
    }
    return { chordText: remainingChordText, triad };
  },

  parseRoot(chordText: string): NotePitch {
    const rootNotationCandidate = chordText;
    const root = ChordTextParser.validRoots.get(rootNotationCandidate);
    if (root === undefined) throw new ChordTextParser.ParseError(rootNotationCandidate);
    return root;
  },

  parse(chordText: string) {
    let triad: ChordTriadType | undefined = undefined;
    let sixthOrSeventh: ChordSixthOrSeventhType | undefined = undefined;
    const tensionLikeNotes = new Set<TensionNotePitch>();
    const tensionNotes = new Set<TensionNotePitch>();
    let bass: NotePitch | undefined = undefined;

    chordText = chordText.trim();

    {
      const result = this.parseBassNote(chordText);
      chordText = result.chordText;
      bass = result.bassNote;
    }

    {
      const result = this.parseTensionNotes(chordText);
      chordText = result.chordText;
      for (const tensionNote of result.tensionNotes) {
        tensionNotes.add(tensionNote);
      }
      for (const tensionLikeNote of result.tensionLikeNotes) {
        tensionLikeNotes.add(tensionLikeNote);
      }
    }

    {
      const result = this.parseOtherTension(chordText);
      chordText = result.chordText;
      if (result.otherTensionNote !== undefined) {
        tensionNotes.add(result.otherTensionNote);
      }
    }

    {
      const result = this.parsePostTriad(chordText, tensionLikeNotes);
      chordText = result.chordText;
      if (result.postTriad !== undefined) {
        triad = result.postTriad;
      }
      if (result.postTriadTensionLikeNote !== undefined) {
        tensionLikeNotes.add(result.postTriadTensionLikeNote);
      }
    }

    {
      const result = this.parseTriadSeventhAndNinth(chordText, tensionLikeNotes);
      chordText = result.chordText;
      if (result.triadSeventhAndNinth !== undefined) {
        if (triad === undefined) triad = result.triadSeventhAndNinth.triad;
        sixthOrSeventh = result.triadSeventhAndNinth.sixthOrSeventh;
        tensionNotes.add(result.triadSeventhAndNinth.ninth);
      }
    }

    {
      const result = this.parseTriadAndSeventh(chordText, tensionLikeNotes);
      chordText = result.chordText;
      if (result.triadAndSeventh !== undefined) {
        if (triad === undefined) triad = result.triadAndSeventh.triad;
        sixthOrSeventh = result.triadAndSeventh.seventh;
      }
    }

    {
      const result = this.parseSixthOrSeventh(chordText);
      chordText = result.chordText;
      if (result.sixthOrSeventh !== undefined) {
        sixthOrSeventh = result.sixthOrSeventh;
      }
    }

    {
      if (triad === undefined) {
        const result = this.parseTriad(chordText, tensionLikeNotes);
        chordText = result.chordText;
        if (result.triad !== undefined) {
          triad = result.triad;
        }
      }
    }

    const root = this.parseRoot(chordText);

    if (triad === undefined) triad = 'major';

    return new Chord(root, triad, sixthOrSeventh, tensionNotes, bass);
  }
}
