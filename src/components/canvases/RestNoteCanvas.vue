<template>
  <canvas
    id="note-canvas-container"
    ref="restNoteCanvas"
  >
  </canvas>
</template>

<style scoped src="./styles/noteCanvas.css">
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import CanvasBase from './CanvasBase.vue';
import { NoteValue, nv } from '../../modules/NoteValue';
import { NotePitch } from '../../modules/NotePitch';
import { assertDefined, max } from '../../modules/utils';

const noteDotRadiusRate = 0.15;
const noteDotMarginPx = 6;
const wholeAndHalfRestNoteWidthPx = 16;
const wholeAndHalfRestNoteHeightRate = 0.4;

const RestNoteCanvas = defineComponent({
  extends: CanvasBase,

  setup() {
    return {
      restNoteCanvas: ref<HTMLCanvasElement>(),
    };
  },

  emits: {
    widthUpdate: (widthPx: number) => true,
    mounted: (element: HTMLCanvasElement) => true,
    beforeUnmount: () => true,
  },

  watch: {
    noteValue: {
      handler() { this.draw() },
      deep: true,
    },

    restNotePitch: {
      handler() { this.draw() },
      deep: true,
    },

    $_noteWidthPx(newCanvasWidthPx) {
      this.$_setCanvasWidthPx(newCanvasWidthPx);
      this.$emit('widthUpdate', newCanvasWidthPx);
    },

    $_noteHeightPx(newCanvasHeightPx) {
      this.$_setCanvasHeightPx(newCanvasHeightPx);
    },

    $_marginTopPx(newMarginTopPx) {
      this.$_updateMarginTop(newMarginTopPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_noteWidthPx);
    this.$_setCanvasHeightPx(this.$_noteHeightPx);
    this.$_updateMarginTop(this.$_marginTopPx);
    this.$emit('widthUpdate', this.$_noteWidthPx);
    if (this.restNoteCanvas) {
      this.$emit('mounted', this.restNoteCanvas);
    }
  },

  beforeUnmount() {
    this.$emit('beforeUnmount');
  },

  props: {
    noteValue:     { type: NoteValue, required: true },
    restNotePitch: { type: NotePitch },
  },

  computed: {
    $_isDotted(): boolean            { return this.noteValue.isDottedOfDivisible() },
    $_undottedNoteValue(): NoteValue { return (this.$_isDotted)? assertDefined(this.noteValue.clone().undot()) : this.noteValue },

    $_anchorHorizontalOffsetPx(): number {
      if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.quarter)) {
        return 0;
      } else if (this.$_undottedNoteValue.isEqualTo(nv.divisible.eighth)) {
        return this.$_staffLineStepPx * 0.6;
      } else {
        return this.$_staffLineStepPx * 0.9;
      }
    },

    $_anchorVerticalOffsetPx() {
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.whole))        return 0;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.half))         return this.$_noteHeightPx;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.quarter))      return this.$_staffLineStepPx * 1.5;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.eighth))       return this.$_staffLineStepPx * 1;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixteenth))    return this.$_staffLineStepPx * 1;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.thirtySecond)) return this.$_staffLineStepPx * 1.8;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixtyFourth))  return this.$_staffLineStepPx * 2.6;
      return 0;
    },

    $_noteWithoutDotWidthPx(): number {
      if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.half)) return wholeAndHalfRestNoteWidthPx;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.quarter))           return this.$_staffLineStepPx;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.eighth))            return this.$_staffLineStepPx * 1;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixteenth))         return this.$_staffLineStepPx * 1.4;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.thirtySecond))      return this.$_staffLineStepPx * 1.8;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixtyFourth))       return this.$_staffLineStepPx * 2.2;
      return 0;
    },

    $_noteWidthPx(): number {
      if (this.$_isDotted) {
        if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.quarter)) {
          return this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx * 2;
        } else {
          return max(
            this.$_noteWithoutDotWidthPx,
            this.$_anchorHorizontalOffsetPx + noteDotMarginPx + this.$_noteDotRadiusPx * 2,
          )
        }
      } else {
        return this.$_noteWithoutDotWidthPx;
      }
    },

    $_noteHeightWithoutDotPx(): number {
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.whole))        return this.$_staffLineStepPx * wholeAndHalfRestNoteHeightRate;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.half))         return this.$_staffLineStepPx * wholeAndHalfRestNoteHeightRate;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.quarter))      return this.$_staffLineStepPx * 3;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.eighth))       return this.$_staffLineStepPx * 1.8;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixteenth))    return this.$_staffLineStepPx * 1.8;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.thirtySecond)) return this.$_staffLineStepPx * 2.6;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixtyFourth))  return this.$_staffLineStepPx * 3.4;
      return 0;
    },

    $_noteHeightPx(): number {
      if (this.$_isDotted) {
        if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.half)) {
          return max(
            (this.$_staffLineStepPx / 2) + this.$_noteDotRadiusPx,
            this.$_noteHeightWithoutDotPx,
          );
        } else {
          return this.$_noteHeightWithoutDotPx;
        }
      } else {
        return this.$_noteHeightWithoutDotPx;
      }
    },

    $_marginTopPx(): number {
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.whole))        return -this.$_staffLineStepPx;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.half))         return -(this.$_noteHeightPx);
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.quarter))      return -(this.$_staffLineStepPx * 1.5);
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.eighth))       return -(this.$_staffLineStepPx * 1);
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixteenth))    return -(this.$_staffLineStepPx * 1);
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.thirtySecond)) return -(this.$_staffLineStepPx * 1.8);
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixtyFourth))  return -(this.$_staffLineStepPx * 2.6);
      return 0;
    },
    $_restNoteCircleRadius() { return this.$_staffLineStepPx * 0.2 },
    $_noteDotRadiusPx() { return this.$_staffLineStepPx * noteDotRadiusRate; },
  },

  created() {
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.whole)) {
        drawWholeRestNote.call(this, canvas);
      } else if (this.$_undottedNoteValue.isEqualTo(nv.divisible.half)) {
        drawHalfRestNote.call(this, canvas);
      } else if (this.$_undottedNoteValue.isEqualTo(nv.divisible.quarter)) {
        drawQuarterRestNote.call(this, canvas);
      } else if (this.$_undottedNoteValue.isEqualTo(nv.divisible.eighth)) {
        drawEighthRestNote.call(this, canvas);
      } else if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixteenth)) {
        drawSixteenthRestNote.call(this, canvas);
      } else if (this.$_undottedNoteValue.isEqualTo(nv.divisible.thirtySecond)) {
        drawThirtySecondRestNote.call(this, canvas);
      } else if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixtyFourth)) {
        drawSixtyFourthRestNote.call(this, canvas);
      }
      if (this.$_isDotted) {
        if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.whole)) {
          drawNoteDot.call(
            this, canvas,
            this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx,
            this.$_noteHeightWithoutDotPx,
          );
        } else if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.half)) {
          drawNoteDot.call(
            this, canvas,
            this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx,
            this.$_noteDotRadiusPx,
          );
        } else if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.quarter)) {
          drawNoteDot.call(
            this, canvas,
            this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx,
            this.$_anchorVerticalOffsetPx + (this.$_staffLineStepPx / 2),
          );
        } else {
          drawNoteDot.call(
            this, canvas,
            this.$_anchorHorizontalOffsetPx + noteDotMarginPx + this.$_noteDotRadiusPx,
            this.$_anchorVerticalOffsetPx + (this.$_staffLineStepPx / 2),
          );
        }
      }
    });

    type This = InstanceType<typeof RestNoteCanvas>;
    function drawWholeRestNote(this: This, canvas: CanvasRenderingContext2D) {
      const anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      const anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      canvas.fillStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.rect(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
        wholeAndHalfRestNoteWidthPx,
        this.$_staffLineStepPx * wholeAndHalfRestNoteHeightRate,
      );
      canvas.fill();
    }

    function drawHalfRestNote(this: This, canvas: CanvasRenderingContext2D) {
      const anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      const anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      canvas.fillStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.rect(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - this.$_noteHeightWithoutDotPx,
        wholeAndHalfRestNoteWidthPx,
        this.$_noteHeightWithoutDotPx,
      );
      canvas.fill();
    }

    function drawQuarterRestNote(this: This, canvas: CanvasRenderingContext2D) {
      const anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      const anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      const staffLineStepPx = this.$_staffLineStepPx;
      canvas.fillStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + staffLineStepPx,
        anchorVerticalOffsetPx + staffLineStepPx,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.1,
        anchorVerticalOffsetPx,
        anchorHorizontalOffsetPx - staffLineStepPx * 0.1,
        anchorVerticalOffsetPx + staffLineStepPx * 1.5,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
        anchorVerticalOffsetPx + staffLineStepPx * 1.5,
      );
      canvas.bezierCurveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.1,
        anchorVerticalOffsetPx + staffLineStepPx * 1.25,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
        anchorVerticalOffsetPx + staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx + staffLineStepPx,
        anchorVerticalOffsetPx + staffLineStepPx,
      );
      canvas.quadraticCurveTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
        anchorHorizontalOffsetPx + staffLineStepPx,
        anchorVerticalOffsetPx - staffLineStepPx * 0.5,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx - staffLineStepPx * 1.5,
      );
      canvas.quadraticCurveTo(
        anchorHorizontalOffsetPx + staffLineStepPx,
        anchorVerticalOffsetPx - staffLineStepPx * 0.5,
        anchorHorizontalOffsetPx,
        anchorVerticalOffsetPx,
      );
      canvas.fill();
    }

    function drawEighthRestNote(this: This, canvas: CanvasRenderingContext2D) {
      const anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      const anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      const staffLineStepPx = this.$_staffLineStepPx;
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
        anchorVerticalOffsetPx + staffLineStepPx * 0.8,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 0.8,
      );
      canvas.stroke();
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 0.8,
      );
    }

    function drawSixteenthRestNote(this: This, canvas: CanvasRenderingContext2D) {
      const anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      const anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      const staffLineStepPx = this.$_staffLineStepPx;
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
        anchorVerticalOffsetPx + staffLineStepPx * 0.8,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 0.8,
      );
      canvas.stroke();
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 0.8,
      );
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.1,
        anchorVerticalOffsetPx - staffLineStepPx * 0.2,
      );
    }

    function drawThirtySecondRestNote(this: This, canvas: CanvasRenderingContext2D) {
      const anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      const anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      const staffLineStepPx = this.$_staffLineStepPx;
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
        anchorVerticalOffsetPx + staffLineStepPx * 0.8,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 0.7,
        anchorVerticalOffsetPx - staffLineStepPx * 1.4,
      );
      canvas.stroke();
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.7,
        anchorVerticalOffsetPx - staffLineStepPx * 1.4,
      );
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 0.8,
      );
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.1,
        anchorVerticalOffsetPx - staffLineStepPx * 0.2,
      );
    }

    function drawSixtyFourthRestNote(this: This, canvas: CanvasRenderingContext2D) {
      const anchorHorizontalOffsetPx = this.$_anchorHorizontalOffsetPx;
      const anchorVerticalOffsetPx = this.$_anchorVerticalOffsetPx;
      const staffLineStepPx = this.$_staffLineStepPx;
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
        anchorVerticalOffsetPx + staffLineStepPx * 0.8,
      );
      canvas.lineTo(
        anchorHorizontalOffsetPx + staffLineStepPx * 1,
        anchorVerticalOffsetPx - staffLineStepPx * 2,
      );
      canvas.stroke();
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 1,
        anchorVerticalOffsetPx - staffLineStepPx * 2,
      );
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.7,
        anchorVerticalOffsetPx - staffLineStepPx * 1.4,
      );
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
        anchorVerticalOffsetPx - staffLineStepPx * 0.8,
      );
      drawRestNoteCircle.call(
        this,
        canvas,
        anchorHorizontalOffsetPx + staffLineStepPx * 0.1,
        anchorVerticalOffsetPx - staffLineStepPx * 0.2,
      );
    }

    function drawNoteDot(this: This, canvas: CanvasRenderingContext2D, dotHorizontalOffsetPx: number, dotVerticalOffsetPx: number) {
      canvas.beginPath();
      canvas.fillStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.arc(
        dotHorizontalOffsetPx,
        dotVerticalOffsetPx,
        this.$_noteDotRadiusPx, 0, 2 * Math.PI);
      canvas.fill();
    }

    function drawRestNoteCircle(this: This, canvas: CanvasRenderingContext2D, beginHorizontalOffsetPx: number, beginVerticalOffsetPx: number) {
      const staffLineStepPx = this.$_staffLineStepPx;
      canvas.fillStyle = this.color.styleString(false);
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        beginHorizontalOffsetPx,
        beginVerticalOffsetPx,
      );
      canvas.quadraticCurveTo(
        beginHorizontalOffsetPx - staffLineStepPx * 0.6,
        beginVerticalOffsetPx + staffLineStepPx * 0.9,
        beginHorizontalOffsetPx - staffLineStepPx * 0.9,
        beginVerticalOffsetPx + staffLineStepPx * 0.2,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.arc(
        beginHorizontalOffsetPx - staffLineStepPx * 0.7,
        beginVerticalOffsetPx + staffLineStepPx * 0.2,
        this.$_restNoteCircleRadius, 0, 2 * Math.PI);
      canvas.fill();
    }
  },

  methods: {
    $_updateMarginTop(marginTopPx: number) {
      this.$_canvasElement.style.marginTop = `${marginTopPx}px`;
    },
  },
});

export default RestNoteCanvas;
</script>