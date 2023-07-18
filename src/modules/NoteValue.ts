import { RationalNumber } from './RationalNumber';
import { calculateMaximumPowerOfTwoLessThanOrEqualTo } from './utils';

export type NoteValueRawObj = {
  numerator: number,
  denominator: number,
}

export class NoteValue extends RationalNumber<NoteValue> {
  static readonly Error = class extends Error {};

  static readonly instance = {
    get zero() { return new NoteValue(0) },
    divisible: {
      get whole()        { return new NoteValue(1, 1) },
      get half()         { return new NoteValue(1, 2) },
      get quarter()      { return new NoteValue(1, 4) },
      get eighth()       { return new NoteValue(1, 8) },
      get sixteenth()    { return new NoteValue(1, 16) },
      get thirtySecond() { return new NoteValue(1, 32) },
      get sixtyFourth()  { return new NoteValue(1, 64) },
    } as const,
  } as const;

  constructor(unitValueRatio: number, unitValueNumber: number = 1) {
    super(unitValueRatio, unitValueNumber);
  }

  getRawObj(): NoteValueRawObj {
    return {
      numerator: this.numerator,
      denominator: this.denominator,
    };
  }

  clone(): NoteValue {
    return NoteValue.loadFromRawObj(this.getRawObj());
  }

  assign(that: NoteValue) {
    super.assign(that);
  }

  static loadFromRawObj(rawObj: NoteValueRawObj) {
    return new NoteValue(rawObj.numerator, rawObj.denominator);
  }

  isDivisible(): boolean {
    for (const divisibleNoteValue of Object.values(nv.divisible)) {
      if (this.isEqualTo(divisibleNoteValue)) return true;
    }
    return false;
  }

  isDottedOfDivisible(): boolean {
    return (this.undot() !== undefined);
  }

  undot(): NoteValue | undefined {
    const undottedNoteValue = new NoteValue(2, 3).multiply(this);
    return (undottedNoteValue.isDivisible())? undottedNoteValue : undefined;
  }

  dot(): NoteValue | undefined {
    if (this.isEqualTo(nv.divisible.sixtyFourth)) return undefined;
    return (this.isDivisible())? new NoteValue(3, 2).multiply(this) : undefined;
  }

  getRate(barValue: NoteValue): number {
    return this.toNumber() / barValue.toNumber();
  }

  splitIntoDivisibleNoteValues(offsetNoteValue: NoteValue, globalGridNoteValue = nv.divisible.half): NoteValue[] {
    const divisibleNoteValues: NoteValue[] = [];
    const remainingNoteValue: NoteValue = this.clone();
    const offsetNoteValueInGlobalGrid = offsetNoteValue.modulo(globalGridNoteValue);
    if (offsetNoteValueInGlobalGrid.isGreaterThan(nv.zero)) {
      let remainingNoteValueInGlobalGrid = globalGridNoteValue.clone().subtract(offsetNoteValueInGlobalGrid);
      if (remainingNoteValueInGlobalGrid.isGreaterThan(remainingNoteValue)) {
        remainingNoteValueInGlobalGrid.assign(remainingNoteValue);
      }
      if (remainingNoteValueInGlobalGrid.isLessThanOrEqualTo(remainingNoteValue) && 
        (remainingNoteValueInGlobalGrid.isDivisible() || remainingNoteValueInGlobalGrid.isDottedOfDivisible())) {
        divisibleNoteValues.push(remainingNoteValueInGlobalGrid);
      } else {
        let remainingNoteValueRatioInGlobalGrid = remainingNoteValueInGlobalGrid
          .clone()
          .reduceTo(nv.divisible.sixtyFourth.denominator).numerator;
        while (remainingNoteValueRatioInGlobalGrid > 0) {
          const divisibleNoteValueRatio = calculateMaximumPowerOfTwoLessThanOrEqualTo(remainingNoteValueRatioInGlobalGrid);
          divisibleNoteValues.unshift(new NoteValue(divisibleNoteValueRatio).multiply(nv.divisible.sixtyFourth));
          remainingNoteValueRatioInGlobalGrid -= divisibleNoteValueRatio;
        }
      }
      remainingNoteValue.subtract(remainingNoteValueInGlobalGrid);
    }
    if (remainingNoteValue.isDivisible() || remainingNoteValue.isDottedOfDivisible()) {
      divisibleNoteValues.push(remainingNoteValue);
    } else {
      while (remainingNoteValue.isGreaterThan(nv.zero)) {
        if (remainingNoteValue.isDivisible() || remainingNoteValue.isDottedOfDivisible()) {
          divisibleNoteValues.push(remainingNoteValue);
          break;
        } else {
          if (remainingNoteValue.isGreaterThan(globalGridNoteValue)) {
            divisibleNoteValues.push(globalGridNoteValue);
            remainingNoteValue.subtract(globalGridNoteValue);
          } else {
            let remainingNoteValueRatio = remainingNoteValue.reduceTo(nv.divisible.sixtyFourth.denominator).numerator;
            while (remainingNoteValueRatio > 0) {
              const divisibleNoteValueRatio = calculateMaximumPowerOfTwoLessThanOrEqualTo(remainingNoteValueRatio);
              divisibleNoteValues.push(new NoteValue(divisibleNoteValueRatio).multiply(nv.divisible.sixtyFourth));
              remainingNoteValueRatio -= divisibleNoteValueRatio;
            }
            break;
          }
        }
      }
    }
    return divisibleNoteValues.map(noteValue => (noteValue.reduce()));
  }
}

export const nv = NoteValue.instance;
