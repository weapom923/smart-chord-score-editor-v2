import { raw } from './utils';
import { NotePitch, NotePitchRawObj, np } from './NotePitch';
import { TensionNotePitch, TensionNotePitchRawObj, tnp  } from './TensionNotePitch';
import { Scale } from './Scale';

export type ChordTriadType = typeof Chord.Triad[number];
export type ChordSixthOrSeventhType = typeof Chord.SixthOrSeventh[number];

export type ChordRawObj = {
  root: NotePitchRawObj,
  triad: ChordTriadType,
  sixth_or_seventh: ChordSixthOrSeventhType | null,
  tension_notes: TensionNotePitchRawObj[],
  bass: NotePitchRawObj | null,
};

export class Chord {
  static InvalidChordError = class extends Error {};

  static readonly Triad = [ 'major', 'minor', 'suspendedFourth', 'suspendedSecond', 'diminished', 'augumented' ] as const; 
  static readonly SixthOrSeventh = [ 'dominantSeventh', 'majorSeventh', 'diminishedSeventh', 'sixth' ] as const;

  static get default() { return new Chord(np.a, 'major') };

  public root: NotePitch;
  public triad: ChordTriadType;
  public sixthOrSeventh?: ChordSixthOrSeventhType;
  public tensionNotes: Set<TensionNotePitch>;
  public bass?: NotePitch;

  constructor(
    root: NotePitch,
    triad: ChordTriadType,
    sixthOrSeventh?: ChordSixthOrSeventhType,
    tensionNotes: Set<TensionNotePitch> = new Set<TensionNotePitch>(),
    bass?: NotePitch,
    { makesValid = false } = {},
  ) {
    this.root = root;
    this.triad = triad;
    this.bass = bass;
    this.sixthOrSeventh = sixthOrSeventh;
    this.tensionNotes = tensionNotes;
    if (!this.isValid){
      if (makesValid) {
        if (sixthOrSeventh !== undefined) {
          let isSixthOrSeventhSelectable = false;
          for (const selectableSixthOrSeventh of this.selectableSixthOrSevenths) {
            if (selectableSixthOrSeventh === sixthOrSeventh) {
              isSixthOrSeventhSelectable = true;
              break;
            }
          }
          if (!isSixthOrSeventhSelectable) {
            this.sixthOrSeventh = undefined;
          }
        }
        for (const tensionNote of tensionNotes) {
          let isTensionNoteSelectable = false;
          for (const selectableTensionNote of this.selectableTensionNotes) {
            if (selectableTensionNote.isEqualTo(tensionNote)) {
              isTensionNoteSelectable = true;
              break;
            }
          }
          if (!isTensionNoteSelectable) {
            this.tensionNotes.delete(tensionNote);
          }
        }
      } else  {
        throw new Chord.InvalidChordError(`Invalid chord: ${this}`);
      }
    }
  }

  getRawObj(): ChordRawObj {
    return {
      root: this.root.getRawObj(),
      triad: this.triad,
      sixth_or_seventh: (this.sixthOrSeventh === undefined)? null : this.sixthOrSeventh,
      tension_notes: Array.from(this.tensionNotes).map(tensionNote => tensionNote.getRawObj()),
      bass: (this.bass === undefined)? null : this.bass.getRawObj(),
    };
  }

  isEqualTo(that: Chord): boolean {
    if (!this.root.isEqualTo(that.root)) return false;
    if (this.triad !== that.triad) return false;
    if (this.sixthOrSeventh !== that.sixthOrSeventh) return false;
    if (this.tensionNotes.size !== that.tensionNotes.size) return false;
    for (const tensionNotePitchOfThis of this.tensionNotes.values()) {
      let isSameTensionNotePitchFound = false;
      for (const tensionNotePitchOfThat of that.tensionNotes.values()) {
        if (tensionNotePitchOfThis.isEqualTo(tensionNotePitchOfThat)) {
          isSameTensionNotePitchFound = true;
          break;
        }
      }
      if (!isSameTensionNotePitchFound) return false;
    }
    if ((this.bass === undefined) && (that.bass !== undefined)) return false;
    if ((this.bass !== undefined) && (that.bass === undefined)) return false;
    if ((this.bass !== undefined) && (that.bass !== undefined)) {
      if (!this.bass.isEqualTo(that.bass)) return false;
    }
    return true;
  }

  clone() {
    const tensionNotes = new Set<TensionNotePitch>();
    this.tensionNotes.forEach(tensionNote => {
      tensionNotes.add(tensionNote.clone());
    });
    return new Chord(
      this.root.clone(),
      this.triad,
      this.sixthOrSeventh,
      tensionNotes,
      (this.bass === undefined)? undefined : this.bass.clone(),
    );
  }

  static loadFromRawObj(rawObj: ChordRawObj): Chord {
    return new Chord(
      NotePitch.loadFromRawObj(rawObj.root),
      rawObj.triad,
      (rawObj.sixth_or_seventh === null)? undefined : rawObj.sixth_or_seventh,
      new Set(rawObj.tension_notes.map(tensionNoteRawObj => TensionNotePitch.loadFromRawObj(tensionNoteRawObj))),
      (rawObj.bass === null)? undefined : NotePitch.loadFromRawObj(rawObj.bass),
    );
  }

  get sortedTensionNotes(): TensionNotePitch[] {
    const sortedTensionNotes: TensionNotePitch[] = [];
    for (const targetTensionNote of Object.values(tnp)) {
      for (const tensionNote of this.tensionNotes) {
        if (targetTensionNote.isEqualTo(tensionNote)) {
          sortedTensionNotes.push(targetTensionNote);
          break;
        }
      }
    }
    return sortedTensionNotes;
  }

  #isHalfDiminished7th?: boolean;
  get isHalfDiminished7th(): boolean {
    const self = raw(this);
    if (self.#isHalfDiminished7th === undefined) {
      self.#isHalfDiminished7th = (self.triad === 'diminished') && (self.sixthOrSeventh === 'dominantSeventh');
    }
    return self.#isHalfDiminished7th;
  }

  #isDiminished7th?: boolean;
  get isDiminished7th(): boolean {
    const self = raw(this);
    if (self.#isDiminished7th === undefined) {
      self.#isDiminished7th = (self.triad === 'diminished') && (self.sixthOrSeventh === 'diminishedSeventh');
    }
    return self.#isDiminished7th;
  }

  #basicChordText?: string;
  get basicChordText(): string {
    const self = raw(this);
    if (self.#basicChordText === undefined) {
      let basicChordText = '';
      if (self.isHalfDiminished7th) {
        basicChordText = 'm7';
      } else if (self.isDiminished7th) {
        basicChordText = 'dim7';
      } else {
        switch (self.triad) {
          case 'minor':
            basicChordText = 'm';
            break;
          case 'diminished':
            basicChordText = 'dim';
            break;
          case 'augumented':
            basicChordText = 'aug';
            break;
        }
        switch (self.sixthOrSeventh) {
          case 'sixth':
            basicChordText += '6';
            break;
          case 'dominantSeventh':
            basicChordText += '7';
            break;
          case 'majorSeventh':
            basicChordText += 'M7';
            break;
        }
      }
      self.#basicChordText = basicChordText;
    } 
    return self.#basicChordText;
  }

  #additionalChordText?: string;
  get additionalChordText(): string {
    const self = raw(this);
    if (self.#additionalChordText === undefined) {
      let additionalChordText = '';
      if (self.isHalfDiminished7th) {
        additionalChordText += '-5';
      } else {
        switch (self.triad) {
          case 'suspendedFourth':
            additionalChordText += 'sus4';
            break;
          case 'suspendedSecond':
            additionalChordText += 'sus2';
            break;
        }
      }
      self.#additionalChordText = additionalChordText;
    }
    return self.#additionalChordText;
  }

  #string?: string;
  toString() {
    const self = raw(this);
    if (self.#string === undefined) {
      let string = `${self.root}`;
      if (self.basicChordText) string += self.basicChordText;
      if (self.additionalChordText) string += self.additionalChordText;
      if (self.sortedTensionNotes.length > 0) {
        string += `(${self.sortedTensionNotes.map(tensionNote => String(tensionNote)).join(' ')})`;
      }
      self.#string = string;
    }
    return self.#string;
  }

  #selectableSixthOrSevenths?: Set<ChordSixthOrSeventhType>;
  get selectableSixthOrSevenths() {
    const self = raw(this);
    if (self.#selectableSixthOrSevenths === undefined) {
      const selectableSixthOrSevenths = new Set<ChordSixthOrSeventhType>(Chord.SixthOrSeventh);
      switch (self.triad) {
        case 'major':
          selectableSixthOrSevenths.delete('diminishedSeventh');
          break;
        case 'minor':
          selectableSixthOrSevenths.delete('diminishedSeventh');
          break;
        case 'suspendedFourth':
          selectableSixthOrSevenths.delete('sixth');
          selectableSixthOrSevenths.delete('diminishedSeventh');
          break;
        case 'suspendedSecond':
          selectableSixthOrSevenths.delete('sixth');
          selectableSixthOrSevenths.delete('diminishedSeventh');
          selectableSixthOrSevenths.delete('dominantSeventh');
          selectableSixthOrSevenths.delete('majorSeventh');
          break;
        case 'diminished':
          selectableSixthOrSevenths.delete('sixth');
          break;
        case 'augumented':
          selectableSixthOrSevenths.delete('diminishedSeventh');
          selectableSixthOrSevenths.delete('sixth');
          break;
      }
      self.#selectableSixthOrSevenths = selectableSixthOrSevenths;
    }
    return self.#selectableSixthOrSevenths;
  }

  #selectableTensionNotes?: Set<TensionNotePitch>;
  get selectableTensionNotes() {
    const self = raw(this);
    if (self.#selectableTensionNotes === undefined) {
      const selectableTensionNotes = new Set(Object.values(tnp));
      switch (self.triad) {
        case 'major':
          selectableTensionNotes.delete(tnp.eleventh);
          break;
        case 'minor':
          selectableTensionNotes.delete(tnp.sharpNinth);
          break;
        case 'suspendedFourth':
          selectableTensionNotes.delete(tnp.eleventh);
          selectableTensionNotes.delete(tnp.sharpEleventh);
          break;
        case 'suspendedSecond':
          selectableTensionNotes.delete(tnp.ninth);
          selectableTensionNotes.delete(tnp.sharpNinth);
          selectableTensionNotes.delete(tnp.flatNinth);
          break;
        case 'diminished':
          selectableTensionNotes.delete(tnp.sharpNinth);
          selectableTensionNotes.delete(tnp.flatNinth);
          selectableTensionNotes.delete(tnp.sharpEleventh);
          break;
        case 'augumented':
          selectableTensionNotes.delete(tnp.flatNinth);
          selectableTensionNotes.delete(tnp.eleventh);
          selectableTensionNotes.delete(tnp.flatThirteenth);
          selectableTensionNotes.delete(tnp.thirteenth);
          break;
      }

      switch (self.sixthOrSeventh) {
        case 'sixth':
          selectableTensionNotes.delete(tnp.flatNinth);
          selectableTensionNotes.delete(tnp.sharpNinth);
          selectableTensionNotes.delete(tnp.flatThirteenth);
          selectableTensionNotes.delete(tnp.thirteenth);
          break;
        case 'diminishedSeventh':
          selectableTensionNotes.delete(tnp.flatNinth);
          selectableTensionNotes.delete(tnp.sharpNinth);
          selectableTensionNotes.delete(tnp.sharpEleventh);
          selectableTensionNotes.delete(tnp.thirteenth);
          break;
        case 'majorSeventh':
          selectableTensionNotes.delete(tnp.flatNinth);
          selectableTensionNotes.delete(tnp.sharpNinth);
          selectableTensionNotes.delete(tnp.eleventh);
          selectableTensionNotes.delete(tnp.flatThirteenth);
          break;
      }

      for (const tensionNote of self.tensionNotes) {
        switch (tensionNote) {
          case tnp.ninth:
            selectableTensionNotes.delete(tnp.flatNinth);
            selectableTensionNotes.delete(tnp.sharpNinth);
            break;
          case tnp.flatNinth:
            selectableTensionNotes.delete(tnp.ninth);
            break;
          case tnp.sharpNinth:
            selectableTensionNotes.delete(tnp.ninth);
            break;
          case tnp.eleventh:
            selectableTensionNotes.delete(tnp.sharpEleventh);
            break;
          case tnp.sharpEleventh:
            selectableTensionNotes.delete(tnp.eleventh);
            break;
          case tnp.thirteenth:
            selectableTensionNotes.delete(tnp.flatThirteenth);
            break;
          case tnp.flatThirteenth:
            selectableTensionNotes.delete(tnp.thirteenth);
            break;
        }
      }
      self.#selectableTensionNotes = selectableTensionNotes;
    }
    return self.#selectableTensionNotes;
  }

  #isValid?: boolean;
  get isValid(): boolean {
    const self = raw(this);
    if (self.#isValid === undefined) {
      let isValid = true;
      if (self.sixthOrSeventh !== undefined) {
        let isSixthOrSeventhSelectable = false;
        for (const selectableSixthOrSeventh of self.selectableSixthOrSevenths) {
          if (selectableSixthOrSeventh === self.sixthOrSeventh) {
            isSixthOrSeventhSelectable = true;
            break;
          }
        }
        if (!isSixthOrSeventhSelectable) isValid = false;
      } else {
        for (const tensionNote of self.tensionNotes) {
          let isTensionNoteSelectable = false;
          for (const selectableTensionNote of self.selectableTensionNotes) {
            if (selectableTensionNote.isEqualTo(tensionNote)) {
              isTensionNoteSelectable = true;
              break;
            }
          }
          if (!isTensionNoteSelectable) {
            isValid = false;
            break;
          }
        }
      }
      self.#isValid = isValid;
    }
    return self.#isValid;
  }

  transpose(scale: Scale, targetScale: Scale): Chord {
    const newChord = this.clone();
    newChord.root = newChord.root.transpose(scale, targetScale);
    if (newChord.bass !== undefined) {
      newChord.bass = newChord.bass.transpose(scale, targetScale);
    }
    return newChord;
  }
}
