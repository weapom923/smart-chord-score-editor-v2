<template>
  <dialog-base
    v-bind:initialize-callback="$_loadData"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>{{ $t('chordText') }}</v-card-title>

      <v-card-text>
        <chord-component
          v-if="$data.$_parsedChord"
          v-bind:chord="$data.$_parsedChord"
          v-bind:font-size-px="12"
          v-bind:color="$_color"
        >
        </chord-component>
        <v-form
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <dialog-text-field
            autofocus density="compact"
            v-model="$data.$_tempChordText"
            v-bind:label="$t('chordText')"
            v-bind:error="$_hasError"
            v-bind:error-messages="$data.$_parseErrorMessage"
            v-on:update:model-value="$_tryParseChordText"
          >
          </dialog-text-field>
        </v-form>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DialogBase from './DialogBase.vue';
import DialogTextField from '../parts/DialogTextField.vue';
import { Chord } from '../../modules/Chord';
import { Color } from '../../modules/Color';
import ChordComponent from '../ChordComponent.vue';
import chordTextParser from '../../modules/chordTextParser.js';
import { SectionAndBarIdx } from '../../modules/SectionAndBarRange';
import { Note } from '../../modules/Note';

export default defineComponent({
  extends: DialogBase,

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
      $_tempChordText: '',
      $_parsedChord: undefined,
      $_parseErrorMessage: undefined,
    };
  },

  computed: {
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

    $_color(): Color {
      return this.$store.state.config.chordTextColor;
    },
  },

  methods: {
    $_loadData() {
      this.$data.$_tempChordText = (this.$_chord === undefined)? '' : String(this.$_chord);
    },

    async $_ok() {
      if (this.$data.$_tempChord !== undefined) {
        const note = this.$_note.clone();
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
})
</script>