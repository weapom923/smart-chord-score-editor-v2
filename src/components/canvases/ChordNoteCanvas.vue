<template>
  <canvas
    id="note-canvas-container"
    ref="chordNoteCanvas"
  >
  </canvas>
</template>

<style scoped src="./styles/noteCanvas.css">
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import CanvasBase from './CanvasBase.vue';
import { Note } from '../../modules/Note';
import { NoteValue, nv } from '../../modules/NoteValue';
import { max } from '../../modules/utils';

const noteStemLegnthRate = 3.5;
const noteFlagWidthRate = 2;
const noteHeadHorizontalOffsetPx = 0.5;
const noteHeadSlideWidthPx = 8;
const noteHeadWidthPx = 8;
const noteDotRadiusRate = 0.15;
const noteDotMarginPx = 2;

const ChordNoteCanvas = defineComponent({
  extends: CanvasBase,

  setup() {
    return {
      chordNoteCanvas: ref<HTMLCanvasElement>(),
    };
  },

  emits: {
    widthUpdate: (noteWidthPx: number) => true,
    tiePointUpdate: ({ tieStartPointOffset, tieEndPointOffset }: { tieStartPointOffset: DOMPoint, tieEndPointOffset: DOMPoint }) => true,
    mounted: (element: HTMLCanvasElement) => true,
    beforeUnmount: () => true,
  },

  watch: {
    note() { this.draw() },

    invertStemDirection() { this.draw() },

    $_tieStartPointOffset() { this.$_emitTiePointUpdate() },

    $_tieEndPointOffset() { this.$_emitTiePointUpdate() },

    $_noteWidthPx(newCanvasWidthPx: number) {
      this.$_setCanvasWidthPx(newCanvasWidthPx);
      this.$_emitWidthUpdate();
    },

    $_noteHeightPx(newCanvasHeightPx: number) {
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
    this.$_emitWidthUpdate();
    this.$_emitTiePointUpdate();
    if (this.chordNoteCanvas) {
      this.$emit('mounted', this.chordNoteCanvas);
    }
  },

  beforeUnmount() {
    this.$emit('beforeUnmount');
  },

  props: {
    note: { type: Note, required: true },
    invertStemDirection: { type: Boolean, default: false },
  },

  computed: {
    $_isNoteHeadOutlined(): boolean { return this.$_undottedNoteValue.isGreaterThanOrEqualTo(nv.divisible.half) },
    $_isDotted(): boolean { return this.note.value.isDottedOfDivisible() },
    $_undottedNoteValue(): NoteValue { return (this.$_isDotted)? this.note.value.clone().undot() as NoteValue : this.note.value },
    $_hasNoteStem(): boolean { return this.$_undottedNoteValue.isLessThanOrEqualTo(nv.divisible.half) },
    $_noteStemLengthPx(): number {
      if (this.$_numNoteFlags === 0) {
        return this.$_staffLineStepPx * noteStemLegnthRate;
      } else {
        return this.$_staffLineStepPx * (noteStemLegnthRate + (this.$_numNoteFlags - 1));
      }
    },
    $_noteStemHorizontalOffsetPx(): number {
      if (this.invertStemDirection) {
        return noteHeadHorizontalOffsetPx;
      } else {
        return noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx;
      }
    },
    $_noteStemBeginPointVerticalOffsetPx(): number {
      if (this.invertStemDirection) {
        return this.$_noteHeadHeightPx;
      } else {
        return this.$_noteStemLengthPx;
      }
    },
    $_noteStemEndPointVerticalOffsetPx(): number {
      if (this.invertStemDirection) {
        return this.$_noteStemBeginPointVerticalOffsetPx + this.$_noteStemLengthPx;
      } else {
        return this.$_noteStemBeginPointVerticalOffsetPx - this.$_noteStemLengthPx;
      }
    },
    $_noteDotRadiusPx(): number { return this.$_staffLineStepPx * noteDotRadiusRate; },
    $_hasNoteFlag(): boolean { return (this.$_numNoteFlags > 0) },
    $_noteFlagWidthPx(): number { return this.$_staffLineStepPx * noteFlagWidthRate },
    $_numNoteFlags(): number {
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.eighth)) return 1;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixteenth)) return 2;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.thirtySecond)) return 3;
      if (this.$_undottedNoteValue.isEqualTo(nv.divisible.sixtyFourth)) return 4;
      return 0;
    },
    $_noteHeadVerticalOffsetPx(): number {
      if (!this.invertStemDirection && this.$_hasNoteStem) {
        return this.$_noteHeadHeightPx + this.$_noteStemLengthPx;
      } else {
        return this.$_noteHeadHeightPx;
      }
    },
    $_noteHeadHeightPx(): number {
      return this.$_staffLineStepPx * 2;
    },
    $_noteWidthPx(): number {
      if (this.$_isDotted) {
        const noteBaseWidthPx = noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx;
        const noteExpandedWidthPx = max(this.$_noteDotRadiusPx * 2 + noteDotMarginPx, this.$_noteFlagWidthPx);
        return noteBaseWidthPx + noteExpandedWidthPx;
      } else {
        const noteBaseWidthPx = noteHeadHorizontalOffsetPx;
        const noteExpandedWidthPx = max(noteHeadWidthPx + noteHeadSlideWidthPx, this.$_noteFlagWidthPx);
        return noteBaseWidthPx + noteExpandedWidthPx;
      }
    },
    $_noteHeightPx(): number {
      if (this.$_hasNoteStem) {
        return this.$_noteHeadHeightPx + this.$_noteStemLengthPx;
      } else {
        return this.$_noteHeadHeightPx;
      }
    },
    $_tieStartPointOffset(): DOMPoint {
      return new DOMPoint(
        noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx,
        -(this.$_noteHeadHeightPx / 2),
      );
    },
    $_tieEndPointOffset(): DOMPoint {
      return new DOMPoint(
        noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx,
        -(this.$_noteHeadHeightPx / 2),
      );
    },
    $_marginTopPx(): number {
      if (this.$_hasNoteStem && !this.invertStemDirection) {
        return -((this.$_noteHeadHeightPx / 2) + this.$_noteStemLengthPx);
      } else {
        return -this.$_noteHeadHeightPx / 2;
      }
    },
  },

  created() {
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      if (this.$_isNoteHeadOutlined) {
        drawChordNoteHeadOutline.call(this, canvas);
      } else {
        drawChordNoteHead.call(this, canvas);
      }
      if (this.$_isDotted) {
        drawNoteDot.call(this, canvas);
      }
      if (this.$_hasNoteStem) {
        drawNoteStem.call(this, canvas);
        if (this.$_hasNoteFlag) {
          drawNoteFlag.call(this, canvas);
        }
      }
    });

    type This = InstanceType<typeof ChordNoteCanvas>;
    function drawChordNoteHeadOutline(this: This, canvas: CanvasRenderingContext2D) {
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 2;
      canvas.beginPath();
      canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx, this.$_noteHeadVerticalOffsetPx - (this.$_noteHeadHeightPx));
      canvas.lineTo(noteHeadHorizontalOffsetPx, this.$_noteHeadVerticalOffsetPx);
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx, this.$_noteHeadVerticalOffsetPx - (this.$_noteHeadHeightPx));
      canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx, this.$_noteHeadVerticalOffsetPx);
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx, this.$_noteHeadVerticalOffsetPx - (this.$_noteHeadHeightPx - 1));
      canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx, this.$_noteHeadVerticalOffsetPx - (this.$_noteHeadHeightPx - 1));
      canvas.stroke();
      canvas.beginPath();
      canvas.moveTo(noteHeadHorizontalOffsetPx, this.$_noteHeadVerticalOffsetPx);
      canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx, this.$_noteHeadVerticalOffsetPx);
      canvas.stroke();
    }

    function drawChordNoteHead(this: This, canvas: CanvasRenderingContext2D) {
      canvas.beginPath();
      canvas.fillStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx, this.$_noteHeadVerticalOffsetPx - this.$_noteHeadHeightPx);
      canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx, this.$_noteHeadVerticalOffsetPx - this.$_noteHeadHeightPx);
      canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx, this.$_noteHeadVerticalOffsetPx);
      canvas.lineTo(noteHeadHorizontalOffsetPx, this.$_noteHeadVerticalOffsetPx);
      canvas.fill();
    }

    function drawNoteDot(this: This, canvas: CanvasRenderingContext2D) {
      canvas.beginPath();
      canvas.fillStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.arc(
        noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx,
        this.$_noteHeadVerticalOffsetPx - (this.$_staffLineStepPx / 2),
        this.$_noteDotRadiusPx, 0, 2 * Math.PI);
      canvas.fill();
    }

    function drawNoteStem(this: This, canvas: CanvasRenderingContext2D) {
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(this.$_noteStemHorizontalOffsetPx, this.$_noteStemBeginPointVerticalOffsetPx);
      canvas.lineTo(this.$_noteStemHorizontalOffsetPx, this.$_noteStemEndPointVerticalOffsetPx);
      canvas.stroke();
    }

    function drawNoteFlag(this: This, canvas: CanvasRenderingContext2D) {
      const noteFlagDirection = (this.invertStemDirection)? -1: 1;
      canvas.strokeStyle = this.color.styleString(false);
      canvas.lineWidth = 2;
      for (let noteFlagIdx = 0; noteFlagIdx < this.$_numNoteFlags; ++noteFlagIdx) {
        const currentNoteFlagBeginVerticalOffsetPx = this.$_noteStemEndPointVerticalOffsetPx + noteFlagIdx * noteFlagDirection * this.$_staffLineStepPx;
        canvas.beginPath();
        canvas.moveTo(
          this.$_noteStemHorizontalOffsetPx,
          currentNoteFlagBeginVerticalOffsetPx,
        );
        canvas.lineTo(
          this.$_noteStemHorizontalOffsetPx + this.$_noteFlagWidthPx,
          currentNoteFlagBeginVerticalOffsetPx + noteFlagDirection * this.$_noteFlagWidthPx,
        );
        canvas.stroke();
      }
    }
  },

  methods: {
    $_emitTiePointUpdate() {
      this.$emit(
        'tiePointUpdate',
        {
          tieStartPointOffset: this.$_tieStartPointOffset,
          tieEndPointOffset: this.$_tieEndPointOffset,
        },
      );
    },

    $_emitWidthUpdate() {
      this.$emit('widthUpdate', this.$_noteWidthPx);
    },

    $_updateMarginTop(marginTopPx: number) {
      this.$_canvasElement.style.marginTop = `${marginTopPx}px`;
    },
  },
})

export default ChordNoteCanvas;
</script>