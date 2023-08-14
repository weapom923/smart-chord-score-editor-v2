<template>
  <v-card>
    <v-btn-group class="d-flex" density="compact" color="secondary" variant="text">
      <v-btn
        size="x-small" class="flex-grow-1"
        v-for="({ icon, callback }, menuItemIdx) in $_menuItemDefinitions"
        v-bind:key="menuItemIdx"
        v-bind:icon="icon"
        v-on:click="callback"
      >
      </v-btn>
    </v-btn-group>
  </v-card>
</template>

<script lang="ts">
import { Bar } from '../../modules/Bar';
import { Section } from '../../modules/Section';
import { SectionAndBarRange, SectionAndBarIdx } from '../../modules/SectionAndBarRange';

type SectionNameHoverMenuItemType = {
  icon: string,
  callback: Function,
};

export default {
  props: {
    section: { type: Section, required: true },
    sectionIdx: { type: Number, required: true },
  },

  computed: {
    $_sectionAndBarRange(): SectionAndBarRange {
      return new SectionAndBarRange(
        new SectionAndBarIdx(this.sectionIdx, this.section.firstBarIdx),
        new SectionAndBarIdx(this.sectionIdx, this.section.lastBarIdx),
      );
    },

    $_menuItemDefinitions(): SectionNameHoverMenuItemType[] {
      return [
        {
          icon: 'mdi-plus',
          callback: () => { this.generateNewSection(this.sectionIdx) },
        },
        {
          icon: 'mdi-select-all',
          callback: async () => {
            await this.$store.dispatch('score/selectBars', this.$_sectionAndBarRange)
          },
        },
        {
          icon: 'mdi-delete',
          callback: async () => {
            await this.$store.dispatch('score/removeBars', this.$_sectionAndBarRange)
          },
        },
        {
          icon: 'mdi-content-copy',
          callback: async () => {
            await this.$store.dispatch('score/setCopiedBars', this.$_sectionAndBarRange)
          },
        },
        {
          icon: 'mdi-content-paste',
          callback: async () => {
            await this.$store.dispatch('score/pasteCopiedBarsPartOnly', this.$_sectionAndBarRange)
          },
        },
        {
          icon: 'mdi-file-cog',
          callback: async () => {
            await this.$store.dispatch(
              'dialog/setDialog',
              {
                componentName: 'section-editor-dialog',
                props: {
                  sectionIdx: this.sectionIdx,
                },
              },
            );
          },
        },
        {
          icon: 'mdi-plus',
          callback: () => { this.generateNewSection(this.sectionIdx + 1) },
        },
      ];
    },
  },

  methods: {
    async generateNewSection(sectionIdx: number) {
      let numSection = this.$store.state.score.score.numSections;
      if (numSection > 0) {
        let baseSectionIdx = (sectionIdx > 0)? sectionIdx - 1 : sectionIdx;
        let baseSection = this.$store.state.score.score.getSection(baseSectionIdx);
        if (baseSection.numBars > 0) {
          let baseBar = baseSection.lastBar as Bar;
          await this.$store.dispatch(
            'dialog/setDialog',
            {
              componentName: 'generate-section-dialog',
              props: {
                sectionIdx: sectionIdx,
                barValue: baseBar.value,
                clef: baseBar.clef,
                scale: baseBar.scale,
                partInBarTypes: baseBar.parts.map(part => part.type),
                gridNoteValue: this.$store.state.config.defaultGridNoteValue,
              },
            },
          );
        }
      } else {
        await this.$store.dispatch(
          'dialog/setDialog',
          {
            componentName: 'generate-section-dialog',
            props: {
              sectionIdx: sectionIdx,
            },
          },
        );
      }
    },
  },
}
</script>