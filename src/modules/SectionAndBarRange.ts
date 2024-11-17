export class SectionAndBarIdx {
  public sectionIdx: SectionIdx;
  public barIdx: BarIdx;

  constructor(sectionIdx: SectionIdx, barIdx: BarIdx) {
    if (sectionIdx < 0) throw new RangeError();
    if (barIdx < 0) throw new RangeError();
    this.sectionIdx = sectionIdx;
    this.barIdx = barIdx;
  }

  clone(): SectionAndBarIdx {
    return new SectionAndBarIdx(this.sectionIdx, this.barIdx);
  }

  assign(that: SectionAndBarIdx) {
    this.sectionIdx = that.sectionIdx;
    this.barIdx = that.barIdx;
  }

  isPriorTo(that: SectionAndBarIdx): boolean {
    if (this.sectionIdx < that.sectionIdx) return true;
    if (this.sectionIdx > that.sectionIdx) return false;
    return (this.barIdx < that.barIdx);
  }

  isPriorOrEqualTo(that: SectionAndBarIdx): boolean {
    if (this.sectionIdx < that.sectionIdx) return true;
    if (this.sectionIdx > that.sectionIdx) return false;
    return (this.barIdx <= that.barIdx);
  }

  isPosteriorTo(that: SectionAndBarIdx): boolean {
    if (this.sectionIdx > that.sectionIdx) return true;
    if (this.sectionIdx < that.sectionIdx) return false;
    return (this.barIdx > that.barIdx);
  }

  isPosteriorOrEqualTo(that: SectionAndBarIdx): boolean {
    if (this.sectionIdx > that.sectionIdx) return true;
    if (this.sectionIdx < that.sectionIdx) return false;
    return (this.barIdx >= that.barIdx);
  }

  isEqualTo(that: SectionAndBarIdx): boolean {
    if (this.sectionIdx !== that.sectionIdx) return false;
    if (this.barIdx !== that.barIdx) return false;
    return true;
  }
}

export class BarRange {
  public firstBarIdx: BarIdx;
  public lastBarIdx: BarIdx;

  constructor(firstBarIdx: BarIdx, lastBarIdx?: BarIdx) {
    if (lastBarIdx === undefined) {
      lastBarIdx = firstBarIdx;
    } else {
      if (lastBarIdx < firstBarIdx) throw new RangeError('last is prior to first.');
    }
    this.firstBarIdx = firstBarIdx;
    this.lastBarIdx = lastBarIdx;
  }

  get numBars(): number {
    return this.lastBarIdx - this.firstBarIdx + 1;
  }

  indices(): IterableIterator<BarIdx> {
    let iterationCount = 0;
    return {
      next: (): IteratorResult<BarIdx, number> => {
        const barIdx = this.firstBarIdx + iterationCount;
        if (barIdx <= this.lastBarIdx) {
          ++iterationCount;
          return { value: barIdx, done: false };
        }
        return { value: iterationCount, done: true };
      },
      [Symbol.iterator](): IterableIterator<BarIdx> {
        return this;
      },
    };
  }

  includes(barIdx: BarIdx) {
    if (barIdx > this.lastBarIdx) return false;
    if (barIdx < this.firstBarIdx) return false;
    return true;
  }
}

export class SectionAndBarRange {
  public first: SectionAndBarIdx;
  public last: SectionAndBarIdx;

  constructor(first: SectionAndBarIdx, last?: SectionAndBarIdx) {
    if (last === undefined) {
      last = first.clone();
    } else {
      if (last.isPriorTo(first)) throw RangeError('last is prior to first.');
    }
    this.first = first;
    this.last = last;
  }

  clone(): SectionAndBarRange {
    return new SectionAndBarRange(this.first.clone(), this.last.clone());
  }

  get numSections(): number {
    return (this.last.sectionIdx - this.first.sectionIdx + 1);
  }

  get includeSingleBarOnly(): boolean {
    return this.first.isEqualTo(this.last);
  }

  get idx(): SectionAndBarIdx {
    if (!this.includeSingleBarOnly) throw new RangeError();
    return this.first;
  }

  sectionIndices(): IterableIterator<SectionIdx> {
    let iterationCount = 0;
    return {
      next: (): IteratorResult<SectionIdx, number> => {
        const sectionIdx = this.first.sectionIdx + iterationCount;
        if (sectionIdx <= this.last.sectionIdx) {
          ++iterationCount;
          return { value: sectionIdx, done: false };
        }
        return { value: iterationCount, done: true };
      },
      [Symbol.iterator](): IterableIterator<SectionIdx> {
        return this;
      },
    };
  }

  includes(sectionAndBarIdx: SectionAndBarIdx): boolean {
    if (sectionAndBarIdx.sectionIdx < this.first.sectionIdx) {
      return false;
    } else if (sectionAndBarIdx.sectionIdx === this.first.sectionIdx) {
      if (sectionAndBarIdx.barIdx < this.first.barIdx) return false;
    }
    if (sectionAndBarIdx.sectionIdx > this.last.sectionIdx) {
      return false;
    } else if (sectionAndBarIdx.sectionIdx === this.last.sectionIdx) {
      if (sectionAndBarIdx.barIdx > this.last.barIdx) return false;
    }
    return true;
  }

  isCompletelyIncludedIn(sectionAndBarRange: SectionAndBarRange): boolean {
    return (sectionAndBarRange.includes(this.first) && sectionAndBarRange.includes(this.last));
  }

  isOverwrapped(sectionAndBarRange: SectionAndBarRange): boolean {
    if (this.includes(sectionAndBarRange.first)) return true;
    if (this.includes(sectionAndBarRange.last)) return true;
    if (sectionAndBarRange.includes(this.first)) return true;
    if (sectionAndBarRange.includes(this.last)) return true;
    return false;
  }

  isPriorTo(sectionAndBarRange: SectionAndBarRange): boolean {
    return this.last.isPriorTo(sectionAndBarRange.first);
  }

  isPosteriorTo(sectionAndBarRange: SectionAndBarRange): boolean {
    return this.first.isPosteriorTo(sectionAndBarRange.last);
  }

  isEqualTo(that: SectionAndBarRange): boolean {
    if (!this.first.isEqualTo(that.first)) return false;
    if (!this.last.isEqualTo(that.last)) return false;
    return true;
  }
}