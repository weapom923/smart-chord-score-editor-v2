<template>
  <v-hover
    v-slot="{ isHovering, props }"
    v-bind:disabled="$store.state.appState.isPrintLayoutEnabled"
  >
    <v-sheet
      id="score-page"
      class="d-flex overflow-y-hidden"
      color="background"
      v-bind:class="{ 'last-page': $_isLastPage }"
      v-bind:style="$_pageStyle"
      v-bind="props"
    >
      <score-page-toolbar
        id="score-page-tool-bar"
        class="no-print"
        collapse absolute
        v-if="sectionAndBarRange && isHovering"
        v-bind:section-and-bar-range="sectionAndBarRange"
      >
      </score-page-toolbar>

      <div class="flex-grow-1 d-flex flex-column px-2">
        <score-title-component v-if="$_isFirstPage"></score-title-component>
        <div class="flex-grow-1">
          <section-component
            v-if="sectionAndBarRange"
            v-for="sectionComponentProp of $_sectionComponentProps"
            v-bind:key="sectionComponentProp.sectionIdx"
            v-bind="sectionComponentProp"
          >
          </section-component>

          <v-btn
            variant="outlined"
            v-else-if="!$store.state.appState.isPrintLayoutEnabled"
            v-bind:text="$t('generateNewSection')"
            v-on:click="$_generateNewSection"
          >
          </v-btn>
        </div>

        <score-footer-component
          class="mt-auto"
          v-bind:score-page-index="scorePageIndex"
          v-bind:num-score-pages="numScorePages"
        >
        </score-footer-component>
      </div>
    </v-sheet>
  </v-hover>
</template>

<style scoped>
#score-page {
  user-select: none;
  border: 1px #cccccc dotted;
  position: relative;
}

#score-page:not(.last-page) {
  break-after: page;
}

#score-page-tool-bar {
  z-index: 1;
  top: 0;
  left: 0;
}

@media print {
  #score-page {
    border: none !important;
    margin: 0 !important;
  }
}
</style>

<script lang="ts">
import { defineComponent, CSSProperties } from 'vue';
import SectionComponent from '../components/SectionComponent.vue';
import ScoreTitleComponent from '../components/ScoreTitleComponent.vue';
import ScoreFooterComponent from '../components/ScoreFooterComponent.vue';
import ScorePageToolbar from './parts/ScorePageToolbar.vue';
import { SectionAndBarRange, SectionAndBarIdx, BarRange } from '../modules/SectionAndBarRange';
import { Score } from '../modules/Score';

type SectionComponentPropsType = InstanceType<typeof SectionComponent>['$props'];

export default defineComponent({
  components: {
    ScoreTitleComponent,
    SectionComponent,
    ScoreFooterComponent,
    ScorePageToolbar,
  },

  props: {
    sectionAndBarRange: { type: SectionAndBarRange },
    scorePageIndex: { type: Number, default: 0 },
    numScorePages: { type: Number, default: 0 },
    aspectRatio: { type: Number, required: true },
  },

  computed: {
    $_score(): Score { return this.$store.state.score.score },

    $_isFirstPage(): boolean { return (this.scorePageIndex === 0) },

    $_isLastPage(): boolean { return (this.scorePageIndex === (this.numScorePages - 1)) },

    $_hasNoSection(): boolean { return (this.$_numSections === 0) },

    $_numSections(): number { return this.$_score.numSections },

    $_pageElevation() { return ((this.$store.state.appState.isPrintLayoutEnabled)? 0 : 3) },

    $_pageStyle(): CSSProperties {
      const pageStyle: CSSProperties = {};
      pageStyle.paddingTop = `${this.$store.state.config.pagePaddingTopPx}px`;
      pageStyle.width = `${this.$store.state.config.pageWidthOnPrintPx}px`;
      if (!this.$store.state.appState.isMobileLayoutEnabled) {
        pageStyle.aspectRatio = `${this.aspectRatio}`;
      }
      return pageStyle;
    },

    $_sectionComponentProps(): SectionComponentPropsType[] {
      const sectionDefinitions: SectionComponentPropsType[] = [];
      if (this.$_numSections === 0) return sectionDefinitions;
      if (!this.sectionAndBarRange) return sectionDefinitions;
      for (const currentSectionIdx of this.sectionAndBarRange.sectionIndices()) {
        const currentSection = this.$_score.getSection(currentSectionIdx);

        const firstBarIdxOfCurrentSection =
          (currentSectionIdx === this.sectionAndBarRange.first.sectionIdx)?
          this.sectionAndBarRange.first.barIdx : currentSection.firstBarIdx;

        const lastBarIdxOfCurrentSection =
          (currentSectionIdx === this.sectionAndBarRange.last.sectionIdx)?
          this.sectionAndBarRange.last.barIdx : currentSection.lastBarIdx;

        let showBeatOnFirstBarOfCurrentSection = false;
        const currentSectionAndFirstBarIdx = new SectionAndBarIdx(currentSectionIdx, firstBarIdxOfCurrentSection);
        const firstBarValueOfCurrentSection = this.$_score.getBar(currentSectionAndFirstBarIdx).value;
        const previousSectionAndLastBarIdx = this.$_score.getPreviousSectionAndBarIdx(currentSectionAndFirstBarIdx);
        if (previousSectionAndLastBarIdx === undefined) {
          showBeatOnFirstBarOfCurrentSection = true;
        } else {
          const lastBarValueOfPreviousSection = this.$_score.getBar(previousSectionAndLastBarIdx).value;
          if (!lastBarValueOfPreviousSection.isEqualTo(firstBarValueOfCurrentSection)) {
            showBeatOnFirstBarOfCurrentSection = true;
          }
        }
        sectionDefinitions.push(
          {
            score: this.$_score,
            sectionIdx: currentSectionIdx,
            barRange: new BarRange(firstBarIdxOfCurrentSection, lastBarIdxOfCurrentSection),
            showBeatOnFirstBar: showBeatOnFirstBarOfCurrentSection,
          },
        );
      }
      return sectionDefinitions;
    },
  },

  methods: {
    async $_generateNewSection() {
      await this.$store.dispatch(
        'dialog/setDialog',
        {
          componentName: 'generate-section-dialog',
          props: {
            sectionIdx: 0,
          },
        },
      );
    },
  },
});
</script>