import { raw } from "./utils";

export type ScoreDataVersionRawObj = {
  major: number,
  minor: number,
  patch: number,
};

export class ScoreDataVersion {
  static UnsupportedVersionError = class extends Error {
    constructor(rawObj: ScoreDataVersionRawObj) {
      super(`Score data version ${rawObj.major}.${rawObj.minor}.${rawObj.patch} is unsupported.`);
    }
  }

  static readonly instance = {
    v0_1_0: new ScoreDataVersion(0, 1, 0),
    v0_2_0: new ScoreDataVersion(0, 2, 0),
    v0_3_0: new ScoreDataVersion(0, 3, 0),
  } as const;
  static readonly latest = ScoreDataVersion.instance.v0_3_0;

  public major: number;
  public minor: number;
  public patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  getRawObj(): ScoreDataVersionRawObj {
    return {
      major: this.major,
      minor: this.minor,
      patch: this.patch,
    };
  }

  static loadFromRawObj(rawObj: ScoreDataVersionRawObj) {
    return ScoreDataVersion.findPredefinedScoreDataVersion(rawObj);
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  isEqualTo(that: ScoreDataVersion): boolean {
    return (raw(this) === raw(that));
  }

  isSameAs(that: ScoreDataVersion) { return this.isEqualTo(that) }

  static getUpgradeTargetVersion(rawObj: ScoreDataVersionRawObj): ScoreDataVersion | undefined {
    switch (rawObj.major) {
      case 0:
        switch (rawObj.minor) {
          case 1:
            switch (rawObj.patch) {
              case 0: return sdv.v0_2_0;
            }
            break;
          case 2:
            switch (rawObj.patch) {
              case 0: return sdv.v0_3_0;
            }
            break;
        }
        break;
    }
    return undefined;
  }

  static findPredefinedScoreDataVersion(rawObj: ScoreDataVersionRawObj) {
    switch (rawObj.major) {
      case 0:
        switch (rawObj.minor) {
          case 1:
            switch (rawObj.patch) {
              case 0: return sdv.v0_1_0;
            }
            break;
          case 2:
            switch (rawObj.patch) {
              case 0: return sdv.v0_2_0;
            }
            break;
          case 3:
            switch (rawObj.patch) {
              case 0: return sdv.v0_3_0;
            }
            break;
        }
        break;
    }
    throw new ScoreDataVersion.UnsupportedVersionError(rawObj);
  }
}

export const sdv = ScoreDataVersion.instance;