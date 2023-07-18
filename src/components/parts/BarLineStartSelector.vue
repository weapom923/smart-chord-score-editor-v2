<template>
  <v-select
    label="Bar Line Start"
    item-title="title"
    item-value="value"
    v-model="$_barLineStart"
    v-bind:items="$_allBarLineStarts"
    v-bind:disabled="barLineStart === undefined"
    v-on:keydown.stop
  />
</template>

<script lang="ts">
import { BarLine, bl } from '../../modules/BarLine';

export default {
  emits: {
    'update:barLineStart': (barLineStart: BarLine) => true,
  },

  props: {
    barLineStart: { type: BarLine },
  },

  computed: {
    $_allBarLineStarts(): { title: string, value: BarLine }[] {
      return [
        { title: 'Empty',  value: bl.start.empty },
        { title: 'Repeat', value: bl.start.repeatStart },
      ];
    },

    $_barLineStart: {
      get(): BarLine | undefined { return this.barLineStart },
      set(barLineStart: BarLine) { this.$emit('update:barLineStart', barLineStart) },
    },
  },
}
</script>