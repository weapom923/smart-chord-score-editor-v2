<template>
  <div class="d-flex flex-col flex-grow-1 align-center">
    <audio-player-controller
      v-bind:duration-sec="audioBuffer.duration"
      v-bind:play-time-sec="$data.$_playTimeSec"
      v-bind:is-playing="$data.$_isPlaying"
      v-bind:is-seeking="$data.$_isSeeking"
      v-model:loop-definition="$data.$_loopDefinition"
      v-model:temp-loop-begin-time-sec="$data.$_tempLoopBeginTimeSec"
      v-on:seek-start="$_seekStart"
      v-on:seek-in-sec="$_seekInSec"
      v-on:seek-instantly-in-sec="$_seekInstantlyInSec"
      v-on:seek-end="$_seekEnd"
      v-on:play="$_play"
      v-on:pause="$_pause"
    >
    </audio-player-controller>
    <audio-player-seek-bar
      ref="audioPlayerSeekBar"
      v-bind:current-time-sec="$data.$_playTimeSec"
      v-bind:duration-sec="audioBuffer.duration"
      v-bind:is-seeking="$data.$_isSeeking"
      v-bind:loop-definition="$data.$_loopDefinition"
      v-bind:temp-loop-begin-time-sec="$data.$_tempLoopBeginTimeSec"
      v-on:seek="$_seekInSec"
      v-on:seek-start="$_seekStart"
      v-on:seek-end="$_seekEnd"
    >
    </audio-player-seek-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AudioPlayerController from './AudioPlayer/AudioPlayerController.vue';
import AudioPlaybackLoopDefinition from './AudioPlayer/modules/AudioPlaybackLoopDefinition';
import AudioPlayerSeekBar from './AudioPlayer/AudioPlayerSeekBar.vue';
import { KeyEventType } from '../modules/KeyEventType';

type AudioBufferSourceNodePool = Record<string, AudioBufferSourceNode>;

export default defineComponent({
  emits: {
    'updatePlayTime': (playTimeSec: number) => true,
  },

  components: {
    AudioPlayerController,
    AudioPlayerSeekBar,
  },

  watch: {
    async '$data.$_audioBufferSourceNodePool'(audioBufferSourceNodePool: AudioBufferSourceNodePool) {
      if (Object.keys(audioBufferSourceNodePool).length === 0) {
        await this.$_suspend();
        this.$_seekInSec(0);
      }
    },

    '$data.$_audioBufferSourceNodesWaitingForStop'(audioBufferSourceNodesWaitingForStop: Array<AudioBufferSourceNode>) {
      if (this.$data.$_isPlaying) {
        if (audioBufferSourceNodesWaitingForStop.length === 0) return;
        let audioBufferSourceNodeWaitingForStop = this.$data.$_audioBufferSourceNodesWaitingForStop.pop();
        audioBufferSourceNodeWaitingForStop?.stop();
      }
    },

    '$data.$_isPlaying'(isPLaying: boolean) {
      if (isPLaying) {
        if (this.$data.$_audioBufferSourceNodesWaitingForStop.length === 0) return;
        let audioBufferSourceNodeWaitingForStop = this.$data.$_audioBufferSourceNodesWaitingForStop.pop();
        audioBufferSourceNodeWaitingForStop?.stop();
      }
    },

    '$data.$_loopDefinition'(loopDefinition?: AudioPlaybackLoopDefinition) {
      if (this.$_latestAudioBufferSourceNode === undefined) return;
      if (loopDefinition === undefined) {
        this.$_seekInSec(this.$_getPlayTimeSec());
        this.$_latestAudioBufferSourceNode.loop = false;
      } else {
        this.$_seekInstantlyInSec(loopDefinition.beginTimeSec);
        this.$_latestAudioBufferSourceNode.loop = true;
      }
    },
  },

  props: {
    audioBuffer:    { type: AudioBuffer, required: true },
    audioContext:   { type: AudioContext, required: true },
  },

  data(): {
    $_previousTimeSec: number,
    $_playTimeSec: number,
    $_isPlaying: boolean,
    $_isSeeking: boolean,
    $_wasPlayingOnSeek: boolean | undefined,
    $_loopDefinition?: AudioPlaybackLoopDefinition,
    $_tempLoopBeginTimeSec?: number,

    $_audioBufferSourceNodePool: AudioBufferSourceNodePool,
    $_audioBufferSourceNodesWaitingForStop: Array<AudioBufferSourceNode>,
    $_audioBufferSourceNodeStartOffsetSec: number,
    $_latestAudioBufferSourceNodeId: string | undefined,
    $_originOfCurrentTime: number,
    $_animtionFrameRequestId: number | undefined,
  } {
    return {
      $_previousTimeSec: 0,
      $_playTimeSec: 0,
      $_isPlaying: false,
      $_isSeeking: false,
      $_wasPlayingOnSeek: undefined,
      $_loopDefinition: undefined,
      $_tempLoopBeginTimeSec: undefined,

      $_audioBufferSourceNodePool: {},
      $_audioBufferSourceNodesWaitingForStop: [],
      $_audioBufferSourceNodeStartOffsetSec: 0,
      $_latestAudioBufferSourceNodeId: undefined,
      $_originOfCurrentTime: 0,
      $_animtionFrameRequestId: undefined,
    };
  },

  computed: {
    $_latestAudioBufferSourceNode(): AudioBufferSourceNode | undefined {
      if (this.$data.$_latestAudioBufferSourceNodeId === undefined) return undefined;
      if (!Object.keys(this.$data.$_audioBufferSourceNodePool).includes(this.$data.$_latestAudioBufferSourceNodeId)) return undefined;
      return this.$data.$_audioBufferSourceNodePool[this.$data.$_latestAudioBufferSourceNodeId];
    },

    $_audioPlayerSeekBar(): InstanceType<typeof AudioPlayerSeekBar> {
      return this.$refs.audioPlayerSeekBar as InstanceType<typeof AudioPlayerSeekBar>;
    }
  },

  mounted() {
    this.$data.$_animtionFrameRequestId = window.requestAnimationFrame(this.$_onRequestAnimationFrame);
    window.addEventListener('mousemove', this.$_onMousemove);
    window.addEventListener('mouseup',   this.$_onMouseup);
  },

  async beforeUnmount() {
    window.removeEventListener('mouseup',   this.$_onMouseup);
    window.removeEventListener('mousemove', this.$_onMousemove);
    if (this.$data.$_animtionFrameRequestId !== undefined) {
      window.cancelAnimationFrame(this.$data.$_animtionFrameRequestId);
    }
    if (this.$_latestAudioBufferSourceNode !== undefined) {
      this.$_requestAudioBufferSourceNodeToStop();
      await this.$_resume();
    }
    if (this.audioContext.state !== 'closed') await this.audioContext.close();
  },

  methods: {
    onKeydown(keyEventType: KeyEventType, event: KeyboardEvent) {
      if (document.activeElement !== document.body) return false;
      switch (event.code) {
        case 'Space':
          if (keyEventType === 'key') {
            (this.$data.$_isPlaying)? this.$_pause() : this.$_play();
            return true;
          }
      }
      return false;
    },

    /* private */
    $_onMousemove(mouseEvent: MouseEvent) {
      this.$_audioPlayerSeekBar.onMousemove(mouseEvent);
    },

    $_onMouseup(mouseEvent: MouseEvent) {
      this.$_audioPlayerSeekBar.onMouseup(mouseEvent);
    },

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
      if (this.$_latestAudioBufferSourceNode === undefined) {
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
    },

    async $_seekStart() {
      this.$data.$_isSeeking = true;
      this.$data.$_wasPlayingOnSeek = this.$data.$_isPlaying;
      await this.$_suspend();
    },

    async $_seekEnd() {
      this.$_requestAudioBufferSourceNodeToStop();
      this.$_createNewAudioBufferSourceNode();
      if (this.$data.$_wasPlayingOnSeek) {
        await this.$_resume();
      }
      this.$data.$_wasPlayingOnSeek = undefined;
      this.$data.$_isSeeking = false;
    },

    $_createNewAudioBufferSourceNode() {
      let newAudioBufferSourceNodeId = String(new Date().getTime());
      let newAudioBufferSourceNode = this.audioContext.createBufferSource();
      this.$data.$_latestAudioBufferSourceNodeId = newAudioBufferSourceNodeId;
      this.$data.$_audioBufferSourceNodePool[newAudioBufferSourceNodeId] = newAudioBufferSourceNode;
      newAudioBufferSourceNode.buffer = this.audioBuffer;
      newAudioBufferSourceNode.connect(this.audioContext.destination);
      newAudioBufferSourceNode.onended = () => {
        delete this.$data.$_audioBufferSourceNodePool[newAudioBufferSourceNodeId];
        this.$_suspend();
      };
      if (this.$data.$_loopDefinition !== undefined) {
        newAudioBufferSourceNode.loop = true;
        newAudioBufferSourceNode.loopStart = this.$data.$_loopDefinition.beginTimeSec;
        newAudioBufferSourceNode.loopEnd = this.$data.$_loopDefinition.endTimeSec;
      } else {
        newAudioBufferSourceNode.loop = false;
      }
      newAudioBufferSourceNode.start(0, this.$data.$_audioBufferSourceNodeStartOffsetSec);
    },

    $_getPlayTimeSec() {
      let offsetTime = this.audioContext.currentTime - this.$data.$_originOfCurrentTime;
      if (this.$_latestAudioBufferSourceNode === undefined) return offsetTime;
      if (this.$_latestAudioBufferSourceNode.loop) {
        if (offsetTime > this.$_latestAudioBufferSourceNode.loopStart) {
          let loopDuration = this.$_latestAudioBufferSourceNode.loopEnd - this.$_latestAudioBufferSourceNode.loopStart;
          let offsetFromLoopStart = (offsetTime - this.$_latestAudioBufferSourceNode.loopStart) % loopDuration;
          offsetTime = this.$_latestAudioBufferSourceNode.loopStart + offsetFromLoopStart;
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
      this.$data.$_previousTimeSec = this.$data.$_playTimeSec;
      this.$data.$_playTimeSec = playTimeSec;
      this.$emit('updatePlayTime', playTimeSec);
    },

    $_requestAudioBufferSourceNodeToStop() {
      for (let [ audioBufferSourceNodeId, audioBufferSourceNode ] of Object.entries(this.$data.$_audioBufferSourceNodePool)) {
        delete this.$data.$_audioBufferSourceNodePool[audioBufferSourceNodeId];
        this.$data.$_audioBufferSourceNodesWaitingForStop.push(audioBufferSourceNode);
        audioBufferSourceNode.onended = null;
      }
    },
  },
});
</script>