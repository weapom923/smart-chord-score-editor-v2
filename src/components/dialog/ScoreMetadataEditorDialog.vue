<template>
  <dialog-base
    v-model:shows="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Score Metadata</v-card-title>
  
      <v-card-text>
        <v-form
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <dialog-text-field
                  autofocus
                  v-model="$data.$_metadata.title"
                  v-bind:rules="$_rules.title"
                  label="Title"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  v-model="$data.$_metadata.artistName"
                  v-bind:rules="$_rules.artistName"
                  label="Artist Name"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  v-model="$data.$_metadata.composerName"
                  v-bind:rules="$_rules.composerName"
                  label="Composer Name"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  v-model="$data.$_metadata.arrangerName"
                  v-bind:rules="$_rules.arrangerName"
                  label="Arranger Name"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  v-model="$data.$_metadata.lyricistName"
                  v-bind:rules="$_rules.lyricistName"
                  label="Lyricist Name"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import DialogBase from './DialogBase.vue';
import DialogTextField from '../parts/DialogTextField.vue';
import { ScoreMetadata } from '../../modules/ScoreMetadata';

export default {
  components: {
    DialogBase,
    DialogTextField,
  },

  data(): {
    $_valid: boolean,
    $_metadata: ScoreMetadata,
  } {
    return {
      $_valid: true,
      $_metadata: this.$store.state.score.score.metadata.clone(),
    };
  },

  computed: {
    $_shows: {
      get(): boolean            { return this.$store.state.dialog.shows },
      async set(shows: boolean) { await this.$store.dispatch('dialog/setShows', shows) },
    },

    $_rules(): Record<string, ((arg: any)=> string | true)[]> {
      return {
        title: [],
        artistName: [],
        composerName: [],
        arrangerName: [],
        lyricistName: [],
      };
    },
  },

  methods: {
    async $_ok() {
      await this.$store.dispatch('score/setScoreMetadata', this.$data.$_metadata);
    },
  },
}
</script>