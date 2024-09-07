<template>
  <dialog-base
    v-bind:initialize-callback="$_loadData"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>{{ $t('scoreMetadata') }}</v-card-title>
  
      <v-card-text>
        <v-form
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <dialog-text-field
                  autofocus density="compact"
                  v-model="$data.$_metadata.title"
                  v-bind:rules="$_rules.title"
                  v-bind:label="$t('songTitle')"
                >
                </dialog-text-field>
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  density="compact"
                  v-model="$data.$_metadata.artistName"
                  v-bind:rules="$_rules.artistName"
                  v-bind:label="$t('artistName')"
                >
                </dialog-text-field>
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  density="compact"
                  v-model="$data.$_metadata.composerName"
                  v-bind:rules="$_rules.composerName"
                  v-bind:label="$t('composerName')"
                >
                </dialog-text-field>
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  density="compact"
                  v-model="$data.$_metadata.arrangerName"
                  v-bind:rules="$_rules.arrangerName"
                  v-bind:label="$t('arrangerName')"
                >
                </dialog-text-field>
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  density="compact"
                  v-model="$data.$_metadata.lyricistName"
                  v-bind:rules="$_rules.lyricistName"
                  v-bind:label="$t('lyricistName')"
                >
                </dialog-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DialogBase from './DialogBase.vue';
import DialogTextField from '../parts/DialogTextField.vue';
import { ScoreMetadata } from '../../modules/ScoreMetadata';

export default defineComponent({
  extends: DialogBase,

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
      $_metadata: new ScoreMetadata(),
    };
  },

  computed: {
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
    $_loadData() {
      this.$data.$_metadata = this.$store.state.score.score.metadata.clone();
    },

    async $_ok() {
      await this.$store.dispatch('score/setScoreMetadata', this.$data.$_metadata);
    },
  },
})
</script>