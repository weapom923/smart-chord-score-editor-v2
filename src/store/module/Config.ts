import { RootState } from '..';
import { ActionContext, Module } from 'vuex';
import { NoteValue, NoteValueRawObj } from '../../modules/NoteValue';
import { NotePitch } from '../../modules/NotePitch';
import { Chord, ChordRawObj } from '../../modules/Chord';
import { Clef, ClefRawObj } from '../../modules/Clef';
import { Scale, ScaleRawObj } from '../../modules/Scale';
import { PartInBarType } from '../../modules/PartInBar';
import { VNavigationDrawer } from 'vuetify/lib/components/index.mjs';
import { Color, ColorRawObj } from '../../modules/Color';

export type BarEditorLocationType = VNavigationDrawer['$props']['location'];

export type ConfigRawObj = {
  numPagesPerRow: number,
  staffLineStepPx: number,
  systemMarginTopPx: number,
  systemMarginBottomPx: number,
  pagePaddingTopPx: number,
  defaultGridNoteValue: NoteValueRawObj,
  chordFontSizePx: number,
  chordTextColor: ColorRawObj,
  defaultChord: ChordRawObj,
  defaultBarValue: NoteValueRawObj,
  defaultClef: ClefRawObj,
  defaultScale: ScaleRawObj,
  defaultPartInBarTypes: PartInBarType[],
  pageWidthOnPrintPx: number,
  locale: string,
  barEditorLocation: BarEditorLocationType,
  noteColor: ColorRawObj,
};

export const defaultConfig: Config = {
  numPagesPerRow: 1,
  staffLineStepPx: 10,
  systemMarginTopPx: 30,
  systemMarginBottomPx: 10,
  pagePaddingTopPx: 20,
  defaultGridNoteValue: NoteValue.instance.divisible.half,
  chordFontSizePx: 18,
  chordTextColor: Color.instance.black,
  pageWidthOnPrintPx: 1080,
  defaultChord: new Chord(NotePitch.instance.a, 'major'),
  defaultBarValue: new NoteValue(4, 4),
  defaultClef: Clef.instance.treble,
  defaultScale: Scale.instance.cMajor,
  defaultPartInBarTypes: [ 'chord' ],
  locale: 'ja',
  barEditorLocation: 'bottom',
  noteColor: Color.instance.black,
};

export type PublicConfig = {
  numPagesPerRow: number,
  staffLineStepPx: number,
  systemMarginTopPx: number,
  systemMarginBottomPx: number,
  pagePaddingTopPx: number,
  defaultGridNoteValue: NoteValue,
  chordFontSizePx: number,
  chordTextColor: Color,
  pageWidthOnPrintPx: number,
  locale: string,
  barEditorLocation: BarEditorLocationType,
  noteColor: Color,
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
    numPagesPerRow: defaultConfig.numPagesPerRow,
    staffLineStepPx: defaultConfig.staffLineStepPx,
    systemMarginTopPx: defaultConfig.systemMarginTopPx,
    systemMarginBottomPx: defaultConfig.systemMarginBottomPx,
    pagePaddingTopPx: defaultConfig.pagePaddingTopPx,
    defaultGridNoteValue: defaultConfig.defaultGridNoteValue.clone(),
    chordFontSizePx: defaultConfig.chordFontSizePx,
    chordTextColor: defaultConfig.chordTextColor,
    pageWidthOnPrintPx: defaultConfig.pageWidthOnPrintPx,
    defaultChord: defaultConfig.defaultChord.clone(),
    defaultBarValue: defaultConfig.defaultBarValue.clone(),
    defaultClef: defaultConfig.defaultClef,
    defaultScale: defaultConfig.defaultScale,
    defaultPartInBarTypes: [ ...defaultConfig.defaultPartInBarTypes ],
    locale: defaultConfig.locale,
    barEditorLocation: defaultConfig.barEditorLocation,
    noteColor: defaultConfig.noteColor,
  },

  mutations: {
    loadConfigFromLocalStorage(state: Config) {
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
        state.numPagesPerRow = rawConfigFromCookie.numPagesPerRow;
        state.staffLineStepPx = rawConfigFromCookie.staffLineStepPx;
        state.systemMarginTopPx = rawConfigFromCookie.systemMarginTopPx;
        state.systemMarginBottomPx = rawConfigFromCookie.systemMarginBottomPx;
        state.pagePaddingTopPx = rawConfigFromCookie.pagePaddingTopPx;
        state.defaultGridNoteValue = NoteValue.loadFromRawObj(rawConfigFromCookie.defaultGridNoteValue);
        state.chordFontSizePx = rawConfigFromCookie.chordFontSizePx;
        state.chordTextColor = Color.loadFromRawObj(rawConfigFromCookie.chordTextColor);
        state.pageWidthOnPrintPx = rawConfigFromCookie.pageWidthOnPrintPx;
        state.defaultChord = Chord.loadFromRawObj(rawConfigFromCookie.defaultChord);
        state.defaultBarValue = NoteValue.loadFromRawObj(rawConfigFromCookie.defaultBarValue);
        state.defaultClef = Clef.loadFromRawObj(rawConfigFromCookie.defaultClef);
        state.defaultScale = Scale.loadFromRawObj(rawConfigFromCookie.defaultScale);
        state.defaultPartInBarTypes = rawConfigFromCookie.defaultPartInBarTypes;
        state.locale = rawConfigFromCookie.locale;
        state.barEditorLocation = rawConfigFromCookie.barEditorLocation;
        state.noteColor = Color.loadFromRawObj(rawConfigFromCookie.noteColor);
      }
    },

    setConfig(state: Config, publicConfig: PublicConfig) {
      state.numPagesPerRow = publicConfig.numPagesPerRow;
      state.staffLineStepPx = publicConfig.staffLineStepPx;
      state.systemMarginTopPx = publicConfig.systemMarginTopPx;
      state.systemMarginBottomPx = publicConfig.systemMarginBottomPx;
      state.pagePaddingTopPx = publicConfig.pagePaddingTopPx;
      state.defaultGridNoteValue = publicConfig.defaultGridNoteValue;
      state.chordFontSizePx = publicConfig.chordFontSizePx;
      state.chordTextColor = publicConfig.chordTextColor;
      state.pageWidthOnPrintPx = publicConfig.pageWidthOnPrintPx;
      state.locale = publicConfig.locale;
      state.barEditorLocation = publicConfig.barEditorLocation;
      state.noteColor = publicConfig.noteColor;

      const configRawObj: ConfigRawObj = {
        numPagesPerRow: state.numPagesPerRow,
        staffLineStepPx: state.staffLineStepPx,
        systemMarginTopPx: state.systemMarginTopPx,
        systemMarginBottomPx: state.systemMarginBottomPx,
        pagePaddingTopPx: state.pagePaddingTopPx,
        defaultGridNoteValue: state.defaultGridNoteValue.getRawObj(),
        chordFontSizePx: state.chordFontSizePx,
        chordTextColor: state.chordTextColor,
        defaultChord: state.defaultChord.getRawObj(),
        defaultBarValue: state.defaultBarValue.getRawObj(),
        defaultClef: state.defaultClef.getRawObj(),
        defaultScale: state.defaultScale.getRawObj(),
        defaultPartInBarTypes: state.defaultPartInBarTypes,
        pageWidthOnPrintPx: state.pageWidthOnPrintPx,
        locale: state.locale,
        barEditorLocation: state.barEditorLocation,
        noteColor: state.noteColor.getRawObj(),
      }
      window.localStorage.setItem('config', JSON.stringify(configRawObj));
    },
  },

  actions: {
    setConfig(context: ActionContext<Config, RootState>, config: PublicConfig) {
      context.commit('setConfig', config);
    },

    loadConfigFromLocalStorage(context: ActionContext<Config, RootState>) {
      context.commit('loadConfigFromLocalStorage');
    },
  },
}

export default ConfigModule;
