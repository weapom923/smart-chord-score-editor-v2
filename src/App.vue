<template>
  <v-app
    id="app"
    v-on:contextmenu="$_onContextmenu"
  >
    <app-bar
      class="no-print" color="secondary" flat
      v-if="!$store.state.appState.isPrintLayoutEnabled"
    >
    </app-bar>

    <v-main
      v-bind:scrollable="!$store.state.appState.isPrintLayoutEnabled"
      v-on:mousedown.left="$_onClickBackground"
    >
      <div
        class="score-row-container"
        v-bind:class="{ 'print-layout': $store.state.appState.isPrintLayoutEnabled }"
        v-bind:key="$data.$_forceRemountKey"
      >
        <div
          class="score-page-row-container"
          v-for="(scorePageProps, rowIdx) of $_scorePagePropsByRows"
          v-bind:key="rowIdx"
          v-bind:class="{ 'print-layout': $store.state.appState.isPrintLayoutEnabled }"
        >
          <score-page
            v-for="(scorePageProp, scorePageDefinitionIdx) of scorePageProps"
            v-bind:key="scorePageDefinitionIdx"
            v-bind="scorePageProp"
          >
          </score-page>
        </div>
      </div>
      
      <component
        ref="dialog"
        v-if="$store.state.dialog.dialog"
        v-bind:is="$store.state.dialog.dialog?.componentName"
        v-bind="$store.state.dialog.dialog?.props"
      >
      </component>

      <context-menu
        v-if="!$store.state.appState.isPrintLayoutEnabled"
      >
      </context-menu>
    </v-main>

    <snack-bar class="no-print"></snack-bar>

    <audio-player-bar
      ref="audioPlayerBar"
      class="no-print"
      color="primary"
      location="bottom"
      v-if="!$store.state.appState.isPrintLayoutEnabled"
    >
    </audio-player-bar>

    <bar-editor-drawer
      ref="barEditorDrawer"
      class="no-print"
      v-if="!$store.state.appState.isPrintLayoutEnabled"
      v-bind:window-inner-width-px="$data.$_windowInnerWidthPx"
      v-bind:window-inner-height-px="$data.$_windowInnerHeightPx"
    >
    </bar-editor-drawer>
  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Klee+One:wght@600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Klee+One:wght@400&display=swap');
@media print {
  .no-print {
    display: none !important;
  }
}
</style>

<style scoped>
:deep(.v-main__scroller) {
  scrollbar-width: thin;
}

#app {
  font-family: 'Klee One';
  text-align: center;
  color: #2c3e50;
  min-width: fit-content;
}

.score-row-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  margin: 0 auto;
  gap: 20px;
}

.score-page-row-container {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
  margin: 0 auto;
  gap: 20px;
}

.score-row-container.print-layout {
  margin: 0;
  gap: 0;
}

.score-page-row-container.print-layout {
  flex-direction: column;
  margin: 0;
  gap: 0;
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import GlobalConfigEditorDialog from './components/dialog/GlobalConfigEditorDialog.vue';
import ScoreMetadataEditorDialog from './components/dialog/ScoreMetadataEditorDialog.vue';
import SectionEditorDialog from './components/dialog/SectionEditorDialog.vue';
import GenerateSectionDialog from './components/dialog/GenerateSectionDialog.vue';
import ChordTextEditorDialog from './components/dialog/ChordTextEditorDialog.vue';
import AppInfoDialog from './components/dialog/AppInfoDialog.vue';
import AudioPlaybackConfigDialog from './components/dialog/AudioPlaybackConfigDialog.vue';
import HelpDialog from './components/dialog/HelpDialog.vue';
import WarningDialog from './components/dialog/WarningDialog.vue';
import AudioPlayerBar from './components/AudioPlayerBar.vue';
import AppBar from './components/AppBar.vue';
import ScorePage from './components/ScorePage.vue';
import SnackBar from './components/snack_bar/SnackBar.vue';
import BarEditorDrawer from './components/BarEditorDrawer.vue';
import DialogBase from './components/dialog/DialogBase.vue';
import ContextMenu from './components/parts/ContextMenu.vue';
import { Score } from './modules/Score';
import { BarBreak, bb } from './modules/BarBreak';
import { SectionAndBarRange, SectionAndBarIdx } from './modules/SectionAndBarRange';
import { getKeyEventType } from './modules/KeyEventType';
import { downloadFile } from './modules/utils';
import { ScoreMetadata } from './modules/ScoreMetadata';

type scorePagePropType = InstanceType<typeof ScorePage>['$props'];

const App = defineComponent({
  name: 'App',

  setup() {
    return {
      audioPlayerBar: ref<InstanceType<typeof AudioPlayerBar>>(),
      barEditorDrawer: ref<InstanceType<typeof BarEditorDrawer>>(),
      dialog: ref<InstanceType<typeof DialogBase>>(),
    };
  },

  components: {
    AppBar,
    AudioPlayerBar,
    ScorePage,
    SnackBar,
    BarEditorDrawer,
    ContextMenu,
    GlobalConfigEditorDialog,
    ScoreMetadataEditorDialog,
    SectionEditorDialog,
    GenerateSectionDialog,
    ChordTextEditorDialog,
    AppInfoDialog,
    AudioPlaybackConfigDialog,
    HelpDialog,
    WarningDialog,
  },

  watch: {
    $_scoreMetadata: {
      handler(scoreMetadata: ScoreMetadata) {
        if (scoreMetadata.artistName.length === 0) {
          if (scoreMetadata.title.length === 0) {
            document.title = 'Smart Chord Score Editor';
          } else {
            document.title = scoreMetadata.title;
          }
        } else {
          document.title = `${scoreMetadata.title} - ${scoreMetadata.artistName}`
        }
      },
      immediate: true,
    },

    '$store.state.config.locale'(locale: string) { this.$i18n.locale = locale },
    '$store.state.config.staffLineStepPx'() { this.$_reloadScore() },
    '$store.state.config.systemMarginTopPx'() { this.$_reloadScore() },
    '$store.state.config.systemMarginBottomPx'() { this.$_reloadScore() },
    '$store.state.config.pagePaddingTopPx'() { this.$_reloadScore() },
    '$store.state.config.chordFontSizePx'() { this.$_reloadScore() },

    '$store.state.score.score': {
      handler(score: Score) {
        window.localStorage.setItem('score', score.dumpJson());
      },
      deep: true,
    },

    score: {
      async handler(score?: Score) {
        if (score !== undefined) {
          await this.$store.dispatch('score/setScore', score);
          await this.$store.dispatch('score/clearChangeHistory');
        } else {
          const scoreJsonFromCookie = window.localStorage.getItem('score');
          if (scoreJsonFromCookie !== null) {
            await this.$store.dispatch('score/setScore', Score.loadJson(scoreJsonFromCookie));
          } 
        }
      },
      immediate: true,
    },
  },

  props: {
    score: { type: Score },
    print: { type: Boolean },
  },

  data(): {
    $_forceRemountKey: number,
    $_windowInnerWidthPx: number,
    $_windowInnerHeightPx: number,
  } {
    return {
      $_forceRemountKey: 0,
      $_windowInnerWidthPx: window.innerWidth,
      $_windowInnerHeightPx: window.innerHeight,
    };
  },

  computed: {
    $_scoreMetadata(): ScoreMetadata { return this.$store.state.score.score.metadata },

    $_score(): Score { return this.$store.state.score.score },

    $_scorePagePropsByRows(): scorePagePropType[][] | undefined {
      return this.$_scorePageProps.reduce(
        (scorePagePropsPerRow: scorePagePropType[][], scorePageProp: scorePagePropType): scorePagePropType[][] => {
          const scorePagePropsInLastRow = scorePagePropsPerRow[scorePagePropsPerRow.length - 1];
          if (scorePagePropsInLastRow.length < this.$store.state.config.numPagesPerRow) {
            scorePagePropsInLastRow.push(scorePageProp);
          } else {
            scorePagePropsPerRow.push([ scorePageProp ]);
          }
          return scorePagePropsPerRow;
        },
        [[]],
      );
    },

    $_scorePageProps(): scorePagePropType[] {
      const sectionAndBarRanges: SectionAndBarRange[] = []
      let sectionAndBarIdx: SectionAndBarIdx | undefined = this.$_score.firstSectionAndBarIdx;
      if (sectionAndBarIdx === undefined) {
        return [{
          sectionAndBarRange: undefined,
          scorePageIndex: 0,
          numScorePages: 1,
          aspectRatio: this.$store.state.score.scorePageWHRatio,
        }]
      }
      let pageFirstSectionAndBarIdx: SectionAndBarIdx | undefined = undefined;
      while (sectionAndBarIdx !== undefined) {
        if (pageFirstSectionAndBarIdx === undefined) {
          pageFirstSectionAndBarIdx = sectionAndBarIdx.clone();
        }
        const bar = this.$_score.getBar(sectionAndBarIdx);
        if (bar.break.isEqualTo(bb.page) && !this.$store.state.appState.isMobileLayoutEnabled) {
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
      return sectionAndBarRanges.map((sectionAndBarRange, scorePageIndex) => ({
        sectionAndBarRange,
        scorePageIndex,
        numScorePages: sectionAndBarRanges.length,
        aspectRatio: this.$store.state.score.scorePageWHRatio,
      }));
    },
  },

  async beforeCreate() {
    await this.$store.dispatch('config/loadConfigFromLocalStorage');
  },

  created() {
    window.addEventListener('keydown', this.onKeydown);
    window.addEventListener('resize', this.$_updateWindowInnerSize);
    window.addEventListener('beforeunload', (event) => {
      if (this.$store.getters['score/isCurrentScoreSaved']) return;
      event.preventDefault();
      event.returnValue = '';
      this.$store.dispatch('dialog/setDialog', {
        componentName: 'warning-dialog',
        props: {
          okCallback: async () => {
            await this.$_saveAndDownloadFile();
          },
          okLabel: this.$t('save'),
          title: this.$t('warning'),
          message: this.$t('unsavedWarning'),
        },
      });
    });
  },

  async beforeMount() {
    if (this.print) {
      await this.$store.dispatch('appState/setIsPrintLayoutEnabled', true);
    }
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('resize', this.$_updateWindowInnerSize);
  },

  methods: {
    $_updateWindowInnerSize() {
      this.$data.$_windowInnerWidthPx = window.innerWidth;
      this.$data.$_windowInnerHeightPx = window.innerHeight;
    },

    $_reloadScore() {
      this.$data.$_forceRemountKey++;
    },

    async $_onClickBackground() {
      if (this.print) return;
      return await this.$_resetStateStepByStep();
    },

    async onKeydown(event: KeyboardEvent) {
      if (await this.$_onKeydown(event)) event.preventDefault();
    },

    async $_onKeydown(event: KeyboardEvent) {
      if (document.activeElement !== document.body) {
        switch (event.code) {
          case 'Escape':
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
              return true;
            }
            break;
        }
      }
      if (this.print) return false;
      if (this.dialog?.onKeydown(event)) return true;
      if (await this.barEditorDrawer?.onKeydown(event)) return true;
      if (this.audioPlayerBar?.onKeydown(event)) return true;
      if (this.$store.state.appState.isPrintLayoutEnabled) {
        await this.$store.dispatch('appState/setIsPrintLayoutEnabled', false);
        return true;
      }
      switch (getKeyEventType(event)) {
        case 'key':
          switch (event.code) {
            case 'Escape':
              return await this.$_resetStateStepByStep();
            case 'ArrowRight': {
              const selectedPart = this.$store.getters['score/selectedPart'];
              await this.$store.dispatch('score/selectNextBar');
              if (selectedPart !== undefined) {
                await this.$store.dispatch('score/selectFirstNoteInSelectedBar', selectedPart.type);
              }
              return true;
            }
            case 'ArrowLeft': {
              const selectedPart = this.$store.getters['score/selectedPart'];
              await this.$store.dispatch('score/selectPreviousBar');
              if (selectedPart !== undefined) {
                await this.$store.dispatch('score/selectFirstNoteInSelectedBar', selectedPart.type);
              }
              return true;
            }
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
              if (this.$store.state.appState.isBarEditorDrawerMinimized) {
                await this.$store.dispatch('appState/setIsBarEditorMinimized', false);
                return false;
              } else {
                await this.$store.dispatch('appState/setIsBarEditorMinimized', true);
                return true;
              }
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
              await this.$_saveAndDownloadFile();
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
        const sectionAndBarIdx = this.$_score.getPreviousSectionAndBarIdx(this.$store.state.score.selectedBars.first);
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
        const baseSectionAndBarIdx = this.$store.state.score.selectedBars.first;
        const baseBar = this.$_score.getBar(baseSectionAndBarIdx);
        const targetSectionAndBarIdx = baseSectionAndBarIdx;
        await this.$store.dispatch(
          'score/insertBars',
          {
            sectionAndBarIdx: targetSectionAndBarIdx,
            bars: [ baseBar.generateEmptyFrom() ],
            selects: true,
          },
        );
        return true;
      }

      async function insertBarAfter(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        const baseSectionAndBarIdx = this.$store.state.score.selectedBars.last;
        const baseBar = this.$_score.getBar(baseSectionAndBarIdx);
        const targetSectionAndBarIdx = new SectionAndBarIdx(baseSectionAndBarIdx.sectionIdx, baseSectionAndBarIdx.barIdx + 1);
        await this.$store.dispatch(
          'score/insertBars',
          {
            sectionAndBarIdx: targetSectionAndBarIdx,
            bars: [ baseBar.generateEmptyFrom() ],
            selects: true,
          },
        );
        return true;
      }

      async function insertSectionBefore(this: This): Promise<boolean> {
        if (this.$store.state.score.selectedBars === undefined) return false;
        const baseSectionIdx = this.$store.state.score.selectedBars.first.sectionIdx;
        const baseSection = this.$_score.getSection(baseSectionIdx);
        const baseBar = baseSection.firstBar;
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
        const baseSectionIdx = this.$store.state.score.selectedBars.last.sectionIdx;
        const baseSection = this.$_score.getSection(baseSectionIdx);
        const baseBar = baseSection.lastBar;
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


    async $_saveAndDownloadFile() {
      await this.$store.dispatch('score/saveScore');
      downloadFile(
        `${this.$store.state.score.score.metadata.title}.json`,
        this.$_score.dumpJson(),
        'application/json',
      );
    },

    async $_onContextmenu() {
      await this.$store.dispatch('contextMenu/clearParameters');
    },

    async $_resetStateStepByStep(): Promise<boolean> {
      if (this.$store.state.appState.isPrintLayoutEnabled) {
        await this.$store.dispatch('appState/setIsPrintLayoutEnabled', false);
        return true;
      } else if (this.$store.state.score.selectedBars) {
        await this.$store.dispatch('score/unselectBar');
        return true;
      } else if (!this.$store.state.appState.isBarEditorDrawerMinimized) {
        await this.$store.dispatch('appState/setIsBarEditorMinimized', true);
        return true;
      }
      return false;
    },
  },
});

export default App;
</script>
