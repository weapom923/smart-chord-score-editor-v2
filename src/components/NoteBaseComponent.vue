<template>
  <div
    id="note-base-component"
    v-bind:style="$_noteBaseComponentStyle"
  >
    <div
      id="chord-component-container"
      v-if="$_noteChord"
    >
      <chord-component
        v-bind:chord="$_noteChord"
        v-bind:style="$_chordStyle"
        v-on:width-update="$_onChordElementWidthUpdate"
        v-on:vue:mounted="$_onChordComponentMounted($event.el)"
        v-on:vue:unmounted="$_onChordComponentUnmounted"
        v-on:click="$_onClickNote"
      />
    </div>
    <div id="split-divisible-notes-container">
      <div
        class="split-divisible-note-container"
        v-for="(splitNote, splitNoteIdx) in $_splitNotes"
        v-bind:key="splitNoteIdx"
        v-bind:style="$_splitNoteContainerStyles.get(splitNoteIdx)"
        v-on:click="$_onClickNote"
      >
        <template v-if="$_isNormalNote(splitNote.type)">
          <chord-note-canvas
            v-if="$_isPartTypeChord"
            v-bind:note="splitNote"
            v-bind:invert-stem-direction="true"
            v-bind:color="$_noteColor"
            v-on:width-update="$_onNoteWidthUpdate(splitNoteIdx, $event)"
            v-on:tie-point-update="$_onNoteTiePointUpdate(splitNoteIdx, $event)"
            v-on:vue:mounted="$_onSplitNoteElementMounted(splitNoteIdx, $event.el)"
            v-on:vue:unmounted="$_onSplitNoteElementUnmounted(splitNoteIdx)"
          />
          <tie-canvas
            v-if="$data.$_tieProps.has(splitNoteIdx)"
            v-bind="assertDefined($data.$_tieProps.get(splitNoteIdx))"
            v-bind:style="$data.$_tieStyles.get(splitNoteIdx)"
          />
        </template>
        <rest-note-canvas
          v-if="$_isRestNote(splitNote.type)"
          v-bind:note-value="splitNote.value"
          v-bind:rest-note-pitch="restNotePitch"
          v-bind:color="$_noteColor"
          v-on:width-update="$_onNoteWidthUpdate(splitNoteIdx, $event)"
          v-on:vue:mounted="$_onSplitNoteElementMounted(splitNoteIdx, $event.el)"
          v-on:vue:unmounted="$_onSplitNoteElementUnmounted(splitNoteIdx)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
#note-base-component {
  position: relative;
  flex-shrink: 0;
}

#note-spacer {
  height: 3px;
  background-color: #000;
  position: relative;
}

#split-divisible-notes-container {
  display: flex;
  flex-direction: row;
}

.split-divisible-note-container {
  position: relative;
}

#chord-component-container {
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>

<script lang="ts">
import { CSSProperties } from 'vue';
import ChordComponent from './ChordComponent.vue';
import ChordNoteCanvas from './canvases/ChordNoteCanvas.vue';
import RestNoteCanvas from './canvases/RestNoteCanvas.vue';
import TieCanvas from './canvases/TieCanvas.vue';
import { Note, NoteType } from '../modules/Note';
import { NoteValue, nv } from '../modules/NoteValue';
import { NotePitch } from '../modules/NotePitch';
import { Chord } from '../modules/Chord';
import { Color, cl } from '../modules/Color';
import { max, assertDefined } from '../modules/utils';

export default {
  emits: {
    chordComponentMounted: (event: HTMLElement) => true,
    chordComponentUnmounted: () => true,
    splitNoteElementMounted: (event: { splitNoteIdx: SplitNoteIdx, splitNoteElement: HTMLElement }) => true,
    splitNoteElementUnounted: (event: SplitNoteIdx) => true,
    clickNote: () => true,
    tiePointUpdate: (event: { tieStartPointOffset: DOMPoint, tieEndPointOffset: DOMPoint } | undefined) => true,
  },

  components: {
    ChordComponent,
    ChordNoteCanvas,
    RestNoteCanvas,
    TieCanvas,
  },

  watch: {
    $_numSplitNotes: {
      handler(newNumSplitNotes: number, oldNumSplitNotes: number) {
        if(newNumSplitNotes < oldNumSplitNotes) {
          for (let splitNoteIdx = newNumSplitNotes; splitNoteIdx < oldNumSplitNotes; ++splitNoteIdx) {
            this.$data.$_splitNoteElementWidthPxs.delete(splitNoteIdx);
            this.$data.$_splitNoteTieStartOffsets.delete(splitNoteIdx);
            this.$data.$_splitNoteTieEndOffsets.delete(splitNoteIdx);
            this.$data.$_splitNoteElements.delete(splitNoteIdx);
          }
        }
      },
      immediate: true,
    },

    $_noteTieStartAndEndOffset(noteTieStartAndEndOffset) {
      this.$emit('tiePointUpdate', noteTieStartAndEndOffset);
    },

    '$data.$_splitNoteElements': {
      handler() { this.$_updateTiePropsAndStyles() },
      deep: true,
    },
  },

  props: {
    offsetNoteValue: { type: NoteValue, required: true },
    note:            { type: Note,      required: true },
    partType:        { type: String,    required: true },
    restNotePitch:   { type: NotePitch },
    gridNoteValue:   { type: NoteValue, required: true },
    isSelected:      { type: Boolean,   required: true },
  },

  data(): {
    $_noteBaseElementResizeObserver: ResizeObserver,
    $_chordElementWidthPx?: number,
    $_splitNoteElementWidthPxs: Map<SplitNoteIdx, number>,
    $_splitNoteTieStartOffsets: Map<SplitNoteIdx, DOMPoint>,
    $_splitNoteTieEndOffsets: Map<SplitNoteIdx, DOMPoint>,
    $_splitNoteElements: Map<SplitNoteIdx, HTMLElement>,
    $_tieProps: Map<SplitNoteIdx, InstanceType<typeof TieCanvas>['$props']>,
    $_tieStyles: Map<SplitNoteIdx, CSSProperties>,
  } {
    return {
      $_noteBaseElementResizeObserver: new ResizeObserver(() => { this.$_updatePositionAndSize() }),
      $_chordElementWidthPx: undefined,
      $_splitNoteElementWidthPxs: new Map(),
      $_splitNoteTieStartOffsets: new Map(),
      $_splitNoteTieEndOffsets: new Map(),
      $_splitNoteElements: new Map(),
      $_tieProps: new Map(),
      $_tieStyles: new Map(),
    };
  },

  computed: {
    $_noteBaseComponentStyle(): CSSProperties {
      let chordElementWidthPx = (this.$data.$_chordElementWidthPx !== undefined)? this.$data.$_chordElementWidthPx : 0;
      let noteBaseComponentWidthPx = max(chordElementWidthPx, this.$_totalNoteElementWidthPx);
      return {
        flexGrow: `${this.note.value.clone().divide(nv.divisible.sixtyFourth).toNumber()}`,
        width: `${noteBaseComponentWidthPx}px`,
      };
    },

    $_totalNoteElementWidthPx(): number {
      let totalNoteElementWidthPx = 0;
      for (let splitNoteElement of this.$data.$_splitNoteElements.values()) {
        totalNoteElementWidthPx += splitNoteElement.clientWidth;
      }
      return totalNoteElementWidthPx;
    },

    $_chordStyle(): CSSProperties {
      return {
        marginBottom: `${this.$store.state.config.staffLineStepPx * 2}px`,
      };
    },

    $_noteColor(): Color {
      return (this.isSelected)? this.$store.state.config.selectedNoteColor : cl.black;
    },

    $_noteChord(): Chord | undefined {
      if (this.note.pitchOrChord === null) return undefined;
      if (this.note.pitchOrChord instanceof NotePitch) return undefined;
      return this.note.pitchOrChord;
    },

    $_isPartTypeChord(): boolean { return this.partType === 'chord' },

    $_splitNoteValues(): NoteValue[] {
      return this.note.value.splitIntoDivisibleNoteValues(this.offsetNoteValue, this.gridNoteValue);
    },

    $_splitNotes() {
      return this.$_splitNoteValues.map(
        splitNoteValue => new Note(this.note.pitchOrChord, splitNoteValue, this.note.type, this.note.tied)
      );
    },

    $_numSplitNotes(): number {
      return this.$_splitNotes.length;
    },

    $_lastSplitNoteIdx(): number {
      return this.$_numSplitNotes - 1;
    },

    $_splitNoteContainerStyles(): Map<SplitNoteIdx, CSSProperties> {
      let splitNoteContainerStyles = new Map<SplitNoteIdx, CSSProperties>();
      for (let splitNoteIdx = 0; splitNoteIdx < this.$_numSplitNotes; ++splitNoteIdx) {
        let splitNoteValue = this.$_splitNoteValues[splitNoteIdx];
        let splitNoteElementWidthPx = this.$data.$_splitNoteElementWidthPxs.get(splitNoteIdx);
        if (splitNoteElementWidthPx === undefined) continue;
        splitNoteContainerStyles.set(
          splitNoteIdx,
          {
            flexGrow:  `${splitNoteValue.clone().divide(nv.divisible.sixtyFourth).toNumber()}`,
            flexBasis: `${splitNoteElementWidthPx}px`,
            width:     `${splitNoteElementWidthPx}px`,
          },
        );
      }
      return splitNoteContainerStyles;
    },

    $_noteTieStartAndEndOffset(): { tieStartPointOffset: DOMPoint, tieEndPointOffset: DOMPoint } | undefined {
      if (this.$data.$_splitNoteTieStartOffsets.size < 1) return undefined;
      let tieStartPointOffset = this.$data.$_splitNoteTieStartOffsets.get(0);
      if (tieStartPointOffset === undefined) return undefined;
      let tieEndPointOffset = this.$data.$_splitNoteTieEndOffsets.get(this.$data.$_splitNoteTieEndOffsets.size - 1);
      if (tieEndPointOffset === undefined) return undefined;
      return { tieStartPointOffset, tieEndPointOffset };
    },
  },

  mounted() {
    this.$data.$_noteBaseElementResizeObserver.observe(this.$el);
    this.$_updatePositionAndSize();
  },

  beforeUnmount() {
    this.$data.$_noteBaseElementResizeObserver.disconnect();
  },

  methods: {
    $_isNormalNote(noteType: NoteType) {
      return noteType === 'normal';
    },

    $_isRestNote(noteType: NoteType) {
      return noteType === 'rest';
    },

    $_onChordElementWidthUpdate(widthPx?: number) {
      this.$data.$_chordElementWidthPx = widthPx;
    },

    $_onChordComponentMounted(chordComponentElement: HTMLElement | null) {
      if (chordComponentElement === null) return;
      this.$emit('chordComponentMounted', chordComponentElement);
    },

    $_onChordComponentUnmounted() {
      this.$emit('chordComponentUnmounted');
    },

    $_onSplitNoteElementMounted(splitNoteIdx: SplitNoteIdx, splitNoteElement: HTMLElement | null) {
      if (splitNoteElement === null) return;
      this.$data.$_splitNoteElements.set(splitNoteIdx, splitNoteElement);
      this.$emit('splitNoteElementMounted', { splitNoteIdx, splitNoteElement });
    },

    $_onSplitNoteElementUnmounted(splitNoteIdx: SplitNoteIdx) {
      this.$data.$_splitNoteElements.delete(splitNoteIdx);
      this.$emit('splitNoteElementUnounted', splitNoteIdx);
    },

    $_onNoteWidthUpdate(splitNoteIdx: SplitNoteIdx, widthPx: number) {
      this.$data.$_splitNoteElementWidthPxs.set(splitNoteIdx, widthPx);
    },

    $_onNoteTiePointUpdate(splitNoteIdx: SplitNoteIdx, { tieStartPointOffset, tieEndPointOffset }: { tieStartPointOffset: DOMPoint, tieEndPointOffset: DOMPoint }) {
      this.$data.$_splitNoteTieStartOffsets.set(splitNoteIdx, tieStartPointOffset);
      this.$data.$_splitNoteTieEndOffsets.set(splitNoteIdx, tieEndPointOffset);
    },

    $_onClickNote() {
      this.$emit('clickNote');
    },

    $_updatePositionAndSize() {
      this.$_updateTiePropsAndStyles();
    },

    $_updateTiePropsAndStyles() {
      let noteBaseElement = this.$el;
      if ((noteBaseElement === undefined) && (noteBaseElement === null)) return;
      let noteBaseElementOffsetX = (noteBaseElement as HTMLElement).getBoundingClientRect().x;
      let tieProps = new Map<SplitNoteIdx, InstanceType<typeof TieCanvas>['$props']>();
      let tieStyles = new Map<SplitNoteIdx, CSSProperties>();
      for (let splitNoteIdx = 0; splitNoteIdx < this.$_lastSplitNoteIdx; ++splitNoteIdx) {
        let nextSplitNoteIdx = splitNoteIdx + 1;
        let currentSplitNoteElement = this.$data.$_splitNoteElements.get(splitNoteIdx);
        if (currentSplitNoteElement === undefined) continue;
        let nextSplitNoteElement = this.$data.$_splitNoteElements.get(nextSplitNoteIdx);
        if (nextSplitNoteElement === undefined) continue;
        let splitNoteTieStartOffset = this.$data.$_splitNoteTieStartOffsets.get(splitNoteIdx);
        if (splitNoteTieStartOffset === undefined) continue;
        let splitNoteTieEndOffset = this.$data.$_splitNoteTieEndOffsets.get(nextSplitNoteIdx);
        if (splitNoteTieEndOffset === undefined) continue;
        let currentSplitNoteElementOffsetX = currentSplitNoteElement.getBoundingClientRect().x;
        let nextSplitNoteElementOffsetX = nextSplitNoteElement.getBoundingClientRect().x;
        let relativeTieStartHorizontalOffsetPx = (currentSplitNoteElementOffsetX - noteBaseElementOffsetX) + splitNoteTieStartOffset.x;
        let relativeTieStartVerticalOffsetPx = splitNoteTieStartOffset.y;
        let relativeTieEndHorizontalOffsetPx = (nextSplitNoteElementOffsetX - noteBaseElementOffsetX) + splitNoteTieEndOffset.x;
        let relativeTieEndVerticalOffsetPx = splitNoteTieEndOffset.y;
        tieProps.set(
          splitNoteIdx,
          {
            startVerticalOffsetPx: relativeTieStartVerticalOffsetPx,
            endVerticalOffsetPx: relativeTieEndVerticalOffsetPx,
            widthPx: relativeTieEndHorizontalOffsetPx - relativeTieStartHorizontalOffsetPx,
          },
        );
        tieStyles.set(
          splitNoteIdx,
          {
            position: 'absolute',
            left: `${splitNoteTieStartOffset.x}px`,
          }
        );
      }
      this.$data.$_tieProps = tieProps;
      this.$data.$_tieStyles = tieStyles;
    },

    assertDefined: assertDefined,
  }
}
</script>