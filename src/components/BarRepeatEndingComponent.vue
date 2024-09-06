<template>
  <div
    id="bar-repeat-ending"
    class="pa-1"
    v-bind:style="$_barRepeatEndingNumberStyle"
  >
    <span
      v-for="barRepeatNumber of $_barRepeatEndingNumbers"
      v-bind:key="barRepeatNumber"
    >
      {{ barRepeatNumber }}.
    </span>
  </div>
</template>

<style scoped>
#bar-repeat-ending span:not(:last-child) {
  margin-right: 5px;
}
</style>

<script lang="ts">
import { defineComponent, CSSProperties } from 'vue';
import { BarRepeatEnding } from '../modules/BarRepeatEnding';

export default defineComponent({
  props: {
    barRepeatEnding: { type: BarRepeatEnding, required: true },
  },

  computed: {
    $_barRepeatEndingNumbers(): number[] {
      return Array.from(this.barRepeatEnding.numbers).sort((a, b) => (a - b));
    },

    $_barRepeatEndingNumberStyle(): CSSProperties {
      return {
        fontSize: `${this.$store.state.config.chordFontSizePx * 0.7}px`,
        lineHeight: `${this.$store.state.config.chordFontSizePx * 0.7}px`,
      };
    },
  },
})
</script>