<template>
  <div id="tension-note" v-bind:style="$_tensionNoteStyle">
    <div v-bind:style="$_tensionNoteSharpOrFlatStyle">{{ $_tensionNoteFlatOrSharpText }}</div>
    <div>{{ $_tensionNoteText }}</div>
  </div>
</template>

<style scoped>
#tension-note {
  display: flex;
  width: fit-content;
  height: fit-content;
}
</style>

<script lang="ts">
import { defineComponent, CSSProperties } from 'vue';
import { TensionNotePitch } from '../modules/TensionNotePitch';

export default defineComponent({
  props: {
    tensionNotePitch: { type: TensionNotePitch, required: true },
    baseFontSizePx: { type: Number, required: true },
  },

  computed: {
    $_tensionNoteText(): string {
      return this.tensionNotePitch.symbolText;
    },

    $_tensionNoteFlatOrSharpText(): string {
      return this.tensionNotePitch.flatOrSharpText;
    },

    $_tensionNoteStyle(): CSSProperties {
      return {
        fontSize: `${this.baseFontSizePx * 0.5}px`,
        lineHeight: `${this.baseFontSizePx * 0.5}px`,
      };
    },

    $_tensionNoteSharpOrFlatStyle(): CSSProperties {
      return {
        fontSize: `${Math.floor(this.baseFontSizePx * 0.4)}px`,
      };
    },
  },
})
</script>

