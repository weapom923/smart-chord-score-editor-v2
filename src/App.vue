<template>
  <v-app id="app">
    <app-bar
      class="no-print" theme="dark"
      v-if="!$store.state.appState.isPrintLayoutEnabled"
    >
    </app-bar>

    <v-main
      v-on:mousedown="$_onClickBackground"
    >
      <div
        id="score-page-container"
        class="d-flex flex-column align-center"
      >
        <v-btn
          variant="outlined"
          v-if="$_score.numSections === 0"
          v-on:click="$_generateNewSection"
          v-bind:text="$t('generateNewSection')"
        >
        </v-btn>
        <score-page
          v-for="(scorePageSectionAndBarRange, scorePageDefinitionIdx) of $_scorePageSectionAndBarRanges"
          v-bind:key="scorePageDefinitionIdx"
          v-bind:section-and-bar-range="scorePageSectionAndBarRange"
          v-bind:score-page-index="scorePageDefinitionIdx"
          v-bind:num-score-pages="$_scorePageSectionAndBarRanges.length"
        >
        </score-page>
      </div>
      
      <component
        v-if="$store.state.dialog.dialog"
        v-model="$store.state.dialog.shows"
        v-bind:is="$store.state.dialog.dialog?.componentName"
        v-bind="$store.state.dialog.dialog?.props"
      >
      </component>
    </v-main>

    <snack-bar class="no-print"></snack-bar>

    <v-footer
      class="pa-0 no-print"
      ref="footer"
      v-show="!$store.state.appState.isPrintLayoutEnabled"
      v-bind:app="!$store.state.appState.isPrintLayoutEnabled"
    >
      <v-card class="w-100 rounded-0">
        <v-toolbar theme="dark" height="20">
          <v-spacer></v-spacer>
          <v-btn
            size="small" icon
            v-show="$store.state.score.selectedBars !== undefined"
            v-on:click="$_toggleFooterEditorMaximizedAndMinimized"
          >
            <v-icon>
              <template v-if="$store.state.appState.isFooterEditorMinimized">mdi-window-maximize</template>
              <template v-else>mdi-window-minimize</template>
            </v-icon>
          </v-btn>
        </v-toolbar>

        <audio-player-bar ref="audioPlayerBar"></audio-player-bar>

        <editor-component
          ref="editorComponent"
          v-if="($store.state.score.selectedBars !== undefined) && !$store.state.appState.isFooterEditorMinimized"
        >
        </editor-component>
      </v-card>
    </v-footer>
  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Klee+One:wght@600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Klee+One:wght@400&display=swap');

#app {
  font-family: 'Klee One';
  text-align: center;
  color: #2c3e50;
  min-width: fit-content;
}

@media print {
  .no-print {
    display: none !important;
  }

  #score-page-container {
    align-items: baseline !important;
  }
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import GlobalConfigEditorDialog from './components/dialog/GlobalConfigEditorDialog.vue';
import ScoreMetadataEditorDialog from './components/dialog/ScoreMetadataEditorDialog.vue';
import SectionEditorDialog from './components/dialog/SectionEditorDialog.vue';
import GenerateSectionDialog from './components/dialog/GenerateSectionDialog.vue';
import ChordTextEditorDialog from './components/dialog/ChordTextEditorDialog.vue';
import AppInfoDialog from './components/dialog/AppInfoDialog.vue';
import HelpDialog from './components/dialog/HelpDialog.vue';
import AudioPlayerBar from './components/AudioPlayerBar.vue';
import AppBar from './components/AppBar.vue';
import ScorePage from './components/ScorePage.vue';
import SnackBar from './components/snack_bar/SnackBar.vue';
import EditorComponent from './components/footer_editor/EditorComponent.vue';
import { Score } from './modules/Score';
import { BarBreak, bb } from './modules/BarBreak';
import { SectionAndBarRange, SectionAndBarIdx } from './modules/SectionAndBarRange';
import { getKeyEventType } from './modules/KeyEventType';
import { downloadFile } from './modules/utils';
import { ScoreMetadata } from './modules/ScoreMetadata';

const App = defineComponent({
  name: 'App',

  components: {
    AppBar,
    AudioPlayerBar,
    ScorePage,
    SnackBar,
    EditorComponent,
    GlobalConfigEditorDialog,
    ScoreMetadataEditorDialog,
    SectionEditorDialog,
    GenerateSectionDialog,
    ChordTextEditorDialog,
    AppInfoDialog,
    HelpDialog,
  },

  watch: {
    $_scoreMetadata: {
      handler(scoreMetadata: ScoreMetadata) { document.title = `${scoreMetadata.title} - ${scoreMetadata.artistName}` },
      immediate: true,
    },

    '$store.state.config.locale'(locale) {
      this.$i18n.locale = locale;
    },

    score: {
      async handler(score?: Score) {
        if (score !== undefined) {
          await this.$store.dispatch('score/setScore', score);
          await this.$store.dispatch('score/clearChangeHistory');
        }
      },
      immediate: true,
    }
  },

  props: {
    score: { type: Score },
  },

  computed: {
    $_scoreMetadata(): ScoreMetadata { return this.$store.state.score.score.metadata },

    $_score(): Score { return this.$store.state.score.score },

    $_scorePageSectionAndBarRanges(): SectionAndBarRange[] {
      let sectionAndBarRanges: SectionAndBarRange[] = [];
      let sectionAndBarIdx: SectionAndBarIdx | undefined = this.$_score.firstSectionAndBarIdx;
      let pageFirstSectionAndBarIdx: SectionAndBarIdx | undefined = undefined;
      while (sectionAndBarIdx !== undefined) {
        if (pageFirstSectionAndBarIdx === undefined) {
          pageFirstSectionAndBarIdx = sectionAndBarIdx.clone();
        }
        let bar = this.$_score.getBar(sectionAndBarIdx);
        if (bar.break.isEqualTo(bb.page)) {
          sectionAndBarRanges.push(new SectionAndBarRange(pageFirstSectionAndBarIdx, sectionAndBarIdx));
          pageFirstSectionAndBarIdx = undefined;
        }
        sectionAndBarIdx = this.$_score.getNextSectionAndBarIdx(sectionAndBarIdx);
      }
      if ((pageFirstSectionAndBarIdx !== undefined) && (this.$_score.lastSectionAndBarIdx !== undefined)) {
        sectionAndBarRanges.push(
          new SectionAndBarRange(
            pageFirstSectionAndBarIdx,
            this.$_score.lastSectionAndBarIdx,
          ),
        );
      }
      return sectionAndBarRanges;
    },
  },

  created() {
    window.addEventListener('keydown', this.onKeydown);
  },

  async mounted() {
    await this.$store.dispatch('config/loadConfigFromCookie');
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  },

  methods: {
    async $_onClickBackground() {
      await this.$store.dispatch('score/unselectBar');
      await this.$store.dispatch('appState/setIsPrintLayoutEnabled', false);
    },

    async $_toggleFooterEditorMaximizedAndMinimized() {
      await this.$store.dispatch('appState/setIsFooterEditorMinimized', !this.$store.state.appState.isFooterEditorMinimized);
    },

    async $_generateNewSection() {
      await this.$store.dispatch(
        'dialog/setDialog',
        {
          componentName: 'generate-section-dialog',
          props: {
            sectionIdx: 0,
          },
        },
      );
    },

    async onKeydown(event: KeyboardEvent) {
      if (await this.$_onKeydown(event)) event.preventDefault() 
    },

    async $_onKeydown(event: KeyboardEvent) {
      let keyEventType = getKeyEventType(event);
      let editorComponent = this.$refs.editorComponent as InstanceType<typeof EditorComponent> | null | undefined;
      if ((editorComponent !== undefined) && (editorComponent !== null)) {
        if (await editorComponent.onKeydown(keyEventType, event)) return true;
      }
      let audioPlayerBar = this.$refs.audioPlayerBar as InstanceType<typeof AudioPlayerBar> | null | undefined;
      if ((audioPlayerBar !== undefined) && (audioPlayerBar !== null)) {
        if (audioPlayerBar.onKeydown(keyEventType, event)) return true;
      }
      if (this.$store.state.appState.isPrintLayoutEnabled) {
        await this.$store.dispatch('appState/setIsPrintLayoutEnabled', false);
        return true;
      }
      switch (keyEventType) {
        case 'key':
          switch (event.code) {
            case 'Escape':
              await this.$store.dispatch('score/unselectBar');
              return true;
            case 'ArrowRight':
              await this.$store.dispatch('score/selectNextBar');
              return true;
            case 'ArrowLeft':
              await this.$store.dispatch('score/selectPreviousBar');
              return true;
            case 'Enter':
              return setBarBreak.call(this, bb.system);
            case 'Backspace':
              return setBarBreak.call(this, bb.empty);
            case 'Delete':
              return await removeSelectedBars.call(this);
            case 'KeyH':
              this.$store.dispatch('dialog/setDialog', { componentName: 'help-dialog' });
              return true;
            case 'KeyE':
              await this.$store.dispatch('appState/setIsFooterEditorMinimized', !this.$store.state.appState.isFooterEditorMinimized);
              return true;
            case 'KeyP':
              await this.$store.dispatch('appState/setIsPrintLayoutEnabled', true);
              return true;
          }
          break;
        case 'key_with_alt':
          switch (event.code) {
            case 'KeyN':
              return await insertBarAfter.call(this);
            case 'KeyM':
              return await insertSectionAfter.call(this);
          }
          break;
        case 'key_with_ctrl':
          switch (event.code) {
            case 'KeyA':
              await this.$store.dispatch('score/selectAllBars');
              return true;
            case 'KeyC':
              return await copySelectedBars.call(this);
            case 'KeyV':
              return await pasteSelectedBarPartOnly.call(this);
            case 'KeyZ':
              await this.$store.dispatch('score/undo');
              return true;
            case 'KeyS':
              downloadFile(
                `${this.$store.state.score.score.metadata.title}.json`,
                this.$_score.dumpJson(),
                'application/json',
              );
              return true;
          }
          break;
        case 'key_with_shift':
          switch (event.code) {
            case 'ArrowRight':
              return await incrementSelectedBarsLastIdx.call(this);
            case 'ArrowLeft':
              return await decrementSelectedBarsLastIdx.call(this);
            case 'Enter':
              return setBarBreak.call(this, bb.page);
          }
          break;
        case 'key_with_alt_and_shift':
          switch (event.code) {
            case 'KeyN':
              return await insertBarBefore.call(this);
            case 'KeyM':
              return insertSectionBefore.call(this);
          }
          break;
        case 'key_with_ctrl_and_shift':
          switch (event.code) {
            case 'KeyV':
              return await pasteSelectedBar.call(this);
            case 'KeyZ':
              await this.$store.dispatch('score/redo');
              return true;
            case 'ArrowRight':
              return await incrementSelectedBarsFirstIdx.call(this);
            case 'ArrowLeft':
              return await decrementSelectedBarsFirstIdx.call(this);
          }
          break;
        case 'repeated_key':
          switch (event.code) {
            case 'ArrowRight':
              await this.$store.dispatch('score/selectNextBar');
              return true;
            case 'ArrowLeft':
              await this.$store.dispatch('score/selectPreviousBar');
              return true;
          }
          break;
        case 'repeated_key_with_ctrl':
          break;
        case 'repeated_key_with_shift':
          switch (event.code) {
            case 'ArrowRight':
              return await incrementSelectedBarsLastIdx.call(this);
            case 'ArrowLeft':
              return await decrementSelectedBarsLastIdx.call(this);
          }
          break;
        case 'repeated_key_with_ctrl_and_shift':
          switch (event.code) {
            case 'ArrowRight':
              return await incrementSelectedBarsFirstIdx.call(this);
            case 'ArrowLeft':
              return await decrementSelectedBarsFirstIdx.call(this);
          }
          break;
      }
      return false;

      type This = InstanceType<typeof App>;
      async function incrementSelectedBarsLastIdx(this: This): Promise<boolean> {
        await this.$store.dispatch('score/incrementSelectedBarsLastIdx');
        return true;
      }

      async function decrementSelectedBarsLastIdx(this: This): Promise<boolean> {
        await this.$store.dispatch('score/decrementSelectedBarsLastIdx');
        return true;
      }

      async function incrementSelectedBarsFirstIdx(this: This): Promise<boolean> {
        await this.$store.dispatch('score/incrementSelectedBarsFirstIdx');
        return true;
      }

      async function decrementSelectedBarsFirstIdx(this: This): Promise<boolean> {
        await this.$store.dispatch('score/decrementSelectedBarsFirstIdx');
        return true;
      }

      async function setBarBreak(this: This, barBreak: BarBreak): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        let sectionAndBarIdx = this.$_score.getPreviousSectionAndBarIdx(this.$store.state.score.selectedBars.first);
        if (sectionAndBarIdx === undefined) return false;
        await this.$store.dispatch( 'score/setBarBreak', { sectionAndBarIdx, barBreak });
        return true;
      }

      async function copySelectedBars(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        await this.$store.dispatch('score/setCopiedBars', this.$store.state.score.selectedBars);
        return true;
      }

      async function pasteSelectedBar(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        await this.$store.dispatch('score/pasteCopiedBars', this.$store.state.score.selectedBars);
        return true;
      }

      async function pasteSelectedBarPartOnly(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        await this.$store.dispatch('score/pasteCopiedBarsPartOnly', this.$store.state.score.selectedBars);
        return true;
      }

      async function insertBarBefore(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        let baseSectionAndBarIdx = this.$store.state.score.selectedBars.first;
        let baseBar = this.$_score.getBar(baseSectionAndBarIdx);
        let targetSectionAndBarIdx = baseSectionAndBarIdx;
        await this.$store.dispatch(
          'score/insertBars',
          {
            sectionAndBarIdx: targetSectionAndBarIdx,
            bars: [ baseBar.generateEmptyFrom() ],
          },
        );
        return true;
      }

      async function insertBarAfter(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        let baseSectionAndBarIdx = this.$store.state.score.selectedBars.last;
        let baseBar = this.$_score.getBar(baseSectionAndBarIdx);
        let targetSectionAndBarIdx = new SectionAndBarIdx(baseSectionAndBarIdx.sectionIdx, baseSectionAndBarIdx.barIdx + 1);
        await this.$store.dispatch(
          'score/insertBars',
          {
            sectionAndBarIdx: targetSectionAndBarIdx,
            bars: [ baseBar.generateEmptyFrom() ],
          },
        );
        return true;
      }

      async function insertSectionBefore(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        let baseSectionIdx = this.$store.state.score.selectedBars.first.sectionIdx;
        let baseSection = this.$_score.getSection(baseSectionIdx);
        let baseBar = baseSection.firstBar;
        await this.$store.dispatch(
          'dialog/setDialog',
          {
            componentName: 'generate-section-dialog',
            props: {
              sectionIdx: baseSectionIdx,
              barValue: baseBar.value,
              clef: baseBar.clef,
              scale: baseBar.scale,
              partInBarTypes: baseBar.parts.map(part => part.type),
              gridNoteValue: baseBar.gridNoteValue,
            },
          },
        );
        return true;
      }

      async function insertSectionAfter(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        let baseSectionIdx = this.$store.state.score.selectedBars.last.sectionIdx;
        let baseSection = this.$_score.getSection(baseSectionIdx);
        let baseBar = baseSection.lastBar;
        await this.$store.dispatch(
          'dialog/setDialog',
          {
            componentName: 'generate-section-dialog',
            props: {
              sectionIdx: baseSectionIdx + 1,
              barValue: baseBar.value,
              clef: baseBar.clef,
              scale: baseBar.scale,
              partInBarTypes: baseBar.parts.map(part => part.type),
              gridNoteValue: baseBar.gridNoteValue,
            },
          },
        );
        return true;
      }

      async function removeSelectedBars(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        await this.$store.dispatch('score/removeBars', this.$store.state.score.selectedBars);
        return true;
      }
    },
  },
});

export default App;
</script>
