<template>
  <dialog-base v-model:shows="$_shows">
    <template v-slot:body>
      <v-card-title>Help</v-card-title>

      <v-card-text>
        <v-card-subtitle>Common</v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th>Keys</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td>ArrowRight</td><td>Select a next bar.</td></tr>
              <tr><td>Shift+ArrowRight</td><td>Select(expand) a next bar.</td></tr>
              <tr><td>ArrowLeft</td><td>Select a previous bar.</td></tr>
              <tr><td>Shift+ArrowLeft</td><td>Select(expand) a previous bar.</td></tr>
              <tr><td>Ctrl+Z</td><td>Undo a change.</td></tr>
              <tr><td>Ctrl+Shift+Z</td><td>Redo a change.</td></tr>
              <tr><td>Ctrl+S</td><td>Save a score to local storage.</td></tr>
              <tr><td>Ctrl+C</td><td>Copy selected bars.</td></tr>
              <tr><td>Ctrl+V</td><td>Paste copied bars on a selected bar.</td></tr>
              <tr><td>Alt+N</td><td>Insert a new bar after selected bars.</td></tr>
              <tr><td>Alt+Shift+N</td><td>Insert a new bar before selected bars.</td></tr>
              <tr><td>Alt+M</td><td>Insert a new section after selected sections.</td></tr>
              <tr><td>Alt+Shift+M</td><td>Insert a new section before selected sections.</td></tr>
              <tr><td>Delete</td><td>Delete selected bars.</td></tr>
              <tr><td>Enter</td><td>Break a system before a selected bar.</td></tr>
              <tr><td>Shift+Enter</td><td>Break a page before a selected bar.</td></tr>
              <tr><td>Backspace</td><td>Remove a break before a selected bar.</td></tr>
              <tr><td>E</td><td>Open/close a bar editor.</td></tr>
              <tr><td>H</td><td>Show a help dialog.</td></tr>
              <tr><td>P</td><td>Enable a print layout.</td></tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-subtitle>Audio Player</v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th>Keys</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td>Space</td><td>Play/pause.</td></tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-subtitle>Bar editor</v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th>Keys</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td>L</td><td>Select a next note.</td></tr>
              <tr><td>H</td><td>Select a previous note.</td></tr>
              <tr><td>N</td><td>Select a next bar.</td></tr>
              <tr><td>B</td><td>Select a previous bar.</td></tr>
              <tr><td>C</td><td>Open a chord text dialog.</td></tr>
              <tr><td>F</td><td>Fill a selected bar with a new note.</td></tr>
              <tr><td>Shift+F</td><td>Fill a selected bar with a new rest note.</td></tr>
              <tr><td>D</td><td>Delete a selected note.</td></tr>
              <tr><td>T</td><td>Tie/untie a selected note to a previous note.</td></tr>
              <tr><td>R</td><td>Convert a selected note to a rest/normal note.</td></tr>
              <tr><td>Y</td><td>Copy a selected note.</td></tr>
              <tr><td>P</td><td>Paste a copied note content.</td></tr>
              <tr><td>U</td><td>Undo a change.</td></tr>
              <tr><td>Ctrl+R</td><td>Redo a change.</td></tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import DialogBase from './DialogBase.vue';

export default {
  components: {
    DialogBase,
  },

  computed: {
    $_shows: {
      get(): boolean            { return this.$store.state.dialog.shows },
      async set(shows: boolean) { await this.$store.dispatch('dialog/setShows', shows) },
    },
  },
}
</script>