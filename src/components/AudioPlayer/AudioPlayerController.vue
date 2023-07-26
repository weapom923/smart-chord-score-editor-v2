<template>
  <div class="d-flex align-center">
    <v-tooltip location="top" v-bind:text="$t('seekToHead')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-skip-previous" size="small"
          v-bind="props"
          v-on:mousedown.stop="$_seekToHead"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('rewind')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-rewind" size="small"
          v-bind="props"
          v-on:mousedown.stop="$_seekBackwardStart"
          v-on:mouseup.stop="$_seekBackwardEnd"
          v-on:mouseout.stop="$_seekBackwardEnd"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('pause')" v-if="isPlaying">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-pause" size="small"
          
          v-bind="props"
          v-on:mousedown.stop="$_pause"
        >
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip location="top" v-bind:text="$t('play')" v-else>
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-play" size="small"
          v-bind="props"
          v-on:mousedown.stop="$_play"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('fastForward')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-fast-forward" size="small"
          v-bind="props"
          v-on:mousedown.stop="$_seekForwardStart"
          v-on:mouseup.stop="$_seekForwardEnd"
          v-on:mouseout.stop="$_seekForwardEnd"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('seekToTail')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-skip-next" size="small"
          v-bind="props"
          v-on:mousedown.stop="$_seekToTail"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('clearLoop')" v-if="loopDefinition !== undefined">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-ray-start-end" size="small" class="loop-enabled"
          
          v-bind="props"
          v-on:mousedown.stop="$_clearLoop"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('setLoopStart')" v-else-if="$_isTempLoopBeginNotSet">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-ray-start" size="small"
          v-bind="props"
          v-on:mousedown.stop="$_setLoopBegin"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip location="top" v-bind:text="$t('setLoopEnd')" v-else-if="$_isTempLoopEndNotSet">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-ray-end" size="small" class="loop-enabled"
          v-bind="props"
          v-bind:disabled="$_isSetTempLoopEndButtonDisabled"
          v-on:mousedown.stop="$_setLoopEnd"
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
      if (this.tempLoopBeginTimeSec === undefined) return true;
      return ((this.tempLoopBeginTimeSec + loopDurationSecMin) > this.playTimeSec);
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

    $_clearLoop() {
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