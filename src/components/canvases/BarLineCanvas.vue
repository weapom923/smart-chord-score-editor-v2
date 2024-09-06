<template>
  <canvas></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CanvasBase from './CanvasBase.vue';
import { BarLine, bl } from '../../modules/BarLine';
import { raw } from '../../modules/utils';

const barLineIntervalPx = 3;
const normalBarLineWidthPx = 1;
const boldBarLineWidthPx = 4;
const barLineDotRadiusRate = 0.15;
const barLineDotMarginPx = 2;

const BarLineCanvas = defineComponent({
  extends: CanvasBase,

  watch: {
    barLine: {
      handler() { this.draw() },
      deep: true,
    },

    $_barLineTotalWidthPx(newBarLineTotalWidthPx) {
      this.$_setCanvasWidthPx(newBarLineTotalWidthPx);
    },

    $_barLineHeightPx(newBarLineHeightPx) {
      this.$_setCanvasHeightPx(newBarLineHeightPx);
    },

    $_marginTopPx(newMarginTopPx) {
      this.$_updateMarginTop(newMarginTopPx);
    },

    $_marginBottomPx(newMarginBottomPx) {
      this.$_updateMarginBottom(newMarginBottomPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_barLineTotalWidthPx);
    this.$_setCanvasHeightPx(this.$_barLineHeightPx);
    this.$_updateMarginTop(this.$_marginTopPx);
    this.$_updateMarginBottom(this.$_marginBottomPx);
  },

  props: {
    barLine: { type: BarLine },
  },

  computed: {
    $_canvasRightEndOffsetPx(): number { return this.$_barLineTotalWidthPx - 1 },
    $_staffLineStepPx(): number { return this.$store.state.config.staffLineStepPx },
    $_barLineDotRadiusPx(): number { return barLineDotRadiusRate * this.$_staffLineStepPx; },
    $_barLineTotalWidthPx(): number {
      switch (raw(this.barLine)) {
        case bl.end.single:        return normalBarLineWidthPx;
        case bl.end.double:        return normalBarLineWidthPx * 2 + barLineIntervalPx;
        case bl.start.repeatStart: return boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx + barLineDotMarginPx + 2 * this.$_barLineDotRadiusPx;
        case bl.end.repeatEnd:     return boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx + barLineDotMarginPx + 2 * this.$_barLineDotRadiusPx;
        case bl.end.greatDouble:   return boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx + 1;
        default:                   return 0;
      } 
    },
    $_barLineHeightPx(): number { return this.$_staffLineStepPx * 4 + 1 },
    $_marginTopPx(): number { return -(this.$_staffLineStepPx * 2) },
    $_marginBottomPx(): number { return -(this.$_staffLineStepPx * 2 + 1) },
  },

  created() {
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      switch (raw(this.barLine)) {
        case bl.end.single:
          drawSingleBarLine.call(this, canvas);
          break;
        case bl.end.double:
          drawDoubledBarLine.call(this, canvas);
          break;
        case bl.start.repeatStart:
          drawRepeatStartBarLine.call(this, canvas);
          break;
        case bl.end.repeatEnd:
          drawRepeatEndBarLine.call(this, canvas);
          break;
        case bl.end.greatDouble:
          drawGreatDoubleBarLine.call(this, canvas);
          break;
      } 
    });

    type This = InstanceType<typeof BarLineCanvas>;
    function drawSingleBarLine(this: This, canvas: CanvasRenderingContext2D) {
      const barLineCenterOffsetPx = normalBarLineWidthPx / 2;
      drawNormalBarLine.call(this, canvas, barLineCenterOffsetPx);
    }

    function drawDoubledBarLine(this: This, canvas: CanvasRenderingContext2D) {
      drawSingleBarLine.call(this, canvas);
      const rightBarLineCenterHorizontalOffsetPx = normalBarLineWidthPx / 2;
      drawNormalBarLine.call(this, canvas, rightBarLineCenterHorizontalOffsetPx);
      const leftBarLineCenterHorizontalOffsetPx = normalBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx / 2;
      drawNormalBarLine.call(this, canvas, leftBarLineCenterHorizontalOffsetPx);
    }

    function drawRepeatStartBarLine(this: This, canvas: CanvasRenderingContext2D) {
      const rightBarLineCenterHorizontalOffsetPx = boldBarLineWidthPx / 2;
      drawBoldBarLine.call(this, canvas, rightBarLineCenterHorizontalOffsetPx);
      const leftBarLineCenterHorizontalOffsetPx = boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx / 2;
      drawNormalBarLine.call(this, canvas, leftBarLineCenterHorizontalOffsetPx);
      const barLineDotCenterHorizontalOffsetPx = boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx + barLineDotMarginPx + this.$_barLineDotRadiusPx;
      const upperBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 3 / 2;
      const lowerBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 5 / 2;
      drawBarLineDot.call(
        this,
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        upperBarLineDotCenterVerticalOffsetPx,
      );
      drawBarLineDot.call(
        this,
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        lowerBarLineDotCenterVerticalOffsetPx,
      );
    }

    function drawRepeatEndBarLine(this: This, canvas: CanvasRenderingContext2D) {
      const rightBarLineCenterHorizontalOffsetPx = this.$_barLineTotalWidthPx - (boldBarLineWidthPx / 2);
      drawBoldBarLine.call(this, canvas, rightBarLineCenterHorizontalOffsetPx);
      const leftBarLineCenterHorizontalOffsetPx = this.$_canvasRightEndOffsetPx - (boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx / 2);
      drawNormalBarLine.call(this, canvas, leftBarLineCenterHorizontalOffsetPx);
      const barLineDotCenterHorizontalOffsetPx = this.$_barLineDotRadiusPx;
      const upperBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 3 / 2;
      const lowerBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 5 / 2;
      drawBarLineDot.call(
        this,
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        upperBarLineDotCenterVerticalOffsetPx,
      );
      drawBarLineDot.call(
        this,
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        lowerBarLineDotCenterVerticalOffsetPx,
      );
    }

    function drawGreatDoubleBarLine(this: This, canvas: CanvasRenderingContext2D) {
      const rightBarLineCenterHorizontalOffsetPx = this.$_barLineTotalWidthPx - (boldBarLineWidthPx / 2);
      drawBoldBarLine.call(this, canvas, rightBarLineCenterHorizontalOffsetPx);
      const leftBarLineCenterHorizontalOffsetPx = this.$_canvasRightEndOffsetPx - (boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx / 2);
      drawNormalBarLine.call(this, canvas, leftBarLineCenterHorizontalOffsetPx);
    }

    function drawNormalBarLine(this: This, canvas: CanvasRenderingContext2D, horizontalOffsetPx: number) {
      canvas.strokeStyle = this.color.styleString();
      canvas.lineWidth = normalBarLineWidthPx;
      canvas.beginPath();
      canvas.moveTo(horizontalOffsetPx, 0);
      canvas.lineTo(horizontalOffsetPx, this.$_barLineHeightPx);
      canvas.stroke();
    }

    function drawBoldBarLine(this: This, canvas: CanvasRenderingContext2D, horizontalOffsetPx: number) {
      canvas.strokeStyle = this.color.styleString();
      canvas.lineWidth = boldBarLineWidthPx;
      canvas.beginPath();
      canvas.moveTo(horizontalOffsetPx, 0);
      canvas.lineTo(horizontalOffsetPx, this.$_barLineHeightPx);
      canvas.stroke();
    }

    function drawBarLineDot(this: This, canvas: CanvasRenderingContext2D, horizontalOffsetPx: number, verticalOffsetPx: number) {
      canvas.strokeStyle = this.color.styleString();
      canvas.lineWidth = normalBarLineWidthPx;
      canvas.beginPath();
      canvas.arc(
        horizontalOffsetPx,
        verticalOffsetPx,
        this.$_barLineDotRadiusPx, 0, 2 * Math.PI);
      canvas.fill();
    }
  },

  methods: {
    $_updateMarginTop(marginTopPx: number) {
      this.$_canvasElement.style.marginTop = `${marginTopPx}px`;
    },

    $_updateMarginBottom(marginBottomPx: number) {
      this.$_canvasElement.style.marginBottom = `${marginBottomPx}px`;
    },
  },
});

export default BarLineCanvas;
</script>