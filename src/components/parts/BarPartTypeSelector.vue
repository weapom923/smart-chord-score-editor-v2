<template>
  <v-select
    label="Part Type"
    hide-details
    item-title="title"
    item-value="value"
    v-model="$_partIdx"
    v-bind:items="$_allPartIdcs"
    v-bind:disabled="$_isPartEmpty"
    v-on:keydown.stop
  />
</template>

<script lang="ts">
import { SectionAndBarIdx } from '../../modules/SectionAndBarRange';
import { PartInBar } from '../../modules/PartInBar';

export default {
  emits: {
    'update:selectedPartIdx': (partIdx: PartIdx) => true,
  },

  props: {
    sectionAndBarIdx: { type: SectionAndBarIdx, required: true },
    selectedPartIdx: { type: Number, required: true },
  },

  computed: {
    $_bar() {
      return this.$store.state.score.score.getBar(this.sectionAndBarIdx);
    },

    $_isPartEmpty() {
      return (this.$_bar.parts.length === 0);
    },

    $_allPartIdcs(): { title: string, value: number }[] {
      return this.$_bar.parts.map((part: PartInBar, partIdx: number) => {
        switch (part.type) {
          case 'normal': return { title: 'Normal', value: partIdx };
          case 'chord':  return { title: 'Chord',  value: partIdx };
          case 'rhythm': return { title: 'Rhythm', value: partIdx };
        }
      });
    },

    $_partIdx: {
      get(): number | undefined { return this.selectedPartIdx },
      set(partIdx: number)      { this.$emit('update:selectedPartIdx', partIdx) },
    },
  },
}
</script>