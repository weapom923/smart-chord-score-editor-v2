<template>
  <canvas id="key-signature-canvas"></canvas>
</template>

<style scoped>
#key-signature-canvas {
  position: relative;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import CanvasBase from './CanvasBase.vue';

const anchorHorizontalOffsetPx = 0;

const KeySignature = defineComponent({
  extends: CanvasBase,

  watch: {
    keyShiftAmount: {
      handler() { this.$_setDirty(true) },
      deep: true,
      immediate: true,
    },

    $_keySignatureWidthPx(newKeySignatureWidthPx) {
      this.$_setCanvasWidthPx(newKeySignatureWidthPx);
    },

    $_keySignatureHeightPx(newKeySignatureHeightPx) {
      this.$_setCanvasHeightPx(newKeySignatureHeightPx);
    },

    $_marginTopPx(newMarginTopPx) {
      this.$_updateMarginTop(newMarginTopPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_keySignatureWidthPx);
    this.$_setCanvasHeightPx(this.$_keySignatureHeightPx);
    this.$_updateMarginTop(this.$_marginTopPx);
  },

  props: {
    keyShiftAmount: { type: Number },
  },

  computed: {
    $_staffLineStepPx() { return this.$store.state.config.staffLineStepPx },
    $_keySignatureWidthPx(): number {
      switch (this.keyShiftAmount) {
        case 1:  return 6;
        case -1: return 8;
        default: return 0;
      } 
    },
    $_keySignatureHeightPx(): number {
      switch (this.keyShiftAmount) {
        case 1:  return this.$_staffLineStepPx * 3;
        case -1: return this.$_staffLineStepPx * 3;
        default: return 0;
      } 
    },
    $_anchorVerticalOffsetPx(): number {
      switch (this.keyShiftAmount) {
        case 1:  return (this.$_staffLineStepPx * 1.5) + 0.5;
        case -1: return (this.$_staffLineStepPx * 2.5) + 0.5;
        default: return 0;
      } 
    },
    $_marginTopPx(): number {
      switch (this.keyShiftAmount) {
        case 1:  return -(this.$_staffLineStepPx * 1.5);
        case -1: return -(this.$_staffLineStepPx * 2.5);
        default: return 0;
      } 
    },
  },

  created() {
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      switch (this.keyShiftAmount) {
        case 1:
          drawSharp.call(this, canvas);
          break;
        case -1:
          drawFlat.call(this, canvas);
          break;
      } 
    });

    type This = InstanceType<typeof KeySignature>;
    function drawSharp(this: This, canvas: CanvasRenderingContext2D) {
      let anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      let staffLineStepPx = this.$_staffLineStepPx;
      let keySignatureWidthPx = this.$_keySignatureWidthPx;
      canvas.strokeStyle = this.color.styleString;
      canvas.fillStyle = this.color.styleString;
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx + 1.5,
        anchorVerticalOffsetPx - staffLineStepPx,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + 1.5,
        anchorVerticalOffsetPx + staffLineStepPx * 7 / 6,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx + keySignatureWidthPx - 1.5,
        anchorVerticalOffsetPx - staffLineStepPx * 7 / 6,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + keySignatureWidthPx - 1.5,
        anchorVerticalOffsetPx + staffLineStepPx,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx + Math.round(staffLineStepPx * 4 / 6) + 0.5,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + keySignatureWidthPx,
        anchorVerticalOffsetPx + Math.round(staffLineStepPx * 2 / 6) + 0.5,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + keySignatureWidthPx,
        anchorVerticalOffsetPx + Math.round(staffLineStepPx * 1 / 6) + 0.5,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx + Math.round(staffLineStepPx * 3 / 6) + 0.5,
      );
      canvas.fill();
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 2 / 6) + 0.5),
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + keySignatureWidthPx,
        anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 4 / 6) + 0.5),
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + keySignatureWidthPx,
        anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 3 / 6) + 0.5),
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 1 / 6) + 0.5),
      );
      canvas.fill();
      canvas.stroke();
    }

    function drawFlat(this: This, canvas: CanvasRenderingContext2D) {
      let anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      let staffLineStepPx = this.$_staffLineStepPx;
      canvas.strokeStyle = this.color.styleString;
      canvas.fillStyle = this.color.styleString;
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx + staffLineStepPx / 2,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - staffLineStepPx * 10 / 6,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx + staffLineStepPx / 2 - 1,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx,
        anchorVerticalOffsetPx - staffLineStepPx * 1 / 4,
        anchorHorizontalOffsetPx + staffLineStepPx / 2,
        anchorVerticalOffsetPx - staffLineStepPx,
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - staffLineStepPx / 3,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 1 / 2,
        anchorVerticalOffsetPx - staffLineStepPx * 4 / 5,
        anchorHorizontalOffsetPx + staffLineStepPx * 4 / 5,
        anchorVerticalOffsetPx,
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx + staffLineStepPx / 2 - 1,
      );
      canvas.stroke();
      canvas.fill();
    }
  },

  methods: {
    $_updateMarginTop(marginTopPx: number) {
      this.$_canvasElement.style.marginTop = `${marginTopPx}px`;
    },
  },
});

export default KeySignature;
</script>