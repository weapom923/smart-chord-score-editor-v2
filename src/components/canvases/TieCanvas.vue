<template>
  <canvas></canvas>
</template>

<script lang="ts">
import CanvasBase from './CanvasBase.vue';
import { max } from '../../modules/utils';

const tieTopMarginPx = 5;

export default {
  extends: CanvasBase,

  watch: {
    startVerticalOffsetPx: {
      handler() { this.draw() },
    },

    endVerticalOffsetPx: {
      handler() { this.draw() },
    },

    $_tieWidthPx(newTieWidthPx) {
      this.$_setCanvasWidthPx(newTieWidthPx);
      this.$store.dispatch('canvas/reserveTieCanvas', this);
    },

    $_tieHeightPx(newTieHeightPx) {
      this.$_setCanvasHeightPx(newTieHeightPx);
      this.$store.dispatch('canvas/reserveTieCanvas', this);
    },

    $_marginTopPx(newMarginTopPx) {
      this.$_updateMarginTop(newMarginTopPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.widthPx);
    this.$_setCanvasHeightPx(this.$_tieHeightPx);
    this.$_updateMarginTop(this.$_marginTopPx);
  },

  props: {
    startVerticalOffsetPx: { type: Number, required: true },
    endVerticalOffsetPx: { type: Number, required: true },
    widthPx: { type: Number, required: true },
  },

  computed: {
    $_tieWidthPx(): number { return this.widthPx },
    $_tieHeightPx(): number { return max(-this.startVerticalOffsetPx, -this.endVerticalOffsetPx) + tieTopMarginPx },
    $_marginTopPx(): number { return -this.$_tieHeightPx },
  },

  created() {
    /* public */
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        0,
        this.$_tieHeightPx + this.startVerticalOffsetPx,
      );
      canvas.bezierCurveTo(
        this.$_tieWidthPx / 2,
        0,
        this.$_tieWidthPx / 2,
        0,
        this.$_tieWidthPx,
        this.$_tieHeightPx + this.endVerticalOffsetPx,
      );
      canvas.stroke();
    });
  },

  methods: {
    $_updateMarginTop(marginTopPx: number) {
      this.$_canvasElement.style.marginTop = `${marginTopPx}px`;
    },
  },
}
</script>