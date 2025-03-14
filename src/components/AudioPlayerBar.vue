<template>
  <v-app-bar app id="audio-player-bar" density="compact">
    <v-tooltip location="top" v-bind:text="$t('loadAudioFile')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-folder-open" size="small"
          v-bind="props"
          v-on:click.stop="$_loadAudioSource"
          v-on:keydown.enter.stop="$_loadAudioSource"
        >
        </v-btn>
      </template>
    </v-tooltip>
    <audio-player
      ref="audioPlayer" class="pr-4"
      v-if="($data.$_audioContext !== undefined) && ($data.$_audioBuffer !== undefined) && ($data.$_gainNode !== undefined)"
      v-model:volume="$data.$_volume"
      v-bind:audio-context="$data.$_audioContext"
      v-bind:audio-buffer="$data.$_audioBuffer"
      v-bind:gain-node="$data.$_gainNode"
    >
    </audio-player>
  </v-app-bar>
</template>

<style scoped>
#audio-player-bar {
  user-select: none;
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AudioPlayer from './AudioPlayer.vue';
import { loadFileAsUint8Array, getFileInterface } from '../modules/utils';

const AudioPlayerBar = defineComponent({
  setup() {
    return {
      audioPlayer: ref<InstanceType<typeof AudioPlayer>>(),
    };
  },

  emits: {
    'update:isLoopEnabled': (isLoopEnabled: boolean) => true,
    'updatePlayTime': (playTimeSec: number) => true,
  },

  watch: {
    $_gainValue(gainValue: number) {
      if (this.$data.$_gainNode === undefined) return;
      this.$data.$_gainNode.gain.value = gainValue;
    },
  },

  components: {
    AudioPlayer,
  },

  data(): {
    $_audioContext?: AudioContext,
    $_audioBuffer?: AudioBuffer,
    $_gainNode?: GainNode,
    $_volume: number,
  } {
    return {
      $_audioContext: undefined,
      $_audioBuffer: undefined,
      $_gainNode: undefined,
      $_volume: 1,
    };
  },

  computed: {
    $_gainValue(): number { return this.$data.$_volume - 1 },
  },

  methods: {
    onKeydown(event: KeyboardEvent): boolean {
      if (this.audioPlayer?.onKeydown(event)) return true;
      return false;
    },

    async $_loadAudioSource() {
      const fileInterface = await getFileInterface('audio/*');
      if (fileInterface === undefined) return;
      this.$data.$_audioContext = undefined;
      this.$data.$_audioBuffer = undefined;
      this.$data.$_gainNode = undefined;
      const audioUint8Array = await loadFileAsUint8Array(fileInterface);
      if (audioUint8Array === undefined) return;
      this.$data.$_audioContext = new AudioContext();
      this.$data.$_audioContext.suspend();
      this.$data.$_audioBuffer = await this.$data.$_audioContext.decodeAudioData(audioUint8Array.buffer);
      this.$data.$_gainNode = this.$data.$_audioContext.createGain();
      this.$data.$_gainNode.connect(this.$data.$_audioContext.destination);
      this.$data.$_gainNode.gain.value = this.$_gainValue;
    },
  },
});

export default AudioPlayerBar;
</script>