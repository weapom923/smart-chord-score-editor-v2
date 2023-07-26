<template>
  <v-select
    multiple
    v-model="$_barRepeatEndingNumbers"
    v-bind:label="$t('barRepeatNumber')"
    v-bind:items="$_allBarRepeatEndingNumbers"
    v-bind:disabled="barRepeatEnding === undefined"
  />
</template>

<script lang="ts">
import { BarRepeatEnding } from '../../modules/BarRepeatEnding';

const barRepeatEndingNumberMax = 5;

export default {
  emits: {
    'update:barRepeatEnding': (barRepeatEnding: BarRepeatEnding) => true,
  },

  props: {
    barRepeatEnding: { type: BarRepeatEnding },
  },

  computed: {
    $_allBarRepeatEndingNumbers() {
      return [ ...Array(barRepeatEndingNumberMax).keys() ].map(idx => idx + 1);
    },

    $_barRepeatEndingNumbers: {
      get(): number[] {
        if (this.barRepeatEnding === undefined) return [];
        return Array.from(this.barRepeatEnding.numbers);
      },
      set(barRepeatEndingNumbers: number[]) {
        this.$emit('update:barRepeatEnding', new BarRepeatEnding(new Set(barRepeatEndingNumbers)));
      },
    }
  },
}
</script>