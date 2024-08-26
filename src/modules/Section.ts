import { Bar, BarRawObj, BarRawObjV0_2 } from './Bar';
import { NoteValue } from './NoteValue';
import { NotePitch } from './NotePitch';
import { Clef } from './Clef';
import { Scale } from './Scale';
import { PartInBarType } from './PartInBar';
import { BarRange } from './SectionAndBarRange';

export type SectionRawObjV0_2 = {
  name: string,
  bars: BarRawObjV0_2[],
};

export type SectionRawObj = {
  name: string,
  bars: BarRawObj[],
};

export class Section {
  name: string;
  bars: Bar[];

  constructor(
    name: string = '',
    bars: Bar[] = [ new Bar() ],
  ) {
    this.name = name;
    this.bars = bars;
    if (this.numBars === 0) throw new RangeError();
  }

  static generateNew(
    name: string,
    value: NoteValue,
    clef: Clef,
    scale: Scale,
    partInBarTypes: PartInBarType[],
    gridNoteValue: NoteValue,
  ) {
    return new Section(
      name,
      [ Bar.generateNew(value, clef, scale, partInBarTypes, gridNoteValue) ],
    );
  }

  getRawObj(): SectionRawObj {
    return {
      name: this.name,
      bars: this.bars.map(bar => bar.getRawObj()),
    };
  }

  isEqualTo(that: Section) {
    if (this.name !== that.name) return false;
    if (this.bars.length !== that.bars.length) return false;
    for (let barIdx = 0; barIdx < this.bars.length; ++barIdx) {
      if (!this.getBar(barIdx).isEqualTo(that.getBar(barIdx))) return false;
    }
    return true;
  }

  clone(): Section {
    return new Section(
      this.name,
      this.bars.map(bar => bar.clone()),
    );
  }

  assign(that: Section): Section {
    this.name = that.name;
    this.bars.splice(0, this.numBars, ...that.bars.map(bar => bar.clone()));
    return this;
  }

  static loadFromRawObj(rawObj: SectionRawObj) {
    return new Section(
      rawObj.name,
      rawObj.bars.map(barRawObj => Bar.loadFromRawObj(barRawObj)),
    );
  }

  transpose(pitchOffset: number): Section {
    pitchOffset = NotePitch.convertToCyclicNoteNumber(pitchOffset)
    const section = this.clone();
    if (pitchOffset !== 0) {
      for (const barIdx of section.barRange.indices()) {
        const bar = section.bars[barIdx];
        bar.assign(bar.transpose(pitchOffset))
      }
    }
    return section;
  }

  get numBars(): number {
    return this.bars.length;
  }

  get barRange(): BarRange {
    return new BarRange(this.firstBarIdx, this.lastBarIdx);
  }

  get firstBarIdx(): BarIdx {
    if (this.numBars === 0) throw new RangeError();
    return 0;
  }

  get lastBarIdx(): BarIdx {
    if (this.numBars === 0) throw new RangeError();
    return this.numBars - 1;
  }

  get firstBar(): Bar {
    return this.bars[this.firstBarIdx]
  }

  get lastBar(): Bar {
    return this.bars[this.lastBarIdx]
  }

  getBar(barIdx: BarIdx): Bar {
    if ((barIdx === undefined) || (barIdx < 0) || (barIdx >= this.numBars)) throw new RangeError();
    return this.bars[barIdx];
  }
}
