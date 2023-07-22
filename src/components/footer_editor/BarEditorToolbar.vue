<template>
  <v-toolbar>
    <div class="d-flex" id="bar-editor-toolbar">
      <div v-if="$_selectedSectionAndBarRange !== undefined">
        <span>
          <span class="section-index">{{ $_selectedSectionAndBarRange.first.sectionIdx + 1 }}</span>
          <span class="section-title">{{ $_score.getSection($_selectedSectionAndBarRange.first.sectionIdx).name }}</span>
          <span>{{ $_selectedSectionAndBarRange.first.barIdx + 1 }}</span>
        </span>
        <span class="connector-symbol" v-if="$_numSelectedBars > 1" />
        <span v-if="$_numSelectedBars > 1">
          <span class="section-index">{{ $_selectedSectionAndBarRange.last.sectionIdx + 1 }}</span>
          <span class="section-title">{{ $_score.getSection($_selectedSectionAndBarRange.last.sectionIdx).name }}</span>
          <span>{{ $_selectedSectionAndBarRange.last.barIdx + 1 }}</span>
        </span>
      </div>
      <div v-if="$_numSelectedBars > 0">
        <template v-if="$_numSelectedBars === 1">({{ $_numSelectedBars }} {{ $t('barSelected') }})</template>
        <template v-else>({{ $_numSelectedBars }} {{ $t('barsSelected') }})</template>
      </div>
      <v-spacer />
      <bar-part-type-selector
        id="part-type-selector"
        v-if="($_sectionAndBarIdx !== undefined) && ($_selectedPartIdx !== undefined)"
        v-bind:section-and-bar-idx="$_sectionAndBarIdx"
        v-model:selected-part-idx="$_selectedPartIdx"
      />
    </div>
  </v-toolbar>
</template>

<style scoped>
#bar-editor-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
}

#bar-editor-toolbar div:not(:last-child) {
  margin-right: 10px;
}

#bar-editor-toolbar div {
  font-size: 12px;
  line-height: 12px;
}

#bar-editor-toolbar div span:not(:last-child) {
  margin-right: 5px;
}

.section-title {
  font-size: 14px;
  line-height: 14px;
}

.section-index {
  font-size: 10px;
  line-height: 10px;
}

.section-index:before {
  content: '[';
}

.section-index:after {
  content: ']';
}

.connector-symbol:after {
  padding: 0 5px;
}

.connector-symbol:after {
  content: '-';
}

#part-type-selector {
  flex-grow: 0;
  width: 20%;
  min-width: 100px;
}
</style>

<script lang="ts">
import BarPartTypeSelector from '../parts/BarPartTypeSelector.vue';
import { Score } from '../../modules/Score';
import { SectionAndBarRange, SectionAndBarIdx } from '../../modules/SectionAndBarRange';

export default {
  emits: {
    'update:selectedPartIdx': (partIdx: PartIdx) => true,
  },

  components: {
    BarPartTypeSelector,
  },

  props: {
    selectedPartIdx: { type: Number },
  },

  computed: {
    $_score(): Score {
      return this.$store.state.score.score;
    },

    $_selectedSectionAndBarRange(): SectionAndBarRange | undefined {
      return this.$store.state.score.selectedBars;
    },

    $_numSelectedBars() {
      if (this.$_selectedSectionAndBarRange === undefined) return 0;
      return this.$_score.getBars(this.$_selectedSectionAndBarRange).length;
    },

    $_sectionAndBarIdx(): SectionAndBarIdx | undefined {
      if (this.$_selectedSectionAndBarRange === undefined) return undefined;
      if (this.$_numSelectedBars !== 1) return undefined;
      return this.$_selectedSectionAndBarRange.first;
    },

    $_selectedPartIdx: {
      get(): PartIdx | undefined    { return this.selectedPartIdx },
      set(selectedPartIdx: PartIdx) { this.$emit('update:selectedPartIdx', selectedPartIdx) },
    },
  },
}
</script>