<template>
  <canvas id="clef-canvas"></canvas>
</template>

<style scoped>
#clef-canvas {
  position: relative;
  margin-left: 2px;
  margin-right: 2px;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import CanvasBase from './CanvasBase.vue';
import { Clef, cl } from '../../modules/Clef';
import { raw } from '../../modules/utils';

const ClefCanvas = defineComponent({
  extends: CanvasBase,

  watch: {
    clef: {
      handler() { this.$_setDirty(true) },
      deep: true,
      immediate: true,
    },

    $_clefWidthPx(newClefWidthPx: number) {
      this.$_setCanvasWidthPx(newClefWidthPx);
    },

    $_clefHeightPx(newClefHeightPx: number) {
      this.$_setCanvasHeightPx(newClefHeightPx);
    },

    $_marginTopPx(marginTopPx) {
      this.$_updateMarginTop(marginTopPx);
    },

    $_marginBottomPx(marginBottomPx) {
      this.$_updateMarginBottom(marginBottomPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_clefWidthPx);
    this.$_setCanvasHeightPx(this.$_clefHeightPx);
    this.$_updateMarginTop(this.$_marginTopPx);
    this.$_updateMarginBottom(this.$_marginBottomPx);
  },

  props: {
    clef: { type: Clef, required: true },
  },

  computed: {
    $_staffLineStepPx(): number { return this.$store.state.config.staffLineStepPx },
    $_clefWidthPx(): number { return this.$_staffLineStepPx * 3 },
    $_clefHeightPx(): number {
      switch (raw(this.clef)) {
        case cl.treble: return this.$_staffLineStepPx * 8 + 1;
        case cl.bass:   return this.$_staffLineStepPx * 4 + 1;
        default:        return 0;
      } 
    },
    $_anchorHorizontalOffsetPx(): number {
      switch (raw(this.clef)) {
        case cl.treble: return this.$_staffLineStepPx * 1.6;
        case cl.bass:   return this.$_staffLineStepPx * 0.6;
        default:        return 0;
      } 
    },
    $_anchorVerticalOffsetPx(): number {
      switch (raw(this.clef)) {
        case cl.treble: return this.$_staffLineStepPx * 5 + 1;
        case cl.bass:   return this.$_staffLineStepPx * 1 + 1;
        default:        return 0;
      } 
    },
    $_marginTopPx(): number {
      switch (raw(this.clef)) {
        case cl.treble: return -(this.$_staffLineStepPx * 4 + 1);
        case cl.bass:   return -(this.$_staffLineStepPx * 2 + 1);
        default:        return 0;
      } 
    },
    $_marginBottomPx(): number {
      switch (raw(this.clef)) {
        case cl.treble: return -this.$_staffLineStepPx * 4 + 1;
        case cl.bass:   return -this.$_staffLineStepPx * 2 + 1;
        default:        return 0;
      } 
    },
  },

  created() {
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      switch (raw(this.clef)) {
        case cl.treble:
          drawTrebleClef.call(this, canvas);
          break;
        case cl.bass:
          drawBassClef.call(this, canvas);
          break;
      } 
    });

    type This = InstanceType<typeof ClefCanvas>;
    function drawTrebleClef(this: This, canvas: CanvasRenderingContext2D) {
      let anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      let anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      let staffLineStepPx = this.$_staffLineStepPx;
      canvas.strokeStyle = this.color.styleString;
      canvas.fillStyle = this.color.styleString;
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx,
        anchorVerticalOffsetPx + staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx - staffLineStepPx,
        anchorVerticalOffsetPx - staffLineStepPx,
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - staffLineStepPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
        anchorVerticalOffsetPx - staffLineStepPx,
        anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
        anchorVerticalOffsetPx + staffLineStepPx * 0.8,
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx + staffLineStepPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx,
        anchorVerticalOffsetPx + staffLineStepPx * 0.8,
        anchorHorizontalOffsetPx + staffLineStepPx,
        anchorVerticalOffsetPx - staffLineStepPx * 0.7,
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - staffLineStepPx * 0.7,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
        anchorVerticalOffsetPx - staffLineStepPx * 0.7,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
        anchorVerticalOffsetPx + staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
      );
      canvas.stroke();
      canvas.fill();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx + staffLineStepPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.7,
        anchorVerticalOffsetPx + staffLineStepPx,
        anchorHorizontalOffsetPx - staffLineStepPx * 1.5,
        anchorVerticalOffsetPx + staffLineStepPx,
        anchorHorizontalOffsetPx - staffLineStepPx * 1.5,
        anchorVerticalOffsetPx - staffLineStepPx * 0.5,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 1.45,
        anchorVerticalOffsetPx - staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx - staffLineStepPx * 1.4,
        anchorVerticalOffsetPx - staffLineStepPx,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.5,
        anchorVerticalOffsetPx - staffLineStepPx * 2,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
        anchorVerticalOffsetPx - staffLineStepPx * 3,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.6,
        anchorVerticalOffsetPx - staffLineStepPx * 3.5,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.6,
        anchorVerticalOffsetPx - staffLineStepPx * 3.5,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 4,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - staffLineStepPx * 4,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
        anchorVerticalOffsetPx - staffLineStepPx * 3.5,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
        anchorVerticalOffsetPx - staffLineStepPx * 3,
      );
      canvas.quadraticCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
        anchorVerticalOffsetPx - staffLineStepPx * 4.6,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 4.8,
      );
      canvas.quadraticCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 1,
        anchorVerticalOffsetPx - staffLineStepPx * 3.3,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.3,
        anchorVerticalOffsetPx - staffLineStepPx * 2.4,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.6,
        anchorVerticalOffsetPx - staffLineStepPx * 1.5,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 1,
        anchorVerticalOffsetPx - staffLineStepPx,
        anchorHorizontalOffsetPx - staffLineStepPx * 1.4,
        anchorVerticalOffsetPx - staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx - staffLineStepPx * 1.5,
        anchorVerticalOffsetPx,
      );
      canvas.stroke();
      canvas.fill();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
        anchorVerticalOffsetPx - staffLineStepPx * 3,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.2,
        anchorVerticalOffsetPx + staffLineStepPx * 1,
      );
      canvas.quadraticCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.3,
        anchorVerticalOffsetPx + staffLineStepPx * 1.5,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.2,
        anchorVerticalOffsetPx + staffLineStepPx * 1.8,
      );
      canvas.quadraticCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.3,
        anchorVerticalOffsetPx + staffLineStepPx * 2.4,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
        anchorVerticalOffsetPx + staffLineStepPx * 2,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.arc(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.7,
        anchorVerticalOffsetPx + staffLineStepPx * 1.8,
        staffLineStepPx * 0.3, 0, 2 * Math.PI);
      canvas.fill();
    }

    function drawBassClef(this: This, canvas: CanvasRenderingContext2D) {
      let anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      let anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      let staffLineStepPx = this.$_staffLineStepPx;
      canvas.strokeStyle = this.color.styleString;
      canvas.fillStyle = this.color.styleString;
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.arc(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
        staffLineStepPx * 0.3, 0, 2 * Math.PI);
      canvas.stroke();
      canvas.fill();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
        anchorVerticalOffsetPx + staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.5,
        anchorVerticalOffsetPx - staffLineStepPx * 1.2,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
        anchorVerticalOffsetPx - staffLineStepPx,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
        anchorVerticalOffsetPx - staffLineStepPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
        anchorVerticalOffsetPx - staffLineStepPx,
        anchorHorizontalOffsetPx + staffLineStepPx * 1.5,
        anchorVerticalOffsetPx - staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx + staffLineStepPx * 1.5,
        anchorVerticalOffsetPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 1.5,
        anchorVerticalOffsetPx + staffLineStepPx,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
        anchorVerticalOffsetPx + staffLineStepPx * 2.2,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
        anchorVerticalOffsetPx + staffLineStepPx * 2.2,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx + staffLineStepPx * 2.2,
        anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
        anchorVerticalOffsetPx + staffLineStepPx,
        anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
        anchorVerticalOffsetPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
        anchorVerticalOffsetPx - staffLineStepPx * 0.3,
        anchorHorizontalOffsetPx + staffLineStepPx * 1.1,
        anchorVerticalOffsetPx - staffLineStepPx * 0.8,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
        anchorVerticalOffsetPx - staffLineStepPx,
      );
      canvas.stroke();
      canvas.fill();
      canvas.beginPath();
      canvas.arc(
        anchorHorizontalOffsetPx + staffLineStepPx * 1.9,
        anchorVerticalOffsetPx - staffLineStepPx * 0.5,
        staffLineStepPx * 0.1, 0, 2 * Math.PI);
      canvas.stroke();
      canvas.fill();
      canvas.beginPath();
      canvas.arc(
        anchorHorizontalOffsetPx + staffLineStepPx * 1.9,
        anchorVerticalOffsetPx + staffLineStepPx * 0.5,
        staffLineStepPx * 0.1, 0, 2 * Math.PI);
      canvas.stroke();
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
  }
});

export default ClefCanvas;
</script>