export type BarRepeatEndingRawObj = {
  numbers: Array<number>,
};

export class BarRepeatEnding {
  static readonly instance = {
    empty: new BarRepeatEnding(),
  } as const;

  numbers: Set<number>;

  constructor(numbers = new Set<number>()) {
    this.numbers = numbers;
  }

  getRawObj(): BarRepeatEndingRawObj {
    return {
      numbers: Array.from(this.numbers),
    };
  }

  isEqualTo(that: BarRepeatEnding) {
    if (this.numbers.size !== that.numbers.size) return false;
    for (const number of this.numbers) {
      if (!that.numbers.has(number)) return false;
    }
    return true;
  }

  clone(): BarRepeatEnding {
    return BarRepeatEnding.loadFromRawObj(this.getRawObj());
  }

  assign(that: BarRepeatEnding) {
    this.numbers = that.numbers;
  }

  static loadFromRawObj(rawObj: BarRepeatEndingRawObj): BarRepeatEnding {
    return new BarRepeatEnding(new Set(rawObj.numbers));
  }
}

export const bre = BarRepeatEnding.instance;
