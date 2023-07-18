<template>
  <v-select
    label="Clef Sign"
    item-title="title"
    item-value="value"
    v-model="$_clef"
    v-bind:items="$_allClefs"
    v-on:keydown.stop
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
        { title: 'Treble', value: cl.treble },
        { title: 'Bass',   value: cl.bass },
      ];
    },

    $_clef: {
      get(): Clef | undefined { return this.clef },
      set(clef: Clef)         { this.$emit('update:clef', clef) },
    },
  },
}
</script>