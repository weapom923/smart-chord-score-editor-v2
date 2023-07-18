<template>
  <dialog-base
    v-model:shows="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Section</v-card-title>

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
                  v-model="$data.$_sectionName"
                  v-bind:rules="$_rules.sectionName"
                  label="Name"
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
import { isEmptyLike } from '../../modules/utils';

export default {
  components: {
    DialogBase,
    DialogTextField,
  },

  props: {
    sectionIdx: { type: Number, required: true },
  },

  data(): {
    $_valid: boolean,
    $_sectionName: string,
  } {
    return {
      $_valid: true,
      $_sectionName: this.$store.state.score.score.getSection(this.sectionIdx).name,
    };
  },

  computed: {
    $_shows: {
      get(): boolean            { return this.$store.state.dialog.shows },
      async set(shows: boolean) { await this.$store.dispatch('dialog/setShows', shows) },
    },

    $_rules(): { [key: string]: ((value: any) => string | true)[] } {
      return {
        sectionName: [
          (value: any) => (isEmptyLike(value)? 'Section name must not be empty.' : true),
        ],
      };
    },
  },

  methods: {
    async $_ok() {
      await this.$store.dispatch(
        'score/setSectionName',
        {
          sectionIdx: this.sectionIdx,
          sectionName: this.$data.$_sectionName,
        },
      );
    },
  },
}
</script>