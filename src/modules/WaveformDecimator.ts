import { seq, generate } from './utils';
import Module from './waveform-decimator';

type MinOrMax = 'min' | 'max';

export class DecimatedSampleBuffer {
  static readonly decimatedSampleBytes = 8; // sizeof IEEE754 double

  readonly numOriginalSamplesPerDecimatedSample: number;
  readonly numSamples: number;
  constructor(
    readonly level: number,
    readonly minBuffer: Float32Array,
    readonly maxBuffer?: Float32Array,
  ) {
    this.numSamples = minBuffer.length;
    this.numOriginalSamplesPerDecimatedSample = 2 ** this.level;
  }

  getSample(sampleIdx: number, minOrMax: MinOrMax): number {
    switch (minOrMax) {
      case 'min':
        return this.minBuffer[sampleIdx];
      case 'max':
        return (this.maxBuffer ?? this.minBuffer)[sampleIdx];
    }
  }

  getSampleByOriginalSample(originalSampleIdx: number, minOrMax: MinOrMax): number {
    const sampleIdx = originalSampleIdx / this.numOriginalSamplesPerDecimatedSample;
    return this.getSample(sampleIdx, minOrMax);
  }
}

export default class WaveformDecimator {
  static readonly decimatedSampleBytes = 8; // sizeof IEEE754 double

  readonly decimatedSampleBuffers: DecimatedSampleBuffer[][];
  readonly levelMax: number;
  readonly numChannels: number;
  readonly numSamples: number;

  static async loadData(audioBuffer: AudioBuffer): Promise<Uint8Array> {
    const module = await Module({ locateFile: (fileName: string) => `/wasm/${fileName}` });
    const numChannels = audioBuffer.numberOfChannels;
    const numSamples = audioBuffer.length;

    let emscriptenHeapByteLength = numChannels * numSamples * Float32Array.BYTES_PER_ELEMENT;
    if (module.HEAP8.length < emscriptenHeapByteLength) throw new RangeError('WebAssembly heap memory is too short.');
    const emscriptenHeapAddress = module._malloc(emscriptenHeapByteLength);
    let emscriptenHeap = new Float32Array(
      module.HEAPF32.buffer,
      emscriptenHeapAddress,
      emscriptenHeapByteLength,
    );
    for (let channelIdx = 0; channelIdx < numChannels; ++channelIdx) {
      const waveform = audioBuffer.getChannelData(channelIdx);
      emscriptenHeap.set(waveform, waveform.length * channelIdx);
    }
    const waveformDecimatorData = module.generateDecimatedSampleData(emscriptenHeapAddress, numChannels, numSamples) as Uint8Array;
    const copiedWaveformDecimatorData = new Uint8Array(waveformDecimatorData);
    module.releaseDecimatedSampleData(waveformDecimatorData.byteOffset)
    module._free(emscriptenHeapAddress);
    return copiedWaveformDecimatorData;
  }

  constructor(data: Uint8Array) {
    let readOffset = 0;
    const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const numChannels = dataView.getUint32(readOffset, true);
    readOffset += 4;
    const numOriginalsamples = dataView.getUint32(readOffset, true);
    readOffset += 4;
    const decimationLevelMax = dataView.getUint32(readOffset, true);
    readOffset += 4;

    this.decimatedSampleBuffers = generate(
      numChannels,
      () => seq(0, decimationLevelMax).map(
        (level: number) => {
          if (level === 0) {
            const originalSamples = new Float32Array(data.buffer, readOffset, numOriginalsamples);
            readOffset += 4 * numOriginalsamples;
            return new DecimatedSampleBuffer(level, originalSamples);
          } else {
            const numDecimatedSamples = dataView.getUint32(readOffset, true);
            readOffset += 4;
            const minSamples = new Float32Array(data.buffer, readOffset, numDecimatedSamples);
            readOffset += 4 * numDecimatedSamples;
            const maxSamples = new Float32Array(data.buffer, readOffset, numDecimatedSamples);
            readOffset += 4 * numDecimatedSamples;
            return new DecimatedSampleBuffer(level, minSamples, maxSamples);
          }
        },
      )
    );
    this.numChannels = numChannels;
    this.numSamples = numOriginalsamples;
    this.levelMax = decimationLevelMax;
  }

  getBuffer(channelIdx: number, level: number): DecimatedSampleBuffer {
    const numChannels = this.decimatedSampleBuffers.length;
    if ((channelIdx < 0) || (channelIdx > numChannels)) throw new RangeError();
    const decimatedSampleBuffersByChannel = this.decimatedSampleBuffers[channelIdx];
    const levelMax = decimatedSampleBuffersByChannel.length;
    if ((level < 0) || (level > levelMax)) throw new RangeError();
    return decimatedSampleBuffersByChannel[level];
  }

  getSuitableBuffer(
    channelIdx: number,
    numSamples: number,
    numSamplesToRender: number,
  ): DecimatedSampleBuffer {
    const decimationRate = numSamples / numSamplesToRender;
    let suitableLevel: number;
    for (suitableLevel = this.levelMax; suitableLevel > 0; --suitableLevel) {
      const decimationRateByLevel = 2 ** suitableLevel;
      if (decimationRateByLevel < decimationRate) break;
    }
    const buffer = this.getBuffer(channelIdx, suitableLevel);
    if (buffer.level !== suitableLevel) throw new Error();
    return buffer;
  }
}