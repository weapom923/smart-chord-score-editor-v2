<template>
  <dialog-base v-model:shows="$_shows">
    <template v-slot:body>
      <v-card-title>Smart Chord Score Editor</v-card-title>
      <v-card-text>
        Version {{ $_appVersion.major }}.{{ $_appVersion.minor }}.{{ $_appVersion.patch }}
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import DialogBase from './DialogBase.vue';
import { AppVersion, AppVersionType } from '../../modules/AppVersion';

export default {
  components: {
    DialogBase,
  },

  computed: {
    $_shows: {
      get(): boolean            { return this.$store.state.dialog.shows },
      async set(shows: boolean) { await this.$store.dispatch('dialog/setShows', shows) },
    },

    $_appVersion(): AppVersionType {
      return AppVersion;
    },
  },
}
</script>