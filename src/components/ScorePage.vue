<template>
  <v-sheet
    id="score-page"
    class="d-flex flex-column overflow-y-hidden mb-5"
    color="background"
    v-bind:style="$_pageStyle"
  >
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
      v-bind:score-page-index="scorePageIndex"
      v-bind:num-score-pages="numScorePages"
    >
    </score-footer-component>
  </v-sheet>
</template>

<style scoped>
#score-page {
  user-select: none;
  break-after: page;
  border: 1px #cccccc dotted;
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
import { SectionAndBarRange, SectionAndBarIdx, BarRange } from '../modules/SectionAndBarRange';
import { Score } from '../modules/Score';

type SectionComponentPropsType = InstanceType<typeof SectionComponent>['$props'];

export default {
  components: {
    ScoreTitleComponent,
    SectionComponent,
    ScoreFooterComponent,
  },

  props: {
    sectionAndBarRange: { type: SectionAndBarRange, required: true },
    scorePageIndex: { type: Number, default: 0 },
    numScorePages: { type: Number, default: 0 },
  },

  computed: {
    $_score(): Score { return this.$store.state.score.score },

    $_isFirstPage(): boolean { return (this.scorePageIndex === 0) },

    $_hasNoSection(): boolean { return (this.$_numSections === 0) },

    $_numSections(): number { return this.$_score.numSections },

    $_pageElevation() { return ((this.$store.state.appState.isPrintLayoutEnabled)? 0 : 3) },

    $_pageStyle(): CSSProperties {
      return {
        width: `${this.$store.state.config.pageWidthOnPrintPx}px`,
        aspectRatio: `${this.$store.state.score.scorePageWHRatio}`,
      }
    },

    $_sectionComponentProps(): SectionComponentPropsType[] {
      let sectionDefinitions: SectionComponentPropsType[] = [];
      if (this.$_numSections === 0) return sectionDefinitions;
      for (let currentSectionIdx of this.sectionAndBarRange.sectionIndices()) {

        let firstBarIdxOfCurrentSection =
          (currentSectionIdx === this.sectionAndBarRange.first.sectionIdx)?
          this.sectionAndBarRange.first.barIdx : this.$_score.getSection(currentSectionIdx).firstBarIdx;

        let lastBarIdxOfCurrentSection =
          (currentSectionIdx === this.sectionAndBarRange.last.sectionIdx)?
          this.sectionAndBarRange.last.barIdx : this.$_score.getSection(currentSectionIdx).lastBarIdx;

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