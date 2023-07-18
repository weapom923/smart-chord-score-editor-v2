<template>
  <div id="seek-bar-container">
    <div
      id="seek-bar-base"
      ref="seekBarBase"
    >
      <div
        v-show="!disabled"
        id="seek-bar-played"
        ref="seekBarPlayed"
      >
        <div
          id="seek-bar-handle"
          ref="seekBarHandle"
        >
        </div>
      </div>

      <div
        id="seek-bar-loop"
        class="loop"
        ref="seekBarLoop"
        v-show="$_isLoopEnabled"
      >
      </div>

      <div
        id="seek-bar-clickable-area"
        ref="seekBarClickableArea"
        v-on:mousedown.stop="$_seekStart"
      >
      </div>
    </div>
  </div>
</template>

<style scoped>
div#seek-bar-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

div#seek-bar-base {
  position: relative;
  flex-grow: 1;
  height: 3px;
  background-color: #dddddd;
}

div#seek-bar-played {
  height: 100%;
  background-color: #666666;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

div#seek-bar-handle {
  flex-shrink: 0;
  background-color: #666666;
  height: 15px;
  width: 15px;
  margin-right: -8px;
  border-radius: 50%;
}

div#seek-bar-loop {
  position: absolute;
  top: 0;
  height: 100%;
  opacity: 0.5;
}

div#seek-bar-clickable-area {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-top: -10px;
  padding: 10px 0;
}

div.loop {
  background-color: #16f43f;
}
</style>

<script lang="ts">
import { clamp } from '../modules/utils';

export default {
  watch: {
    currentTimeMsec(newCurrentTimeMsec: number) {
      this.$_updateSeekBarPosition(newCurrentTimeMsec);
    },

    durationMsec(newDurationMsec: number) {
      let seekBarBaseWidthPx = this.$_seekBarBaseElement.getBoundingClientRect().width;
      this.$_updateSeekBarScaleAndPosition(seekBarBaseWidthPx, newDurationMsec);
    },

    loopBeginTimeMsec(newLoopBeginTimeMsec: number) {
      if (newLoopBeginTimeMsec === undefined) return;
      if (this.loopEndTimeMsec === undefined) return;
      this.$_updateLoopRange(newLoopBeginTimeMsec, this.loopEndTimeMsec);
    },

    loopEndTimeMsec(newLoopEndTimeMsec) {
      if (newLoopEndTimeMsec === undefined) return;
      if (this.loopBeginTimeMsec === undefined) return;
      this.$_updateLoopRange(this.loopBeginTimeMsec, newLoopEndTimeMsec);
    },
  },

  mounted() {
    let seekBarBaseWidthPx = this.$_seekBarBaseElement.getBoundingClientRect().width;
    this.$_updateSeekBarScaleAndPosition(seekBarBaseWidthPx, this.durationMsec);
    this.$_updateSeekBarPosition(this.currentTimeMsec);
    if ((this.loopBeginTimeMsec !== undefined) && (this.loopEndTimeMsec !== undefined)) {
      this.$_updateLoopRange(this.loopBeginTimeMsec, this.loopEndTimeMsec);
    }
    this.$data.$_seekBarBaseResizeObserver.observe(this.$_seekBarBaseElement);
  },

  beforeUnmount() {
    this.$data.$_seekBarBaseResizeObserver.disconnect();
  },

  props: {
    disabled:          { type: Boolean, required: true },
    currentTimeMsec:   { type: Number, required: true },
    durationMsec:      { type: Number, required: true },
    loopBeginTimeMsec: { type: Number },
    loopEndTimeMsec:   { type: Number },
  },

  data(): {
    $_seekBarBaseResizeObserver: ResizeObserver,
    $_seekBarScale: number,
    $_isSeeking: boolean,
  } {
    return {
      $_seekBarBaseResizeObserver: new ResizeObserver(
        resizeObserverEntries => {
          let resizeObserverEntry = resizeObserverEntries[0];
          this.$_updateSeekBarScaleAndPosition(resizeObserverEntry.contentRect.width, this.durationMsec);
        },
      ),
      $_seekBarScale: 1,
      $_isSeeking: false,
    };
  },

  computed: {
    $_seekBarPlayedElement(): HTMLDivElement {
      return this.$refs.seekBarPlayed as HTMLDivElement;
    },

    $_seekBarBaseElement(): HTMLDivElement {
      return this.$refs.seekBarBase as HTMLDivElement;
    },

    $_seekBarLoop(): HTMLDivElement {
      return this.$refs.seekBarLoop as HTMLDivElement;
    },

    $_isLoopEnabled() {
      return ((this.loopBeginTimeMsec !== undefined) && (this.loopEndTimeMsec !== undefined));
    },
  },

  methods: {
    $_updateSeekBarPosition(currentTimeMsec: number) {
      this.$_seekBarPlayedElement.style.width = `${currentTimeMsec / this.$_seekBarScale}px`;
    }, 

    $_updateSeekBarScaleAndPosition(seekBarBaseWidthPx: number, durationMsec: number) {
      this.$_seekBarScale = durationMsec / seekBarBaseWidthPx;
      this.$_updateSeekBarPosition(this.currentTimeMsec);
    },

    $_updateLoopRange(loopBeginTimeMsec: number, loopEndTimeMsec: number) {
      let loopDurationMsec = loopEndTimeMsec - loopBeginTimeMsec;
      this.$_seekBarLoop.style.left = `${loopBeginTimeMsec / this.$_seekBarScale}px`;
      this.$_seekBarLoop.style.width = `${loopDurationMsec / this.$_seekBarScale}px`;
    },

    $_getSeekTimeMsecByMouseEvent(mouseEvent: MouseEvent) {
      let seekBarBaseClientRect = this.$_seekBarBaseElement.getBoundingClientRect();
      let seekBarOffsetPx = mouseEvent.clientX - seekBarBaseClientRect.x;
      return seekBarOffsetPx * this.$_seekBarScale;
    },

    $_seek(event: MouseEvent) {
      if (this.$data.$_isSeeking) {
        let seekBarBaseClientRect = this.$_seekBarBaseElement.getBoundingClientRect();
        let seekBarOffsetPx = event.clientX - seekBarBaseClientRect.x;
        let seekTimeMsec = seekBarOffsetPx * this.$_seekBarScale;
        clamp(seekTimeMsec, 0, this.durationMsec);
        this.$emit('seek', seekTimeMsec);
      }
    },

    $_seekStart(event: MouseEvent) {
      this.$data.$_isSeeking = true;
      this.$emit('seek-start');
      this.$_seek(event);
      window.addEventListener('mousemove', this.$_seek);
      window.addEventListener('mouseup', this.$_seekEnd);
    },

    $_seekEnd(event: MouseEvent) {
      this.$data.$_isSeeking = false;
      this.$_seek(event);
      this.$emit('seek-end');
      window.removeEventListener('mousemove', this.$_seek);
      window.addEventListener('mouseup', this.$_seekEnd);
    },
  },
}
</script>