<template>
  <div id="note">
    <div v-bind:style="$_noteTextStyle">
      {{ $_noteText }}
    </div>
    <sup
      id="note-sharp-or-flat-text"
      v-bind:style="$_noteFlatOrSharpTextStyle"
    >
      {{ $_noteFlatOrSharpText }}
    </sup>
  </div>
</template>

<style scoped>
#note {
  display: flex;
  flex-direction: row;
  position: relative;
}

#note-sharp-or-flat-text {
  position: relative;
  left: -3px;
  width: 0;
}
</style>

<script lang="ts">
import { CSSProperties } from 'vue';
import { NotePitch } from '../modules/NotePitch';
import { nps } from '../modules/NotePitchSymbol'
import { raw } from '../modules/utils'

function getNoteSymbolText(notePitch: NotePitch): string {
  switch (raw(notePitch.symbol)) {
    case nps.a: return 'A';
    case nps.b: return 'B';
    case nps.c: return 'C';
    case nps.d: return 'D';
    case nps.e: return 'E';
    case nps.f: return 'F';
    case nps.g: return 'G';
  }
  throw new RangeError();
}

function getNoteFlatOrSharpText(notePitch: NotePitch): string {
  if (notePitch.isSharp) return '♯';
  if (notePitch.isFlat) return '♭';
  return '';
}

export default {
  props: {
    notePitch:      { type: NotePitch, required: true },
    baseFontSizePx: { type: Number, required: true },
  },

  computed: {
    $_noteText(): string {
      return getNoteSymbolText(this.notePitch);
    },

    $_noteFlatOrSharpText(): string {
      return getNoteFlatOrSharpText(this.notePitch);
    },

    $_noteTextStyle(): CSSProperties {
      return {
        fontSize: `${this.baseFontSizePx}px`,
        lineHeight: `${this.baseFontSizePx}px`,
      };
    },

    $_noteFlatOrSharpTextStyle(): CSSProperties {
      return {
        fontSize: `${Math.floor(this.baseFontSizePx * 0.6)}px`,
        lineHeight: `${Math.floor(this.baseFontSizePx * 0.6)}px`,
      };
    },
  },
};
</script>

