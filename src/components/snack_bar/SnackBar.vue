<template>
  <v-snackbar
    timeout="2000"
    v-model="$_shows"
  >
    {{ $_snackBarMessage }}
    <template v-slot:actions>
      <v-btn color="indigo" v-on:click="$_dismiss">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
export default {
  computed: {
    $_snackBarMessage(): string | undefined {
      return this.$store.state.appState.snackBarMessage;
    },

    $_shows: {
      get(): boolean { return (this.$_snackBarMessage !== undefined) },
      async set(shows: boolean) { if (!shows) await this.$_dismiss() },
    }
  },

  methods: {
    async $_dismiss() {
      await this.$store.dispatch('appState/setSnackBarMessage', undefined)
    },
  }
}
</script>