<template>
  <v-select
    label="Bar Break"
    item-title="title"
    item-value="value"
    v-model="$_barBreak"
    v-bind:items="$_allBarBreaks"
    v-bind:disabled="barBreak === undefined"
    v-on:keydown.stop
  />
</template>

<script lang="ts">
import { BarBreak, bb } from '../../modules/BarBreak';

export default {
  emits: {
    'update:barBreak': (barBreak: BarBreak) => true,
  },

  props: {
    barBreak: { type: BarBreak },
  },

  computed: {
    $_allBarBreaks(): { title: string, value: BarBreak }[] {
      return [
        { title: 'Empty',        value: bb.empty },
        { title: 'System Break', value: bb.system },
        { title: 'Page Break',   value: bb.page },
      ];
    },

    $_barBreak: {
      get(): BarBreak | undefined { return this.barBreak },
      set(barBreak: BarBreak)     { this.$emit('update:barBreak', barBreak) },
    },
  },
}
</script>