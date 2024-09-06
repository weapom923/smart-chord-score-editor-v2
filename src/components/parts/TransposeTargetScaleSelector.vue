<template>
  <v-select
    item-title="title"
    item-value="value"
    v-model="$_pitchOffset"
    v-bind:label="$t('transpose')"
    v-bind:items="$_targetPitchOffsets"
  />
</template>

<script lang="ts">
import { Bar } from '../../modules/Bar';
import { Scale } from '../../modules/Scale';

export default {
  emits: {
    'update:bars': (bars: Bar[]) => true,
  },

  props: {
    bars: { type: Array<Bar> },
  },

  computed: {
    $_uniqueScale(): Scale | undefined {
      if (this.bars === undefined) return undefined;
      let uniqueScale: Scale | undefined = undefined;
      for (const bar of this.bars) {
        if (uniqueScale === undefined) {
          uniqueScale = bar.scale;
        } else if (!uniqueScale.isEqualTo(bar.scale)) {
          return undefined;
        }
      }
      return uniqueScale;
    },

    $_targetPitchOffsets(): { title: string, value: number }[] {
      const pitchOffsets = [ -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5 ];
      return pitchOffsets.map((pitchOffset): { title: string, value: number } => {
        if (pitchOffset === 0) {
          return {
            title: '',
            value: pitchOffset,
          };
        } else {
          const pitchOffsetString = ((pitchOffset > 0)? '+' : '-') + Math.abs(pitchOffset);
          if (this.$_uniqueScale === undefined) {
            return {
              title: pitchOffsetString,
              value: pitchOffset,
            };
          } else {
            const targetScale = this.$_uniqueScale.transposeByPitchOffset(pitchOffset);
            return {
              title: `${targetScale.tonicNotePitch} ${this.$t(this.$_uniqueScale.type)} (${pitchOffsetString})`,
              value: pitchOffset,
            };
          }
        }
      });
    },

    $_pitchOffset: {
      get(): number { return 0 },
      set(pitchOffset: number) {
        if (pitchOffset === 0) return;
        if (this.bars === undefined) return;
        this.$emit('update:bars', this.bars.map(bar => bar.transpose(pitchOffset)));
      },
    }
  },
}
</script>