<template>
  <chord-component
    v-bind:chord="chord"
  >
  </chord-component>
</template>

<script lang="ts">
import ChordComponent from './ChordComponent.vue';
import { Chord } from '../modules/Chord';
import { NotePitch } from '../modules/NotePitch';
import { TensionNotePitch } from '../modules/TensionNotePitch';

export default {
  components: {
    ChordComponent
  },

  data() {
    return {
      chord: new Chord(
        NotePitch.instance.a,
        'major',
        'majorSeventh',
        new Set<TensionNotePitch>([
          TensionNotePitch.instance.ninth,
          TensionNotePitch.instance.thirteenth,
        ]),
      ),
    };
  },
}
</script>