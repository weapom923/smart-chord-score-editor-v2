<template>
  <div
    id="system"
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
        v-bind:style="assertDefined($data.$_firstTieStyles.get(partIdx))"
      >
      </tie-canvas>
    </template>
    <template
      v-for="barProps of $_barProps"
      v-bind:key="barProps.barIdx"
    >
      <template
        v-if="$data.$_tieProps.has(barProps.barIdx)"
        v-for="partIdx of $_partIdcs.get(barProps.barIdx)"
        v-bind:key="partIdx"
      >
        <tie-canvas
          class="tie-canvas"
          v-if="assertDefined($data.$_tieProps.get(barProps.barIdx)).has(partIdx)"
          v-bind="assertDefined(assertDefined($data.$_tieProps.get(barProps.barIdx)).get(partIdx))"
          v-bind:style="assertDefined(assertDefined($data.$_tieStyles.get(barProps.barIdx)).get(partIdx))"
        >
        </tie-canvas>
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
        <v-menu
          open-on-hover
          close-on-back
          close-on-content-click
          location="bottom"
          open-delay="0"
          close-delay="0"
          v-if="showBarHoverMenu"
          v-bind:disabled="$store.state.appState.isPrintLayoutEnabled"
        >
          <template v-slot:activator="{ props }">
            <div
              id="clickable-area"
              v-bind="props"
              v-bind:style="$_clickableAreaStyle.get(barProps.barIdx)"
              v-on:mousedown.stop="$_onMousedownStaff(barProps.barIdx, $event)"
            >
            </div>
          </template>

          <bar-hover-menu
            v-bind:section-idx="sectionIdx"
            v-bind:bar-idx="barProps.barIdx"
          >
          </bar-hover-menu>
        </v-menu>
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

#system * {
  flex-grow: 1;
}

#staff-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

#clickable-area {
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
import { CSSProperties } from 'vue';
import BarComponent from '../components/BarComponent.vue';
import StaffCanvas from './canvases/StaffCanvas.vue';
import BarHoverMenu from './parts/BarHoverMenu.vue';
import { Score } from '../modules/Score';
import { Section } from '../modules/Section';
import { bb } from '../modules/BarBreak';
import { Color, cl } from '../modules/Color';
import { assertDefined, max } from '../modules/utils';
import TieCanvas from './canvases/TieCanvas.vue';
import { SectionAndBarIdx, BarRange } from '../modules/SectionAndBarRange';

const selectedBarStaffBackgroundColor = new Color(170, 210, 160, 0.3);

type TieCanvasProps = InstanceType<typeof TieCanvas>['$props'];
type BarComponentPropsType = InstanceType<typeof BarComponent>['$props'];

export default {
  emits: {
    mousedownStaff: ({ barIdx, event }: { barIdx: BarIdx, event: MouseEvent }) => true,
    'update:selectedNoteIdx': (noteIdx: NoteIdx) => true,
    'update:selectedPartIdx': (partIdx: PartIdx) => true,
  },

  components: {
    BarComponent,
    BarHoverMenu,
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
      let partIdcs = new Map<BarIdx, PartIdx[]>();
      for (let barIdx of this.barRange.indices()) {
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
      let clickableAreaStyle = new Map<BarIdx, CSSProperties>();
      for (let barIdx of this.barRange.indices()) {
        let backgroundColor: Color;
        let sectionAndBarIdx = new SectionAndBarIdx(this.sectionIdx, barIdx);
        let isSelected = this.$store.state.score.selectedBars?.includes(sectionAndBarIdx) ?? false;
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
            backgroundColor: backgroundColor.styleString,
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
        };
      })
    },

    $_sameTypedPartIdxInNextBar(): Map<BarIdx, Map<PartIdx, { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }>> {
      let sameTypedPartIdxInNextBar = new Map<BarIdx, Map<PartIdx, { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }>>();
      for (let barIdx of this.barRange.indices()) {
        let sameTypedPartIdx = new Map<PartIdx, { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }>();
        if (!this.section.barRange.includes(barIdx)) continue;
        for (let partIdx of this.section.getBar(barIdx).partIndices()) {
          let found = this.score.findSameTypedPartIndexInNextBar({
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
      let isTiedToNextSystem = new Map<PartIdx, boolean>();
      let currentPartIdcs = this.$_partIdcs.get(this.barRange.lastBarIdx) as PartIdx[];
      if (!this.section.barRange.includes(this.barRange.lastBarIdx)) return undefined;
      let currentBar = this.section.getBar(this.barRange.lastBarIdx);
      for (let currentPartIdx of currentPartIdcs) {
        let currentPart = currentBar.getPart(currentPartIdx);
        let lastNoteOfCurrentPart = currentPart.lastNote;
        if (lastNoteOfCurrentPart === undefined) continue;
        if (lastNoteOfCurrentPart.type === 'rest') continue;
        let found = this.$_sameTypedPartIdxInNextBar.get(this.barRange.lastBarIdx)?.get(currentPartIdx);
        if (found === undefined) continue;
        let firstNoteOfNextPart = this.score.getPart(found).firstNote;
        if (firstNoteOfNextPart === undefined) continue;
        isTiedToNextSystem.set(currentPartIdx, firstNoteOfNextPart.tied);
      }
      return isTiedToNextSystem;
    },

    $_systemElement(): HTMLDivElement {
      return this.$el as HTMLDivElement;
    },
  },

  mounted() {
    this.$data.$_systemElementResizeObserver.observe(this.$_systemElement);
  },

  beforeUnmount() {
    this.$data.$_systemElementResizeObserver.disconnect();
  },

  methods: {
    $_getShowClef(barIdx: BarIdx): boolean {
      if (barIdx === 0) return true;
      let currentBar = this.section.getBar(barIdx);
      let previousBar = this.section.getBar(barIdx - 1);
      if (!previousBar.break.isEqualTo(bb.empty)) return true;
      let currentClef = currentBar.clef;
      let previousClef = previousBar.clef;
      if (!currentClef.isEqualTo(previousClef)) return true;
      return false;
    },

    $_getShowBeat(barIdx: BarIdx): boolean {
      if (barIdx === this.barRange.firstBarIdx) return this.showBeatOnFirstBar;
      let currentBarValue = this.section.getBar(barIdx).value;
      let previousBarValue = this.section.getBar(barIdx - 1).value;
      if (!currentBarValue.isSameAs(previousBarValue)) return true;
      return false;
    },

    $_getShowKeySignature(barIdx: BarIdx): boolean {
      if (barIdx === this.barRange.firstBarIdx) {
        return true;
      } else {
        let previousBar = this.section.getBar(barIdx - 1)
        let currentBar = this.section.getBar(barIdx);
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
      let firstTieProps = new Map<PartIdx, TieCanvasProps>();
      let firstTieStyles = new Map<PartIdx, CSSProperties>();
      let tieProps = new Map<BarIdx, Map<PartIdx, TieCanvasProps>>();
      let tieStyles = new Map<BarIdx, Map<PartIdx, CSSProperties>>();
      let firstBar = this.section.getBar(this.barRange.firstBarIdx);
      if (this.$_systemElement.nodeType === Node.COMMENT_NODE) return;
      let systemElementBoundingClientRect = this.$_systemElement.getBoundingClientRect();
      let partIdcs = this.$_partIdcs.get(this.barRange.firstBarIdx) as PartIdx[];
      for (let partIdxInFirstBar of partIdcs) {
        let partInFirstBar = firstBar.getPart(partIdxInFirstBar);
        let firstNoteOfPart = partInFirstBar.firstNote;
        if (firstNoteOfPart === undefined) continue;
        if (firstNoteOfPart.tied) {
          let found = this.score.findSameTypedPartIndexInPreviousBar({
            sectionAndBarIdx: new SectionAndBarIdx(this.sectionIdx, this.barRange.firstBarIdx),
            partIdx: partIdxInFirstBar,
          });
          if (found === undefined) continue;
          let previousPart = this.score.getPart(found);
          if (previousPart.lastNote === undefined) continue;
          if (previousPart.lastNote.type === 'rest') continue;
          let firstBarNoteTieEndOffsets = this.$data.$_barNoteTieEndPointOffsets.get(this.barRange.firstBarIdx);
          if (firstBarNoteTieEndOffsets === undefined) continue;
          let firstBarNoteTieEndOffset = firstBarNoteTieEndOffsets.get(partIdxInFirstBar);
          if (firstBarNoteTieEndOffset === undefined) continue;

          let firstBarElement = this.$data.$_barElements.get(this.barRange.firstBarIdx);
          if (firstBarElement === undefined) continue;
          let firstBarElementBoundingClientRect = firstBarElement.getBoundingClientRect();

          let firstTieEndHorizontalOffsetPx = firstBarElementBoundingClientRect.x + firstBarNoteTieEndOffset.x - systemElementBoundingClientRect.x;
          let firstTieEndVerticalOffsetPx = firstBarNoteTieEndOffset.y;
          let firstTieStartHorizontalOffsetPx = firstTieEndHorizontalOffsetPx - 20;
          let firstTieStartVerticalOffsetPx = firstBarNoteTieEndOffset.y;
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

      for (let currentBarIdx of this.barRange.indices()) {
        tieProps.set(currentBarIdx, new Map<PartIdx, TieCanvasProps>());
        tieStyles.set(currentBarIdx, new Map<PartIdx, CSSProperties>());
        if (!this.section.barRange.includes(currentBarIdx)) continue;
        let currentPartIdcs = this.$_partIdcs.get(currentBarIdx) as PartIdx[];
        for (let currentPartIdx of currentPartIdcs) {
          let currentPart = this.section.getBar(currentBarIdx).getPart(currentPartIdx);
          if (currentPart.lastNote === undefined) continue;
          if (currentPart.lastNote.type === 'rest') continue;
          let found = this.$_sameTypedPartIdxInNextBar.get(currentBarIdx)?.get(currentPartIdx);
          if (found === undefined) continue;
          let { sectionAndBarIdx: nextSectionAndBarIdx, partIdx: nextPartIdx } = found;
          let nextPart = this.score.getPart({ sectionAndBarIdx: nextSectionAndBarIdx, partIdx: nextPartIdx });
          let firstNoteOfNextPart = nextPart.firstNote;
          if (firstNoteOfNextPart === undefined) continue;
          if (firstNoteOfNextPart.tied) {
            let currentBarNoteTieStartOffsets = this.$data.$_barNoteTieStartPointOffsets.get(currentBarIdx);
            if (currentBarNoteTieStartOffsets === undefined) continue;
            let currentBarNoteTieStartOffset = currentBarNoteTieStartOffsets.get(currentPartIdx);
            if (currentBarNoteTieStartOffset === undefined) continue;
            let currentBarElement = this.$data.$_barElements.get(currentBarIdx);
            if (currentBarElement === undefined) continue;
            let currentBarElementBoundingClientRect = currentBarElement.getBoundingClientRect();

            let tieStartHorizontalOffsetPx = currentBarElementBoundingClientRect.x + currentBarNoteTieStartOffset.x - systemElementBoundingClientRect.x;
            let tieStartVerticalOffsetPx = currentBarNoteTieStartOffset.y;

            let tieEndHorizontalOffsetPx;
            let tieEndVerticalOffsetPx;
            if (this.barRange.includes(nextSectionAndBarIdx.barIdx)) {
              let nextBarNoteTieEndOffsets = this.$data.$_barNoteTieEndPointOffsets.get(nextSectionAndBarIdx.barIdx);
              if (nextBarNoteTieEndOffsets === undefined) continue;
              let barNoteTieEndOffset = nextBarNoteTieEndOffsets.get(nextPartIdx);
              if (barNoteTieEndOffset === undefined) continue;
              let nextBarElement = this.$data.$_barElements.get(nextSectionAndBarIdx.barIdx);
              if (nextBarElement === undefined) continue;
              let nextBarElementBoundingClientRect = nextBarElement.getBoundingClientRect();
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
      // this.$vuetify.goTo(this.$_systemElement);
    },

    assertDefined: assertDefined,
  },
}
</script>