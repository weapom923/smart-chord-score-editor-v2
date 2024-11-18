import { raw } from "./utils";

function getGCD(x: number, y: number): number {
  return (y === 0)? x : getGCD(y, x % y);
}

export type RationalNumberRawObj = {
  numerator: number,
  denominator: number,
}

export class RationalNumber<T extends RationalNumber<any> = RationalNumber<any>> {
  static TypeError = class extends Error {
    constructor(message?: string, options?: ErrorOptions) {
      super(message, options);
    }
  }

  #isNegative: boolean;
  #numerator: number;
  #denominator: number;

  constructor(numerator: number, denominator: number = 1, { reduces }: { reduces: boolean } = { reduces: false }) {
    const normalized = RationalNumber.normalizeNumeratorAndDenominator(numerator, denominator);
    this.#isNegative = normalized.isNegative;
    this.#numerator = normalized.numerator;
    this.#denominator = normalized.denominator;
    if (reduces) this.reduce();
    this.validate();
  }

  assign(that: RationalNumber) {
    const self = raw(this);
    that = raw(that);
    self.#isNegative = that.#isNegative;
    self.#numerator = that.#numerator;
    self.#denominator = that.#denominator;
  }

  #set(numerator: number, denominator: number, { reduces }: { reduces: boolean } = { reduces: false }): T {
    const self = raw(this);
    const normalized = RationalNumber.normalizeNumeratorAndDenominator(numerator, denominator);
    self.#isNegative = normalized.isNegative;
    self.#numerator = normalized.numerator;
    self.#denominator = normalized.denominator;
    this.validate();
    if (reduces) this.reduce();
    return <any> this;
  }

  get isNegative(): boolean { return raw(this).#isNegative }
  get numerator(): number { return raw(this).#numerator }
  set numerator(numerator: number) { raw(this).#set(numerator, this.denominator) }
  get numeratorWithSign(): number { return (this.isNegative)? -this.numerator : this.numerator }
  get denominator(): number { return raw(this).#denominator }
  set denominator(denominator: number) { raw(this).#set(this.numerator, denominator) }

  static normalizeNumeratorAndDenominator(numerator: number, denominator: number) {
    const isNumeratorNegative = (numerator < 0);
    const isDenominatorNegative = (denominator < 0);
    return {
      isNegative: (isNumeratorNegative !== isDenominatorNegative),
      numerator: (isNumeratorNegative)? -numerator : numerator,
      denominator: (isDenominatorNegative)? -denominator : denominator,
    };
  }

  validate() {
    if (!Number.isSafeInteger(this.numerator)) {
        throw new RationalNumber.TypeError(`numerator(${this.numerator}) is not a safe integer`);
    }
    if (!Number.isSafeInteger(this.denominator)) {
        throw new RationalNumber.TypeError(`denominator(${this.denominator}) is not a safe integer`);
    }
  }

  getRawObj(): RationalNumberRawObj {
    return {
      numerator: this.numeratorWithSign,
      denominator: this.denominator,
    };
  }

  clone(): RationalNumber<T> {
    return new RationalNumber<T>(
      this.numeratorWithSign,
      this.denominator,
    );
  }

  loadFromRawObj(rawObj: RationalNumberRawObj): RationalNumber<T> {
    return new RationalNumber<T>(
      rawObj.numerator,
      rawObj.denominator,
    );
  }

  reduce(): T {
    const gcd = getGCD(this.numerator, this.denominator);
    return raw(this).#set(
      this.numeratorWithSign / gcd,
      this.denominator / gcd,
    );
  }

  reduceTo(denominator: number): T {
    const gcd = getGCD(this.denominator, denominator);
    const xScale = denominator / gcd;
    const yScale = this.denominator / gcd;
    return raw(this).#set(
      this.numeratorWithSign * xScale,
      gcd * xScale * yScale,
    );
  }

  static reduceToCommonDenominator<T extends RationalNumber<any>>({ x, y }: { x: T, y: T }) {
    const gcd = getGCD(x.denominator, y.denominator);
    const xScale = y.denominator / gcd;
    const yScale = x.denominator / gcd;
    return {
      commonDenominator: gcd * xScale * yScale,
      xNominator: x.numeratorWithSign * xScale,
      yNominator: y.numeratorWithSign * yScale,
    };
  }

  toNumber(): number {
    return this.numeratorWithSign / this.denominator;
  }

  toString(): string {
    return `${this.numeratorWithSign}/${this.denominator}`;
  }

  invertSign(): T {
    const self = raw(this);
    self.#isNegative = !self.#isNegative;
    return <any> this;
  }

  add(that: RationalNumber<T>): T {
    const { commonDenominator, xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return raw(this).#set(
      xNominator + yNominator,
      commonDenominator,
    );
  }

  subtract(that: RationalNumber<T>): T {
    const { commonDenominator, xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return raw(this).#set(
      xNominator - yNominator,
      commonDenominator,
    );
  }

  multiply(that: RationalNumber<T>): T {
    return raw(this).#set(
      this.numeratorWithSign * that.numeratorWithSign,
      this.denominator * that.denominator,
      { reduces: true },
    );
  }

  divide(that: RationalNumber<T>): T {
    return raw(this).#set(this.numeratorWithSign * that.denominator, this.denominator * that.numeratorWithSign, { reduces: true });
  }

  modulo(that: RationalNumber<T>): RationalNumber<T> {
    const { commonDenominator, xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return new RationalNumber<T>(xNominator % yNominator, commonDenominator, { reduces: true });
  }

  isSameAs(that: RationalNumber<T>): boolean {
    const self = raw(this);
    that = raw(that);
    if (self.#denominator !== that.#denominator) return false;
    if (self.#numerator !== that.#numerator) return false;
    if (self.#isNegative !== that.#isNegative) return false;
    return true;
  }

  isEqualTo(that: RationalNumber<T>): boolean {
    const { xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return (xNominator === yNominator);
  }

  isLessThan(that: RationalNumber<T>): boolean {
    const { xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return (xNominator < yNominator);
  }

  isGreaterThan(that: RationalNumber<T>): boolean {
    const { xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return (xNominator > yNominator);
  }

  isLessThanOrEqualTo(that: RationalNumber<T>): boolean {
    const { xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return (xNominator <= yNominator);
  }

  isGreaterThanOrEqualTo(that: RationalNumber<T>): boolean {
    const { xNominator, yNominator } = RationalNumber.reduceToCommonDenominator({ x: this, y: that });
    return (xNominator >= yNominator);
  }
}
