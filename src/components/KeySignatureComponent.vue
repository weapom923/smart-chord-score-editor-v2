<template>
  <div
    id="key-signature-component"
    v-bind:style="$_keySignatureComponentStyle"
  >
    <div
      class="key-signature"
      v-for="(notePitch, keySignatureIdx) in $_keySignatureNotePitches"
      v-bind:key="keySignatureIdx"
      v-bind:style="$_keySignatureStyle(notePitch, keySignatureIdx)"
    >
      <key-signature v-bind:key-shift-amount="$_keyShiftAmount(notePitch)">
      </key-signature>
    </div>
  </div>
</template>

<style scoped>
#key-signature-component {
  position: relative;
  display: flex;
  flex-direction: row;
}

.key-signature {
  display: flex;
  flex-direction: row;
  position: absolute;
  width: 5px;
}
</style>

<script lang="ts">
import { CSSProperties } from 'vue';
import { NotePitch, np } from '../modules/NotePitch';
import { nps } from '../modules/NotePitchSymbol';
import { Scale } from '../modules/Scale';
import { Clef, cl } from '../modules/Clef';
import { raw } from '../modules/utils';
import KeySignature from '../components/canvases/KeySignature.vue';

const keySignatureWidthPx = 6;

export default {
  components: {
    KeySignature,
  },

  props: {
    clef: { type: Clef, default: cl.treble },
    scale: { type: Scale, required: true },
  },

  computed: {
    $_staffLineStepPx(): number {
      return this.$store.state.config.staffLineStepPx;
    },

    $_keySignatureComponentStyle(): CSSProperties {
      const keySignatureComponentStyle: CSSProperties = {};
      if (this.$_keySignatureNotePitches.length > 0) {
        keySignatureComponentStyle.marginRight = `${10}px`;
      }
      keySignatureComponentStyle.width = `${keySignatureWidthPx * this.$_numKeySignatures}px`;
      return keySignatureComponentStyle;
    },

    $_keySignatureGlobalTopOffset(): number {
      switch (raw(this.clef)) {
        case cl.bass:
          return this.$_staffLineStepPx;
      }
      return 0;
    },

    $_keySignatureNotePitches(): NotePitch[] {
      const keySignatureNotePitches: NotePitch[] = [];
      if (this.scale.numSharps > 0) {
        if (this.scale.numSharps >= 1) keySignatureNotePitches.push(np.fSharp);
        if (this.scale.numSharps >= 2) keySignatureNotePitches.push(np.cSharp);
        if (this.scale.numSharps >= 3) keySignatureNotePitches.push(np.gSharp);
        if (this.scale.numSharps >= 4) keySignatureNotePitches.push(np.dSharp);
        if (this.scale.numSharps >= 5) keySignatureNotePitches.push(np.aSharp);
        if (this.scale.numSharps >= 6) keySignatureNotePitches.push(np.eSharp);
        if (this.scale.numSharps >= 7) keySignatureNotePitches.push(np.bSharp);
      } else if (this.scale.numFlats > 0) {
        if (this.scale.numFlats >= 1) keySignatureNotePitches.push(np.bFlat);
        if (this.scale.numFlats >= 2) keySignatureNotePitches.push(np.eFlat);
        if (this.scale.numFlats >= 3) keySignatureNotePitches.push(np.aFlat);
        if (this.scale.numFlats >= 4) keySignatureNotePitches.push(np.dFlat);
        if (this.scale.numFlats >= 5) keySignatureNotePitches.push(np.gFlat);
        if (this.scale.numFlats >= 6) keySignatureNotePitches.push(np.cFlat);
        if (this.scale.numFlats >= 7) keySignatureNotePitches.push(np.fFlat);
      }
      return keySignatureNotePitches;
    },

    $_numKeySignatures() {
      return this.$_keySignatureNotePitches.length;
    },
  },

  methods: {
    $_keySignatureStyle(notePitch: NotePitch, keySignatureIdx: number): CSSProperties {
      const topOffset = getTopOffsetPx(this.$_staffLineStepPx, notePitch) + this.$_keySignatureGlobalTopOffset;
      return {
        left: `${keySignatureIdx * keySignatureWidthPx}px`,
        top: `${topOffset}px`,
      }

      function getTopOffsetPx(staffLineStepPx: number, notePitch: NotePitch): number {
        if (notePitch.isSharp) {
          switch (raw(notePitch.symbol)) {
            case nps.c: return -staffLineStepPx * 1 / 2;
            case nps.d: return -staffLineStepPx * 2 / 2;
            case nps.e: return -staffLineStepPx * 3 / 2;
            case nps.f: return -staffLineStepPx * 4 / 2;
            case nps.g: return -staffLineStepPx * 5 / 2;
            case nps.a: return staffLineStepPx * 1 / 2;
          }
        } else if (notePitch.isFlat) {
          switch (raw(notePitch.symbol)) {
            case nps.e: return -staffLineStepPx * 3 / 2;
            case nps.d: return -staffLineStepPx * 2 / 2;
            case nps.c: return -staffLineStepPx * 1 / 2;
            case nps.a: return staffLineStepPx * 1 / 2;
            case nps.g: return staffLineStepPx * 2 / 2;
            case nps.f: return staffLineStepPx * 3 / 2;
          }
        }
        return 0;
      }
    },

    $_keyShiftAmount(notePitch: NotePitch): number {
      if (notePitch.isSharp) return 1;
      if (notePitch.isFlat) return -1;
      return 0;
    },
  },
}
</script>