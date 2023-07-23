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
import { CSSProperties } from 'vue';
import { NoteValue } from '../modules/NoteValue'
import { max } from '../modules/utils'

export default {
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

  computed: {
    $_numerator(): HTMLDivElement { return this.$refs.numerator as HTMLDivElement },
    $_denominator(): HTMLDivElement { return this.$refs.denominator as HTMLDivElement },
  },

  mounted() {
    this.$data.$_numeratorResizeObserver.observe(this.$_numerator);
    this.$data.$_numeratorResizeObserver.observe(this.$_denominator);
    this.$_updateStyle();
  },

  beforeUnmount() {
    this.$data.$_numeratorResizeObserver.unobserve(this.$_denominator);
    this.$data.$_numeratorResizeObserver.unobserve(this.$_numerator);
  },

  methods: {
    $_updateStyle() {
      let numeratorWidthPx = this.$_numerator.getBoundingClientRect().width;
      let denominatorWidthPx = this.$_denominator.getBoundingClientRect().width;
      this.$data.$_style = {
        fontSize:   `${this.$store.state.config.staffLineStepPx * 2}px`,
        lineHeight: `${this.$store.state.config.staffLineStepPx * 2}px`,
        width:      `${max(numeratorWidthPx, denominatorWidthPx)}px`,
      }
    },
  },
}
</script>