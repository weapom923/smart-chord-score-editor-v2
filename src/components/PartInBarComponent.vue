<template>
  <div id="part-in-bar">
    <template
      v-for="noteIdx in part.noteIndices()"
      v-bind:key="noteIdx"
    >
      <note-base-component
        v-if="$_noteBarComponentProps.has(noteIdx)"
        v-bind="assertDefined($_noteBarComponentProps.get(noteIdx))"
        v-bind:color="noteColor"
        v-on:split-note-element-mounted="$_onSplitNoteElementMounted(noteIdx, $event)"
        v-on:split-note-element-before-unmount="$_onSplitNoteElementBeforeUnmount(noteIdx, $event)"
        v-on:chord-component-mounted="$_onChordComponentMounted(noteIdx, $event)"
        v-on:chord-component-before-unmount="$_onChordComponentBeforeUnmount(noteIdx)"
        v-on:tie-point-update="$_onNoteTiePointUpdate(noteIdx, $event)"
        v-on:click-note="$_onClickNote(noteIdx)"
        v-on:resize="$_updateTiePropsAndStyles"
      />
      <tie-canvas
        v-if="$data.$_tieProps.has(noteIdx)"
        v-bind="assertDefined($data.$_tieProps.get(noteIdx))"
        v-bind:color="noteColor"
        v-bind:alpha-as-opacity="true"
        v-bind:style="$data.$_tieStyles.get(noteIdx)"
      />
    </template>
  </div>
</template>

<style scoped>
#part-in-bar {
  display: flex;
  flex-direction: row;
  position: relative;
}
</style>

<script lang="ts">
import { CSSProperties } from 'vue';
import NoteBaseComponent from './NoteBaseComponent.vue';
import TieCanvas from './canvases/TieCanvas.vue';
import { NoteValue, nv } from '../modules/NoteValue';
import { PartInBar } from '../modules/PartInBar';
import { assertDefined } from '../modules/utils';
import Color from '../modules/Color';

type TieCanvasProps = InstanceType<typeof TieCanvas>['$props'];
type NoteBaseComponentProps = InstanceType<typeof NoteBaseComponent>['$props'];

export default {
  emits: {
    tiePointUpdate: (event: { tieEndPointOffset?: DOMPoint, tieStartPointOffset?: DOMPoint }) => true,
    splitNoteElementMounted: (event: { noteIdx: NoteIdx, splitNoteIdx: SplitNoteIdx, splitNoteElement: HTMLElement }) => true,
    splitNoteElementBeforeUnmount: (event: { noteIdx: NoteIdx, splitNoteIdx: SplitNoteIdx }) => true,
    noteChordElementMounted: (event: { noteIdx: NoteIdx, noteChordElement: HTMLElement }) => true,
    noteChordElementBeforeUnmount: (event: NoteIdx) => true,
    clickNote: (event: NoteIdx) => true,
    'update:noteIdx': (event: NoteIdx) => true,
  },

  watch: {
    part: {
      handler() { this.$_updateTiePropsAndStyles() },
      deep: true,
      flush: 'post',
    },
  },

  components: {
    NoteBaseComponent,
    TieCanvas,
  },

  props: {
    part:            { type: PartInBar, required: true },
    selectedNoteIdx: { type: Number },
    gridNoteValue:   { type: NoteValue, required: true },
    noteColor:       { type: Color },
  },

  data(): {
    $_partInBarElementResizeObserver: ResizeObserver,
    $_noteTieStartOffsets: Map<NoteIdx, DOMPoint>,
    $_noteTieEndOffsets: Map<NoteIdx, DOMPoint>,
    $_splitNoteElements: Map<NoteIdx, Map<SplitNoteIdx, HTMLElement>>,
    $_tieProps: Map<NoteIdx, TieCanvasProps>,
    $_tieStyles: Map<NoteIdx, CSSProperties>,
  } {
    return {
      $_partInBarElementResizeObserver: new ResizeObserver(() => { this.$_updateTiePropsAndStyles() }),
      $_noteTieStartOffsets: new Map(),
      $_noteTieEndOffsets: new Map(),
      $_splitNoteElements: new Map(),
      $_tieProps: new Map(),
      $_tieStyles: new Map(),
    };
  },

  computed: {
    $_noteColor(): Color { return this.$store.state.config.noteColor },
    $_noteBarComponentProps(): Map<NoteIdx, NoteBaseComponentProps> {
      let noteBarComponentProps = new Map<NoteIdx, NoteBaseComponentProps>();
      let accumulatedNoteValue = nv.zero;
      for (let noteIdx of this.part.noteIndices()) {
        let note = this.part.getNote(noteIdx);
        noteBarComponentProps.set(
          noteIdx,
          {
            offsetNoteValue: accumulatedNoteValue.clone(),
            note: note,
            partType: this.part.type,
            restNotePitch: this.part.restNotePitch,
            gridNoteValue: this.gridNoteValue,
            isSelected: (this.selectedNoteIdx === undefined)? false : (this.selectedNoteIdx === noteIdx),
            color: this.$store.state.config.noteColor,
          }
        );
        accumulatedNoteValue.add(note.value);
      }
      return noteBarComponentProps;
    },

    $_partInBarElement(): HTMLDivElement {
      return this.$el as HTMLDivElement;
    },
  },

  mounted() {
    this.$data.$_partInBarElementResizeObserver.observe(this.$_partInBarElement);
    this.$_updateTiePropsAndStyles();
  },

  beforeUnmount() {
    this.$data.$_partInBarElementResizeObserver.disconnect();
  },

  methods: {
    $_onSplitNoteElementMounted(noteIdx: NoteIdx, { splitNoteIdx, splitNoteElement }: { splitNoteIdx: SplitNoteIdx, splitNoteElement: HTMLElement }) {
      if (!this.$data.$_splitNoteElements.has(noteIdx)) {
        this.$data.$_splitNoteElements.set(noteIdx, new Map<SplitNoteIdx, HTMLElement>());
      }
      this.$data.$_splitNoteElements.get(noteIdx)?.set(splitNoteIdx, splitNoteElement);
      this.$emit('splitNoteElementMounted', { noteIdx, splitNoteIdx, splitNoteElement });
      this.$nextTick(() => this.$_updateTiePropsAndStyles());
    },

    $_onSplitNoteElementBeforeUnmount(noteIdx: NoteIdx, splitNoteIdx: SplitNoteIdx) {
      let splitNoteElements = this.$data.$_splitNoteElements.get(noteIdx);
      if (splitNoteElements === undefined) return;
      splitNoteElements.delete(splitNoteIdx);
      if (splitNoteElements.size === 0) this.$data.$_splitNoteElements.delete(noteIdx);
      this.$emit('splitNoteElementBeforeUnmount', { noteIdx, splitNoteIdx });
      this.$nextTick(() => this.$_updateTiePropsAndStyles());
    },

    $_onChordComponentMounted(noteIdx: NoteIdx, noteChordElement: HTMLElement) {
      this.$emit('noteChordElementMounted', { noteIdx, noteChordElement });
    },

    $_onChordComponentBeforeUnmount(noteIdx: NoteIdx) {
      this.$emit('noteChordElementBeforeUnmount', noteIdx);
    },

    $_onNoteTiePointUpdate(noteIdx: NoteIdx, noteTieStartAndEndOffset?: { tieStartPointOffset: DOMPoint, tieEndPointOffset: DOMPoint }) {
      if (noteTieStartAndEndOffset === undefined) {
        this.$data.$_noteTieStartOffsets.delete(noteIdx);
        this.$data.$_noteTieEndOffsets.delete(noteIdx);
      } else {
        let { tieStartPointOffset, tieEndPointOffset } = noteTieStartAndEndOffset;
        this.$data.$_noteTieStartOffsets.set(noteIdx, tieStartPointOffset);
        this.$data.$_noteTieEndOffsets.set(noteIdx, tieEndPointOffset);
      }
      this.$nextTick(() => this.$_updateTiePropsAndStyles());
    },

    $_onClickNote(noteIdx: NoteIdx) {
      this.$emit('clickNote', noteIdx);
    },

    $_emitTiePointUpdate() {
      let partElementOffsetX = this.$_partInBarElement.getBoundingClientRect().x;
      if (this.part.firstNoteIdx === undefined) return;
      let firstSplitNoteElements = this.$data.$_splitNoteElements.get(this.part.firstNoteIdx);
      if (firstSplitNoteElements === undefined) return;
      let firstNoteElement = firstSplitNoteElements.get(0);
      if (firstNoteElement === undefined) return;
      if (this.part.lastNoteIdx === undefined) return;
      let lastSplitNoteElements = this.$data.$_splitNoteElements.get(this.part.lastNoteIdx);
      if (lastSplitNoteElements === undefined) return;
      let lastNoteElement = lastSplitNoteElements.get(lastSplitNoteElements.size - 1);
      if (lastNoteElement === undefined) return;
      let firstNoteElementOffsetX = firstNoteElement.getBoundingClientRect().x;
      let lastNoteElementOffsetX = lastNoteElement.getBoundingClientRect().x;
      let firstNoteTieEndOffset = this.$data.$_noteTieEndOffsets.get(this.part.firstNoteIdx);
      let partTieEndPointOffset: DOMPoint | undefined = undefined;
      if (firstNoteTieEndOffset !== undefined) {
        partTieEndPointOffset = new DOMPoint(
          firstNoteTieEndOffset.x + firstNoteElementOffsetX - partElementOffsetX,
          firstNoteTieEndOffset.y,
        );
      }
      let lastNoteTieStartOffset = this.$data.$_noteTieStartOffsets.get(this.part.lastNoteIdx);
      let partTieStartPointOffset: DOMPoint | undefined = undefined;
      if (lastNoteTieStartOffset !== undefined) {
        partTieStartPointOffset = new DOMPoint(
          lastNoteTieStartOffset.x + lastNoteElementOffsetX - partElementOffsetX,
          lastNoteTieStartOffset.y,
        );
      }
      this.$emit(
        'tiePointUpdate',
        {
          tieEndPointOffset: partTieEndPointOffset,
          tieStartPointOffset: partTieStartPointOffset,
        },
      );
    },

    $_updateTiePropsAndStyles() {
      let partElementOffsetX = this.$_partInBarElement.getBoundingClientRect().x;
      let tieProps = new Map<NoteIdx, TieCanvasProps>();
      let tieStyles = new Map<NoteIdx, CSSProperties>();
      for (let noteIdx of this.part.noteIndices()) {
        let nextNoteIdx = noteIdx + 1;
        if (!this.part.includesNote(nextNoteIdx)) continue;
        if (!this.part.getNote(nextNoteIdx).tied) continue;
        let splitNoteElement = this.$data.$_splitNoteElements.get(noteIdx);
        if (splitNoteElement === undefined) continue;
        let nextSplitNoteElement = this.$data.$_splitNoteElements.get(nextNoteIdx);
        if (nextSplitNoteElement === undefined) continue;
        let noteTieStartOffset = this.$data.$_noteTieStartOffsets.get(noteIdx);
        if (noteTieStartOffset === undefined) continue;
        let noteTieEndOffset = this.$data.$_noteTieEndOffsets.get(nextNoteIdx);
        if (noteTieEndOffset === undefined) continue;
        let lastSplitNoteElementOfCurrentNote = splitNoteElement.get(splitNoteElement.size - 1);
        if (lastSplitNoteElementOfCurrentNote === undefined) continue;
        let firstSplitNoteElementOfNextNote = nextSplitNoteElement.get(0);
        if (firstSplitNoteElementOfNextNote === undefined) continue;
        let currentNoteElementOffsetX = lastSplitNoteElementOfCurrentNote.getBoundingClientRect().x;
        let nextNoteElementOffsetX = firstSplitNoteElementOfNextNote.getBoundingClientRect().x;
        let tieStartHorizontalOffsetPx = (currentNoteElementOffsetX - partElementOffsetX) + noteTieStartOffset.x;
        let tieStartVerticalOffsetPx = noteTieStartOffset.y;
        let tieEndHorizontalOffsetPx = (nextNoteElementOffsetX - partElementOffsetX) + noteTieEndOffset.x;
        let tieEndVerticalOffsetPx = noteTieEndOffset.y;
        tieProps.set(
          noteIdx,
          {
            startVerticalOffsetPx: tieStartVerticalOffsetPx,
            endVerticalOffsetPx: tieEndVerticalOffsetPx,
            widthPx: tieEndHorizontalOffsetPx - tieStartHorizontalOffsetPx,
          },
        );
        tieStyles.set(
          noteIdx,
          {
            position: 'absolute',
            left: `${tieStartHorizontalOffsetPx}px`,
          },
        );
      }
      this.$data.$_tieProps = tieProps;
      this.$data.$_tieStyles = tieStyles;
      this.$_emitTiePointUpdate();
    },

    assertDefined: assertDefined,
  },
}
</script>