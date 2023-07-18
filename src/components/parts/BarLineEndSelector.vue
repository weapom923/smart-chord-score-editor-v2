<template>
  <v-select
    label="Bar Line End"
    item-title="title"
    item-value="value"
    v-model="$_barLineEnd"
    v-bind:items="$_allBarLineEnds"
    v-bind:disabled="barLineEnd === undefined"
    v-on:keydown.stop
  />
</template>

<script lang="ts">
import { BarLine, bl } from '../../modules/BarLine';

export default {
  emits: {
    'update:barLineEnd': (barLineEnd: BarLine) => true,
  },

  props: {
    barLineEnd: { type: BarLine },
  },

  computed: {
    $_allBarLineEnds(): { title: string, value: BarLine }[] {
      return [
        { title: 'Single',       value: bl.end.single },
        { title: 'Double',       value: bl.end.double },
        { title: 'Repeat',       value: bl.end.repeatEnd },
        { title: 'Great Double', value: bl.end.greatDouble },
      ];
    },

    $_barLineEnd: {
      get(): BarLine | undefined { return this.barLineEnd },
      set(barLineEnd: BarLine)   { this.$emit('update:barLineEnd', barLineEnd) },
    },
  },
}
</script>