import { NotePitch, NotePitchRawObj } from './NotePitch';
import { NoteValue, NoteValueRawObj } from './NoteValue';
import { Chord, ChordRawObj } from './Chord';

export type NoteType = 'normal' | 'rest';

export type NoteRawObj = {
  pitch?: NotePitchRawObj,
  chord?: ChordRawObj,
  value: NoteValueRawObj,
  type: NoteType,
  tied: boolean,
}

export class Note {
  pitchOrChord: NotePitch | Chord | null;
  value: NoteValue;
  type: NoteType;
  tied: boolean;

  constructor(pitchOrChord: NotePitch | Chord | null, value: NoteValue, type: NoteType, tied: boolean) {
    this.pitchOrChord = pitchOrChord;
    this.value = value;
    this.type = type;
    this.tied = (type === 'rest')? false : tied;
  }

  getRawObj(): NoteRawObj {
    if (this.pitchOrChord instanceof NotePitch) {
      return {
        pitch: this.pitchOrChord.getRawObj(),
        value: this.value.getRawObj(),
        type: this.type,
        tied: this.tied,
      };
    } else if (this.pitchOrChord instanceof Chord) {
      return {
        chord: this.pitchOrChord.getRawObj(),
        value: this.value.getRawObj(),
        type: this.type,
        tied: this.tied,
      };
    } else {
      return {
        value: this.value.getRawObj(),
        type: this.type,
        tied: this.tied,
      };
    }
  }

  static loadFromRawObj(rawObj: NoteRawObj): Note {
    let pitchOrChord: NotePitch | Chord | null = null;
    if (rawObj.pitch !== undefined) {
      pitchOrChord = NotePitch.loadFromRawObj(rawObj.pitch);
    } else if (rawObj.chord !== undefined) {
      pitchOrChord = Chord.loadFromRawObj(rawObj.chord);
    }
    return new Note(
      pitchOrChord,
      NoteValue.loadFromRawObj(rawObj.value),
      rawObj.type,
      rawObj.tied,
    );
  }

  clone(): Note {
    let pitchOrChord: NotePitch | Chord | null = null;
    if (this.pitchOrChord instanceof NotePitch) {
      pitchOrChord = this.pitchOrChord.clone();
    } else if (this.pitchOrChord instanceof Chord) {
      pitchOrChord = this.pitchOrChord.clone();
    }
    return new Note(
      pitchOrChord,
      this.value.clone(),
      this.type,
      this.tied,
    );
  }

  isEqualTo(that: Note): boolean {
    if (this.type !== that.type) return false;
    switch (this.type) {
      case 'normal':
        if ((this.pitchOrChord instanceof NotePitch) && (that.pitchOrChord instanceof NotePitch)) {
          if (!this.pitchOrChord.isEqualTo(that.pitchOrChord)) return false;
        } else if ((this.pitchOrChord instanceof Chord) && (that.pitchOrChord instanceof Chord)) {
          if (!this.pitchOrChord.isEqualTo(that.pitchOrChord)) return false;
        } else {
          if (this.pitchOrChord !== that.pitchOrChord) return false;
        }
        break;
    }
    if (!this.value.isEqualTo(that.value)) return false;
    if (this.tied !== that.tied) return false;
    return true;
  }

  assign(that: Note): Note {
    this.pitchOrChord = that.pitchOrChord;
    this.value = that.value;
    this.type = that.type;
    this.tied = that.tied;
    return this;
  }

  generateNewNoteFrom(): Note {
    return new Note(
      null,
      this.value.clone(),
      this.type,
      false,
    );
  }
}
