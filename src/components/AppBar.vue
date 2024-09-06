<template>
  <v-app-bar app density="compact">
    <v-slide-group class="w-100" show-arrows>
      <div>
        <v-tooltip
          location="bottom"
          v-for="(menuItemDefinition, menuItemDefinitionId) in $_leftMenuItemDefinitions"
          v-bind:key="menuItemDefinitionId"
          v-bind:text="menuItemDefinition.text"
          v-bind:disabled="menuItemDefinition.disabled"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              size="small"
              v-bind="props"
              v-bind:disabled="menuItemDefinition.disabled"
              v-bind:icon="menuItemDefinition.iconName"
              v-on:click.stop="menuItemDefinition.callback"
              v-on:keydown.enter.stop="menuItemDefinition.callback"
            >
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      
      <v-spacer></v-spacer>
  
      <div>
        <v-tooltip
          location="bottom"
          v-for="(menuItemDefinition, menuItemDefinitionId) in $_rightMenuItemDefinitions"
          v-bind:key="menuItemDefinitionId"
          v-bind:disabled="menuItemDefinition.disabled"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              size="small"
              v-bind="props"
              v-bind:disabled="menuItemDefinition.disabled"
              v-bind:icon="menuItemDefinition.iconName"
              v-on:click.stop="menuItemDefinition.callback"
              v-on:keydown.enter.stop="menuItemDefinition.callback"
            >
            </v-btn>
          </template>
          <span>{{ menuItemDefinition.text }}</span>
        </v-tooltip>
      </div>
    </v-slide-group>
  </v-app-bar>
</template>

<script lang="ts">
import { Score } from '../modules/Score';
import { ScoreMetadata } from '../modules/ScoreMetadata';
import scoreTextParser from '../modules/scoreTextParser';
import { downloadFile, loadFileAsUTF8Text, getFileInterface } from '../modules/utils';

class MenuItemDefinition {
  public iconName: string;
  public text: string;
  public callback: () => void;
  public disabled: boolean;
  constructor(iconName: string, text: string, callback: () => void, disabled: boolean = false) {
    this.iconName = iconName;
    this.text = text;
    this.callback = callback;
    this.disabled = disabled;
  }
}

export default {
  computed: {
    $_leftMenuItemDefinitions(): Record<string, MenuItemDefinition> {
      const onPrintLayoutEnabledMessage = this.$t('onPrintLayoutEnabledMessage');
      return {
        undo: new MenuItemDefinition(
          'mdi-undo', this.$t('undo'),
          async () => { await this.$store.dispatch('score/undo') },
          !this.$store.state.score.isUndoable,
        ),
        redo: new MenuItemDefinition(
          'mdi-redo', this.$t('redo'),
          async () => { await this.$store.dispatch('score/redo') },
          !this.$store.state.score.isRedoable,
        ),
        generateNewScore: new MenuItemDefinition(
          'mdi-file', this.$t('createNewScore'),
          async () => { await this.$store.dispatch('score/setScore', new Score()) },
        ),
        loadScoreFile: new MenuItemDefinition(
          'mdi-folder-open', this.$t('loadScore'),
          async () => {
            const fileInterface = await getFileInterface('application/json');
            if (fileInterface === undefined) return;
            const scoreJsonString = await loadFileAsUTF8Text(fileInterface);
            if (scoreJsonString === undefined) return;
            await this.$store.dispatch('score/setScore', Score.loadJson(scoreJsonString));
          },
        ),
        saveScoreFile: new MenuItemDefinition(
          'mdi-content-save', this.$t('saveScore'),
          () => {
            downloadFile(
              `${this.$store.state.score.score.metadata.title}.json`,
              this.$store.state.score.score.dumpJson(),
              'application/json',
            )
          },
        ),
        loadScoreFromTextFile: new MenuItemDefinition(
          'mdi-import', this.$t('importScoreFromText'),
          async () => {
            const fileInterface = await getFileInterface();
            if (fileInterface === undefined) return;
            const scoreText = await loadFileAsUTF8Text(fileInterface);
            if (scoreText === undefined) return;
            const score = scoreTextParser.parse(
              scoreText,
              this.$store.state.config.defaultBarValue,
              this.$store.state.config.defaultScale,
              new ScoreMetadata(fileInterface.name),
            );
            await this.$store.dispatch('score/setScore', score);
          },
        ),
        enablePrintLayout: new MenuItemDefinition(
          `mdi-printer-${(this.$store.state.appState.isPrintLayoutEnabled)? 'off' : 'eye'}`,
          this.$t(`${(this.$store.state.appState.isPrintLayoutEnabled)? 'dis' : 'en'}ablePrintLayout`),
          async () => {
            await this.$store.dispatch(
              'appState/setIsPrintLayoutEnabled',
              !this.$store.state.appState.isPrintLayoutEnabled,
            );
            await this.$store.dispatch(
              'appState/setSnackBarMessage',
              onPrintLayoutEnabledMessage,
            );
          },
        ),
        enableMobileLayout: new MenuItemDefinition(
          (this.$store.state.appState.isMobileLayoutEnabled)? 'mdi-tablet-cellphone' : 'mdi-note-outline',
          this.$t(`${(this.$store.state.appState.isMobileLayoutEnabled)? 'dis' : 'en'}ableMobileLayout`),
          async () => {
            await this.$store.dispatch(
              'appState/setIsMobileLayoutEnabled',
              !this.$store.state.appState.isMobileLayoutEnabled,
            );
          },
        ),
      };
    },

    $_rightMenuItemDefinitions(): Record<string, MenuItemDefinition> {
      return {
        openScoreMetadataEditorDialog: new MenuItemDefinition(
          'mdi-file-cog', this.$t('scoreMetadata'),
          async () => { await this.$store.dispatch('dialog/setDialog', { componentName: 'score-metadata-editor-dialog' }) },
        ),
        openGlobalConfigEditorDialog: new MenuItemDefinition(
          'mdi-cog', this.$t('globalConfig'),
          async () => { await this.$store.dispatch('dialog/setDialog', { componentName: 'global-config-editor-dialog' }) },
        ),
        showHelp: new MenuItemDefinition(
          'mdi-help-circle', this.$t('help'),
          async () => { await this.$store.dispatch('dialog/setDialog', { componentName: 'help-dialog' }) },
        ),
        showInfo: new MenuItemDefinition(
          'mdi-information', this.$t('appInfo'),
          async () => { await this.$store.dispatch('dialog/setDialog', { componentName: 'app-info-dialog' }) },
        ),
      };
    },
  },
}
</script>