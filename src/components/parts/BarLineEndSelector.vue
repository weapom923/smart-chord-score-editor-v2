<template>
  <v-select
    item-title="title"
    item-value="value"
    v-model="$_barLineEnd"
    v-bind:label="$t('barLineEndKind')"
    v-bind:items="$_allBarLineEnds"
    v-bind:disabled="barLineEnd === undefined"
  >
  </v-select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { BarLine, bl } from '../../modules/BarLine';

export default defineComponent({
  emits: {
    'update:barLineEnd': (barLineEnd: BarLine) => true,
  },

  props: {
    barLineEnd: { type: BarLine },
  },

  computed: {
    $_allBarLineEnds(): { title: string, value: BarLine }[] {
      return [
        { title: this.$t('barLineEndSingle'),      value: bl.end.single },
        { title: this.$t('barLineEndDouble'),      value: bl.end.double },
        { title: this.$t('barLineEndRepeat'),      value: bl.end.repeatEnd },
        { title: this.$t('barLineEndGreatDouble'), value: bl.end.greatDouble },
      ];
    },

    $_barLineEnd: {
      get(): BarLine | undefined { return this.barLineEnd },
      set(barLineEnd: BarLine)   { this.$emit('update:barLineEnd', barLineEnd) },
    },
  },
})
</script>