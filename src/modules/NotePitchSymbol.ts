import { raw } from './utils';

type NotePitchSymbolNameType = typeof NotePitchSymbol.Name[number];
type CyclicNoteNumberType = typeof NotePitchSymbol.CyclicNoteNumber[number];

export type NotePitchSymbolRawObj = {
  name: NotePitchSymbolNameType,
};

export class NotePitchSymbol {
  static readonly Name = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] as const;
  static readonly CyclicNoteNumber = [ 0, 2, 4, 5, 7, 9, 11 ] as const;

  static readonly instance = {
    a: new NotePitchSymbol('A'),
    b: new NotePitchSymbol('B'),
    c: new NotePitchSymbol('C'),
    d: new NotePitchSymbol('D'),
    e: new NotePitchSymbol('E'),
    f: new NotePitchSymbol('F'),
    g: new NotePitchSymbol('G'),
  } as const;

  readonly name: NotePitchSymbolNameType;

  constructor(name: NotePitchSymbolNameType) {
    this.name = name;
  }

  getRawObj(): NotePitchSymbolRawObj {
    return {
      name: this.name,
    };
  }

  isEqualTo(that: NotePitchSymbol) {
    return (raw(this) === raw(that));
  }

  static loadFromRawObj(rawObj: NotePitchSymbolRawObj): NotePitchSymbol {
    return NotePitchSymbol.findPredefinedNotePitchSymbol(rawObj.name);
  }

  toString() {
    return this.name;
  }

  #cyclicNoteNumber?: CyclicNoteNumberType;
  get cyclicNoteNumber() {
    const self = raw(this);
    if (self.#cyclicNoteNumber === undefined) {
      switch (self.name) {
        case 'A':
          self.#cyclicNoteNumber = 9;
          break;
        case 'B':
          self.#cyclicNoteNumber = 11;
          break;
        case 'C':
          self.#cyclicNoteNumber = 0;
          break;
        case 'D':
          self.#cyclicNoteNumber = 2;
          break;
        case 'E':
          self.#cyclicNoteNumber = 4;
          break;
        case 'F':
          self.#cyclicNoteNumber = 5;
          break;
        case 'G':
          self.#cyclicNoteNumber = 7;
          break;
      }
    }
    return self.#cyclicNoteNumber;
  }

  static findPredefinedNotePitchSymbol(name: string): NotePitchSymbol {
    switch (name) {
      case 'A': return nps.a;
      case 'B': return nps.b;
      case 'C': return nps.c;
      case 'D': return nps.d;
      case 'E': return nps.e;
      case 'F': return nps.f;
      case 'G': return nps.g;
    }
    throw new RangeError();
  }
}

export const nps = NotePitchSymbol.instance;
