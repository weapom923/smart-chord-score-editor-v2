<template>
  <v-select
    item-title="title"
    item-value="value"
    v-model="$_clef"
    v-bind:label="$t('clefSign')"
    v-bind:items="$_allClefs"
  />
</template>

<script lang="ts">
import { Clef, cl } from '../../modules/Clef';

export default {
  emits: {
    'update:clef': (clef: Clef) => true,
  },

  props: {
    clef: { type: Clef },
  },

  computed: {
    $_allClefs(): { title: string, value: Clef }[] {
      return [
        { title: this.$t('clefSignTreble'), value: cl.treble },
        { title: this.$t('clefSignBass'),   value: cl.bass },
      ];
    },

    $_clef: {
      get(): Clef | undefined { return this.clef },
      set(clef: Clef)         { this.$emit('update:clef', clef) },
    },
  },
}
</script>