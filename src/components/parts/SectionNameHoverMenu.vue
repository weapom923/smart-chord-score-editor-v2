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

type SectionNameHoverMenuItemType = {
  icon: string,
  callback: Function,
};

export default {
  props: {
    sectionIdx: { type: Number, required: true },
  },

  computed: {
    $_menuItemDefinitions(): SectionNameHoverMenuItemType[] {
      return [
        {
          icon: 'mdi-plus',
          callback: () => { this.generateNewSection(this.sectionIdx) },
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