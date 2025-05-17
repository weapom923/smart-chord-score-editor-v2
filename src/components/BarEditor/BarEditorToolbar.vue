<template>
  <v-toolbar>
    <v-container
      class="d-flex flex-row align-center gc-3"
      id="bar-editor-toolbar-item-container"
    >
      <div
        class="d-flex flex-row gc-1 align-center"
        v-if="$_selectedSectionAndBarRange !== undefined"
      >
        <div class="d-flex flex-row gc-1 align-center">
          <span class="section-index">{{ $_selectedSectionAndBarRange.first.sectionIdx + 1 }}</span>
          <span class="section-title">{{ $_score.getSection($_selectedSectionAndBarRange.first.sectionIdx).name }}</span>
          <span>{{ $_selectedSectionAndBarRange.first.barIdx + 1 }}</span>
        </div>
        <template v-if="$_numSelectedBars > 1">
          <div class="connector-symbol"></div>
          <div class="d-flex flex-row gc-1 align-center">
            <span class="section-index">{{ $_selectedSectionAndBarRange.last.sectionIdx + 1 }}</span>
            <span class="section-title">{{ $_score.getSection($_selectedSectionAndBarRange.last.sectionIdx).name }}</span>
            <span>{{ $_selectedSectionAndBarRange.last.barIdx + 1 }}</span>
          </div>
        </template>
      </div>
      <div v-if="$_numSelectedBars > 0">
        <template v-if="$_numSelectedBars === 1">({{ $_numSelectedBars }} {{ $t('barSelected') }})</template>
        <template v-else>({{ $_numSelectedBars }} {{ $t('barsSelected') }})</template>
      </div>
      <v-spacer></v-spacer>
      <v-btn-toggle
        v-if="!$store.state.appState.isMobileLayoutEnabled"
        class="py-1"
        variant="outlined"
        mandatory
        v-model="$_barEditorLocation"
      >
        <v-btn size="small" icon="mdi-dock-left" v-bind:value="barEditorLocationLeft"></v-btn>
        <v-btn size="small" icon="mdi-dock-bottom" v-bind:value="barEditorLocationBottom"></v-btn>
        <v-btn size="small" icon="mdi-dock-right" v-bind:value="barEditorLocationRight"></v-btn>
      </v-btn-toggle>
      <bar-part-type-selector
        id="part-type-selector" density="compact"
        v-if="($_sectionAndBarIdx !== undefined) && ($_selectedPartIdx !== undefined)"
        v-bind:section-and-bar-idx="$_sectionAndBarIdx"
        v-model:selected-part-idx="$_selectedPartIdx"
      >
      </bar-part-type-selector>
    </v-container>
  </v-toolbar>
</template>

<style scoped>
#bar-editor-toolbar-item-container div {
  font-size: 12px;
  line-height: 12px;
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
import { defineComponent } from 'vue';
import BarPartTypeSelector from '../parts/BarPartTypeSelector.vue';
import { Score } from '../../modules/Score';
import { SectionAndBarRange, SectionAndBarIdx } from '../../modules/SectionAndBarRange';
import { BarEditorLocationType } from '../../store/module/Config';

export default defineComponent({
  setup(): {
    barEditorLocationLeft: BarEditorLocationType,
    barEditorLocationRight: BarEditorLocationType,
    barEditorLocationBottom: BarEditorLocationType,
  } {
    return {
      barEditorLocationLeft: 'left',
      barEditorLocationRight: 'right',
      barEditorLocationBottom: 'bottom',
    };
  },

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

    $_barEditorLocation: {
      get(): BarEditorLocationType { return this.$store.state.config.barEditorLocation },
      async set(barEditorLocation: BarEditorLocationType) {
        const newConfig = { ...this.$store.state.config };
        newConfig.barEditorLocation = barEditorLocation;
        await this.$store.dispatch('config/setConfig', newConfig);
      },
    },
  },
})
</script>