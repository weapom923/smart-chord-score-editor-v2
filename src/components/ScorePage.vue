<template>
  <v-sheet
    id="score-page"
    class="overflow-y-hidden"
    color="background"
  >
    <score-page-toolbar
      v-if="!$store.state.appState.isPrintLayoutEnabled"
      id="score-page-tool-bar"
      class="no-print"
      collapse absolute 
      v-bind:section-and-bar-range="sectionAndBarRange"
    >
    </score-page-toolbar>

    <div class="d-flex flex-column px-2" v-bind:style="$_pageStyle">
      <score-title-component v-if="$_isFirstPage">
      </score-title-component>
      <template
        v-for="sectionComponentProp of $_sectionComponentProps"
        v-bind:key="sectionComponentProp.sectionIdx"
      >
        <section-component v-bind="sectionComponentProp">
        </section-component>
      </template>
      <score-footer-component
        class="mt-auto"
        v-if="numScorePages > 1"
        v-bind:score-page-index="scorePageIndex"
        v-bind:num-score-pages="numScorePages"
      >
      </score-footer-component>
    </div>
  </v-sheet>
</template>

<style scoped>
#score-page {
  user-select: none;
  border: 1px #cccccc dotted;
}

#score-page:not(:last-of-type) {
  break-after: page;
  margin-bottom: 5px;
}

#score-page-tool-bar {
  z-index: 1;
}

@media print {
  #score-page {
    border: none !important;
    margin: 0 !important;
  }
}
</style>

<script lang="ts">
import { CSSProperties } from 'vue';
import SectionComponent from '../components/SectionComponent.vue';
import ScoreTitleComponent from '../components/ScoreTitleComponent.vue';
import ScoreFooterComponent from '../components/ScoreFooterComponent.vue';
import ScorePageToolbar from './parts/ScorePageToolbar.vue';
import { SectionAndBarRange, SectionAndBarIdx, BarRange } from '../modules/SectionAndBarRange';
import { Score } from '../modules/Score';

type SectionComponentPropsType = InstanceType<typeof SectionComponent>['$props'];

export default {
  components: {
    ScoreTitleComponent,
    SectionComponent,
    ScoreFooterComponent,
    ScorePageToolbar,
  },

  props: {
    sectionAndBarRange: { type: SectionAndBarRange, required: true },
    scorePageIndex: { type: Number, default: 0 },
    numScorePages: { type: Number, default: 0 },
    aspectRatio: { type: Number, required: true },
  },

  computed: {
    $_score(): Score { return this.$store.state.score.score },

    $_isFirstPage(): boolean { return (this.scorePageIndex === 0) },

    $_hasNoSection(): boolean { return (this.$_numSections === 0) },

    $_numSections(): number { return this.$_score.numSections },

    $_pageElevation() { return ((this.$store.state.appState.isPrintLayoutEnabled)? 0 : 3) },

    $_pageStyle(): CSSProperties {
      let pageStyle: CSSProperties = {};
      pageStyle.paddingTop = `${this.$store.state.config.pagePaddingTopPx}px`;
      pageStyle.width = `${this.$store.state.config.pageWidthOnPrintPx}px`;
      if (!this.$store.state.appState.isMobileLayoutEnabled) {
        pageStyle.aspectRatio = `${this.aspectRatio}`;
      }
      return pageStyle;
    },

    $_sectionComponentProps(): SectionComponentPropsType[] {
      let sectionDefinitions: SectionComponentPropsType[] = [];
      if (this.$_numSections === 0) return sectionDefinitions;
      for (let currentSectionIdx of this.sectionAndBarRange.sectionIndices()) {
        let currentSection = this.$_score.getSection(currentSectionIdx);

        let firstBarIdxOfCurrentSection =
          (currentSectionIdx === this.sectionAndBarRange.first.sectionIdx)?
          this.sectionAndBarRange.first.barIdx : currentSection.firstBarIdx;

        let lastBarIdxOfCurrentSection =
          (currentSectionIdx === this.sectionAndBarRange.last.sectionIdx)?
          this.sectionAndBarRange.last.barIdx : currentSection.lastBarIdx;

        let showBeatOnFirstBarOfCurrentSection = false;
        let currentSectionAndFirstBarIdx = new SectionAndBarIdx(currentSectionIdx, firstBarIdxOfCurrentSection);
        let firstBarValueOfCurrentSection = this.$_score.getBar(currentSectionAndFirstBarIdx).value;
        let previousSectionAndLastBarIdx = this.$_score.getPreviousSectionAndBarIdx(currentSectionAndFirstBarIdx);
        if (previousSectionAndLastBarIdx === undefined) {
          showBeatOnFirstBarOfCurrentSection = true;
        } else {
          let lastBarValueOfPreviousSection = this.$_score.getBar(previousSectionAndLastBarIdx).value;
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
}
</script>