import { BarBreak, BarBreakRawObj, bb } from './BarBreak'
import { BarLine, BarLineRawObj, bl } from './BarLine'
import { NoteValue, NoteValueRawObj } from './NoteValue'
import { Clef, ClefRawObj } from './Clef'
import { Scale, ScaleRawObj } from './Scale'
import { PartInBar, PartInBarRawObj, PartInBarType } from './PartInBar'
import { BarRepeatEnding, BarRepeatEndingRawObj, bre } from './BarRepeatEnding'

export type BarRawObjV0_2 = {
  value: NoteValueRawObj;
  parts: PartInBarRawObj[];
  clef: ClefRawObj;
  scale: ScaleRawObj;
  break: BarBreakRawObj;
  line_start: BarLineRawObj;
  line_end: BarLineRawObj;
  repeat_ending: BarRepeatEndingRawObj;
};

export type BarRawObj = BarRawObjV0_2 & {
  grid_note_value: NoteValueRawObj;
};

export class Bar {
  value: NoteValue;
  parts: PartInBar[];
  clef: Clef;
  scale: Scale;
  break: BarBreak;
  lineStart: BarLine;
  lineEnd: BarLine;
  repeatEnding: BarRepeatEnding;
  gridNoteValue: NoteValue;

  constructor(
    value: NoteValue = NoteValue.instance.divisible.whole,
    partsInBar: PartInBar[] = [],
    clef: Clef = Clef.instance.treble,
    scale: Scale = Scale.instance.cMajor,
    barBreak: BarBreak = BarBreak.instance.empty,
    barLineStart: BarLine = BarLine.instance.start.empty,
    barLineEnd: BarLine = BarLine.instance.end.single,
    barRepeatEnding: BarRepeatEnding = BarRepeatEnding.instance.empty,
    gridNoteValue: NoteValue = NoteValue.instance.divisible.half,
  ) {
    this.value = value;
    this.parts = partsInBar;
    this.clef = clef;
    this.scale = scale;
    this.break = barBreak;
    this.lineStart = barLineStart;
    this.lineEnd = barLineEnd;
    this.repeatEnding = barRepeatEnding;
    this.gridNoteValue = gridNoteValue;
  }

  static generateNew(value: NoteValue, clef: Clef, scale: Scale, partInBarTypes: PartInBarType[], gridNoteValue: NoteValue): Bar {
    return new Bar(
      value,
      partInBarTypes.map(partInBarType => new PartInBar([], partInBarType)),
      clef,
      scale,
      bb.empty,
      bl.start.empty,
      bl.end.single,
      bre.empty,
      gridNoteValue,
    );
  }

  generateEmptyFrom() {
    return new Bar(
      this.value.clone(),
      this.parts.map(partInBar => new PartInBar([], partInBar.type, partInBar.restNotePitch)),
      this.clef,
      this.scale,
      bb.empty,
      bl.start.empty,
      bl.end.single,
      bre.empty.clone(),
      this.gridNoteValue.clone(),
    );
  }

  assign(that: Bar) {
    this.value.assign(that.value);
    this.parts.splice(0, this.parts.length, ...that.parts);
    this.clef = that.clef;
    this.scale = that.scale;
    this.break = that.break;
    this.lineStart = that.lineStart;
    this.lineEnd = that.lineEnd;
    this.repeatEnding = that.repeatEnding;
    this.gridNoteValue.assign(that.gridNoteValue);
  }

  isEqualTo(that: Bar): boolean {
    if (!this.value.isEqualTo(that.value)) return false;
    if (this.parts.length !== that.parts.length) return false;
    for (let partIdx = 0; partIdx < this.numParts; ++partIdx) {
      const thisPart = this.getPart(partIdx);
      const thatPart = that.getPart(partIdx);
      if (!thisPart.isEqualTo(thatPart)) return false;
    }
    if (!this.clef.isEqualTo(that.clef)) return false;
    if (!this.break.isEqualTo(that.break)) return false;
    if (!this.lineStart.isEqualTo(that.lineStart)) return false;
    if (!this.lineEnd.isEqualTo(that.lineEnd)) return false;
    if (!this.repeatEnding.isEqualTo(that.repeatEnding)) return false;
    if (!this.scale.isEqualTo(that.scale)) return false;
    return true;
  }

  clone(): Bar {
    return new Bar(
      this.value.clone(),
      this.parts.map(part => part.clone()),
      this.clef,
      this.scale,
      this.break,
      this.lineStart,
      this.lineEnd,
      this.repeatEnding.clone(),
      this.gridNoteValue.clone(),
    );
  }

  getRawObj(): BarRawObj {
    return {
      value: this.value.getRawObj(),
      parts: this.parts.map(part => part.getRawObj()),
      clef: this.clef.getRawObj(),
      scale: this.scale.getRawObj(),
      break: this.break.getRawObj(),
      line_start: this.lineStart.getRawObj(),
      line_end: this.lineEnd.getRawObj(),
      repeat_ending: this.repeatEnding.getRawObj(),
      grid_note_value: this.gridNoteValue.getRawObj(),
    }
  }

  static loadFromRawObj(rawObj: BarRawObj): Bar {
    return new Bar(
      NoteValue.loadFromRawObj(rawObj.value),
      rawObj.parts.map(PartInBar.loadFromRawObj),
      Clef.loadFromRawObj(rawObj.clef),
      Scale.loadFromRawObj(rawObj.scale),
      BarBreak.loadFromRawObj(rawObj.break),
      BarLine.loadFromRawObj(rawObj.line_start),
      BarLine.loadFromRawObj(rawObj.line_end),
      BarRepeatEnding.loadFromRawObj(rawObj.repeat_ending),
      NoteValue.loadFromRawObj(rawObj.grid_note_value),
    );
  }

  get numParts(): number {
    return this.parts.length;
  }

  findSameTypedPartIndex(partInBarType: PartInBarType): PartIdx | undefined {
    const foundPartIdx = this.parts.findIndex(part => (part.type === partInBarType));
    return (foundPartIdx === -1)? undefined : foundPartIdx;
  }

  findSameTypedPart(partInBarType: PartInBarType): PartInBar | undefined {
    const foundPartIdx = this.findSameTypedPartIndex(partInBarType);
    if (foundPartIdx === undefined) return undefined;
    return this.getPart(foundPartIdx);
  }

  get firstPartIdx(): PartIdx | undefined {
    if (this.numParts === 0) return undefined;
    return 0;
  }

  get lastPartIdx(): PartIdx | undefined {
    if (this.numParts === 0) return undefined;
    return this.numParts - 1;
  }

  getPart(partIdx: PartIdx): PartInBar {
    if ((partIdx < 0) || (partIdx > this.numParts)) throw new RangeError();
    return this.parts[partIdx];
  }

  partIndices(): IterableIterator<PartIdx> {
    let iterationCount = 0;
    return {
      next: (): IteratorResult<PartIdx, number> => {
        const partIdx = iterationCount;
        if (iterationCount < this.numParts) {
          ++iterationCount;
          return { value: partIdx, done: false };
        }
        return { value: iterationCount, done: true };
      },
      [Symbol.iterator](): IterableIterator<PartIdx> {
        return this;
      },
    };
  }

  transpose(pitchOffset: number): Bar {
    const targetScale = this.scale.transposeByPitchOffset(pitchOffset);
    const newBar = this.clone();
    newBar.scale = targetScale;
    for (const part of newBar.parts) {
      switch (part.type) {
        case 'chord':
        case 'normal':
          for (const note of part.notes) {
            switch (note.type) {
              case 'normal':
                if (note.pitchOrChord !== null) {
                  note.pitchOrChord = note.pitchOrChord.transpose(this.scale, targetScale);
                }
            }
          }
          break;
      }
    }
    return newBar;
  }
}
