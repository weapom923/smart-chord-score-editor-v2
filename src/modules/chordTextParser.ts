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

  export const validTensionNotes = new Map<string, TensionNotePitch>([
    [ '9',   tnp.ninth ],
    [ 'b9',  tnp.flatNinth ],
    [ '#9',  tnp.sharpNinth ],
    [ '11',  tnp.eleventh ],
    [ '#11', tnp.sharpEleventh ],
    [ '13',  tnp.thirteenth ],
    [ 'b13', tnp.flatThirteenth ],
  ]);

  export const validOtherTensionNotes = new Map<string, TensionNotePitch>([
    [ 'add9', tnp.ninth ],
  ]);

  export type TriadSeventhAndNinthTuple = [ ChordTriadType, ChordSixthOrSeventhType, TensionNotePitch ];

  export const validTriadSeventhAndNinths = new Map<string, TriadSeventhAndNinthTuple>([
    [ '9',    [ 'major',      'dominantSeventh',   tnp.ninth ] ],
    [ 'm9',   [ 'minor',      'dominantSeventh',   tnp.ninth ] ],
    [ 'M9',   [ 'major',      'majorSeventh',      tnp.ninth ] ],
    [ 'mM9',  [ 'major',      'majorSeventh',      tnp.ninth ] ],
    [ 'dim9', [ 'diminished', 'diminishedSeventh', tnp.ninth ] ],
  ]);

  export type TriadAndSeventhPair = [ ChordTriadType, ChordSixthOrSeventhType ];

  export const validTriadAndSevenths = new Map<string, TriadAndSeventhPair>([
    [ 'dim7', [ 'diminished', 'diminishedSeventh' ] ],
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

  parseBassNote(chordText: string): [ string, NotePitch | undefined ] {
    const chordWithBassNoteNotationRegexp = new RegExp('(?<remaining>.+)( on |/)(?<bassNoteNotation>.+)');
    const chordWithBassNoteNotation = chordWithBassNoteNotationRegexp.exec(chordText);
    if (chordWithBassNoteNotation === null) {
      return [ chordText, undefined ];
    } else {
      const remainingChordText = chordWithBassNoteNotation.groups?.remaining;
      if (remainingChordText === undefined) throw new ChordTextParser.ParseError(chordWithBassNoteNotation.toString());
      const bassNoteNotationCandidate = chordWithBassNoteNotation.groups?.bassNoteNotation;
      if (bassNoteNotationCandidate === undefined) throw new ChordTextParser.ParseError(chordWithBassNoteNotation.toString());
      const bassNote = ChordTextParser.validBassNotes.get(bassNoteNotationCandidate);
      if (bassNote === undefined) throw new ChordTextParser.ParseError(bassNoteNotationCandidate);
      return [ remainingChordText, bassNote ];
    }
  },

  parseTensionNotes(chordText: string): [ string, TensionNotePitch[] | undefined ] {
    const chordWithTensionNotationRegexp = new RegExp('(?<remaining>.+)\\((?<tensionNotations>.+)\\)');
    const chordWithTensionNotation = chordWithTensionNotationRegexp.exec(chordText);
    if (chordWithTensionNotation === null) {
      return [ chordText, undefined ];
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
      const tensionNotes = tensionNotationCandidates.map(tensionNotation => ChordTextParser.validTensionNotes.get(tensionNotation));
      for (const tensionNote of tensionNotes) {
        if (tensionNote === undefined) throw new ChordTextParser.ParseError(tensionNote);
      }
      return [ remainingChordText, tensionNotes as TensionNotePitch[] ];
    }
  },

  parseOtherTension(chordText: string): [ string, TensionNotePitch | undefined ] {
    let indexOfOtherTensionNotesNotation = chordText.length;
    if (chordText.endsWith('add9')) {
      indexOfOtherTensionNotesNotation = chordText.lastIndexOf('add9');
    } else {
      return [ chordText, undefined ];
    }
    const remainingChordText = chordText.slice(0, indexOfOtherTensionNotesNotation);
    const otherTensionNote = ChordTextParser.validOtherTensionNotes.get(chordText.slice(indexOfOtherTensionNotesNotation));
    if (otherTensionNote === undefined) throw new ChordTextParser.ParseError(chordText);
    return [ remainingChordText, otherTensionNote ];
  },

  parseTriadSeventhAndNinth(chordText: string): [ string, ChordTextParser.TriadSeventhAndNinthTuple | undefined ] {
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
      return [ chordText, undefined ];
    }
    const remainingChordText = chordText.slice(0, indexOfTriadSeventhAndNinthNotation);
    const triadSeventhAndNinth = ChordTextParser.validTriadSeventhAndNinths.get(chordText.slice(indexOfTriadSeventhAndNinthNotation));
    if (triadSeventhAndNinth === undefined) throw new ChordTextParser.ParseError(chordText);
    return [ remainingChordText, triadSeventhAndNinth ];
  },

  parseTriadAndSeventh(chordText: string): [ string, ChordTextParser.TriadAndSeventhPair | undefined ] {
    let indexOfTriadAndSeventhNotation = chordText.length;
    if (chordText.endsWith('dim7')) {
      indexOfTriadAndSeventhNotation = chordText.lastIndexOf('dim7');
    } else {
      return [ chordText, undefined ];
    }
    const remainingChordText = chordText.slice(0, indexOfTriadAndSeventhNotation);
    const triadAndSeventh = ChordTextParser.validTriadAndSevenths.get(chordText.slice(indexOfTriadAndSeventhNotation));
    if (triadAndSeventh === undefined) throw new ChordTextParser.ParseError(chordText);
    return [ remainingChordText, triadAndSeventh ];
  },

  parseSixthOrSeventh(chordText: string): [ string, ChordSixthOrSeventhType | undefined ] {
    let indexOfSixthOrSeventhNotation = chordText.length;
    if (chordText.endsWith('M7')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('M7');
    } else if (chordText.endsWith('7')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('7');
    } else if (chordText.endsWith('6')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('6');
    } else {
      return [ chordText, undefined ];
    }
    const remainingChordText = chordText.slice(0, indexOfSixthOrSeventhNotation);
    const sixthOrSeventh = ChordTextParser.validSixthAndSevenths.get(chordText.slice(indexOfSixthOrSeventhNotation));
    if (sixthOrSeventh === undefined) throw new ChordTextParser.ParseError(chordText);
    return [ remainingChordText, sixthOrSeventh ];
  },

  parsePostTriad(chordText: string): [ string, ChordTriadType | undefined ] {
    let indexOfPostTriadNotation = chordText.length;
    if (chordText.endsWith('sus4')) {
      indexOfPostTriadNotation = chordText.lastIndexOf('sus4');
    } else if (chordText.endsWith('sus2')) {
      indexOfPostTriadNotation = chordText.lastIndexOf('sus2');
    } else {
      return [ chordText, undefined ];
    }
    const remainingChordText = chordText.slice(0, indexOfPostTriadNotation);
    const postTriad = ChordTextParser.validPostTriads.get(chordText.slice(indexOfPostTriadNotation));
    if (postTriad === undefined) throw new ChordTextParser.ParseError(chordText);
    return [ remainingChordText, postTriad ];
  },

  parseTriad(chordText: string): [ string, ChordTriadType | undefined ] {
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
      return [ chordText, undefined ];
    }
    const remainingChordText = chordText.slice(0, indexOfTriadNotation);
    const triad = ChordTextParser.validTriads.get(chordText.slice(indexOfTriadNotation));
    if (triad === undefined) throw new ChordTextParser.ParseError(chordText);
    return [ remainingChordText, triad ];
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
    const tensionNotes = new Set<TensionNotePitch>();
    let bass: NotePitch | undefined = undefined;

    chordText = chordText.trim();

    {
      const result = this.parseBassNote(chordText);
      chordText = result[0];
      bass = result[1];
    }

    {
      const result = this.parseTensionNotes(chordText);
      chordText = result[0];
      const tensionNotesTemp = result[1];
      if (tensionNotesTemp !== undefined) {
        tensionNotesTemp.forEach(tensionNote => { tensionNotes.add(tensionNote) })
      }
    }

    {
      const result = this.parseOtherTension(chordText);
      chordText = result[0];
      const otherTension = result[1];
      if (otherTension !== undefined) {
        tensionNotes.add(otherTension);
      }
    }

    {
      const result = this.parsePostTriad(chordText);
      chordText = result[0];
      const triadTemp = result[1];
      if (triadTemp !== undefined) {
        triad = triadTemp;
      }
    }

    {
      const result = this.parseTriadSeventhAndNinth(chordText);
      chordText = result[0];
      const triadSeventhAndNinth = result[1];
      if (triadSeventhAndNinth !== undefined) {
        if (triad === undefined) triad = triadSeventhAndNinth[0];
        sixthOrSeventh = triadSeventhAndNinth[1];
        const ninth = triadSeventhAndNinth[2];
        tensionNotes.add(ninth);
      }
    }

    {
      const result = this.parseTriadAndSeventh(chordText);
      chordText = result[0];
      const triadAndSeventh = result[1];
      if (triadAndSeventh !== undefined) {
        if (triad === undefined) triad = triadAndSeventh[0];
        sixthOrSeventh = triadAndSeventh[1];
      }
    }

    {
      const result = this.parseSixthOrSeventh(chordText);
      chordText = result[0];
      const sixthOrSeventhTemp = result[1];
      if (sixthOrSeventhTemp !== undefined) {
        sixthOrSeventh = sixthOrSeventhTemp;
      }
    }

    {
      const result = this.parseTriad(chordText);
      chordText = result[0];
      const triadTemp = result[1];
      if (triadTemp !== undefined) {
        if (triad === undefined) triad = triadTemp;
      }
    }

    const root = this.parseRoot(chordText);

    if (triad === undefined) triad = 'major';

    return new Chord(root, triad, sixthOrSeventh, tensionNotes, bass);
  }
}
