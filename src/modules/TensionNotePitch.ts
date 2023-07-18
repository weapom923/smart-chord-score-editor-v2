import { raw } from './utils';

export type TensionNotePitchSymbolType = typeof TensionNotePitch.Symbol[number];

export type TensionNotePitchRawObj = {
  symbol: TensionNotePitchSymbolType,
  is_flat: boolean,
  is_sharp: boolean,
};

export class TensionNotePitch {
  static readonly Symbol = [ 'ninth', 'eleventh', 'thirteenth' ] as const;

  // sorted
  static readonly instance = {
    flatNinth:      new TensionNotePitch('ninth',      true,  false),
    ninth:          new TensionNotePitch('ninth',      false, false),
    sharpNinth:     new TensionNotePitch('ninth',      false, true),
    eleventh:       new TensionNotePitch('eleventh',   false, false),
    sharpEleventh:  new TensionNotePitch('eleventh',   false, true),
    flatThirteenth: new TensionNotePitch('thirteenth', true,  false),
    thirteenth:     new TensionNotePitch('thirteenth', false, false),
  } as const;

  readonly symbol: TensionNotePitchSymbolType;
  readonly isFlat: boolean;
  readonly isSharp: boolean;

  #isNatural?: boolean;
  get isNatural(): boolean {
    const self = raw(this);
    if (self.#isNatural === undefined) {
      self.#isNatural = !self.isFlat && !self.isSharp;
    }
    return self.#isNatural;
  }

  #symbolText?: string;
  get symbolText(): string {
    const self = raw(this);
    if (self.#symbolText === undefined) {
      switch (self.symbol) {
        case 'ninth':      
          self.#symbolText = '9';
          break;
        case 'eleventh':
          self.#symbolText = '11';
          break;
        case 'thirteenth':
          self.#symbolText = '13';
          break;
        default:
          self.#symbolText = '';
          break;
      }
    }
    return self.#symbolText;
  }

  #flatOrSharpText?: string;
  get flatOrSharpText(): string {
    const self = raw(this);
    if (self.#flatOrSharpText === undefined) {
      if (self.isSharp) {
        self.#flatOrSharpText = '♯';
      } else if (self.isFlat) {
        self.#flatOrSharpText = '♭';
      } else {
        self.#flatOrSharpText = '';
      }
    }
    return self.#flatOrSharpText;
  }

  constructor(symbol: TensionNotePitchSymbolType, flat: boolean, sharp: boolean) {
    this.symbol = symbol;
    this.isFlat = flat;
    this.isSharp = sharp;
  }

  getRawObj(): TensionNotePitchRawObj {
    return {
      symbol: this.symbol,
      is_flat: this.isFlat,
      is_sharp: this.isSharp,
    };
  }

  isEqualTo(that: TensionNotePitch) {
    return (raw(this) === raw(that));
  }

  clone(): TensionNotePitch {
    return this;
  }

  static loadFromRawObj(rawObj: TensionNotePitchRawObj): TensionNotePitch {
    return TensionNotePitch.findPredefinedTensionNotePitch(rawObj.symbol, rawObj.is_flat, rawObj.is_sharp);
  }

  #string?: string;
  toString() {
    const self = raw(this);
    if (self.#string === undefined) {
      let string = '';
      if (self.flatOrSharpText) string += self.flatOrSharpText;
      if (self.symbolText) string += self.symbolText;
      self.#string = string;
    }
    return self.#string;
  }

  static findPredefinedTensionNotePitch(symbol: TensionNotePitchSymbolType, isFlat: boolean, isSharp: boolean) {
    switch (symbol) {
      case 'ninth':
        if (isFlat) {
          return tnp.flatNinth;
        } else if (isSharp) {
          return tnp.flatThirteenth;
        } else {
          return tnp.ninth;
        }
      case 'eleventh':
        if (isSharp) {
          return tnp.sharpEleventh;
        } else {
          return tnp.eleventh;
        }
      case 'thirteenth':
        if (isFlat) {
          return tnp.flatThirteenth;
        } else {
          return tnp.thirteenth;
        }
    }
  }
}

export const tnp = TensionNotePitch.instance;
