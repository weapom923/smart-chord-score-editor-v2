<template>
  <v-toolbar
    id="score-page-tool-bar"
    class="no-print"
    collapse
    density="compact"
    absolute 
  >
    <v-btn
      v-for="( itemDefinition, itemKey ) in $_toolBarItemDefinitions"
      icon size="small"
      v-bind:key="itemKey"
      v-bind:disabled="itemDefinition.disabled"
      v-on:click="itemDefinition.callback"
    >
      <v-icon>{{ itemDefinition.iconName }}</v-icon>
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        {{ itemDefinition.text }}
      </v-tooltip>
    </v-btn>
  </v-toolbar>
</template>

<style scoped>
#score-page-tool-bar {
  max-width: fit-content;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { SectionAndBarRange } from '../../modules/SectionAndBarRange';

class ToolBarItemDefinition {
  constructor(
    readonly iconName: string,
    readonly text: string,
    readonly callback: () => void,
    readonly disabled: boolean = false,
  ) {}
};

export default defineComponent({
  props: {
    sectionAndBarRange: { type: SectionAndBarRange, required: true },
  },

  computed: {
    $_toolBarItemDefinitions(): Record<string, ToolBarItemDefinition> {
      return {
        editAllBars: new ToolBarItemDefinition(
          'mdi-pencil', this.$t('editAllBars'),
          async () => {
            await this.$store.dispatch('score/selectAllBars');
            await this.$store.dispatch('appState/setIsBarEditorMinimized', false);
          },
        ),
        editAllBarsInPage: new ToolBarItemDefinition(
          'mdi-file-edit', this.$t('editAllBarsInCurrentPage'),
          async () => {
            await this.$store.dispatch('score/selectBars', this.sectionAndBarRange);
            await this.$store.dispatch('appState/setIsBarEditorMinimized', false);
          },
        ),
        deleteAllBarsInPage: new ToolBarItemDefinition(
          'mdi-delete', this.$t('deleteAllBarsInCurrentPage'),
          async () => {
            await this.$store.dispatch('score/removeBars', this.sectionAndBarRange);
          },
        ),
      };
    },
  },
})
</script>