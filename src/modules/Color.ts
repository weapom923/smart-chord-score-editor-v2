import { raw } from './utils';

export type ColorRawObj = {
  red: number,
  green: number,
  blue: number,
  alpha: number,
};

export class Color {
  static readonly instance = {
    get transparent() { return new Color(255, 255, 255, 0) },
    get black()       { return new Color(0, 0, 0, 1) },
    get red()         { return new Color(255, 0, 0, 1) },
  };

  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly alpha: number;

  constructor(red: number, green: number, blue: number, alpha = 1) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  getRawObj(): ColorRawObj {
    return {
      red: this.red,
      green: this.green,
      blue: this.blue,
      alpha: this.alpha,
    };
  }

  isEqualTo(that: Color) {
    if (this.red !== that.red) return false;
    if (this.green !== that.green) return false;
    if (this.blue !== that.blue) return false;
    if (this.alpha !== that.alpha) return false;
    return true;
  }

  static loadFromRawObj(rawObj: ColorRawObj): Color {
    return new Color(rawObj.red, rawObj.green, rawObj.blue, rawObj.alpha);
  }

  clone(): Color {
    return Color.loadFromRawObj(this.getRawObj());
  }

  #rgba?: Array<number>;
  get rgba() {
    let self = raw(this);
    if (self.#rgba === undefined) {
      self.#rgba = [ self.red, self.green, self.blue, self.alpha ];
    }
    return self.#rgba;
  }

  #styleString?: string;
  #styleStringWithAlpha?: string;
  styleString(withAlpha: boolean = true): string {
    let self = raw(this);
    if (withAlpha) {
      if (self.#styleStringWithAlpha === undefined) {
        self.#styleStringWithAlpha = `rgba(${self.red}, ${self.green}, ${self.blue}, ${self.alpha})`;
      }
      return self.#styleStringWithAlpha;
    } else {
      if (self.#styleString === undefined) {
        self.#styleString = `rgb(${self.red}, ${self.green}, ${self.blue})`;
      }
      return self.#styleString;
    }
  }
}

export const cl = Color.instance;

export default Color;