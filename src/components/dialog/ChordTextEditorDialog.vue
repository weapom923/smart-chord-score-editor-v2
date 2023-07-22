<template>
  <dialog-base
    v-model:shows="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Chord Text</v-card-title>

      <v-card-text>
        <chord-component
          v-if="$data.$_parsedChord"
          v-bind:chord="$data.$_parsedChord"
          v-bind:font-size-px="12"
        />
        <v-form
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <dialog-text-field
            autofocus density="compact"
            v-model="$data.$_tempChordText"
            v-bind:error="$_hasError"
            v-bind:error-messages="$data.$_parseErrorMessage"
            v-on:update:model-value="$_tryParseChordText"
            label="Chord Text"
          />
        </v-form>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import DialogBase from './DialogBase.vue';
import DialogTextField from '../parts/DialogTextField.vue';
import { Chord } from '../../modules/Chord';
import ChordComponent from '../ChordComponent.vue';
import chordTextParser from '../../modules/chordTextParser.js';
import { SectionAndBarIdx } from '../../modules/SectionAndBarRange';
import { Note } from '../../modules/Note';

export default {
  components: {
    DialogBase,
    DialogTextField,
    ChordComponent,
  },

  props: {
    sectionAndBarIdx: { type: SectionAndBarIdx, required: true },
    partIdx: { type: Number, required: true },
    noteIdx: { type: Number, required: true },
  },

  data(): {
    $_valid: boolean,
    $_tempChord?: Chord,
    $_tempChordText: string,
    $_parsedChord?: Chord,
    $_parseErrorMessage?: string,
  } {
    return {
      $_valid: true,
      $_tempChord: undefined,
      $_tempChordText: (this.$_chord === undefined)? '' : String(this.$_chord),
      $_parsedChord: undefined,
      $_parseErrorMessage: undefined,
    };
  },

  computed: {
    $_shows: {
      get(): boolean            { return this.$store.state.dialog.shows },
      async set(shows: boolean) { await this.$store.dispatch('dialog/setShows', shows) },
    },

    $_hasError() {
      return (this.$data.$_parseErrorMessage !== undefined);
    },

    $_note(): Note {
      return this.$store.state.score.score.getNote({
        sectionAndBarIdx: this.sectionAndBarIdx,
        partIdx: this.partIdx,
        noteIdx: this.noteIdx,
      });
    },

    $_chord(): Chord | undefined {
      if (!(this.$_note.pitchOrChord instanceof Chord)) return undefined;
      return this.$_note.pitchOrChord;
    },
  },

  methods: {
    async $_ok() {
      if (this.$data.$_tempChord !== undefined) {
        let note = this.$_note.clone();
        note.pitchOrChord = this.$data.$_tempChord;
        await this.$store.dispatch(
          'score/replaceNote',
          {
            sectionAndBarIdx: this.sectionAndBarIdx,
            partIdx: this.partIdx,
            noteIdx: this.noteIdx,
            note,
          },
        );
      }
    },

    $_tryParseChordText(chordText: string) {
      try {
        this.$data.$_tempChord = chordTextParser.parse(chordText);
        this.$data.$_parseErrorMessage = undefined;
      } catch (error) {
        this.$data.$_tempChord = undefined;
        if (error instanceof chordTextParser.ParseError) {
          this.$data.$_parseErrorMessage = 'Invalid chord text.';
        } else if (error instanceof Chord.InvalidChordError) {
          this.$data.$_parseErrorMessage = 'Invalid chord.';
        } else {
          this.$data.$_parseErrorMessage = 'Unexpected error.';
        }
      }
    }
  },
}
</script>