<template>
  <v-select
    item-title="title"
    item-value="value"
    v-model="$_barLineStart"
    v-bind:label="$t('barLineStartKind')"
    v-bind:items="$_allBarLineStarts"
    v-bind:disabled="barLineStart === undefined"
  >
  </v-select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { BarLine, bl } from '../../modules/BarLine';

export default defineComponent({
  emits: {
    'update:barLineStart': (barLineStart: BarLine) => true,
  },

  props: {
    barLineStart: { type: BarLine },
  },

  computed: {
    $_allBarLineStarts(): { title: string, value: BarLine }[] {
      return [
        { title: '',                            value: bl.start.empty },
        { title: this.$t('barLineStartRepeat'), value: bl.start.repeatStart },
      ];
    },

    $_barLineStart: {
      get(): BarLine | undefined { return this.barLineStart },
      set(barLineStart: BarLine) { this.$emit('update:barLineStart', barLineStart) },
    },
  },
})
</script>