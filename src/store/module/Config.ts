import { RootState } from '..';
import { ActionContext, Module } from 'vuex';
import { NoteValue, NoteValueRawObj } from '../../modules/NoteValue';
import { NotePitch } from '../../modules/NotePitch';
import { Chord, ChordRawObj } from '../../modules/Chord';
import { Clef, ClefRawObj } from '../../modules/Clef';
import { Scale, ScaleRawObj } from '../../modules/Scale';
import { PartInBarType } from '../../modules/PartInBar';
import { VNavigationDrawer } from 'vuetify/lib/components/index.mjs';

export type BarEditorLocationType = VNavigationDrawer['$props']['location'];

export type ConfigRawObj = {
  staffLineStepPx: number,
  systemMarginTopPx: number,
  systemMarginBottomPx: number,
  defaultGridNoteValue: NoteValueRawObj,
  chordFontSizePx: number,
  defaultChord: ChordRawObj,
  defaultBarValue: NoteValueRawObj,
  defaultClef: ClefRawObj,
  defaultScale: ScaleRawObj,
  defaultPartInBarTypes: PartInBarType[],
  pageWidthOnPrintPx: number,
  locale: string,
  barEditorLocation: BarEditorLocationType,
};

export const defaultConfig: Config = {
  staffLineStepPx: 10,
  systemMarginTopPx: 30,
  systemMarginBottomPx: 10,
  defaultGridNoteValue: NoteValue.instance.divisible.half,
  chordFontSizePx: 18,
  pageWidthOnPrintPx: 1080,
  defaultChord: new Chord(NotePitch.instance.a, 'major'),
  defaultBarValue: new NoteValue(4, 4),
  defaultClef: Clef.instance.treble,
  defaultScale: Scale.instance.cMajor,
  defaultPartInBarTypes: [ 'chord' ],
  locale: 'ja',
  barEditorLocation: 'bottom',
};

export type PublicConfig = {
  staffLineStepPx: number,
  systemMarginTopPx: number,
  systemMarginBottomPx: number,
  defaultGridNoteValue: NoteValue,
  chordFontSizePx: number,
  pageWidthOnPrintPx: number,
  locale: string,
  barEditorLocation: BarEditorLocationType,
};

export type Config = PublicConfig & {
  defaultChord: Chord,
  defaultBarValue: NoteValue,
  defaultClef: Clef,
  defaultScale: Scale,
  defaultPartInBarTypes: PartInBarType[],
};

const ConfigModule: Module<Config, RootState> = {
  namespaced: true,

  state: {
    staffLineStepPx: defaultConfig.staffLineStepPx,
    systemMarginTopPx: defaultConfig.systemMarginTopPx,
    systemMarginBottomPx: defaultConfig.systemMarginBottomPx,
    defaultGridNoteValue: defaultConfig.defaultGridNoteValue.clone(),
    chordFontSizePx: defaultConfig.chordFontSizePx,
    pageWidthOnPrintPx: defaultConfig.pageWidthOnPrintPx,
    defaultChord: defaultConfig.defaultChord.clone(),
    defaultBarValue: defaultConfig.defaultBarValue.clone(),
    defaultClef: defaultConfig.defaultClef,
    defaultScale: defaultConfig.defaultScale,
    defaultPartInBarTypes: [ ...defaultConfig.defaultPartInBarTypes ],
    locale: defaultConfig.locale,
    barEditorLocation: defaultConfig.barEditorLocation,
  },

  mutations: {
    loadConfigFromCookie(state: Config) {
      const configJsonFromCookie = window.localStorage.getItem('config');
      if (configJsonFromCookie !== null) {
        const configKeys = Object.keys(state);
        const rawConfigFromCookie = JSON.parse(configJsonFromCookie);
        const configKeysFromCookie = Object.keys(rawConfigFromCookie);
        const missingKeys: string[] = [];
        for (const configKey of configKeys) {
          if (!configKeysFromCookie.includes(configKey)) {
            missingKeys.push(configKey);
            break;
          }
        }
        if (missingKeys.length > 0) {
          console.warn(`missing required config key: ${missingKeys.join(', ')}`);
          return;
        }
        state.staffLineStepPx = rawConfigFromCookie.staffLineStepPx;
        state.systemMarginTopPx = rawConfigFromCookie.systemMarginTopPx;
        state.systemMarginBottomPx = rawConfigFromCookie.systemMarginBottomPx;
        state.defaultGridNoteValue = NoteValue.loadFromRawObj(rawConfigFromCookie.defaultGridNoteValue);
        state.chordFontSizePx = rawConfigFromCookie.chordFontSizePx;
        state.pageWidthOnPrintPx = rawConfigFromCookie.pageWidthOnPrintPx;
        state.defaultChord = Chord.loadFromRawObj(rawConfigFromCookie.defaultChord);
        state.defaultBarValue = NoteValue.loadFromRawObj(rawConfigFromCookie.defaultBarValue);
        state.defaultClef = Clef.loadFromRawObj(rawConfigFromCookie.defaultClef);
        state.defaultScale = Scale.loadFromRawObj(rawConfigFromCookie.defaultScale);
        state.defaultPartInBarTypes = rawConfigFromCookie.defaultPartInBarTypes;
        state.locale = rawConfigFromCookie.locale;
        state.barEditorLocation = rawConfigFromCookie.barEditorLocation;
      }
    },

    setConfig(state: Config, publicConfig: PublicConfig) {
      state.staffLineStepPx = publicConfig.staffLineStepPx;
      state.systemMarginTopPx = publicConfig.systemMarginTopPx;
      state.systemMarginBottomPx = publicConfig.systemMarginBottomPx;
      state.defaultGridNoteValue = publicConfig.defaultGridNoteValue;
      state.chordFontSizePx = publicConfig.chordFontSizePx;
      state.pageWidthOnPrintPx = publicConfig.pageWidthOnPrintPx;
      state.locale = publicConfig.locale;
      state.barEditorLocation = publicConfig.barEditorLocation;

      const configRawObj: ConfigRawObj = {
        staffLineStepPx: state.staffLineStepPx,
        systemMarginTopPx: state.systemMarginTopPx,
        systemMarginBottomPx: state.systemMarginBottomPx,
        defaultGridNoteValue: state.defaultGridNoteValue.getRawObj(),
        chordFontSizePx: state.chordFontSizePx,
        defaultChord: state.defaultChord.getRawObj(),
        defaultBarValue: state.defaultBarValue.getRawObj(),
        defaultClef: state.defaultClef.getRawObj(),
        defaultScale: state.defaultScale.getRawObj(),
        defaultPartInBarTypes: state.defaultPartInBarTypes,
        pageWidthOnPrintPx: state.pageWidthOnPrintPx,
        locale: state.locale,
        barEditorLocation: state.barEditorLocation,
      }
      window.localStorage.setItem('config', JSON.stringify(configRawObj));
    },
  },

  actions: {
    setConfig(context: ActionContext<Config, RootState>, config: PublicConfig) {
      context.commit('setConfig', config);
    },

    loadConfigFromCookie(context: ActionContext<Config, RootState>) {
      context.commit('loadConfigFromCookie');
    },
  },
}

export default ConfigModule;
