<template>
  <dialog-base>
    <template v-slot:body>
      <v-card-title>{{ $t('helpMessage.help') }}</v-card-title>

      <v-card-text>
        <v-card-subtitle>{{ $t('helpMessage.common') }}</v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th>{{ $t('helpMessage.keys') }}</th><th>{{ $t('helpMessage.description') }}</th></tr>
            </thead>
            <tbody>
              <tr><td>→</td><td>{{ $t('helpMessage.selectNextBar') }}</td></tr>
              <tr><td>Shift + →</td><td>{{ $t('helpMessage.selectExpandNextBar') }}</td></tr>
              <tr><td>Shift + ←</td><td>{{ $t('helpMessage.selectShrinkNextBar') }}</td></tr>
              <tr><td>←</td><td>{{ $t('helpMessage.selectPreviousBar') }}</td></tr>
              <tr><td>Ctrl + Shift + ←</td><td>{{ $t('helpMessage.selectExpandPreviousBar') }}</td></tr>
              <tr><td>Ctrl + Shift + →</td><td>{{ $t('helpMessage.selectShrinkPreviousBar') }}</td></tr>
              <tr><td>Ctrl + Z</td><td>{{ $t('helpMessage.undo') }}</td></tr>
              <tr><td>Ctrl + Shift + Z</td><td>{{ $t('helpMessage.redo') }}</td></tr>
              <tr><td>Ctrl + S</td><td>{{ $t('helpMessage.saveScore') }}</td></tr>
              <tr><td>Ctrl + C</td><td>{{ $t('helpMessage.copySelectedBars') }}</td></tr>
              <tr><td>Ctrl + V</td><td>{{ $t('helpMessage.pasteCopiedBars') }}</td></tr>
              <tr><td>Alt + N</td><td>{{ $t('helpMessage.insertNewBarAfter') }}</td></tr>
              <tr><td>Alt + Shift + N</td><td>{{ $t('helpMessage.insertNewBarBefore') }}</td></tr>
              <tr><td>Alt + M</td><td>{{ $t('helpMessage.insertNewSectionAfter') }}</td></tr>
              <tr><td>Alt + Shift + M</td><td>{{ $t('helpMessage.insertNewSectionBefore') }}</td></tr>
              <tr><td>Delete</td><td>{{ $t('helpMessage.deleteSelectedBars') }}</td></tr>
              <tr><td>Enter</td><td>{{ $t('helpMessage.breakSystem') }}</td></tr>
              <tr><td>Shift + Enter</td><td>{{ $t('helpMessage.breakPage') }}</td></tr>
              <tr><td>Backspace</td><td>{{ $t('helpMessage.removeBreak') }}</td></tr>
              <tr><td>E</td><td>{{ $t('helpMessage.openOrCloseBarEditor') }}</td></tr>
              <tr><td>H</td><td>{{ $t('helpMessage.showHelp') }}</td></tr>
              <tr><td>P</td><td>{{ $t('helpMessage.enablePrintLayout') }}</td></tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-subtitle>{{ $t('helpMessage.audioPlayer') }}</v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th>{{ $t('helpMessage.keys') }}</th><th>{{ $t('helpMessage.description') }}</th></tr>
            </thead>
            <tbody>
              <tr><td>Space</td><td>{{ $t('helpMessage.playOrPause') }}</td></tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-subtitle>{{ $t('helpMessage.barEditor') }}</v-card-subtitle>
        <v-card-text>
          <v-table density="compact" class="text-left">
            <thead>
              <tr><th>{{ $t('helpMessage.keys') }}</th><th>{{ $t('helpMessage.description') }}</th></tr>
            </thead>
            <tbody>
              <tr><td>L</td><td>{{ $t('helpMessage.selectNextNote') }}</td></tr>
              <tr><td>H</td><td>{{ $t('helpMessage.selectPreviousNote') }}</td></tr>
              <tr><td>N</td><td>{{ $t('helpMessage.selectNextBar') }}</td></tr>
              <tr><td>B</td><td>{{ $t('helpMessage.selectPreviousBar') }}</td></tr>
              <tr><td>C</td><td>{{ $t('helpMessage.openChordTextDialog') }}</td></tr>
              <tr><td>F</td><td>{{ $t('helpMessage.fillSelectedBarWithNewNote') }}</td></tr>
              <tr><td>Shift + F</td><td>{{ $t('helpMessage.fillSelectedBarWithNewRestNote') }}</td></tr>
              <tr><td>D</td><td>{{ $t('helpMessage.deleteSelectedNote') }}</td></tr>
              <tr><td>T</td><td>{{ $t('helpMessage.tieOrUntieSelectedNoteToPreviousNote') }}</td></tr>
              <tr><td>R</td><td>{{ $t('helpMessage.convertSelectedNoteToRestOrNormal') }}</td></tr>
              <tr><td>Y</td><td>{{ $t('helpMessage.copySelectedNote') }}</td></tr>
              <tr><td>P</td><td>{{ $t('helpMessage.pasteSelectedNoteContent') }}</td></tr>
              <tr><td>U</td><td>{{ $t('helpMessage.undo') }}</td></tr>
              <tr><td>Ctrl + R</td><td>{{ $t('helpMessage.redo') }}</td></tr>
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
  extends: DialogBase,

  components: {
    DialogBase,
  },
}
</script>