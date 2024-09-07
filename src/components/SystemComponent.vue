<template>
  <div
    id="system"
    ref="system"
    v-bind:style="$_systemStyle"
  >
    <staff-canvas
      id="staff-canvas"
      v-bind:style="$_staffCanvasStyle"
    >
    </staff-canvas>
    <template
      v-for="partIdx of $_partIdcs.get(barRange.firstBarIdx)"
      v-bind:key="partIdx"
    >
      <tie-canvas
        class="tie-canvas"
        v-if="$data.$_firstTieProps.has(partIdx)"
        v-bind="assertDefined($data.$_firstTieProps.get(partIdx))"
        v-bind:color="$store.state.config.noteColor"
        v-bind:alpha-as-opacity="true"
        v-bind:style="assertDefined($data.$_firstTieStyles.get(partIdx))"
      >
      </tie-canvas>
    </template>
    <template
      v-for="barProps of $_barProps"
      v-bind:key="barProps.barIdx"
    >
      <template v-if="$data.$_tieProps.has(barProps.barIdx)">
        <template
          v-for="partIdx of $_partIdcs.get(barProps.barIdx)"
          v-bind:key="partIdx"
        >
          <tie-canvas
            class="tie-canvas"
            v-if="assertDefined($data.$_tieProps.get(barProps.barIdx)).has(partIdx)"
            v-bind="assertDefined($data.$_tieProps.get(barProps.barIdx)?.get(partIdx))"
            v-bind:color="$store.state.config.noteColor"
            v-bind:alpha-as-opacity="true"
            v-bind:style="assertDefined($data.$_tieStyles.get(barProps.barIdx)?.get(partIdx))"
          >
          </tie-canvas>
        </template>
      </template>
      <div class="bar-container">
        <bar-component
          v-model:selected-part-idx="$_selectedPartIdx"
          v-model:selected-note-idx="$_selectedNoteIdx"
          v-bind="barProps"
          v-on:tie-point-update="$_onTiePointUpdate(barProps.barIdx, $event)"
          v-on:margin-top-px-update="$_onMarginTopPxUpdate(barProps.barIdx, $event)"
          v-on:margin-bottom-px-update="$_onMarginBottomPxUpdate(barProps.barIdx, $event)"
          v-on:mounted="$_setBarElement(barProps.barIdx, $event)"
          v-on:before-unmount="$_deleteBarElement(barProps.barIdx)"
        >
        </bar-component>
        <div
          class="clickable-area"
          v-bind:style="$_clickableAreaStyle.get(barProps.barIdx)"
          v-on:mousedown.stop="$_onMousedownStaff(barProps.barIdx, $event)"
          v-on:contextmenu.capture.stop.prevent="$_onContextmenu(sectionIdx, barProps.barIdx, $event)"
          v-on:keydown.stop
        >
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
#system {
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
}

#system > * {
  flex-grow: 1;
}

#staff-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.clickable-area {
  z-index: 2;
  cursor: pointer;
  position: absolute;
  width: 100%;
}

.bar-container {
  position: relative;
}

.tie-canvas {
  position: absolute;
}
</style>

<script lang="ts">
import { defineComponent, CSSProperties, ref } from 'vue';
import BarComponent from '../components/BarComponent.vue';
import StaffCanvas from './canvases/StaffCanvas.vue';
import { Score } from '../modules/Score';
import { Section } from '../modules/Section';
import { bb } from '../modules/BarBreak';
import { Color, cl } from '../modules/Color';
import { assertDefined, max } from '../modules/utils';
import TieCanvas from './canvases/TieCanvas.vue';
import { SectionAndBarIdx, SectionAndBarRange, BarRange } from '../modules/SectionAndBarRange';
import { ContextMenuItem, ContextMenuParameters } from '../store/module/ContextMenu'

const selectedBarStaffBackgroundColor = new Color(170, 210, 160, 0.3);

type TieCanvasProps = InstanceType<typeof TieCanvas>['$props'];
type BarComponentPropsType = InstanceType<typeof BarComponent>['$props'];

export default defineComponent({
  setup() {
    return {
      system: ref<HTMLDivElement>(),
    };
  },

  emits: {
    mousedownStaff: ({ barIdx, event }: { barIdx: BarIdx, event: MouseEvent }) => true,
    'update:selectedNoteIdx': (noteIdx: NoteIdx) => true,
    'update:selectedPartIdx': (partIdx: PartIdx) => true,
  },

  components: {
    BarComponent,
    StaffCanvas,
    TieCanvas,
  },

  watch: {
    async $_isFirstOfSelection() { this.$_tryScrollTo() },
    async $_isLastOfSelection() { this.$_tryScrollTo() },
    '$data.$_barElements'() { this.$_updateTiePropsAndStyles() },
    $_isTiedToNextSystem() { this.$_updateTiePropsAndStyles() },
  },

  props: {
    score: { type: Score, required: true },
    section: { type: Section, required: true },
    sectionIdx: { type: Number, required: true },
    barRange: { type: BarRange, required: true },
    selectedPartIdx: { type: Number },
    selectedNoteIdx: { type: Number },
    showBeatOnFirstBar: { type: Boolean, required: true },
    showBarHoverMenu: { type: Boolean, required: true },
    staffBackgroundColor: { type: Color },
    selectedStaffBackgroundColor: { type: Color, default: () => selectedBarStaffBackgroundColor },
  },

  data(): {
    $_systemElementResizeObserver: ResizeObserver,
    $_marginTopPxMax: number,
    $_marginBottomPxMax: number,
    $_marginTopPx: Map<BarIdx, number>,
    $_marginBottomPx: Map<BarIdx, number>,
    $_barElements: Map<BarIdx, HTMLElement>,
    $_barNoteTieStartPointOffsets: Map<BarIdx, Map<PartIdx, DOMPoint>>,
    $_barNoteTieEndPointOffsets: Map<BarIdx, Map<PartIdx, DOMPoint>>,
    $_firstTieProps: Map<BarIdx, TieCanvasProps> ,
    $_firstTieStyles: Map<BarIdx, CSSProperties>,
    $_tieProps: Map<BarIdx, Map<PartIdx, TieCanvasProps>>,
    $_tieStyles: Map<BarIdx, Map<PartIdx, CSSProperties>>,
  } {
    return {
      $_systemElementResizeObserver: new ResizeObserver(() => {
        if (this.score.includesSection(this.sectionIdx)) this.$_updateTiePropsAndStyles();
      }),
      $_marginTopPxMax: this.$store.state.config.systemMarginTopPx,
      $_marginBottomPxMax: this.$store.state.config.systemMarginBottomPx,
      $_marginTopPx: new Map(),
      $_marginBottomPx: new Map(),
      $_barElements: new Map(),
      $_barNoteTieStartPointOffsets: new Map(),
      $_barNoteTieEndPointOffsets: new Map(),
      $_firstTieProps: new Map(),
      $_firstTieStyles: new Map(),
      $_tieProps: new Map(),
      $_tieStyles: new Map(),
    };
  },

  computed: {
    $_barIdcs(): BarIdx[] { return [ ...this.barRange.indices() ] },

    $_selectedPartIdx: {
      get(): PartIdx | undefined { return this.selectedPartIdx },
      set(partIdx: PartIdx) { this.$emit('update:selectedPartIdx', partIdx) },
    },

    $_selectedNoteIdx: {
      get(): NoteIdx | undefined { return this.selectedNoteIdx },
      set(noteIdx: NoteIdx) { this.$emit('update:selectedNoteIdx', noteIdx) },
    },

    $_partIdcs(): Map<BarIdx, PartIdx[]> {
      const partIdcs = new Map<BarIdx, PartIdx[]>();
      for (const barIdx of this.barRange.indices()) {
        if (barIdx >= this.section.numBars) continue;
        partIdcs.set(barIdx, [ ...this.section.getBar(barIdx).partIndices() ]);
      }
      return partIdcs;
    },

    $_internalMarginTopPx(): number {
      return this.$store.state.config.staffLineStepPx * 2;
    },

    $_staffCanvasStyle(): CSSProperties {
      return {
        marginTop: `${-this.$_internalMarginTopPx}px`,
      };
    },

    $_systemStyle(): CSSProperties {
      return {
        marginTop: `${this.$data.$_marginTopPxMax}px`,
        marginBottom: `${this.$data.$_marginBottomPxMax}px`,
      };
    },

    $_clickableAreaStyle(): Map<BarIdx, CSSProperties> {
      const clickableAreaStyle = new Map<BarIdx, CSSProperties>();
      for (const barIdx of this.barRange.indices()) {
        let backgroundColor: Color;
        const sectionAndBarIdx = new SectionAndBarIdx(this.sectionIdx, barIdx);
        const isSelected = this.$store.state.score.selectedBars?.includes(sectionAndBarIdx) ?? false;
        if (!this.$store.state.appState.isPrintLayoutEnabled && isSelected) {
          backgroundColor = this.selectedStaffBackgroundColor;
        } else {
          backgroundColor = cl.transparent;
        }
        clickableAreaStyle.set(
          barIdx,
          {
            marginTop: `${-this.$_internalMarginTopPx}px`,
            height: `${this.$store.state.config.staffLineStepPx * 4 + 1}px`,
            backgroundColor: backgroundColor.styleString(),
          },
        );
      }
      return clickableAreaStyle;
    },

    $_isFirstOfSelection(): boolean {
      if (this.$store.state.score.selectedBars === undefined) return false;
      if (this.sectionIdx !== this.$store.state.score.selectedBars.first.sectionIdx) return false;
      return this.barRange.includes(this.$store.state.score.selectedBars.first.barIdx);
    },

    $_isLastOfSelection(): boolean {
      if (this.$store.state.score.selectedBars === undefined) return false;
      if (this.sectionIdx !== this.$store.state.score.selectedBars.last.sectionIdx) return false;
      return this.barRange.includes(this.$store.state.score.selectedBars.last.barIdx);
    },

    $_barProps(): BarComponentPropsType[] {
      return [ ...this.barRange.indices() ].map((barIdx: BarIdx): BarComponentPropsType => {
        return {
          bar: this.section.getBar(barIdx),
          sectionIdx: this.sectionIdx,
          barIdx: barIdx,
          showClef: this.$_getShowClef(barIdx),
          showBeat: this.$_getShowBeat(barIdx),
          showKeySignature: this.$_getShowKeySignature(barIdx),
          isSelected: this.$_getIsSelected(barIdx),
          selectedStaffBackgroundColor: this.selectedStaffBackgroundColor,
          noteColor: this.$store.state.config.noteColor,
        };
      })
    },

    $_sameTypedPartIdxInNextBar(): Map<BarIdx, Map<PartIdx, { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }>> {
      const sameTypedPartIdxInNextBar = new Map<BarIdx, Map<PartIdx, { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }>>();
      for (const barIdx of this.barRange.indices()) {
        const sameTypedPartIdx = new Map<PartIdx, { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }>();
        if (!this.section.barRange.includes(barIdx)) continue;
        for (const partIdx of this.section.getBar(barIdx).partIndices()) {
          const found = this.score.findSameTypedPartIndexInNextBar({
            sectionAndBarIdx: new SectionAndBarIdx(this.sectionIdx, barIdx),
            partIdx,
          });
          if (found === undefined) continue;
          sameTypedPartIdx.set(partIdx, found);
        }
        sameTypedPartIdxInNextBar.set(barIdx, sameTypedPartIdx);
      }
      return sameTypedPartIdxInNextBar;
    },

    $_isTiedToNextSystem(): Map<PartIdx, boolean> | undefined {
      const isTiedToNextSystem = new Map<PartIdx, boolean>();
      const currentPartIdcs = this.$_partIdcs.get(this.barRange.lastBarIdx) as PartIdx[];
      if (!this.section.barRange.includes(this.barRange.lastBarIdx)) return undefined;
      const currentBar = this.section.getBar(this.barRange.lastBarIdx);
      for (const currentPartIdx of currentPartIdcs) {
        const currentPart = currentBar.getPart(currentPartIdx);
        const lastNoteOfCurrentPart = currentPart.lastNote;
        if (lastNoteOfCurrentPart === undefined) continue;
        if (lastNoteOfCurrentPart.type === 'rest') continue;
        const found = this.$_sameTypedPartIdxInNextBar.get(this.barRange.lastBarIdx)?.get(currentPartIdx);
        if (found === undefined) continue;
        const firstNoteOfNextPart = this.score.getPart(found).firstNote;
        if (firstNoteOfNextPart === undefined) continue;
        isTiedToNextSystem.set(currentPartIdx, firstNoteOfNextPart.tied);
      }
      return isTiedToNextSystem;
    },
  },

  mounted() {
    if (this.system) {
      this.$data.$_systemElementResizeObserver.observe(this.system);
    }
  },

  beforeUnmount() {
    this.$data.$_systemElementResizeObserver.disconnect();
  },

  methods: {
    $_getShowClef(barIdx: BarIdx): boolean {
      if (barIdx === 0) return true;
      const currentBar = this.section.getBar(barIdx);
      const previousBar = this.section.getBar(barIdx - 1);
      if (!previousBar.break.isEqualTo(bb.empty)) return true;
      const currentClef = currentBar.clef;
      const previousClef = previousBar.clef;
      if (!currentClef.isEqualTo(previousClef)) return true;
      return false;
    },

    $_getShowBeat(barIdx: BarIdx): boolean {
      if (barIdx > 0) {
        const currentBarValue = this.section.getBar(barIdx).value;
        const previousBarValue = this.section.getBar(barIdx - 1).value;
        if (!currentBarValue.isSameAs(previousBarValue)) return true;
      }
      if (barIdx === this.barRange.firstBarIdx) return this.showBeatOnFirstBar;
      return false;
    },

    $_getShowKeySignature(barIdx: BarIdx): boolean {
      if (barIdx === this.barRange.firstBarIdx) {
        return true;
      } else {
        const previousBar = this.section.getBar(barIdx - 1)
        const currentBar = this.section.getBar(barIdx);
        if (currentBar.scale.isEqualTo(previousBar.scale)) return false;
        if (currentBar.scale.isRelativeTo(previousBar.scale)) return false;
        return true;
      }
    },

    $_getIsSelected(barIdx: BarIdx): boolean {
      if (this.$store.state.score.selectedBars === undefined) return false;
      return this.$store.state.score.selectedBars.includes(new SectionAndBarIdx(this.sectionIdx, barIdx))
    },

    $_setBarElement(barIdx: BarIdx, barElement: HTMLElement) {
      this.$data.$_barElements.set(barIdx, barElement);
    },

    $_deleteBarElement(barIdx: BarIdx) {
      this.$data.$_barElements.delete(barIdx);
    },

    $_onTiePointUpdate(barIdx: BarIdx, { tieStartPointOffsets, tieEndPointOffsets }: { tieStartPointOffsets: Map<BarIdx, DOMPoint>, tieEndPointOffsets: Map<BarIdx, DOMPoint> }) {
      this.$data.$_barNoteTieStartPointOffsets.set(barIdx, tieStartPointOffsets);
      this.$data.$_barNoteTieEndPointOffsets.set(barIdx, tieEndPointOffsets);
      this.$_updateTiePropsAndStyles();
    },

    $_onMarginTopPxUpdate(barIdx: BarIdx, marginTopPx: number) {
      if (marginTopPx === undefined) {
        this.$data.$_marginTopPx.delete(barIdx);
      } else {
        this.$data.$_marginTopPx.set(barIdx, marginTopPx);
      }
      this.$data.$_marginTopPxMax = max(this.$store.state.config.systemMarginTopPx, ...this.$data.$_marginTopPx.values());
    },

    $_onMarginBottomPxUpdate(barIdx: BarIdx, marginBottomPx?: number) {
      if (marginBottomPx === undefined) {
        this.$data.$_marginBottomPx.delete(barIdx);
      } else {
        this.$data.$_marginBottomPx.set(barIdx, marginBottomPx);
      }
      this.$data.$_marginBottomPxMax = max(this.$store.state.config.systemMarginBottomPx, ...this.$data.$_marginBottomPx.values());
    },

    $_onMousedownStaff(barIdx: BarIdx, event: MouseEvent) {
      this.$emit('mousedownStaff', { barIdx, event });
    },

    $_updateTiePropsAndStyles() {
      const firstTieProps = new Map<PartIdx, TieCanvasProps>();
      const firstTieStyles = new Map<PartIdx, CSSProperties>();
      const tieProps = new Map<BarIdx, Map<PartIdx, TieCanvasProps>>();
      const tieStyles = new Map<BarIdx, Map<PartIdx, CSSProperties>>();
      const firstBar = this.section.getBar(this.barRange.firstBarIdx);
      if (!this.system) return;
      if (this.system.nodeType === Node.COMMENT_NODE) return;
      const systemElementBoundingClientRect = this.system.getBoundingClientRect();
      const partIdcs = this.$_partIdcs.get(this.barRange.firstBarIdx) as PartIdx[];
      for (const partIdxInFirstBar of partIdcs) {
        const partInFirstBar = firstBar.getPart(partIdxInFirstBar);
        const firstNoteOfPart = partInFirstBar.firstNote;
        if (firstNoteOfPart === undefined) continue;
        if (firstNoteOfPart.tied) {
          const found = this.score.findSameTypedPartIndexInPreviousBar({
            sectionAndBarIdx: new SectionAndBarIdx(this.sectionIdx, this.barRange.firstBarIdx),
            partIdx: partIdxInFirstBar,
          });
          if (found === undefined) continue;
          const previousPart = this.score.getPart(found);
          if (previousPart.lastNote === undefined) continue;
          if (previousPart.lastNote.type === 'rest') continue;
          const firstBarNoteTieEndOffsets = this.$data.$_barNoteTieEndPointOffsets.get(this.barRange.firstBarIdx);
          if (firstBarNoteTieEndOffsets === undefined) continue;
          const firstBarNoteTieEndOffset = firstBarNoteTieEndOffsets.get(partIdxInFirstBar);
          if (firstBarNoteTieEndOffset === undefined) continue;

          const firstBarElement = this.$data.$_barElements.get(this.barRange.firstBarIdx);
          if (firstBarElement === undefined) continue;
          const firstBarElementBoundingClientRect = firstBarElement.getBoundingClientRect();

          const firstTieEndHorizontalOffsetPx = firstBarElementBoundingClientRect.x + firstBarNoteTieEndOffset.x - systemElementBoundingClientRect.x;
          const firstTieEndVerticalOffsetPx = firstBarNoteTieEndOffset.y;
          const firstTieStartHorizontalOffsetPx = firstTieEndHorizontalOffsetPx - 20;
          const firstTieStartVerticalOffsetPx = firstBarNoteTieEndOffset.y;
          firstTieProps.set(
            partIdxInFirstBar,
            {
              startVerticalOffsetPx: firstTieStartVerticalOffsetPx,
              endVerticalOffsetPx: firstTieEndVerticalOffsetPx,
              widthPx: firstTieEndHorizontalOffsetPx - firstTieStartHorizontalOffsetPx,
            },
          );
          firstTieStyles.set(
            partIdxInFirstBar,
            {
              left: `${firstTieStartHorizontalOffsetPx}px`,
            },
          );
        }
      }

      for (const currentBarIdx of this.barRange.indices()) {
        tieProps.set(currentBarIdx, new Map<PartIdx, TieCanvasProps>());
        tieStyles.set(currentBarIdx, new Map<PartIdx, CSSProperties>());
        if (!this.section.barRange.includes(currentBarIdx)) continue;
        const currentPartIdcs = this.$_partIdcs.get(currentBarIdx) as PartIdx[];
        for (const currentPartIdx of currentPartIdcs) {
          const currentPart = this.section.getBar(currentBarIdx).getPart(currentPartIdx);
          if (currentPart.lastNote === undefined) continue;
          if (currentPart.lastNote.type === 'rest') continue;
          const found = this.$_sameTypedPartIdxInNextBar.get(currentBarIdx)?.get(currentPartIdx);
          if (found === undefined) continue;
          const { sectionAndBarIdx: nextSectionAndBarIdx, partIdx: nextPartIdx } = found;
          const nextPart = this.score.getPart({ sectionAndBarIdx: nextSectionAndBarIdx, partIdx: nextPartIdx });
          const firstNoteOfNextPart = nextPart.firstNote;
          if (firstNoteOfNextPart === undefined) continue;
          if (firstNoteOfNextPart.tied) {
            const currentBarNoteTieStartOffsets = this.$data.$_barNoteTieStartPointOffsets.get(currentBarIdx);
            if (currentBarNoteTieStartOffsets === undefined) continue;
            const currentBarNoteTieStartOffset = currentBarNoteTieStartOffsets.get(currentPartIdx);
            if (currentBarNoteTieStartOffset === undefined) continue;
            const currentBarElement = this.$data.$_barElements.get(currentBarIdx);
            if (currentBarElement === undefined) continue;
            const currentBarElementBoundingClientRect = currentBarElement.getBoundingClientRect();

            const tieStartHorizontalOffsetPx = currentBarElementBoundingClientRect.x + currentBarNoteTieStartOffset.x - systemElementBoundingClientRect.x;
            const tieStartVerticalOffsetPx = currentBarNoteTieStartOffset.y;

            let tieEndHorizontalOffsetPx;
            let tieEndVerticalOffsetPx;
            if (this.barRange.includes(nextSectionAndBarIdx.barIdx)) {
              const nextBarNoteTieEndOffsets = this.$data.$_barNoteTieEndPointOffsets.get(nextSectionAndBarIdx.barIdx);
              if (nextBarNoteTieEndOffsets === undefined) continue;
              const barNoteTieEndOffset = nextBarNoteTieEndOffsets.get(nextPartIdx);
              if (barNoteTieEndOffset === undefined) continue;
              const nextBarElement = this.$data.$_barElements.get(nextSectionAndBarIdx.barIdx);
              if (nextBarElement === undefined) continue;
              const nextBarElementBoundingClientRect = nextBarElement.getBoundingClientRect();
              tieEndHorizontalOffsetPx = nextBarElementBoundingClientRect.x + barNoteTieEndOffset.x - systemElementBoundingClientRect.x;
              tieEndVerticalOffsetPx = barNoteTieEndOffset.y;
            } else {
              tieEndHorizontalOffsetPx = currentBarElementBoundingClientRect.x + currentBarElementBoundingClientRect.width - systemElementBoundingClientRect.x;
              tieEndVerticalOffsetPx = currentBarNoteTieStartOffset.y;
            }

            tieProps.get(currentBarIdx)?.set(
              currentPartIdx,
              {
                startVerticalOffsetPx: tieStartVerticalOffsetPx,
                endVerticalOffsetPx: tieEndVerticalOffsetPx,
                widthPx: tieEndHorizontalOffsetPx - tieStartHorizontalOffsetPx,
              },
            );
            tieStyles.get(currentBarIdx)?.set(
              currentPartIdx,
              {
                left: `${tieStartHorizontalOffsetPx}px`,
              },
            );
          }
        }
      }
      this.$data.$_firstTieProps = firstTieProps;
      this.$data.$_firstTieStyles = firstTieStyles;
      this.$data.$_tieProps = tieProps;
      this.$data.$_tieStyles = tieStyles;
      this.$nextTick(() => { this.$store.dispatch('canvas/drawTieCanvas') });
    },

    $_tryScrollTo() {
      if (!this.$store.state.appState.isAutoScrollEnabled) return;
      if (this.$store.state.appState.isBarEditorDrawerMinimized) return;
      // FIXME
      // this.$vuetify.goTo(this.system);
    },

    $_barMenuItems(sectionIdx: number, barIdx: number): ContextMenuItem[] {
      const sectionAndBarIdx = new SectionAndBarIdx(sectionIdx, barIdx);
      const nextBarIdxInCurrentSection = new SectionAndBarIdx(sectionIdx, barIdx + 1);
      const sectionAndBarRange = new SectionAndBarRange(sectionAndBarIdx);
      return [
        {
          icon: 'mdi-plus',
          text: this.$t('insertBarBefore'),
          callback: async () => {
            await this.$store.dispatch(
              'score/insertBars',
              {
                sectionAndBarIdx: sectionAndBarIdx,
                bars: [ this.$store.state.score.score.getBar(sectionAndBarIdx).generateEmptyFrom() ],
                selects: false,
              },
            );
          },
        },
        {
          icon: 'mdi-delete',
          text: this.$t('removeBar'),
          callback: async () => {
            await this.$store.dispatch('score/removeBars', sectionAndBarRange);
            await this.$store.dispatch('score/unselectBar');
          },
        },
        {
          icon: 'mdi-content-copy',
          text: this.$t('copyBar'),
          callback: async () => { await this.$store.dispatch('score/setCopiedBars', sectionAndBarRange) },
        },
        {
          icon: 'mdi-content-paste',
          text: this.$t('pasteBar'),
          callback: async () => { await this.$store.dispatch('score/pasteCopiedBarsPartOnly', sectionAndBarRange) },
          disabled: (this.$store.state.score.copiedBars.length === 0),
        },
        {
          icon: 'mdi-plus',
          text: this.$t('insertBarAfter'),
          callback: async () => {
            await this.$store.dispatch(
              'score/insertBars',
              {
                sectionAndBarIdx: nextBarIdxInCurrentSection,
                bars: [ this.$store.state.score.score.getBar(sectionAndBarIdx).generateEmptyFrom() ],
                selects: false,
              },
            );
          },
        },
      ];
    },

    async $_onContextmenu(sectionIdx: number, barIdx: number, event: Event) {
      await this.$store.dispatch('contextMenu/clearParameters');
      const parameters: ContextMenuParameters = {
        activator: event.target as HTMLElement,
        menuItems: this.$_barMenuItems(sectionIdx, barIdx),
      };
      await this.$store.dispatch('contextMenu/setParameters', parameters);
    },

    assertDefined,
  },
})
</script>