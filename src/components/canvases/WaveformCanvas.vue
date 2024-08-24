<template>
  <canvas></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CanvasBase from './CanvasBase.vue';
import WaveformDecimator from '../../modules/WaveformDecimator';

const WaveformCanvas = defineComponent({
  extends: CanvasBase,

  props: {
    channelIdx:        { type: Number, required: true },
    waveformDecimator: { type: WaveformDecimator, required: true },
    sampleValueScale:  { type: Number, required: true },
    viewSampleBegin:   { type: Number, required: true },
    viewSampleEnd:     { type: Number, required: true },
    viewWidth:         { type: Number, required: true },
  },

  data(): {
    $_isDirty: boolean,
  } {
    return {
      $_isDirty: false,
    };
  },

  mounted() {
    this.$_setCanvasHeightPx(this.$_canvasElement.clientHeight, false);
    this.$_setCanvasWidthPx(this.$_canvasElement.clientWidth, false);
  },

  watch: {
    viewWidth(viewWidth: number) { this.$_setCanvasWidthPx(viewWidth, false) },
    viewSampleBegin()  { this.$data.$_isDirty = true },
    viewSampleEnd()    { this.$data.$_isDirty = true },
    sampleValueScale() { this.$data.$_isDirty = true },
    '$data.$_isDirty'(isDirty: boolean) {
      if (isDirty) {
        this.draw();
        this.$data.$_isDirty = false;
      }
    },
  },

  created() {
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      const width = this.$_canvasElement.width;
      const height = this.$_canvasElement.height;
      const viewDurationSamples = this.viewSampleEnd - this.viewSampleBegin;
      const sampleBuffer = this.waveformDecimator.getSuitableBuffer(this.channelIdx, viewDurationSamples, width);
      const decimationLevel = sampleBuffer.level;
      const rawDecimatedViewSampleBegin = this.viewSampleBegin / (2 ** decimationLevel);
      const rawDecimatedViewSampleEnd = this.viewSampleEnd / (2 ** decimationLevel);
      const decimatedViewSampleBegin = Math.floor(rawDecimatedViewSampleBegin);
      const decimatedViewSampleEnd = Math.ceil(rawDecimatedViewSampleEnd);
      const decimatedViewDurationSamples = decimatedViewSampleEnd - decimatedViewSampleBegin;
      const scaleX = width / decimatedViewDurationSamples;
      const scaleY = height / 2;
      const offsetX = (rawDecimatedViewSampleBegin - decimatedViewSampleBegin) * scaleX;
      const offsetY = height / 2;
      let isPathBegun = false;
      const setPath = (offsetIdx: number, minOrMax: 'min' | 'max') => {
        const sampleIdx = decimatedViewSampleBegin + offsetIdx;
        if (sampleIdx < 0) return;
        if (sampleIdx > sampleBuffer.numSamples) return;
        const sample = sampleBuffer.getSample(sampleIdx, minOrMax) * this.sampleValueScale;
        if (isPathBegun) {
          canvas.lineTo(offsetX + offsetIdx * scaleX, offsetY - sample * scaleY);
        } else {
          canvas.moveTo(offsetX + offsetIdx * scaleX, offsetY - sample * scaleY);
          canvas.beginPath();
          isPathBegun = true;
        }
      };
      for (let offsetIdx = 0; offsetIdx < decimatedViewDurationSamples; ++offsetIdx) {
        setPath(offsetIdx, 'min');
      }
      if (decimationLevel === 0) {
        canvas.lineWidth = 1;
        canvas.strokeStyle = this.color.styleString(true);
        canvas.stroke();
      } else {
        for (let offsetIdx = (decimatedViewDurationSamples - 1); offsetIdx >= 0; --offsetIdx) {
          setPath(offsetIdx, 'max');
        }
        canvas.closePath();
        canvas.lineWidth = 0.5;
        canvas.strokeStyle = this.color.styleString(true);
        canvas.stroke();
        canvas.fillStyle = this.color.styleString(true);
        canvas.fill();
      }
    });
  },
});

export default WaveformCanvas;
</script>