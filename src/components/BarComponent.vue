<template>
  <div id="beat-and-part-container" ref="barElement">
    <clef-canvas
      v-if="showClef"
      v-bind:clef="bar.clef"
    />
    <key-signature-component
      v-if="showKeySignature"
      v-bind:clef="bar.clef"
      v-bind:scale="bar.scale"
    />
    <beat-component
      v-if="showBeat"
      v-bind:bar-value="bar.value"
    />
    <bar-line-canvas
      v-if="bar.lineStart"
      v-bind:bar-line="bar.lineStart"
    />
    <div
      id="repeat-ending-container"
      v-if="!$_isBarRepeatEndingEmpty"
      v-bind:style="$data.$_barRepeatEndingStyle"
    >
      <bar-repeat-ending-component
        ref="barRepeatEndingComponent"
        v-bind:bar-repeat-ending="bar.repeatEnding"
      />
    </div>
    <div
      id="part-container"
      ref="partContainer"
    >
      <part-in-bar-component
        v-for="(part, partIdx) in bar.parts"
        v-bind:key="partIdx"
        v-bind:part="part"
        v-bind:selected-note-idx="$_getSelectedNoteIdxInPart(partIdx)"
        v-bind:grid-note-value="bar.gridNoteValue"
        v-bind:note-color="noteColor"
        v-on:split-note-element-mounted="$_onSplitNoteElementMounted(partIdx, $event)"
        v-on:split-note-element-before-unmount="$_onSplitNoteElementBeforeUnmount(partIdx, $event)"
        v-on:note-chord-element-mounted="$_onNoteChordElementMounted(partIdx, $event)"
        v-on:note-chord-element-before-unmount="$_onNoteChordElementBeforeUnmount(partIdx, $event)"
        v-on:tie-point-update="$_onPartTiePointUpdate(partIdx, $event)"
        v-on:click-note="$_onClickNote(partIdx, $event)"
      />
    </div>
    <bar-line-canvas
      v-bind:bar-line="bar.lineEnd"
    />
  </div>
</template>           

<style scoped>
#beat-and-part-container {
  display: flex;
  flex-direction: row;
}

#beat-and-part-container > * {
  position: relative;
  flex-shrink: 0;
  z-index: 1;
}

#repeat-ending-container {
  display: flex;
  position: relative;
  border-left: 1px solid #000000;
  border-top: 1px solid #000000;
  margin-left: -1px;
}

#part-container {
  flex-grow: 1;
  margin: 0 10px;
}

#clickable-area {
  cursor: pointer;
  position: absolute;
  width: 100%;
}
</style>

<script lang="ts">
import { defineComponent, CSSProperties, ref } from 'vue';
import PartInBarComponent from '../components/PartInBarComponent.vue';
import ClefCanvas from './canvases/ClefCanvas.vue';
import BarLineCanvas from './canvases/BarLineCanvas.vue';
import BeatComponent from './BeatComponent.vue';
import BarRepeatEndingComponent from './BarRepeatEndingComponent.vue';
import KeySignatureComponent from './KeySignatureComponent.vue';
import BarHoverMenu from './parts/BarHoverMenu.vue'
import { Bar } from '../modules/Bar';
import { bre } from '../modules/BarRepeatEnding';
import { Color } from '../modules/Color';
import { SectionAndBarIdx } from '../modules/SectionAndBarRange';

const selectedBarStaffBackgroundColor = new Color(0, 0, 0, 0.2);

export default defineComponent({
  inheritAttrs: false,

  setup() {
    return {
      partContainer: ref<HTMLDivElement>(),
      barElement: ref<HTMLDivElement>(),
      barRepeatEndingComponent: ref<InstanceType<typeof BarRepeatEndingComponent>>(),
    };
  },

  emits: {
    'update:selectedPartIdx': (partIdx: PartIdx) => true,
    'update:selectedNoteIdx': (partIdx: NoteIdx) => true,
    tiePointUpdate: ({ tieStartPointOffsets, tieEndPointOffsets }: { tieStartPointOffsets: Map<PartIdx, DOMPoint>, tieEndPointOffsets: Map<PartIdx, DOMPoint> }) => true,
    mousedownStaff: (event: MouseEvent) => true,
    marginTopPxUpdate: (marginTopPx: number) => true,
    marginBottomPxUpdate: (marginBottomPx: number) => true,
    mounted: (element: HTMLDivElement) => true,
    beforeUnmount: () => true,
  },

  components: {
    BeatComponent,
    PartInBarComponent,
    ClefCanvas,
    BarLineCanvas,
    BarRepeatEndingComponent,
    KeySignatureComponent,
    BarHoverMenu,
  },

  watch: {
    bar: {
      handler() { this.$_updatePositionAndSize() },
      deep: true,
      flush: 'post',
    },

    barElement: {
      handler(newBarElement?: HTMLDivElement, oldBarElement?: HTMLDivElement) {
        if (oldBarElement) this.$data.$_barElementResizeObserver.unobserve(oldBarElement);
        if (newBarElement) this.$data.$_barElementResizeObserver.observe(newBarElement);
      },
      immediate: true,
    },

    partContainer: {
      handler(newPartContainer?: HTMLDivElement, oldPartContainer?: HTMLDivElement) {
        if (oldPartContainer) this.$data.$_partContainerResizeObserver.unobserve(oldPartContainer);
        if (newPartContainer) this.$data.$_partContainerResizeObserver.observe(newPartContainer);
      },
      immediate: true,
    },
  },

  mounted() {
    this.$_updatePositionAndSize();
    this.$emit('mounted', this.$el);
  },

  beforeUnmount() {
    this.$emit('beforeUnmount');
    this.$data.$_partContainerResizeObserver.disconnect();
    this.$data.$_barElementResizeObserver.disconnect();
  },

  props: {
    bar:                  { type: Bar, required: true },
    sectionIdx:           { type: Number, required: true },
    barIdx:               { type: Number, required: true },
    selectedPartIdx:      { type: Number },
    selectedNoteIdx:      { type: Number },
    isSelected:           { type: Boolean, required: true },
    showKeySignature:     { type: Boolean, required: true },
    showBeat:             { type: Boolean, default: false },
    showClef:             { type: Boolean, default: false },
    noteColor:            { type: Color },
    selectedStaffBackgroundColor: { type: Color, default: () => selectedBarStaffBackgroundColor },
  },

  data(): {
    $_barElementResizeObserver: ResizeObserver,
    $_partContainerResizeObserver: ResizeObserver,
    $_partNoteElements: Map<PartIdx, Map<NoteIdx, Map<SplitNoteIdx, HTMLElement>>>,
    $_partNoteChordElements: Map<number, Map<NoteIdx, HTMLElement>>,
    $_partTieStartPointOffsets: Map<PartIdx, DOMPoint>,
    $_partTieEndPointOffsets: Map<PartIdx, DOMPoint>,
    $_barRepeatEndingStyle: CSSProperties,
    $_marginTopPxMax: number,
    $_marginBottomPxMax: number,
    $_barElementBoundingClientRect: DOMRect,
    $_partContainerBoundingClientRect: DOMRect,
  } {
    return {
      $_barElementResizeObserver: new ResizeObserver(() => { this.$_updatePositionAndSize() }),
      $_partContainerResizeObserver: new ResizeObserver(() => { this.$_updatePositionAndSize() }),
      $_partNoteElements: new Map(),
      $_partNoteChordElements: new Map(),
      $_partTieStartPointOffsets: new Map(),
      $_partTieEndPointOffsets: new Map(),
      $_barRepeatEndingStyle: {},
      $_marginTopPxMax: this.$store.state.config.systemMarginTopPx,
      $_marginBottomPxMax: this.$store.state.config.systemMarginBottomPx,
      $_barElementBoundingClientRect: new DOMRect(),
      $_partContainerBoundingClientRect: new DOMRect(),
    };
  },

  computed: {
    $_sectionAndBarIdx() {
      return new SectionAndBarIdx(this.sectionIdx, this.barIdx);
    },

    $_internalMarginTopPx(): number {
      return this.$store.state.config.staffLineStepPx * 2;
    },

    $_internalMarginBottomPx(): number {
      return this.$store.state.config.staffLineStepPx * 2 + 1;
    },

    $_isBarRepeatEndingEmpty(): boolean {
      return this.bar.repeatEnding.isEqualTo(bre.empty);
    },
  },

  methods: {
    $_getSelectedNoteIdxInPart(partIdx: PartIdx) {
      if (this.selectedPartIdx === undefined) return undefined;
      if (partIdx === this.selectedPartIdx) return this.selectedNoteIdx;
    },

    $_onSplitNoteElementMounted(partIdx: PartIdx, { noteIdx, splitNoteIdx, splitNoteElement }: { noteIdx: NoteIdx, splitNoteIdx: SplitNoteIdx, splitNoteElement: HTMLElement }) {
      if (!this.$data.$_partNoteElements.has(partIdx)) {
        this.$data.$_partNoteElements.set(partIdx, new Map<NoteIdx, Map<SplitNoteIdx, HTMLElement>>())
      }
      const partNoteElements = this.$data.$_partNoteElements.get(partIdx);
      if (partNoteElements === undefined) return;
      if (!partNoteElements.has(noteIdx)) {
        partNoteElements.set(noteIdx, new Map<SplitNoteIdx, HTMLElement>());
      }
      const noteElements = partNoteElements.get(noteIdx);
      if (noteElements === undefined) return;
      noteElements.set(splitNoteIdx, splitNoteElement);
      this.$_updateMarginTopAndBottom();
    },

    $_onSplitNoteElementBeforeUnmount(partIdx: PartIdx, { noteIdx, splitNoteIdx }: { noteIdx: NoteIdx, splitNoteIdx: SplitNoteIdx }) {
      const partNoteElements = this.$data.$_partNoteElements.get(partIdx);
      if (partNoteElements === undefined) return;
      const noteElements = partNoteElements.get(noteIdx);
      if (noteElements === undefined) return;
      noteElements.delete(splitNoteIdx);
      if (noteElements.size === 0) partNoteElements.delete(noteIdx);
      if (partNoteElements.size === 0) this.$data.$_partNoteElements.delete(partIdx);
      this.$_updateMarginTopAndBottom();
    },

    $_onNoteChordElementMounted(
      partIdx: PartIdx,
      { noteIdx, noteChordElement }: { noteIdx: NoteIdx, noteChordElement: HTMLElement },
    ) {
      if (!this.$data.$_partNoteChordElements.has(partIdx)) {
        this.$data.$_partNoteChordElements.set(partIdx, new Map<NoteIdx, HTMLElement>());
      }
      this.$data.$_partNoteChordElements.get(partIdx)?.set(noteIdx, noteChordElement);
      this.$_updateMarginTopAndBottom();
    },

    $_onNoteChordElementBeforeUnmount(partIdx: PartIdx, noteIdx: NoteIdx) {
      const partNoteChordElements = this.$data.$_partNoteChordElements.get(partIdx);
      if (partNoteChordElements === undefined) return;
      partNoteChordElements.delete(noteIdx);
      if (partNoteChordElements.size === 0) this.$data.$_partNoteChordElements.delete(partIdx);
      this.$_updateMarginTopAndBottom();
    },

    $_onPartTiePointUpdate(partIdx: PartIdx, { tieStartPointOffset, tieEndPointOffset }: { tieStartPointOffset?: DOMPoint, tieEndPointOffset?: DOMPoint }) {
      if (tieStartPointOffset === undefined) {
        this.$data.$_partTieStartPointOffsets.delete(partIdx);
      } else {
        this.$data.$_partTieStartPointOffsets.set(partIdx, tieStartPointOffset);
      }
      if (tieEndPointOffset === undefined) {
        this.$data.$_partTieEndPointOffsets.delete(partIdx);
      } else {
        this.$data.$_partTieEndPointOffsets.set(partIdx, tieEndPointOffset);
      }
      this.$_emitTiePointUpdate();
    },

    $_updatePositionAndSize() {
      if (this.barElement) {
        this.$data.$_barElementBoundingClientRect = this.barElement.getBoundingClientRect();
      }
      if (this.partContainer) {
        this.$data.$_partContainerBoundingClientRect = this.partContainer.getBoundingClientRect();
      }
      this.$_emitTiePointUpdate();
      this.$_updateMarginTopAndBottom();
      this.$_updateBarRepeatEndingStyle();
    },

    $_emitTiePointUpdate() {
      this.$emit(
        'tiePointUpdate',
        {
          tieStartPointOffsets: new Map<PartIdx, DOMPoint>(
            [ ...this.$data.$_partTieStartPointOffsets ].map(
              ([ partIdx, partTieStartPointOffset ]: [ PartIdx, DOMPoint ]) => {
                return [
                  partIdx,
                  new DOMPoint(
                    partTieStartPointOffset.x + this.$data.$_partContainerBoundingClientRect.x - this.$data.$_barElementBoundingClientRect.x,
                    partTieStartPointOffset.y,
                  ),
                ];
              },
            ),
          ),
          tieEndPointOffsets: new Map<PartIdx, DOMPoint>(
            [ ...this.$data.$_partTieEndPointOffsets ].map(
              ([ partIdx, partTieEndPointOffset ]: [ PartIdx, DOMPoint ]) => {
                return [
                  partIdx,
                  new DOMPoint(
                    partTieEndPointOffset.x + this.$data.$_partContainerBoundingClientRect.x - this.$data.$_barElementBoundingClientRect.x,
                    partTieEndPointOffset.y,
                  ),
                ];
              },
            ),
          ),
        },
      );
    },

    $_updateMarginTopAndBottom() {
      {
        let maxTopOffsetPx = this.$_internalMarginTopPx + this.$store.state.config.systemMarginTopPx;
        let maxBottomOffsetPx = this.$_internalMarginBottomPx + this.$store.state.config.systemMarginBottomPx;
        const topBiasPx = this.$data.$_barElementBoundingClientRect.top;
        const bottomBiasPx = this.$data.$_barElementBoundingClientRect.bottom;
        for (const partNoteElements of this.$data.$_partNoteElements.values()) {
          for (const partNoteElement of partNoteElements.values()) {
            for (const partSplitNoteElement of partNoteElement.values()) {
              maxTopOffsetPx = getMaxTopOffsetPx(partSplitNoteElement, maxTopOffsetPx, topBiasPx);
              maxBottomOffsetPx = getMaxBottomOffsetPx(partSplitNoteElement, maxBottomOffsetPx, bottomBiasPx);
            }
          }
        }
        for (const partNoteChordElements of this.$data.$_partNoteChordElements.values()) {
          for (const partNoteChordElement of partNoteChordElements.values()) {
            maxTopOffsetPx = getMaxTopOffsetPx(partNoteChordElement, maxTopOffsetPx, topBiasPx);
            maxBottomOffsetPx = getMaxBottomOffsetPx(partNoteChordElement, maxBottomOffsetPx, bottomBiasPx);
          }
        }
        this.$data.$_marginTopPxMax = maxTopOffsetPx;
        this.$data.$_marginBottomPxMax = maxBottomOffsetPx;
        this.$emit('marginTopPxUpdate', this.$data.$_marginTopPxMax);
        this.$emit('marginBottomPxUpdate', this.$data.$_marginBottomPxMax);
      }

      function getMaxTopOffsetPx(element: HTMLElement, currentMaxTopOffsetPx: number, topBiasPx: number): number {
        if (element.clientHeight === 0) return currentMaxTopOffsetPx;
        const topOffsetPx = topBiasPx - element.getBoundingClientRect().top;
        if (currentMaxTopOffsetPx < topOffsetPx) {
          currentMaxTopOffsetPx = topOffsetPx;
        }
        return currentMaxTopOffsetPx;
      }

      function getMaxBottomOffsetPx(element: HTMLElement, currentMaxBottomOffsetPx: number, bottomBiasPx: number): number {
        if (element.clientHeight === 0) return currentMaxBottomOffsetPx;
        const bottomOffsetPx = element.getBoundingClientRect().bottom - bottomBiasPx;
        if (currentMaxBottomOffsetPx < bottomOffsetPx) {
          currentMaxBottomOffsetPx = bottomOffsetPx;
        }
        return currentMaxBottomOffsetPx;
      }
    },

    $_updateBarRepeatEndingStyle() {
      const barRepeatEndingElementBoundingClientRect = this.barRepeatEndingComponent?.$el.getBoundingClientRect();
      if (barRepeatEndingElementBoundingClientRect === undefined) return;
      const barRepeatEndingWidthPx = this.$data.$_barElementBoundingClientRect.x + this.$data.$_barElementBoundingClientRect.width - barRepeatEndingElementBoundingClientRect.x;
      const barRepeatEndingRightOffsetPx = barRepeatEndingElementBoundingClientRect.x + barRepeatEndingElementBoundingClientRect.width - this.$data.$_barElementBoundingClientRect.x;
      this.$data.$_barRepeatEndingStyle = {
        marginTop: `${-this.$data.$_marginTopPxMax}px`,
        marginRight: `${-(this.$data.$_barElementBoundingClientRect.width - barRepeatEndingRightOffsetPx)}px`,
        height: `${this.$data.$_marginTopPxMax - this.$_internalMarginTopPx}px`,
        width: `${barRepeatEndingWidthPx}px`,
      };
    },

    $_onClickNote(partIdx: PartIdx, noteIdx: NoteIdx) {
      this.$emit('update:selectedPartIdx', partIdx);
      this.$emit('update:selectedNoteIdx', noteIdx);
    },
  },
})
</script>