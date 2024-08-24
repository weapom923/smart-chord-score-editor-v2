<template>
  <div class="d-flex align-center">
    <v-tooltip location="top" v-bind:text="$t('seekToHead')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-skip-previous" size="small"
          v-bind="props"
          v-on:click.stop="$_seekToHead"
          v-on:keydown.enter.stop="$_seekToHead"
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
          v-on:click.stop="$_onPlayOrPauseButtonClicked"
          v-on:keydown.enter.stop="$_onPlayOrPauseButtonClicked"
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
          v-on:click.stop="$_seekToTail"
          v-on:keydown.enter.stop="$_seekToTail"
        >
        </v-btn>
      </template>
    </v-tooltip>

    <v-menu>
      <template v-slot:activator="{ props: menuProps }">
        <v-tooltip location="top" v-bind:text="$t('volume')">
          <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
              size="small"
              v-bind:icon="$_volumeButtonIconName"
              v-bind="mergeProps(menuProps, tooltipProps)"
            >
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <v-card>
        <v-card-text>
          <v-slider
            min="0" max="1" hide-details
            direction="vertical" density="compact"
            v-bind:prepend-icon="$_volumeButtonIconName"
            v-model="$_volume"
            v-on:click.stop
            v-on:keydown.stop
          >
          </v-slider>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, mergeProps } from 'vue';

const seekIntervalTimeSec = 0.1;
const seekTimeStepSec = 0.1;

export default defineComponent({
  emits: {
    'update:volume': (volume: number) => true,
    'update:playbackRate': (playbackRate: number) => true,
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
    volume: { type: Number, default: 1 },
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
    $_volume: {
      get(): number       { return this.volume },
      set(volume: number) { this.$emit('update:volume', volume) },
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

    $_volumeButtonIconName(): string {
      if (this.volume > 0.7) return 'mdi-volume-high';
      if (this.volume > 0.3) return 'mdi-volume-medium';
      if (this.volume > 0) return 'mdi-volume-low';
      return 'mdi-volume-mute'
    },
  },

  methods: {
    mergeProps,

    $_seekToHead() { this.$emit('seekInstantlyInSec', 0) },

    $_seekToTail() { this.$emit('seekInstantlyInSec', this.durationSec) },

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