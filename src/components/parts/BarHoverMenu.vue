<template>
  <v-card>
    <v-btn-group class="d-flex" density="compact" color="secondary" variant="text">
      <v-tooltip
        location="bottom"
        v-for="({ icon, text, callback, disabled }, menuItemIdx) in $_menuItems"
        v-bind:key="menuItemIdx"
        v-bind:text="text"
        v-bind:disabled="disabled"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            size="x-small" class="flex-grow-1"
            v-bind="props"
            v-bind:disabled="disabled"
            v-bind:icon="icon"
            v-on:click="callback"
          >
          </v-btn>
        </template>
      </v-tooltip>
    </v-btn-group>
  </v-card>
</template>

<script lang="ts">
import { SectionAndBarIdx, SectionAndBarRange } from '../../modules/SectionAndBarRange';

type BarHoverMenuItem = {
  icon: string,
  text: string,
  callback: Function,
  disabled: boolean,
};

export default {
  props: {
    sectionIdx: { type: Number, required: true },
    barIdx:     { type: Number, required: true },
  },

  computed: {
    $_sectionAndBarIdx(): SectionAndBarIdx {
      return new SectionAndBarIdx(this.sectionIdx, this.barIdx);
    },

    $_nextBarIdxInCurrentSection(): SectionAndBarIdx {
      return new SectionAndBarIdx(this.sectionIdx, this.barIdx + 1);
    },

    $_sectionAndBarRange(): SectionAndBarRange {
      return new SectionAndBarRange(this.$_sectionAndBarIdx);
    },

    $_menuItems(): BarHoverMenuItem[] {
      return [
        {
          icon: 'mdi-plus',
          text: this.$t('insertBarBefore'),
          callback: async () => {
            await this.$store.dispatch(
              'score/insertBars',
              {
                sectionAndBarIdx: this.$_sectionAndBarIdx,
                bars: [ this.$store.state.score.score.getBar(this.$_sectionAndBarIdx).generateEmptyFrom() ],
                selects: false,
              },
            );
          },
          disabled: false,
        },
        {
          icon: 'mdi-delete',
          text: this.$t('removeBar'),
          callback: async () => { await this.$store.dispatch('score/removeBars', this.$_sectionAndBarRange) },
          disabled: false,
        },
        {
          icon: 'mdi-content-copy',
          text: this.$t('copyBar'),
          callback: async () => { await this.$store.dispatch('score/setCopiedBars', this.$_sectionAndBarRange) },
          disabled: false,
        },
        {
          icon: 'mdi-content-paste',
          text: this.$t('pasteBar'),
          callback: async () => { await this.$store.dispatch('score/pasteCopiedBarsPartOnly', this.$_sectionAndBarRange) },
          disabled: (this.$store.state.score.copiedBars.length === 0),
        },
        {
          icon: 'mdi-plus',
          text: this.$t('insertBarAfter'),
          callback: async () => {
            await this.$store.dispatch(
              'score/insertBars',
              {
                sectionAndBarIdx: this.$_nextBarIdxInCurrentSection,
                bars: [ this.$store.state.score.score.getBar(this.$_sectionAndBarIdx).generateEmptyFrom() ],
                selects: false,
              },
            );
          },
          disabled: false,
        },
      ];
    },
  },
}
</script>