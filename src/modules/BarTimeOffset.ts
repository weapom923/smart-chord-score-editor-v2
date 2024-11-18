export class BarTimeOffset {
  public timeSec: number;
  public barIdx: BarIdx;

  constructor(
    timeSec: number,
    barIdx: BarIdx,
  ) {
    this.timeSec = timeSec;
    this.barIdx = barIdx;
  }
}
