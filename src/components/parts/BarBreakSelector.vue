<template>
  <v-select
    item-title="title"
    item-value="value"
    v-model="$_barBreak"
    v-bind:label="$t('barBreakKind')"
    v-bind:items="$_allBarBreaks"
    v-bind:disabled="barBreak === undefined"
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
        { title: '',                        value: bb.empty },
        { title: this.$t('barBreakSystem'), value: bb.system },
        { title: this.$t('barBreakPage'),   value: bb.page },
      ];
    },

    $_barBreak: {
      get(): BarBreak | undefined { return this.barBreak },
      set(barBreak: BarBreak)     { this.$emit('update:barBreak', barBreak) },
    },
  },
}
</script>