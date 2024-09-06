<template>
  <div
    id="beat-component"
    v-bind:style="$data.$_style"
  >
    <div ref="numerator" id="numerator">
      {{ barValue.numerator }}
    </div>
    <div ref="denominator" id="denominator">
      {{ barValue.denominator }}
    </div>
  </div>
</template>

<style scoped>
#beat-component {
  display: flex;
  flex-direction: row;
  position: relative;
  margin-right: 5px;
}

#numerator {
  position: absolute;
  bottom: 0;
}

#denominator {
  position: absolute;
  top: 0;
}
</style>

<script lang="ts">
import { defineComponent, ref, CSSProperties } from 'vue';
import { NoteValue } from '../modules/NoteValue'
import { max } from '../modules/utils'

export default defineComponent({
  setup() {
    return {
      numerator: ref<HTMLDivElement>(),
      denominator: ref<HTMLDivElement>(),
    };
  },

  props: {
    barValue: { type: NoteValue, required: true },
  },

  data(): {
    $_style?: CSSProperties,
    $_numeratorResizeObserver: ResizeObserver,
    $_denominatorResizeObserver: ResizeObserver,
  } {
    return {
      $_style: undefined,
      $_numeratorResizeObserver: new ResizeObserver(() => { this.$_updateStyle() }),
      $_denominatorResizeObserver: new ResizeObserver(() => { this.$_updateStyle() }),
    };
  },

  watch: {
    numerator: {
      handler(newNumerator?: HTMLDivElement, oldNumerator?: HTMLDivElement) {
        if (oldNumerator) this.$data.$_numeratorResizeObserver.unobserve(oldNumerator);
        if (newNumerator) this.$data.$_numeratorResizeObserver.observe(newNumerator);
      },
      immediate: true,
    },

    denominator: {
      handler(newDenominator?: HTMLDivElement, oldDenominator?: HTMLDivElement) {
        if (oldDenominator) this.$data.$_numeratorResizeObserver.unobserve(oldDenominator);
        if (newDenominator) this.$data.$_numeratorResizeObserver.observe(newDenominator);
      },
      immediate: true,
    },
  },

  mounted() {
    this.$_updateStyle();
  },

  beforeUnmount() {
    this.$data.$_numeratorResizeObserver.disconnect();
    this.$data.$_numeratorResizeObserver.disconnect();
  },

  methods: {
    $_updateStyle() {
      if (this.numerator && this.denominator) {
        let numeratorWidthPx = this.numerator.getBoundingClientRect().width;
        let denominatorWidthPx = this.denominator.getBoundingClientRect().width;
        this.$data.$_style = {
          fontSize:   `${this.$store.state.config.staffLineStepPx * 2}px`,
          lineHeight: `${this.$store.state.config.staffLineStepPx * 2}px`,
          width:      `${max(numeratorWidthPx, denominatorWidthPx)}px`,
        }
      }
    },
  },
});
</script>