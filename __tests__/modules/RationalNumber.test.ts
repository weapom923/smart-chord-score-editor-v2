import { describe, test, expect } from '@jest/globals'
import { RationalNumber } from '../../src/modules/RationalNumber'

describe(
  'rational number',
  () => {
    test(
      'basic',
      () => {
        expect(new RationalNumber(1, 2).toNumber()).toBe(0.5);
        expect(new RationalNumber(-1, 2).toNumber()).toBe(-0.5);
        expect(new RationalNumber(1, -2).toNumber()).toBe(-0.5);
        expect(new RationalNumber(-1, -2).toNumber()).toBe(0.5);

        expect(new RationalNumber(2, 4, { reduces: true }).isEqualTo(new RationalNumber(1, 2))).toBe(true);
        expect(new RationalNumber(2, 4).isSameAs( new RationalNumber(1, 2))).toBe(false);
        expect(new RationalNumber(2, 4).isEqualTo(new RationalNumber(1, 2))).toBe(true);

        expect(new RationalNumber(1, 2).isGreaterThanOrEqualTo(new RationalNumber(1, 2))).toBe(true);
        expect(new RationalNumber(1, 2).isGreaterThan(         new RationalNumber(1, 2))).toBe(false);
        expect(new RationalNumber(3, 4).isGreaterThanOrEqualTo(new RationalNumber(1, 2))).toBe(true);
        expect(new RationalNumber(3, 4).isGreaterThan(         new RationalNumber(1, 2))).toBe(true);

        expect(new RationalNumber(1, 2).isLessThanOrEqualTo(new RationalNumber(1, 2))).toBe(true);
        expect(new RationalNumber(1, 2).isLessThan(         new RationalNumber(1, 2))).toBe(false);
        expect(new RationalNumber(1, 4).isLessThanOrEqualTo(new RationalNumber(1, 2))).toBe(true);
        expect(new RationalNumber(1, 4).isLessThan(         new RationalNumber(1, 2))).toBe(true);

        expect(new RationalNumber(-1, 2).numerator).toBe(1);
        expect(new RationalNumber(-1, 2).numeratorWithSign).toBe(-1);
        expect(new RationalNumber(-1, 2).denominator).toBe(2);

        expect(new RationalNumber(1, -2).numerator).toBe(1);
        expect(new RationalNumber(1, -2).numeratorWithSign).toBe(-1);
        expect(new RationalNumber(1, -2).denominator).toBe(2);

        expect(() => new RationalNumber(Infinity)).toThrow(RationalNumber.TypeError);

        expect(new RationalNumber(1, 2).add(new RationalNumber(1, 2)).isEqualTo(new RationalNumber(1))).toBe(true);
        expect(new RationalNumber(1, 2).subtract(new RationalNumber(1, 2)).isEqualTo(new RationalNumber(0))).toBe(true);
        expect(new RationalNumber(1, 2).multiply(new RationalNumber(1, 2)).isEqualTo(new RationalNumber(1, 4))).toBe(true);
        expect(new RationalNumber(1, 2).divide(new RationalNumber(1, 2)).isEqualTo(new RationalNumber(1))).toBe(true);
      },
    );
  },
)