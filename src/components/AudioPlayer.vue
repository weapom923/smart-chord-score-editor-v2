<template>
  <div class="d-flex flex-col flex-grow-1 align-stretch gc-1">
    <audio-player-controller
      v-bind:duration-sec="audioBuffer.duration"
      v-bind:play-time-sec="$data.$_playTimeSec"
      v-bind:is-playing="$data.$_isPlaying"
      v-bind:is-seeking="$data.$_isSeeking"
      v-model:volume="$_volume"
      v-model:loop-definition="$data.$_loopDefinition"
      v-model:temp-loop-begin-time-sec="$data.$_tempLoopbegin"
      v-on:seek-start="$_seekStart"
      v-on:seek-in-sec="$_seekInSec"
      v-on:seek-instantly-in-sec="$_seekInstantlyInSec"
      v-on:seek-end="$_seekEnd"
      v-on:play="$_play"
      v-on:pause="$_pause"
    >
    </audio-player-controller>
    <audio-play-time-controller
      v-if="$data.$_waveformDecimator"
      v-bind:waveform-decimator="$data.$_waveformDecimator"
      v-bind:sampling-rate="audioBuffer.sampleRate"
      v-bind:play-time-sec="$data.$_playTimeSec"
      v-model:loop-definition="$data.$_loopDefinition"
      v-on:seek-start="$_seekStart"
      v-on:seek-in-sec="$_seekInSec"
      v-on:seek-end="$_seekEnd"
    >
    </audio-play-time-controller>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AudioPlayerController from './AudioPlayer/AudioPlayerController.vue';
import { TimeRangeSec } from './AudioPlayer/modules/TimeRangeSec';
import AudioPlayTimeController from './AudioPlayer/AudioPlayTimeController.vue';
import WaveformDecimator from '../modules/WaveformDecimator';

type AudioBufferSourceNodePool = Set<AudioBufferSourceNode>;

export default defineComponent({
  emits: {
    'update:volume': (volume: number) => true,
  },

  components: {
    AudioPlayerController,
    AudioPlayTimeController,
  },

  watch: {
    async '$data.$_audioBufferSourceNodePool'(audioBufferSourceNodePool: AudioBufferSourceNodePool) {
      if (audioBufferSourceNodePool.size === 0) {
        await this.$_suspend();
        this.$_seekInSec(0);
      }
    },

    '$data.$_loopDefinition'(loopDefinition?: TimeRangeSec) {
      if (this.$data.$_latestAudioBufferSourceNode === undefined) return;
      if (loopDefinition === undefined) {
        this.$_seekInSec(this.$_getPlayTimeSec());
        this.$data.$_latestAudioBufferSourceNode.loop = false;
      } else {
        this.$_seekInstantlyInSec(loopDefinition.begin);
        this.$data.$_latestAudioBufferSourceNode.loop = true;
      }
    },
  },

  props: {
    audioBuffer:  { type: AudioBuffer, required: true },
    audioContext: { type: AudioContext, required: true },
    gainNode:     { type: GainNode, required: true },
    volume:       { type: Number, required: true },
  },

  data(): {
    $_playTimeSec: number,
    $_isPlaying: boolean,
    $_isSeeking: boolean,
    $_wasPlayingOnSeek?: boolean,
    $_loopDefinition?: TimeRangeSec,
    $_tempLoopbegin?: number,

    $_audioBufferSourceNodePool: AudioBufferSourceNodePool,
    $_audioBufferSourceNodeStartOffsetSec: number,
    $_latestAudioBufferSourceNode?: AudioBufferSourceNode,
    $_originOfCurrentTime: number,
    $_animtionFrameRequestId: number | undefined,
    $_waveformDecimator?: WaveformDecimator,
  } {
    return {
      $_playTimeSec: 0,
      $_isPlaying: false,
      $_isSeeking: false,
      $_wasPlayingOnSeek: undefined,
      $_loopDefinition: undefined,
      $_tempLoopbegin: undefined,

      $_audioBufferSourceNodePool: new Set(),
      $_audioBufferSourceNodeStartOffsetSec: 0,
      $_latestAudioBufferSourceNode: undefined,
      $_originOfCurrentTime: 0,
      $_animtionFrameRequestId: undefined,
      $_waveformDecimator: undefined,
    };
  },

  computed: {
    $_volume: {
      get(): number       { return this.volume }, 
      set(volume: number) { this.$emit('update:volume', volume) },
    },
    $_audioPlayerTimeController(): InstanceType<typeof AudioPlayTimeController> | undefined {
      return this.$refs.audioPlayerBar as InstanceType<typeof AudioPlayTimeController> | undefined;
    },
  },

  async created() {
    this.$data.$_waveformDecimator = new WaveformDecimator(await WaveformDecimator.loadData(this.audioBuffer));
  },

  mounted() {
    this.$data.$_animtionFrameRequestId = window.requestAnimationFrame(this.$_onRequestAnimationFrame);
  },

  async beforeUnmount() {
    if (this.$data.$_animtionFrameRequestId !== undefined) {
      window.cancelAnimationFrame(this.$data.$_animtionFrameRequestId);
    }
    if (this.$data.$_latestAudioBufferSourceNode !== undefined) {
      this.$_requestAudioBufferSourceNodeToStop();
      await this.$_resume();
    }
    if (this.audioContext.state !== 'closed') await this.audioContext.close();
  },

  methods: {
    onKeydown(event: KeyboardEvent): boolean {
      if (document.activeElement !== document.body) return false;
      switch (event.code) {
        case 'Space':
          (this.$data.$_isPlaying)? this.$_pause() : this.$_play();
          return true;
      }
      return false;
    },

    /* private */
    $_onRequestAnimationFrame() {
      this.$_update();
      this.$data.$_animtionFrameRequestId = window.requestAnimationFrame(this.$_onRequestAnimationFrame);
    },

    async $_suspend() {
      switch (this.audioContext.state) {
        case 'running':
          await this.audioContext.suspend();
          break;
      }
      this.$data.$_isPlaying = false;
    },

    async $_resume() {
      if (this.$data.$_latestAudioBufferSourceNode === undefined) {
        this.$_seekInSec(0);
        this.$_createNewAudioBufferSourceNode();
      }
      switch (this.audioContext.state) {
        case 'suspended':
          await this.audioContext.resume();
          break;
      }
      this.$data.$_isPlaying = true;
    },

    async $_seekInstantlyInSec(seekTimeSec: number) {
      await this.$_seekStart();
      this.$_seekInSec(seekTimeSec);
      await this.$_seekEnd();
    },

    $_seekInSec(seekTimeSec: number) {
      this.$data.$_audioBufferSourceNodeStartOffsetSec = seekTimeSec;
      this.$data.$_originOfCurrentTime = this.audioContext.currentTime - seekTimeSec;
      this.$_update();
    },

    async $_seekStart() {
      this.$data.$_isSeeking = true;
      this.$data.$_wasPlayingOnSeek = this.$data.$_isPlaying;
      await this.$_suspend();
    },

    async $_seekEnd() {
      this.$_requestAudioBufferSourceNodeToStop();
      this.$_createNewAudioBufferSourceNode();
      let isSeekedToTail = (this.audioBuffer.duration === this.$_getPlayTimeSec());
      if (this.$data.$_wasPlayingOnSeek && !isSeekedToTail) {
        await this.$_resume();
      }
      this.$data.$_wasPlayingOnSeek = undefined;
      this.$data.$_isSeeking = false;
    },

    $_createNewAudioBufferSourceNode() {
      let newAudioBufferSourceNode = this.audioContext.createBufferSource();
      this.$data.$_latestAudioBufferSourceNode = newAudioBufferSourceNode;
      this.$data.$_audioBufferSourceNodePool.add(newAudioBufferSourceNode);
      newAudioBufferSourceNode.buffer = this.audioBuffer;
      newAudioBufferSourceNode.connect(this.audioContext.destination);
      newAudioBufferSourceNode.connect(this.gainNode);
      newAudioBufferSourceNode.onended = () => {
        this.$data.$_audioBufferSourceNodePool.delete(newAudioBufferSourceNode);
        this.$data.$_latestAudioBufferSourceNode = undefined;
        this.$_suspend();
      };
      if (this.$data.$_loopDefinition !== undefined) {
        newAudioBufferSourceNode.loop = true;
        newAudioBufferSourceNode.loopStart = this.$data.$_loopDefinition.begin;
        newAudioBufferSourceNode.loopEnd = this.$data.$_loopDefinition.end;
      } else {
        newAudioBufferSourceNode.loop = false;
      }
      newAudioBufferSourceNode.start(0, this.$data.$_audioBufferSourceNodeStartOffsetSec);
    },

    $_getPlayTimeSec() {
      let offsetTime = this.audioContext.currentTime - this.$data.$_originOfCurrentTime;
      if (this.$data.$_latestAudioBufferSourceNode === undefined) return offsetTime;
      if (this.$data.$_latestAudioBufferSourceNode.loop) {
        if (offsetTime > this.$data.$_latestAudioBufferSourceNode.loopStart) {
          let loopDuration = this.$data.$_latestAudioBufferSourceNode.loopEnd - this.$data.$_latestAudioBufferSourceNode.loopStart;
          let offsetFromLoopStart = (offsetTime - this.$data.$_latestAudioBufferSourceNode.loopStart) % loopDuration;
          offsetTime = this.$data.$_latestAudioBufferSourceNode.loopStart + offsetFromLoopStart;
        }
      }
      return offsetTime;
    },

    async $_play() {
      await this.$_resume();
    },

    async $_pause() {
      await this.$_suspend();
    },

    $_update() {
      let playTimeSec = this.$_getPlayTimeSec();
      this.$data.$_playTimeSec = playTimeSec;
    },

    $_requestAudioBufferSourceNodeToStop() {
      for (let audioBufferSourceNode of this.$data.$_audioBufferSourceNodePool) {
        this.$data.$_audioBufferSourceNodePool.delete(audioBufferSourceNode);
        audioBufferSourceNode.onended = null;
        audioBufferSourceNode.stop();
      }
    },
  },
});
</script>