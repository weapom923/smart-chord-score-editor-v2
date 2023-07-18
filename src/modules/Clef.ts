import { raw } from './utils';

type ClefName = typeof Clef.Name[number];

export type ClefRawObj = {
  name: ClefName,
};

export class Clef {
  static readonly Name = [ 'treble', 'bass' ] as const;

  static readonly instance = {
    treble: new Clef('treble'),
    bass:   new Clef('bass'),
  } as const;

  name: ClefName;

  constructor(name: ClefName) {
    this.name = name;
  }

  getRawObj(): ClefRawObj {
    return {
      name: this.name,
    };
  }

  isEqualTo(that: Clef): boolean {
    return raw(this) === raw(that);
  }

  static loadFromRawObj(rawObj: ClefRawObj): Clef {
    return Clef.findPredefinedBarBreak(rawObj.name);
  }

  static findPredefinedBarBreak(clefName: ClefName): Clef {
    switch (clefName) {
      case 'treble': return cl.treble;
      case 'bass':   return cl.bass;
    }
  }
}

export const cl = Clef.instance;
