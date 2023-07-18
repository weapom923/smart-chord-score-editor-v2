import { raw } from './utils';

type BarBreakType = typeof BarBreak.Type[number];

export type BarBreakRawObj = {
  type: BarBreakType,
};

export class BarBreak {
  static readonly Type = [ 'empty', 'system', 'page' ] as const;

  static readonly instance = {
    empty:  new BarBreak('empty'),
    system: new BarBreak('system'),
    page:   new BarBreak('page'),
  } as const;

  type: BarBreakType;

  constructor(type: BarBreakType) {
    this.type = type;
  }

  getRawObj(): BarBreakRawObj {
    return {
      type: this.type,
    };
  }

  isEqualTo(that: BarBreak) {
    return (raw(this) === raw(that));
  }

  static loadFromRawObj(rawObj: BarBreakRawObj): BarBreak {
    return BarBreak.findPredefinedBarBreak(rawObj.type);
  }

  static findPredefinedBarBreak(type: BarBreakType): BarBreak {
    switch (type) {
      case 'empty':  return bb.empty;
      case 'system': return bb.system;
      case 'page':   return bb.page;
    }
  }
}

export const bb = BarBreak.instance;
