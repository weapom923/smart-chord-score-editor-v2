<template>
  <v-card>
    <v-btn-group class="d-flex" density="compact" color="secondary" variant="text">
      <v-tooltip
        location="bottom"
        v-for="({ icon, text, callback, disabled }, menuItemIdx) in $_menuItemDefinitions"
        v-bind:key="menuItemIdx"
        v-bind:text="text"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            size="x-small" class="flex-grow-1"
            v-bind="props"
            v-bind:icon="icon"
            v-bind:disabled="disabled"
            v-on:click="callback"
          >
          </v-btn>
        </template>
      </v-tooltip>
    </v-btn-group>
  </v-card>
</template>

<script lang="ts">
import { Bar } from '../../modules/Bar';
import { Section } from '../../modules/Section';
import { SectionAndBarRange, SectionAndBarIdx } from '../../modules/SectionAndBarRange';

type SectionNameHoverMenuItemType = {
  icon: string,
  text: string,
  callback: Function,
  disabled: boolean,
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
          text: this.$t('insertSectionBefore'),
          callback: () => { this.generateNewSection(this.sectionIdx) },
          disabled: false,
        },
        {
          icon: 'mdi-select-all',
          text: this.$t('selectSection'),
          callback: async () => {
            await this.$store.dispatch('score/selectBars', this.$_sectionAndBarRange)
          },
          disabled: false,
        },
        {
          icon: 'mdi-delete',
          text: this.$t('deleteSection'),
          callback: async () => {
            await this.$store.dispatch('score/removeBars', this.$_sectionAndBarRange)
          },
          disabled: false,
        },
        {
          icon: 'mdi-content-copy',
          text: this.$t('copySection'),
          callback: async () => {
            await this.$store.dispatch('score/setCopiedBars', this.$_sectionAndBarRange)
          },
          disabled: false,
        },
        {
          icon: 'mdi-content-paste',
          text: this.$t('pasteSection'),
          callback: async () => {
            await this.$store.dispatch('score/pasteCopiedBarsPartOnly', this.$_sectionAndBarRange)
          },
          disabled: (this.$store.state.score.copiedBars.length === 0),
        },
        {
          icon: 'mdi-file-cog',
          text: this.$t('sectionSetting'),
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
          disabled: false,
        },
        {
          icon: 'mdi-plus',
          text: this.$t('insertSectionAfter'),
          callback: () => { this.generateNewSection(this.sectionIdx + 1) },
          disabled: false,
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