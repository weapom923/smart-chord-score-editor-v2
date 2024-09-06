<template>
  <canvas></canvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CanvasBase from './CanvasBase.vue';
import { drawLine } from './modules/canvasUtils'

export default defineComponent({
  extends: CanvasBase,

  watch: {
    $_staffHeightPx(newCanvasHeightPx) {
      this.$_setCanvasHeightPx(newCanvasHeightPx);
    },
  },

  mounted() {
    this.$_setCanvasHeightPx(this.$_staffHeightPx);
    this.$data.$_resizeObserver.observe(this.$_canvasElement);
  },

  beforeUnmount() {
    this.$data.$_resizeObserver.disconnect();
  },

  data(): {
    $_resizeObserver: ResizeObserver,
  } {
    return {
      $_resizeObserver: new ResizeObserver((event: ResizeObserverEntry[]) => {
        this.$_setCanvasWidthPx(event[0].contentRect.width, false);
      }),
    };
  },

  computed: {
    $_staffLineStepPx() { return this.$store.state.config.staffLineStepPx },
    $_staffHeightPx() { return this.$_staffLineStepPx * 4 + 1 },
  },

  created() {
    /* public */
    this.$_setCallback((canvas: CanvasRenderingContext2D) => {
      for (let lineIdx = 0; lineIdx < 5; ++lineIdx) {
        drawLine(
          canvas,
          { x: 0, y: lineIdx * this.$_staffLineStepPx },
          { x: this.$_canvasElement.width },
        );
      }
    });
  },
})
</script>