<template>
  <v-toolbar
    id="audio-player-bar" density="compact"
    v-on:keydown.stop
    v-on:click.stop
  >
    <v-tooltip location="top" v-bind:text="$t('loadAudioFile')">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-folder-open" size="small"
          v-bind="props"
          v-on:click="$_loadAudioSource"
        >
        </v-btn>
      </template>
    </v-tooltip>
    <audio-player
      ref="audioPlayer" class="pr-4"
      v-if="($data.$_audioContext !== undefined) && ($data.$_audioBuffer !== undefined)"
      v-bind:audio-context="$data.$_audioContext"
      v-bind:audio-buffer="$data.$_audioBuffer"
    >
    </audio-player>
  </v-toolbar>
</template>

<style scoped>
#audio-player-bar {
  user-select: none;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import AudioPlayer from './AudioPlayer.vue';
import { loadFileAsUint8Array, getFileInterface } from '../modules/utils';
import { KeyEventType } from '../modules/KeyEventType'

const AudioPlayerBar = defineComponent({
  emits: {
    'update:isLoopEnabled': (isLoopEnabled: boolean) => true,
    'updatePlayTime': (playTimeSec: number) => true,
  },

  components: {
    AudioPlayer,
  },

  data(): {
    $_audioContext?: AudioContext,
    $_audioBuffer?: AudioBuffer,
  } {
    return {
      $_audioContext: undefined,
      $_audioBuffer: undefined,
    };
  },

  methods: {
    $_getAudioPlayer(): InstanceType<typeof AudioPlayer> | undefined | null {
      return this.$refs.audioPlayer as any;
    },

    onKeydown(keyEventType: KeyEventType, event: KeyboardEvent): boolean {
      return this.$_getAudioPlayer()?.onKeydown(keyEventType, event) ?? false;
    },

    async $_loadAudioSource() {
      let fileInterface = await getFileInterface('audio/*');
      if (fileInterface === undefined) return;
      let audioUint8Array = await loadFileAsUint8Array(fileInterface);
      if (audioUint8Array === undefined) return;
      this.$data.$_audioContext = new AudioContext();
      this.$data.$_audioContext.suspend();
      this.$data.$_audioBuffer = await this.$data.$_audioContext.decodeAudioData(audioUint8Array.buffer);
    },
  },
});

export default AudioPlayerBar;
</script>