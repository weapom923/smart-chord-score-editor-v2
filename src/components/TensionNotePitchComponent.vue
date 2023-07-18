<template>
  <div
    id="tension-note"
    v-bind:style="$_tensionNoteStyle"
  >
    <div
      id="tension-note-sharp-or-flat-text"
      v-bind:style="$_tensionNoteSharpOrFlatStyle"
    >
      {{ $_tensionNoteFlatOrSharpText }}
    </div>
    <div id="tension-note-text">{{ $_tensionNoteText }}</div>
  </div>
</template>

<style scoped>
#tension-note {
  display: inline-block;
  width: fit-content;
  height: fit-content;
  line-height: 10px;
}

#tension-note-text {
  display: inline-block;
  font-size: 10px;
}

#tension-note-sharp-or-flat-text {
  display: inline-block;
  font-size: 8px;
}
</style>

<script lang="ts">
import { CSSProperties } from 'vue';
import { TensionNotePitch } from '../modules/TensionNotePitch';

export default {
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
};
</script>

