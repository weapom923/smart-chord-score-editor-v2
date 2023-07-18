<template>
  <div id="audio-player-controller">
    <v-btn
      icon="mdi-skip-previous" size="small"
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_seekToHead"
    >
    </v-btn>

    <v-btn
      icon="mdi-rewind" size="small"
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_seekBackwardStart"
      v-on:mouseup.stop="$_seekBackwardEnd"
      v-on:mouseout.stop="$_seekBackwardEnd"
    >
    </v-btn>

    <v-btn
      icon="mdi-pause" size="small"
      v-if="isPlaying"
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_pause"
    >
    </v-btn>

    <v-btn
      icon="mdi-play" size="small"
      v-else
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_play"
    >
    </v-btn>

    <v-btn
      icon="mdi-fast-forward" size="small"
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_seekForwardStart"
      v-on:mouseup.stop="$_seekForwardEnd"
      v-on:mouseout.stop="$_seekForwardEnd"
    >
    </v-btn>

    <v-btn
      icon="mdi-skip-next" size="small"
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_seekToTail"
    >
    </v-btn>

    <audio-player-seek-bar
      v-bind:disabled="disabled"
      v-bind:current-time-msec="playTimeMsec"
      v-bind:duration-msec="durationMsec"
      v-bind:is-loop-enabled="$_isLoopEnabled"
      v-bind:loop-begin-time-msec="loopBeginTimeMsec"
      v-bind:loop-end-time-msec="$_tempLoopEndTimeMsec"
      v-on:seek="$_seekBySlider"
      v-on:seek-start="$_seekBySliderStart"
      v-on:seek-end="$_seekBySliderEnd"
    />

    <v-btn
      icon="mdi-ray-start" size="small"
      v-if="$_isLoopBeginNotSet"
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_setLoopBegin"
    >
    </v-btn>

    <v-btn
      icon="mdi-ray-start-end" size="small"
      v-else-if="$_isLoopEndNotSet"
      v-bind:disabled="disabled || $_isSetLoopEndButtonDisabled"
      v-on:mousedown.stop="$_setLoopEnd"
    >
    </v-btn>

    <v-btn
      icon="mdi-restart-off" size="small" class="loop"
      v-else
      v-bind:disabled="disabled"
      v-on:mousedown.stop="$_clearLoop"
    >
    </v-btn>
  </div>
</template>

<style scoped>
#audio-player-controller {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.v-icon.loop {
  color: #16f43f;
}
</style>

<script lang="ts">
import AudioPlayerSeekBar from './AudioPlayerSeekBar.vue';

const seekIntervalTimeMsec = 100;
const seekTimeStepMsec = 1000;
const loopDurationMsecMin = 100;

export default {
  components: {
    AudioPlayerSeekBar,
  },

  props: {
    disabled: { type: Boolean, default: true },
    durationMsec: { type: Number, default: 0 },
    playTimeMsec: { type: Number, default: 0 },
    isPlaying: { type: Boolean, default: false },
    loopBeginTimeMsec: { type: Number },
    loopEndTimeMsec: { type: Number },
  },

  data(): {
    $_isPlayingOnSeek?: boolean,
    $_isSeeking: boolean,
    $_seekTargetTimeMsec: number,
    $_intervalId?: number,
  } {
    return {
      $_isPlayingOnSeek: undefined,
      $_isSeeking: false,
      $_seekTargetTimeMsec: 0,
      $_intervalId: undefined,
    };
  },

  computed: {
    $_isLoopEnabled(): boolean {
      if (this.loopBeginTimeMsec === undefined) return false;
      if (this.loopEndTimeMsec === undefined) return false;
      return true;
    },

    $_isLoopBeginNotSet(): boolean {
      return (this.loopBeginTimeMsec === undefined);
    },

    $_isLoopEndNotSet(): boolean {
      return (this.loopEndTimeMsec === undefined);
    },

    $_isSetLoopEndButtonDisabled(): boolean {
      if (this.loopBeginTimeMsec === undefined) return true;
      return ((this.loopBeginTimeMsec + loopDurationMsecMin) > this.playTimeMsec);
    },

    $_tempLoopEndTimeMsec(): number | undefined {
      if (this.$_isLoopBeginNotSet) {
        return undefined;
      } else if (this.$_isLoopEndNotSet) {
        return this.playTimeMsec;
      } else {
        return this.loopEndTimeMsec;
      }
    },
  },

  methods: {
    $_seekToHead() { this.$emit('seek-in-msec', 0) },

    $_seekToTail() { this.$emit('seek-in-msec', this.durationMsec) },

    $_setLoopBegin() { this.$emit('set-loop-begin', this.playTimeMsec) },

    $_setLoopEnd() { this.$emit('set-loop-end', this.playTimeMsec) },

    $_clearLoop() { this.$emit('clear-loop') },

    $_toggleSetLoop() {
      if (this.$_isLoopBeginNotSet) {
        this.$_setLoopBegin();
      } else if (this.$_isLoopEndNotSet) {
        this.$_setLoopEnd();
      } else {
        this.$_clearLoop();
      }
    },

    $_play() { this.$emit('play') },

    $_pause() { this.$emit('pause') },

    $_seekBackwardStart() {
      if (this.$data.$_isSeeking) return;
      this.$data.$_isSeeking = true;
      this.$data.$_isPlayingOnSeek = this.isPlaying;
      if (this.$data.$_isPlayingOnSeek) this.$_pause();
      this.$data.$_seekTargetTimeMsec = this.playTimeMsec;
      this.$_updateSeekBackwardTargetTime();
      this.$_setInterval(this.$_updateSeekBackwardTargetTime, seekIntervalTimeMsec);
    },

    $_updateSeekBackwardTargetTime() {
      let nextSeekTargetTimeMsec = this.$data.$_seekTargetTimeMsec - seekTimeStepMsec;
      if (nextSeekTargetTimeMsec < 0) nextSeekTargetTimeMsec = 0;
      this.$data.$_seekTargetTimeMsec = nextSeekTargetTimeMsec;
      this.$emit('seek-in-msec', nextSeekTargetTimeMsec);
    },

    $_seekBackwardEnd() {
      if (!this.$data.$_isSeeking) return;
      this.$_clearInterval();
      if (this.$data.$_isPlayingOnSeek) this.$_play();
      this.$data.$_isPlayingOnSeek = undefined;
      this.$data.$_isSeeking = false;
    },

    $_seekForwardStart() {
      if (this.$data.$_isSeeking) return;
      this.$data.$_isSeeking = true;
      this.$data.$_isPlayingOnSeek = this.isPlaying;
      if (this.$data.$_isPlayingOnSeek) this.$_pause();
      this.$data.$_seekTargetTimeMsec = this.playTimeMsec;
      this.$_updateSeekForwardTargetTime();
      this.$_clearInterval();
      this.$_setInterval(this.$_updateSeekForwardTargetTime, seekIntervalTimeMsec);
    },

    $_updateSeekForwardTargetTime() {
      let nextSeekTargetTimeMsec = this.$data.$_seekTargetTimeMsec + seekTimeStepMsec;
      if (nextSeekTargetTimeMsec > this.durationMsec) nextSeekTargetTimeMsec = this.durationMsec;
      this.$data.$_seekTargetTimeMsec = nextSeekTargetTimeMsec;
      this.$emit('seek-in-msec', nextSeekTargetTimeMsec);
    },

    $_seekForwardEnd() {
      if (!this.$data.$_isSeeking) return;
      this.$_clearInterval();
      if (this.$data.$_isPlayingOnSeek) this.$_play();
      this.$data.$_isPlayingOnSeek = undefined;
      this.$data.$_isSeeking = false;
    },

    $_seekBySliderStart() {
      this.$data.$_isSeeking = true;
      this.$data.$_isPlayingOnSeek = this.isPlaying;
      if (this.$data.$_isPlayingOnSeek) this.$_pause();
    },

    $_seekBySliderEnd() {
      if (this.$data.$_isPlayingOnSeek) this.$_play();
      this.$data.$_isPlayingOnSeek = undefined;
      this.$data.$_isSeeking = false;
    },

    $_seekBySlider(timeMsec: number) {
      if (!this.$data.$_isSeeking) return;
      this.$emit('seek-in-msec', timeMsec);
    },

    $_clearInterval() {
      if (this.$data.$_intervalId !== undefined) window.clearInterval(this.$data.$_intervalId);
      this.$data.$_intervalId = undefined;
    },

    $_setInterval(callback: TimerHandler, intervalMsec: number) {
      this.$_clearInterval();
      this.$data.$_intervalId = window.setInterval(callback, intervalMsec);
    }
  },
}
</script>