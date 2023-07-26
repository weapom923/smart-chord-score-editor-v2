<template>
  <div class="d-flex align-center">
    <v-tooltip location="top" v-bind:text="$t('seekToHead')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-skip-previous" size="small"
          v-bind="props"
          v-on:click="$_seekToHead"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('rewind')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-rewind" size="small"
          v-bind="props"
          v-on:mousedown="$_seekBackwardStart"
          v-on:mouseup="$_seekBackwardEnd"
          v-on:mouseout="$_seekBackwardEnd"
          v-on:keydown.space="$_seekBackwardStart"
          v-on:keydown.enter="$_seekBackwardStart"
          v-on:keyup.space="$_seekBackwardEnd"
          v-on:keyup.enter="$_seekBackwardEnd"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$_playOrPauseButtonTooltipText">
      <template v-slot:activator="{ props }">
        <v-btn
          size="small"
          v-bind="props"
          v-bind:icon="$_playOrPauseButtonIconName"
          v-on:click="$_onPlayOrPauseButtonClicked"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('fastForward')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-fast-forward" size="small"
          v-bind="props"
          v-on:mousedown="$_seekForwardStart"
          v-on:mouseup="$_seekForwardEnd"
          v-on:mouseout="$_seekForwardEnd"
          v-on:keydown.space="$_seekForwardStart"
          v-on:keydown.enter="$_seekForwardStart"
          v-on:keyup.space="$_seekForwardEnd"
          v-on:keyup.enter="$_seekForwardEnd"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('seekToTail')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-skip-next" size="small"
          v-bind="props"
          v-on:click="$_seekToTail"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$_loopButtonTooltipText">
      <template v-slot:activator="{ props }">
        <v-btn
          size="small"
          v-bind="props"
          v-bind:class="$_loopButtonClassName"
          v-bind:icon="$_loopButtonIconName"
          v-on:click="$_onLoopButtonClicked"
        >
        </v-btn>
      </template>
    </v-tooltip>
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
    'update:tempLoopBeginTimeSec': (tempLoopBeginTimeSec?: number) => true,
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
    tempLoopBeginTimeSec: { type: Number },
  },

  data(): {
    $_seekTargetTimeSec: number,
    $_intervalId: number | undefined,
  } {
    return {
      $_seekTargetTimeSec: 0,
      $_intervalId: undefined,
    };
  },

  computed: {
    $_isTempLoopBeginNotSet() {
      return (this.tempLoopBeginTimeSec === undefined);
    },

    $_isTempLoopEndNotSet() {
      return (!this.$_isTempLoopBeginNotSet && (this.loopDefinition === undefined));
    },

    $_isSetTempLoopEndButtonDisabled() {
      if (this.tempLoopBeginTimeSec === undefined) return false;
      return ((this.tempLoopBeginTimeSec + loopDurationSecMin) > this.playTimeSec);
    },

    $_playOrPauseButtonTooltipText(): string {
      return (this.isPlaying)? this.$t('pause') : this.$t('play');
    },

    $_playOrPauseButtonIconName(): string {
      return (this.isPlaying)? 'mdi-pause' : 'mdi-play';
    },

    $_onPlayOrPauseButtonClicked(): () => void {
      return (this.isPlaying)? this.$_pause : this.$_play;
    },

    $_loopButtonTooltipText(): string {
      if (this.loopDefinition !== undefined) return this.$t('clearLoop');
      return (this.$_isTempLoopBeginNotSet)? this.$t('setLoopStart') : this.$t('setLoopEnd');
    },

    $_loopButtonClassName(): string | undefined {
      if ((this.loopDefinition !== undefined) || !this.$_isTempLoopBeginNotSet) return 'loop-enabled';
      return undefined;
    },

    $_loopButtonIconName(): string {
      if (this.loopDefinition !== undefined) return 'mdi-ray-start-end';
      return (this.$_isTempLoopBeginNotSet)? 'mdi-ray-start' : 'mdi-ray-end';
    },

    $_onLoopButtonClicked(): () => void {
      if (this.loopDefinition !== undefined) return this.$_clearLoop;
      return (this.$_isTempLoopBeginNotSet)? this.$_setLoopBegin : this.$_setLoopEnd;
    },
  },

  methods: {
    $_seekToHead() { this.$emit('seekInstantlyInSec', 0) },

    $_seekToTail() { this.$emit('seekInstantlyInSec', this.durationSec) },

    $_setLoopBegin() { this.$emit('update:tempLoopBeginTimeSec', this.playTimeSec) },

    $_setLoopEnd() {
      if (this.tempLoopBeginTimeSec === undefined) return;
      this.$emit('update:loopDefinition', new AudioPlaybackLoopDefinition(this.tempLoopBeginTimeSec, this.playTimeSec));
      this.$emit('update:tempLoopBeginTimeSec', undefined);
    },

    $_clearLoop() { this.$emit('update:loopDefinition', undefined) },

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