<template>
  <v-select
    v-bind:label="$t('gridNoteValue')"
    v-model="$_gridNoteValueLabel"
    v-bind:items="$_gridNoteValueLabels"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NoteValue, nv } from '../../modules/NoteValue';

export default defineComponent({
  emits: {
    'update:gridNoteValue': (gridNoteValue: NoteValue) => true,
  },

  props: {
    gridNoteValue: { type: NoteValue },
  },

  computed: {
    $_labelToGridNoteValues(): Map<string, NoteValue> {
      return new Map<string, NoteValue>([
        [ this.$t('noteValueWhole'),   nv.divisible.whole ],
        [ this.$t('noteValueHalf'),    nv.divisible.half ],
        [ this.$t('noteValueQuarter'), nv.divisible.quarter ],
      ]);
    },

    $_gridNoteValueLabels(): string[] {
      return [ ...this.$_labelToGridNoteValues.keys() ];
    },

    $_gridNoteValueLabel: {
      get(): string | undefined  {
        if (this.gridNoteValue === undefined) return undefined;
        for (let [ gridNoteValueLabel, gridNoteValue ] of this.$_labelToGridNoteValues.entries()) {
          if (gridNoteValue.isEqualTo(this.gridNoteValue)) return gridNoteValueLabel;
        }
        return undefined;
      },
      set(gridNoteValueLabel: string) {
        const gridNoteValue = this.$_labelToGridNoteValues.get(gridNoteValueLabel);
        if (gridNoteValue === undefined) return;
        this.$emit('update:gridNoteValue', gridNoteValue.clone());
      },
    },
  },
})
</script>