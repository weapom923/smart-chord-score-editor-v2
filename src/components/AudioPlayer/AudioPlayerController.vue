<template>
  <div class="d-flex align-center">
    <v-btn
      icon="mdi-skip-previous" size="small"
      v-on:mousedown.stop="$_seekToHead"
    >
    </v-btn>

    <v-btn
      icon="mdi-rewind" size="small"
      v-on:mousedown.stop="$_seekBackwardStart"
      v-on:mouseup.stop="$_seekBackwardEnd"
      v-on:mouseout.stop="$_seekBackwardEnd"
    >
    </v-btn>

    <v-btn
      icon="mdi-pause" size="small"
      v-if="isPlaying"
      v-on:mousedown.stop="$_pause"
    >
    </v-btn>
    <v-btn
      icon="mdi-play" size="small"
      v-else
      v-on:mousedown.stop="$_play"
    >
    </v-btn>

    <v-btn
      icon="mdi-fast-forward" size="small"
      v-on:mousedown.stop="$_seekForwardStart"
      v-on:mouseup.stop="$_seekForwardEnd"
      v-on:mouseout.stop="$_seekForwardEnd"
    >
    </v-btn>

    <v-btn
      icon="mdi-skip-next" size="small"
      v-on:mousedown.stop="$_seekToTail"
    >
    </v-btn>

    <v-btn
      icon="mdi-restart-off" size="small" class="loop-enabled"
      v-if="loopDefinition !== undefined"
      v-on:mousedown.stop="$_clearLoop"
    >
    </v-btn>
    <v-btn
      icon="mdi-ray-start" size="small"
      v-else-if="$_isTempLoopBeginNotSet"
      v-on:mousedown.stop="$_setLoopBegin"
    >
    </v-btn>

    <v-btn
      icon="mdi-ray-start-end" size="small"
      v-else-if="$_isTempLoopEndNotSet"
      v-bind:disabled="$_isSetTempLoopEndButtonDisabled"
      v-on:mousedown.stop="$_setLoopEnd"
    >
    </v-btn>

  </div>
</template>

<style scoped>
.loop-enabled {
  color: #16f43f !important;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AudioPlaybackLoopDefinition from './modules/AudioPlaybackLoopDefinition';

const seekIntervalTimeSec = 0.1;
const seekTimeStepSec = 0.1;
const loopDurationSecMin = 0.1;

export default defineComponent({
  emits: {
    'update:loopDefinition': (loopDefinition?: AudioPlaybackLoopDefinition) => true,
    'seekInstantlyInSec': (timeSec: number) => true,
    'play': () => true,
    'pause': () => true,
    'seekStart': () => true,
    'seekInSec': (seekTimeSec: number) => true,
    'seekEnd': () => true,
  },
  
  props: {
    durationSec: { type: Number, default: 0 },
    playTimeSec: { type: Number, default: 0 },
    isPlaying: { type: Boolean, default: false },
    isSeeking: { type: Boolean, default: false },
    loopDefinition: { type: AudioPlaybackLoopDefinition },
  },

  data(): {
    $_seekTargetTimeSec: number,
    $_intervalId: number | undefined,
    $_tempLoopBeginTimeSec?: number,
    $_tempLoopEndTimeSec?: number,
  } {
    return {
      $_seekTargetTimeSec: 0,
      $_intervalId: undefined,
      $_tempLoopBeginTimeSec: undefined,
      $_tempLoopEndTimeSec: undefined,
    };
  },

  computed: {

    $_isTempLoopBeginNotSet() {
      return (this.$data.$_tempLoopBeginTimeSec === undefined);
    },

    $_isTempLoopEndNotSet() {
      return (this.$data.$_tempLoopEndTimeSec === undefined);
    },

    $_isSetTempLoopEndButtonDisabled() {
      if (this.$data.$_tempLoopBeginTimeSec === undefined) return true;
      return ((this.$data.$_tempLoopBeginTimeSec + loopDurationSecMin) > this.playTimeSec);
    },
  },

  methods: {
    $_seekToHead() { this.$emit('seekInstantlyInSec', 0) },

    $_seekToTail() { this.$emit('seekInstantlyInSec', this.durationSec) },

    $_setLoopBegin() {
      this.$data.$_tempLoopBeginTimeSec = this.playTimeSec;
    },

    $_setLoopEnd() {
      if (this.$data.$_tempLoopBeginTimeSec === undefined) return;
      this.$data.$_tempLoopEndTimeSec = this.playTimeSec;
      this.$emit('update:loopDefinition', new AudioPlaybackLoopDefinition(this.$data.$_tempLoopBeginTimeSec, this.$data.$_tempLoopEndTimeSec));
    },

    $_clearLoop() {
      this.$data.$_tempLoopEndTimeSec = undefined;
      this.$data.$_tempLoopBeginTimeSec = undefined;
      this.$emit('update:loopDefinition', undefined);
    },

    $_play() { this.$emit('play') },

    $_pause() { this.$emit('pause') },

    $_seekBackwardStart() {
      if (this.isSeeking) return;
      this.$emit('seekStart');
      this.$data.$_seekTargetTimeSec = this.playTimeSec;
      this.$_updateSeekBackwardTargetTime();
      this.$_setInterval(this.$_updateSeekBackwardTargetTime, seekIntervalTimeSec);
    },

    $_updateSeekBackwardTargetTime() {
      let nextSeekTargetTimeSec = this.$data.$_seekTargetTimeSec - seekTimeStepSec;
      if (nextSeekTargetTimeSec < 0) nextSeekTargetTimeSec = 0;
      this.$data.$_seekTargetTimeSec = nextSeekTargetTimeSec;
      this.$emit('seekInSec', nextSeekTargetTimeSec)
    },

    $_seekBackwardEnd() {
      if (!this.isSeeking) return;
      this.$_clearInterval();
      this.$emit('seekEnd');
    },

    $_seekForwardStart() {
      if (this.isSeeking) return;
      this.$emit('seekStart');
      this.$data.$_seekTargetTimeSec = this.playTimeSec;
      this.$_updateSeekForwardTargetTime();
      this.$_clearInterval();
      this.$_setInterval(this.$_updateSeekForwardTargetTime, seekIntervalTimeSec);
    },

    $_updateSeekForwardTargetTime() {
      let nextSeekTargetTimeSec = this.$data.$_seekTargetTimeSec + seekTimeStepSec;
      if (nextSeekTargetTimeSec > this.durationSec) nextSeekTargetTimeSec = this.durationSec;
      this.$data.$_seekTargetTimeSec = nextSeekTargetTimeSec;
      this.$emit('seekInSec', nextSeekTargetTimeSec)
    },

    $_seekForwardEnd() {
      if (!this.isSeeking) return;
      this.$_clearInterval();
      this.$emit('seekEnd');
    },

    $_clearInterval() {
      if (this.$data.$_intervalId !== undefined) window.clearInterval(this.$data.$_intervalId);
      this.$data.$_intervalId = undefined;
    },

    $_setInterval(callback: () => void, intervalSec: number) {
      this.$_clearInterval();
      this.$data.$_intervalId = window.setInterval(callback, intervalSec);
    },
  },
});
</script>