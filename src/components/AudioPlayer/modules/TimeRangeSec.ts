export interface TimeRangeSecInterface {
  begin: number;
  end: number;
};

export class TimeRangeSec implements TimeRangeSecInterface {
  readonly begin: number;
  readonly end: number;

  constructor({ begin, end }: { begin: number, end: number }) {
    this.begin = Math.min(begin, end);
    this.end = Math.max(begin, end);
  }

  get duration(): number {
    return this.end - this.begin;
  }
}
