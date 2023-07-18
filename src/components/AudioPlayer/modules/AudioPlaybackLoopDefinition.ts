class AudioPlaybackLoopDefinition {
  public beginTimeSec: number;
  public endTimeSec: number;

  constructor(beginTimeSec: number, endTimeSec: number) {
    this.beginTimeSec = beginTimeSec;
    this.endTimeSec = endTimeSec;
  }

  get loopDurationSec(): number {
    return this.endTimeSec - this.beginTimeSec;
  }
}

export default AudioPlaybackLoopDefinition;
