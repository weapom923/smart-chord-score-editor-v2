<template>
  <dialog-base v-model:shows="$_shows">
    <template v-slot:body>
      <v-card-title v-text="$t('helpMessage.help')"></v-card-title>

      <v-card-text>
        <v-card-subtitle v-text="$t('helpMessage.common')"></v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th v-text="$t('helpMessage.keys')"></th><th v-text="$t('helpMessage.description')"></th></tr>
            </thead>
            <tbody>
              <tr><td>→</td><td v-text="$t('helpMessage.selectNextBar')"></td></tr>
              <tr><td>Shift + →</td><td v-text="$t('helpMessage.selectExpandNextBar')"></td></tr>
              <tr><td>Shift + ←</td><td v-text="$t('helpMessage.selectShrinkNextBar')"></td></tr>
              <tr><td>←</td><td v-text="$t('helpMessage.selectPreviousBar')"></td></tr>
              <tr><td>Ctrl + Shift + ←</td><td v-text="$t('helpMessage.selectExpandPreviousBar')"></td></tr>
              <tr><td>Ctrl + Shift + →</td><td v-text="$t('helpMessage.selectShrinkPreviousBar')"></td></tr>
              <tr><td>Ctrl + Z</td><td v-text="$t('helpMessage.undo')"></td></tr>
              <tr><td>Ctrl + Shift + Z</td><td v-text="$t('helpMessage.redo')"></td></tr>
              <tr><td>Ctrl + S</td><td v-text="$t('helpMessage.saveScore')"></td></tr>
              <tr><td>Ctrl + C</td><td v-text="$t('helpMessage.copySelectedBars')"></td></tr>
              <tr><td>Ctrl + V</td><td v-text="$t('helpMessage.pasteCopiedBars')"></td></tr>
              <tr><td>Alt + N</td><td v-text="$t('helpMessage.insertNewBarAfter')"></td></tr>
              <tr><td>Alt + Shift + N</td><td v-text="$t('helpMessage.insertNewBarBefore')"></td></tr>
              <tr><td>Alt + M</td><td v-text="$t('helpMessage.insertNewSectionAfter')"></td></tr>
              <tr><td>Alt + Shift + M</td><td v-text="$t('helpMessage.insertNewSectionBefore')"></td></tr>
              <tr><td>Delete</td><td v-text="$t('helpMessage.deleteSelectedBars')"></td></tr>
              <tr><td>Enter</td><td v-text="$t('helpMessage.breakSystem')"></td></tr>
              <tr><td>Shift + Enter</td><td v-text="$t('helpMessage.breakPage')"></td></tr>
              <tr><td>Backspace</td><td v-text="$t('helpMessage.removeBreak')"></td></tr>
              <tr><td>E</td><td v-text="$t('helpMessage.openOrCloseBarEditor')"></td></tr>
              <tr><td>H</td><td v-text="$t('helpMessage.showHelp')"></td></tr>
              <tr><td>P</td><td v-text="$t('helpMessage.enablePrintLayout')"></td></tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-subtitle v-text="$t('helpMessage.audioPlayer')"></v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th v-text="$t('helpMessage.keys')"></th><th>{{ $t('helpMessage.description') }}</th></tr>
            </thead>
            <tbody>
              <tr><td>Space</td><td v-text="$t('helpMessage.playOrPause')"></td></tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-subtitle>Bar editor</v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th>{{ $t('helpMessage.keys') }}</th><th>{{ $t('helpMessage.description') }}</th></tr>
            </thead>
            <tbody>
              <tr><td>L</td><td v-text="$t('helpMessage.selectNextNote')"></td></tr>
              <tr><td>H</td><td v-text="$t('helpMessage.selectPreviousNote')"></td></tr>
              <tr><td>N</td><td v-text="$t('helpMessage.selectNextBar')"></td></tr>
              <tr><td>B</td><td v-text="$t('helpMessage.selectPreviousBar')"></td></tr>
              <tr><td>C</td><td v-text="$t('helpMessage.openChordTextDialog')"></td></tr>
              <tr><td>F</td><td v-text="$t('helpMessage.fillSelectedBarWithNewNote')"></td></tr>
              <tr><td>Shift + F</td><td v-text="$t('helpMessage.fillSelectedBarWithNewRestNote')"></td></tr>
              <tr><td>D</td><td v-text="$t('helpMessage.deleteSelectedNote')"></td></tr>
              <tr><td>T</td><td v-text="$t('helpMessage.tieOrUntieSelectedNoteToPreviousNote')"></td></tr>
              <tr><td>R</td><td v-text="$t('helpMessage.convertSelectedNoteToRestOrNormal')"></td></tr>
              <tr><td>Y</td><td v-text="$t('helpMessage.copySelectedNote')"></td></tr>
              <tr><td>P</td><td v-text="$t('helpMessage.pasteSelectedNoteContent')"></td></tr>
              <tr><td>U</td><td v-text="$t('helpMessage.undo')"></td></tr>
              <tr><td>Ctrl + R</td><td v-text="$t('helpMessage.redo')"></td></tr>
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