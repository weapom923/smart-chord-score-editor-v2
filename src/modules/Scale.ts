import { raw } from './utils';
import { NotePitch, NotePitchRawObj, np } from './NotePitch';

export type ScaleType = typeof Scale.Type[number];

export type ScaleRawObj = {
  type: ScaleType,
  tonic_note_pitch: NotePitchRawObj,
};

export class Scale {
  static readonly instance = {
    cMajor:      new Scale(np.c,      'major'),
    gMajor:      new Scale(np.g,      'major'),
    dMajor:      new Scale(np.d,      'major'),
    aMajor:      new Scale(np.a,      'major'),
    eMajor:      new Scale(np.e,      'major'),
    bMajor:      new Scale(np.b,      'major'),
    fSharpMajor: new Scale(np.fSharp, 'major'),
    gFlatMajor:  new Scale(np.gFlat,  'major'),
    cSharpMajor: new Scale(np.cSharp, 'major'),
    dFlatMajor:  new Scale(np.dFlat,  'major'),
    aFlatMajor:  new Scale(np.aFlat,  'major'),
    eFlatMajor:  new Scale(np.eFlat,  'major'),
    bFlatMajor:  new Scale(np.bFlat,  'major'),
    fMajor:      new Scale(np.f,      'major'),

    aMinor:      new Scale(np.a,      'minor'),
    dMinor:      new Scale(np.d,      'minor'),
    gMinor:      new Scale(np.g,      'minor'),
    cMinor:      new Scale(np.c,      'minor'),
    fMinor:      new Scale(np.f,      'minor'),
    bFlatMinor:  new Scale(np.bFlat,  'minor'),
    eFlatMinor:  new Scale(np.eFlat,  'minor'),
    dSharpMinor: new Scale(np.dSharp, 'minor'),
    aFlatMinor:  new Scale(np.aFlat,  'minor'),
    gSharpMinor: new Scale(np.gSharp, 'minor'),
    cSharpMinor: new Scale(np.cSharp, 'minor'),
    fSharpMinor: new Scale(np.fSharp, 'minor'),
    bMinor:      new Scale(np.b,      'minor'),
    eMinor:      new Scale(np.e,      'minor'),
  } as const;

  static readonly Type = [
    'major',
    'minor',
  ] as const;

  readonly notePitches: NotePitch[];
  readonly type: ScaleType;

  #numSharps?: number;
  get numSharps(): number {
    const self = raw(this);
    if (self.#numSharps === undefined) {
      self.#numSharps = self.notePitches.filter(notePitch => notePitch.isSharp).length;
    }
    return self.#numSharps;
  }

  #numFlats?: number;
  get numFlats(): number {
    const self = raw(this);
    if (self.#numFlats === undefined) {
      self.#numFlats = self.notePitches.filter(notePitch => notePitch.isFlat).length;
    }
    return self.#numFlats;
  }

  constructor(tonicNotePitch: NotePitch, type: ScaleType) {
    tonicNotePitch = Scale.normalizeTonicNotePitch(tonicNotePitch, type);
    this.notePitches = Scale.getScaleNotePitches(tonicNotePitch, type);
    this.type = type;
  }

  get tonicNotePitch(): NotePitch {
    return this.notePitches[0];
  }

  getRawObj(): ScaleRawObj {
    return {
      type: this.type,
      tonic_note_pitch: this.tonicNotePitch.getRawObj(),
    };
  }

  isEqualTo(that: Scale): boolean {
    return this === that;
  }

  isParallelTo(that: Scale): boolean {
    if (this.isEqualTo(that)) return false;
    if (this.tonicNotePitch.noteNumber !== that.tonicNotePitch.noteNumber) return false;
    return true;
  }

  isRelativeTo(that: Scale): boolean {
    if (this.isEqualTo(that)) return false;
    if (this.numFlats !== that.numFlats) return false;
    if (this.numSharps !== that.numSharps) return false;
    return true;
  }

  static loadFromRawObj(rawObj: ScaleRawObj): Scale {
    return Scale.findPredefinedScale(NotePitch.loadFromRawObj(rawObj.tonic_note_pitch), rawObj.type);
  }

  static findPredefinedScale(tonicNotePitch: NotePitch, scaleType: ScaleType): Scale {
    tonicNotePitch = Scale.normalizeTonicNotePitch(tonicNotePitch, scaleType);
    switch (scaleType) {
      case 'major':
        switch (raw(tonicNotePitch)) {
          case np.c:      return sc.cMajor;
          case np.g:      return sc.gMajor;
          case np.d:      return sc.dMajor;
          case np.a:      return sc.aMajor;
          case np.e:      return sc.eMajor;
          case np.b:      return sc.bMajor;
          case np.fSharp: return sc.fSharpMajor;
          case np.gFlat:  return sc.gFlatMajor;
          case np.cSharp: return sc.cSharpMajor;
          case np.dFlat:  return sc.dFlatMajor;
          case np.aFlat:  return sc.aFlatMajor;
          case np.eFlat:  return sc.eFlatMajor;
          case np.bFlat:  return sc.bFlatMajor;
          case np.f:      return sc.fMajor;
        }
        break;
      case 'minor':
        switch (raw(tonicNotePitch)) {
          case np.a:      return sc.aMinor;
          case np.d:      return sc.dMinor;
          case np.g:      return sc.gMinor;
          case np.c:      return sc.cMinor;
          case np.f:      return sc.fMinor;
          case np.bFlat:  return sc.bFlatMinor;
          case np.eFlat:  return sc.eFlatMinor;
          case np.aFlat:  return sc.aFlatMinor;
          case np.cSharp: return sc.cSharpMinor;
          case np.fSharp: return sc.fSharpMinor;
          case np.b:      return sc.bMinor;
          case np.e:      return sc.eMinor;
        }
        break;
    }
    throw new RangeError();
  }

  static normalizeTonicNotePitch(tonicNotePitch: NotePitch, type: ScaleType): NotePitch {
    switch (type) {
      case 'major':
        switch (raw(tonicNotePitch)) {
          case np.aSharp: return np.bFlat;
          case np.bSharp: return np.c;
          case np.dSharp: return np.eFlat;
          case np.eSharp: return np.f;
          case np.fFlat:  return np.e;
          case np.gSharp: return np.aFlat;
        }
        break;
      case 'minor':
        switch (raw(tonicNotePitch)) {
          case np.bSharp: return np.c;
          case np.cFlat:  return np.b;
          case np.dFlat:  return np.cSharp;
          case np.eSharp: return np.f;
          case np.fFlat:  return np.e;
          case np.gFlat:  return np.fSharp;
        }
        break;
    }
    return tonicNotePitch;
  }

  static getScaleNotePitches(tonicNotePitch: NotePitch, type: ScaleType): Array<NotePitch> {
    switch (type) {
      case 'major':
        switch (raw(tonicNotePitch)) {
          case np.c:      return [ np.c,      np.d,      np.e,      np.f,      np.g,      np.a,      np.b ];
          case np.g:      return [ np.g,      np.a,      np.b,      np.c,      np.d,      np.e,      np.fSharp ];
          case np.d:      return [ np.d,      np.e,      np.fSharp, np.g,      np.a,      np.b,      np.cSharp ];
          case np.a:      return [ np.a,      np.b,      np.cSharp, np.d,      np.e,      np.fSharp, np.gSharp ];
          case np.e:      return [ np.e,      np.fSharp, np.gSharp, np.a,      np.b,      np.cSharp, np.dSharp ];
          case np.b:      return [ np.b,      np.cSharp, np.dSharp, np.e,      np.fSharp, np.gSharp, np.aSharp ];
          case np.fSharp: return [ np.fSharp, np.gSharp, np.aSharp, np.b,      np.cSharp, np.dSharp, np.eSharp ];
          case np.gFlat:  return [ np.gFlat,  np.aFlat,  np.bFlat,  np.cFlat,  np.dFlat,  np.eFlat,  np.f ];
          case np.cSharp: return [ np.cSharp, np.dSharp, np.eSharp, np.fSharp, np.gSharp, np.aSharp, np.bSharp ];
          case np.dFlat:  return [ np.dFlat,  np.eFlat,  np.f,      np.gFlat,  np.aFlat,  np.bFlat,  np.c ];
          case np.aFlat:  return [ np.aFlat,  np.bFlat,  np.c,      np.dFlat,  np.eFlat,  np.f,      np.g ];
          case np.eFlat:  return [ np.eFlat,  np.f,      np.g,      np.aFlat,  np.bFlat,  np.c,      np.d ];
          case np.bFlat:  return [ np.bFlat,  np.c,      np.d,      np.eFlat,  np.f,      np.g,      np.a ];
          case np.f:      return [ np.f,      np.g,      np.a,      np.bFlat,  np.c,      np.d,      np.e ];
          default:        return [];
        }
      case 'minor':
        switch (raw(tonicNotePitch)) {
          case np.a:      return [ np.a,      np.b,      np.c,      np.d,      np.e,      np.f,      np.g ];
          case np.d:      return [ np.d,      np.e,      np.f,      np.g,      np.a,      np.bFlat,  np.c ];
          case np.g:      return [ np.g,      np.a,      np.bFlat,  np.c,      np.d,      np.eFlat,  np.f ];
          case np.c:      return [ np.c,      np.d,      np.eFlat,  np.f,      np.g,      np.aFlat,  np.bFlat ];
          case np.f:      return [ np.f,      np.g,      np.aFlat,  np.bFlat,  np.c,      np.dFlat,  np.eFlat ];
          case np.bFlat:  return [ np.bFlat,  np.c,      np.dFlat,  np.eFlat,  np.f,      np.gFlat,  np.aFlat ];
          case np.dSharp: return [ np.dSharp, np.eSharp, np.fSharp, np.gSharp, np.aSharp, np.b,      np.cSharp ];
          case np.eFlat:  return [ np.eFlat,  np.f,      np.gFlat,  np.aFlat,  np.bFlat,  np.cFlat,  np.dFlat ];
          case np.aFlat:  return [ np.aFlat,  np.bFlat,  np.cFlat,  np.dFlat,  np.eFlat,  np.fFlat,  np.gFlat ];
          case np.gSharp: return [ np.gSharp, np.aSharp, np.b,      np.cSharp, np.dSharp, np.e,      np.fSharp ];
          case np.cSharp: return [ np.cSharp, np.dSharp, np.e,      np.fSharp, np.gSharp, np.a,      np.b ];
          case np.fSharp: return [ np.fSharp, np.gSharp, np.a,      np.b,      np.cSharp, np.d,      np.e ];
          case np.b:      return [ np.b,      np.cSharp, np.d,      np.e,      np.fSharp, np.g,      np.a ];
          case np.e:      return [ np.e,      np.fSharp, np.g,      np.a,      np.b,      np.c,      np.d ];
          default:        return [];
        }
    }
  }

  transposeByPitchOffset(pitchOffset: number): Scale {
    let transposedTonicNoteNumber = NotePitch.convertToCyclicNoteNumber(this.tonicNotePitch.noteNumber + pitchOffset);
    let transposedTonicNotePitches = NotePitch.findAllPredefinedPitchesFromCyclicNoteNumber(transposedTonicNoteNumber);
    for (let transposedTonicNotePitch of transposedTonicNotePitches) {
      try {
        return Scale.findPredefinedScale(transposedTonicNotePitch, this.type);
      }
      catch {
      }
    }
    throw new RangeError();
  }
}

export const sc = Scale.instance;
