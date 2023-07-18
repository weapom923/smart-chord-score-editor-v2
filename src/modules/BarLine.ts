import { raw } from './utils';

export type BarLineStartType = typeof BarLine.Type.start[number];
export type BarLineEndType = typeof BarLine.Type.end[number];
export type BarLineType = BarLineStartType | BarLineEndType;

export type BarLineRawObj = {
  type: BarLineType,
};

export class BarLine {
  static readonly Type = {
    start: [ 'empty', 'repeatStart' ] as const,
    end: [ 'single', 'double', 'repeatEnd', 'greatDouble' ] as const,
  } as const;

  static readonly instance = {
    start: {
      empty:       new BarLine('empty'),
      repeatStart: new BarLine('repeatStart'),
    } as const,
    end: {
      single:      new BarLine('single'),
      double:      new BarLine('double'),
      repeatEnd:   new BarLine('repeatEnd'),
      greatDouble: new BarLine('greatDouble'),
    } as const,
  } as const;

  type: BarLineType;

  constructor(type: BarLineType) {
    this.type = type;
  }

  getRawObj(): BarLineRawObj {
    return { type: this.type };
  }

  isEqualTo(that: BarLine) {
    return raw(this) === raw(that);
  }

  static loadFromRawObj(rawObj: BarLineRawObj) {
    return BarLine.findPredefinedBarLine(rawObj.type);
  }

  static findPredefinedBarLine(type: BarLineType): BarLine {
    switch (type) {
      case 'empty':
        return bl.start.empty;
      case 'repeatStart':
        return bl.start.repeatStart;
      case 'single':
        return bl.end.single;
      case 'double':
        return bl.end.double;
      case 'repeatEnd':
        return bl.end.repeatEnd;
      case 'greatDouble':
        return bl.end.greatDouble;
    }
  }
}

export const bl = BarLine.instance;
