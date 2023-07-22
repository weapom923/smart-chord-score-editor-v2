<template>
  <v-select
    multiple 
    item-title="title"
    item-value="value"
    v-model="$_partInBarTypeNames"
    v-bind:label="$t('partType')"
    v-bind:items="$_allPartInBarTypeNames"
    v-bind:rules="$_rules"
    v-on:keydown.stop
  />
</template>

<script lang="ts">
import { PartInBarType } from '../../modules/PartInBar';

export default {
  emits: {
    'update:partInBarTypes': (partInBarType: PartInBarType[]) => true,
  },

  props: {
    partInBarTypes: { type: Array<PartInBarType>, required: true },
  },

  computed: {
    $_allPartInBarTypeNames(): { title: string, value: PartInBarType }[] {
      return [
        { title: this.$t('chord'), value: 'chord' },
      ];
    },

    $_partInBarTypeNames: {
      get(): PartInBarType[]               { return this.partInBarTypes },
      set(partInBarTypes: PartInBarType[]) { this.$emit('update:partInBarTypes', partInBarTypes) },
    },

    $_rules(): ((value: any) => string | true)[] {
      return [
        (partInBarTypes: PartInBarType[]) => ((partInBarTypes.length > 0)? true : 'At least 1 part type must be selected.'),
      ];
    },
  },
}
</script>