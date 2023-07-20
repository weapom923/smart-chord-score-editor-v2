import { raw } from './utils';
import { NotePitchSymbol, NotePitchSymbolRawObj, nps } from './NotePitchSymbol'

const numPitchesInOctave = 12;

export type NotePitchRawObj = {
  note_number: number,
  symbol: NotePitchSymbolRawObj;
};

export class NotePitch {
  static readonly instance = {
    a:      new NotePitch(9,  nps.a),
    aFlat:  new NotePitch(8,  nps.a),
    aSharp: new NotePitch(10, nps.a),
    b:      new NotePitch(11, nps.b),
    bFlat:  new NotePitch(10, nps.b),
    bSharp: new NotePitch(0,  nps.b),
    c:      new NotePitch(0,  nps.c),
    cFlat:  new NotePitch(11, nps.c),
    cSharp: new NotePitch(1,  nps.c),
    d:      new NotePitch(2,  nps.d),
    dFlat:  new NotePitch(1,  nps.d),
    dSharp: new NotePitch(3,  nps.d),
    e:      new NotePitch(4,  nps.e),
    eFlat:  new NotePitch(3,  nps.e),
    eSharp: new NotePitch(5,  nps.e),
    f:      new NotePitch(5,  nps.f),
    fFlat:  new NotePitch(4,  nps.f),
    fSharp: new NotePitch(6,  nps.f),
    g:      new NotePitch(7,  nps.g),
    gFlat:  new NotePitch(6,  nps.g),
    gSharp: new NotePitch(8,  nps.g),
  } as const;

  readonly noteNumber: number;
  readonly symbol: NotePitchSymbol;

  constructor(noteNumber: number, symbol: NotePitchSymbol) {
    this.noteNumber = noteNumber;
    this.symbol = symbol;
    if (this.shift > 2) throw 'too many sharps';
    if (this.shift < -2) throw 'too many flats';
  }

  #cyclicNoteNumber?: number;
  get cyclicNoteNumber() {
    const self = raw(this);
    if (self.#cyclicNoteNumber === undefined) {
      self.#cyclicNoteNumber = self.noteNumber % numPitchesInOctave;
    }
    return self.#cyclicNoteNumber;
  }

  #shift?: number;
  get shift() {
    const self = raw(this);
    if (self.#shift === undefined) {
      let sharpShiftAmount = self.cyclicNoteNumber - self.symbol.cyclicNoteNumber;
      let flatShiftAmount = self.symbol.cyclicNoteNumber - self.cyclicNoteNumber;
      if (sharpShiftAmount < 0) sharpShiftAmount += numPitchesInOctave;
      if (flatShiftAmount < 0) flatShiftAmount += numPitchesInOctave;
      if (sharpShiftAmount <= 6) {
        self.#shift = sharpShiftAmount;
      } else if (flatShiftAmount <= 6) {
        self.#shift = -flatShiftAmount;
      } else {
        self.#shift = 0;
      }
    }
    return self.#shift;
  }

  getRawObj(): NotePitchRawObj {
    return {
      note_number: this.noteNumber,
      symbol: this.symbol.getRawObj(),
    };
  }

  isEqualTo(that: NotePitch): boolean {
    if (this.noteNumber !== that.noteNumber) return false;
    if (!this.symbol.isEqualTo(that.symbol)) return false;
    return true;
  }

  clone(): NotePitch {
    return NotePitch.findPredefinedNotePitch(this.symbol, this.shift);
  }

  static loadFromRawObj(rawObj: NotePitchRawObj): NotePitch {
    const notePitch = new NotePitch(
      rawObj.note_number,
      NotePitchSymbol.loadFromRawObj(rawObj.symbol),
    );
    return NotePitch.findPredefinedNotePitch(notePitch.symbol, notePitch.shift);
  }

  get isDoubleFlat() {
    const self = raw(this);
    return (self.#shift === -2);
  }

  get isFlat() {
    const self = raw(this);
    return (self.#shift === -1);
  }

  get isNatural() {
    const self = raw(this);
    return (self.#shift === 0);
  }

  get isSharp() {
    const self = raw(this);
    return (self.#shift === 1);
  }

  get isDoubleSharp() {
    const self = raw(this);
    return (self.#shift === 2);
  }

  toString() {
    let notePitchString = this.symbol.toString();
    if (this.isNatural) notePitchString += '';
    else if (this.isFlat) notePitchString += 'b';
    else if (this.isSharp) notePitchString += '#';
    else notePitchString += '?';
    return notePitchString;
  }

  static findPredefinedNotePitch(symbol: NotePitchSymbol, shift: number): NotePitch {
    switch (raw(symbol)) {
      case nps.a:
        switch (shift) {
          case -1: return np.aFlat;
          case 0:  return np.a;
          case 1:  return np.aSharp;
        }
        break;
      case nps.b:
        switch (shift) {
          case -1: return np.bFlat;
          case 0:  return np.b;
          case 1:  return np.bSharp;
        }
        break;
      case nps.c:
        switch (shift) {
          case -1: return np.cFlat;
          case 0:  return np.c;
          case 1:  return np.cSharp;
        }
        break;
      case nps.d:
        switch (shift) {
          case -1: return np.dFlat;
          case 0:  return np.d;
          case 1:  return np.dSharp;
        }
        break;
      case nps.e:
        switch (shift) {
          case -1: return np.eFlat;
          case 0:  return np.e;
          case 1:  return np.eSharp;
        }
        break;
      case nps.f:
        switch (shift) {
          case -1: return np.fFlat;
          case 0:  return np.f;
          case 1:  return np.fSharp;
        }
        break;
      case nps.g:
        switch (shift) {
          case -1: return np.gFlat;
          case 0:  return np.g;
          case 1:  return np.gSharp;
        }
        break;
    }
    throw new RangeError();
  }
}

export const np = NotePitch.instance;