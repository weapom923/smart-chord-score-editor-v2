<template>
  <v-select
    v-model="$_unitBeatValue"
    v-bind:label="$t('unitBeatValue')"
    v-bind:items="$_unitBeatValueLabels"
  >
  </v-select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NoteValue, nv } from '../../modules/NoteValue';

export default defineComponent({
  emits: {
    'update:unitBeatValue': (unitBeatValue: NoteValue) => true,
  },

  props: {
    unitBeatValue: { type: NoteValue },
  },

  computed: {
    $_labelToUnitBeatValues(): Map<string, NoteValue> {
      return new Map<string, NoteValue>([
        [ this.$t('noteValueHalf'),    nv.divisible.half ],
        [ this.$t('noteValueQuarter'), nv.divisible.quarter ],
        [ this.$t('noteValueEighth'),  nv.divisible.eighth ],
      ]);
    },

    $_unitBeatValueLabels(): string[] {
      return [ ...this.$_labelToUnitBeatValues.keys() ];
    },

    $_unitBeatValue: {
      get(): string | undefined  {
        if (this.unitBeatValue === undefined) return undefined;
        for (let [ unitBeatValueLabel, unitBeatValue ] of this.$_labelToUnitBeatValues.entries()) {
          if (unitBeatValue.isEqualTo(this.unitBeatValue)) return unitBeatValueLabel;
        }
        return undefined;
      },
      set(unitBeatValueLabel: string) {
        const unitBeatValue = this.$_labelToUnitBeatValues.get(unitBeatValueLabel);
        if (unitBeatValue === undefined) return;
        this.$emit('update:unitBeatValue', unitBeatValue.clone());
      },
    },
  },
})
</script>