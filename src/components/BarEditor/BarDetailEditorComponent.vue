<template>
  <v-card>
    <v-card-text
      class="pa-2"
      v-if="$_selectedBar !== undefined"
    >
      <bar-line-start-selector
        density="compact"
        v-model:bar-line-start="$_selectedBarsLineStart"
      >
      </bar-line-start-selector>

      <bar-line-end-selector
        density="compact"
        v-model:bar-line-end="$_selectedBarsLineEnd"
      >
      </bar-line-end-selector>

      <bar-repeat-ending-number-selector
        density="compact"
        v-model:bar-repeat-ending="$_selectedBarsRepeatEnding"
      >
      </bar-repeat-ending-number-selector>

      <bar-break-selector
        density="compact"
        v-model:bar-break="$_selectedBarsBreak"
      >
      </bar-break-selector>

      <bar-value-text-area-and-selector
        density="compact"
        v-model:bar-value="$_selectedBarsValue"
      >
      </bar-value-text-area-and-selector>

      <grid-note-selector
        density="compact"
        v-model:grid-note-value="$_selectedBarsGridNoteValue"
      >
      </grid-note-selector>

      <clef-selector
        density="compact"
        v-model:clef="$_selectedBarsClef"
      >
      </clef-selector>

      <scale-selector
        density="compact"
        v-model:scale="$_selectedBarsScale"
      >
      </scale-selector>

      <transpose-target-scale-selector
        density="compact"
        v-model:bars="$_selectedBars"
      >
      </transpose-target-scale-selector>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import ScaleSelector from '../parts/ScaleSelector.vue';
import TransposeTargetScaleSelector from '../parts/TransposeTargetScaleSelector.vue';
import ClefSelector from '../parts/ClefSelector.vue';
import BarBreakSelector from '../parts/BarBreakSelector.vue';
import BarRepeatEndingNumberSelector from '../parts/BarRepeatEndingNumberSelector.vue';
import BarLineStartSelector from '../parts/BarLineStartSelector.vue';
import BarLineEndSelector from '../parts/BarLineEndSelector.vue';
import BarValueTextAreaAndSelector from '../parts/BarValueTextAreaAndSelector.vue';
import GridNoteSelector from '../parts/GridNoteSelector.vue';
import { Bar } from '../../modules/Bar';
import { BarLine } from '../../modules/BarLine';
import { BarBreak } from '../../modules/BarBreak';
import { BarRepeatEnding } from '../../modules/BarRepeatEnding';
import { NoteValue } from '../../modules/NoteValue';
import { Clef } from '../../modules/Clef';
import { Scale } from '../../modules/Scale';
import { SectionAndBarRange, SectionAndBarIdx } from '../../modules/SectionAndBarRange';

export default {
  components: {
    ScaleSelector,
    TransposeTargetScaleSelector,
    ClefSelector,
    BarBreakSelector,
    BarRepeatEndingNumberSelector,
    BarLineStartSelector,
    BarLineEndSelector,
    BarValueTextAreaAndSelector,
    GridNoteSelector,
  },

  computed: {
    $_score() {
      return this.$store.state.score.score;
    },

    $_selectedBars: {
      get(): Bar[] | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        return this.$_score.getBars(this.$_selectedSectionAndBarRange);
      },
      async set(selectedBars: Bar[]) {
        if (this.$_selectedSectionAndBarRange === undefined) return;
        await this.$store.dispatch(
          'score/replaceBars',
          {
            sectionAndBarRange: this.$_selectedSectionAndBarRange,
            bars: selectedBars,
          },
        );
      },
    },

    $_selectedSectionAndBarRange(): SectionAndBarRange | undefined {
      return this.$store.state.score.selectedBars;
    },

    $_selectedBarsFirst(): SectionAndBarIdx | undefined {
      return this.$_selectedSectionAndBarRange?.first;
    },

    $_selectedBarsLast(): SectionAndBarIdx | undefined {
      return this.$_selectedSectionAndBarRange?.last;
    },

    $_selectedBar(): Bar | undefined {
      if (this.$_score === undefined) return undefined;
      if (this.$_selectedBarsFirst === undefined) return undefined;
      return this.$_score.getBar(this.$_selectedBarsFirst);
    },

    $_selectedBarsLineStart: {
      get(): BarLine | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        if (!this.$_selectedSectionAndBarRange.includeSingleBarOnly) return undefined;
        let uniqueBarLineStart = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).lineStart;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarLineStart.isEqualTo(this.$_score.getBar(sectionAndBarIdx).lineStart)) return undefined;
        }
        return uniqueBarLineStart;
      },
      set(barLineStart: BarLine) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.lineStart = barLineStart;
          return newBar;
        });
      },
    },

    $_selectedBarsLineEnd: {
      get(): BarLine | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        if (!this.$_selectedSectionAndBarRange.includeSingleBarOnly) return undefined;
        let uniqueBarLineEnd = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).lineEnd;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarLineEnd.isEqualTo(this.$_score.getBar(sectionAndBarIdx).lineEnd)) return undefined;
        }
        return uniqueBarLineEnd;
      },
      set(barLineEnd: BarLine) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.lineEnd = barLineEnd;
          return newBar;
        });
      },
    },

    $_selectedBarsRepeatEnding: {
      get(): BarRepeatEnding | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        if (!this.$_selectedSectionAndBarRange.includeSingleBarOnly) return undefined;
        let uniqueBarRepeatEnding = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).repeatEnding;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarRepeatEnding.isEqualTo(this.$_score.getBar(sectionAndBarIdx).repeatEnding)) return undefined;
        }
        return uniqueBarRepeatEnding;
      },
      set(barRepeatEnding: BarRepeatEnding) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.repeatEnding = barRepeatEnding.clone();
          return newBar;
        });
      },
    },

    $_selectedBarsBreak: {
      get(): BarBreak | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        if (!this.$_selectedSectionAndBarRange.includeSingleBarOnly) return undefined;
        let uniqueBarBreak = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).break;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarBreak.isEqualTo(this.$_score.getBar(sectionAndBarIdx).break)) return undefined;
        }
        return uniqueBarBreak;
      },
      set(barBreak: BarBreak) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.break = barBreak;
          return newBar;
        });
      },
    },

    $_selectedBarsValue: {
      get(): NoteValue | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        let uniqueBarValue = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).value;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarValue.isEqualTo(this.$_score.getBar(sectionAndBarIdx).value)) return undefined;
        }
        return uniqueBarValue;
      },
      set(barValue: NoteValue) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.value = barValue.clone();
          return newBar;
        });
      },
    },

    $_selectedBarsGridNoteValue: {
      get(): NoteValue | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        let uniqueBarGridNoteValue = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).gridNoteValue;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarGridNoteValue.isEqualTo(this.$_score.getBar(sectionAndBarIdx).gridNoteValue)) return undefined;
        }
        return uniqueBarGridNoteValue;
      },
      set(barGridNoteValue: NoteValue) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.gridNoteValue = barGridNoteValue.clone();
          return newBar;
        });
      },
    },

    $_selectedBarsClef: {
      get(): Clef | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        let uniqueBarClef = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).clef;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarClef.isEqualTo(this.$_score.getBar(sectionAndBarIdx).clef)) return undefined;
        }
        return uniqueBarClef;
      },
      set(barClef: Clef) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.clef = barClef;
          return newBar;
        });
      },
    },

    $_selectedBarsScale: {
      get(): Scale | undefined {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        let uniqueBarScale = this.$_score.getBar(this.$_selectedSectionAndBarRange.first).scale;
        for (let sectionAndBarIdx of this.$_score.getSectionAndBarIdxIterator(this.$_selectedSectionAndBarRange)) {
          if (!uniqueBarScale.isEqualTo(this.$_score.getBar(sectionAndBarIdx).scale)) return undefined;
        }
        return uniqueBarScale;
      },
      set(scale: Scale) {
        if (this.$_selectedSectionAndBarRange === undefined) return undefined;
        this.$_selectedBars = this.$_score.getBars(this.$_selectedSectionAndBarRange).map(bar => {
          let newBar = bar.clone();
          newBar.scale = scale;
          return newBar;
        });
      },
    },
  },
}
</script>