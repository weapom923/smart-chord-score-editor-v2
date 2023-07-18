<template>
  <v-btn-toggle
    mandatory
    v-model="$_noteType"
  >
    <v-btn
      size="small"
      v-for="({ title, value }, idx) of $_allNoteTypes"
      v-bind:key="idx"
      v-bind:value="value"
      v-on:keydown.stop
    >
      {{ title }}
    </v-btn>
  </v-btn-toggle>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { NoteType } from '../../modules/Note';

export default {
  emits: {
    'update:noteType': (noteType: NoteType) => true,
  },

  props: {
    noteType: { type: Object as PropType<NoteType>, required: true },
  },

  computed: {
    $_allNoteTypes(): { title: string, value: NoteType }[] {
      return [
        { title: 'Rest', value: 'rest' },
        { title: 'Note', value: 'normal' },
      ];
    },

    $_noteType: {
      get(): NoteType         { return this.noteType },
      set(noteType: NoteType) { this.$emit('update:noteType', noteType) },
    },
  },
}
</script>