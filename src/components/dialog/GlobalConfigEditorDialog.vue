<template>
  <dialog-base
    v-bind:initialize-callback="$_loadData"
    v-bind:ok-callback="$_ok"
  >
    <template v-slot:body>
      <v-card-title>{{ $t('globalConfig') }}</v-card-title>
  
      <v-card-text>
        <v-form
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <dialog-text-field
                  autofocus number
                  type="number" density="compact"
                  v-model.number="$data.$_staffLineStepPx"
                  v-bind:rules="$_rules.staffLineStepPx"
                  v-bind:max="staffLineStaffPxMax"
                  v-bind:min="staffLineStaffPxMin"
                  v-bind:label="$t('staffLineStepPx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_systemMarginTopPx"
                  v-bind:rules="$_rules.systemMarginTopPx"
                  v-bind:min="systemMarginTopPxMin"
                  v-bind:label="$t('systemMarginTopPx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_systemMarginBottomPx"
                  v-bind:rules="$_rules.systemMarginBottomPx"
                  v-bind:min="systemMerginBottomPxMin"
                  v-bind:label="$t('systemMarginBottomPx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_pagePaddingTopPx"
                  v-bind:rules="$_rules.pagePaddingTopPx"
                  v-bind:min="pagePaddingTopPxMin"
                  v-bind:label="$t('pagePaddingTopPx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <grid-note-selector
                  density="compact"
                  v-model:grid-note-value="$data.$_defaultGridNoteValue"
                  v-bind:rules="$_rules.defaultGridNoteValue"
                  v-bind:label="$t('defaultGridNoteValue')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_chordFontSizePx"
                  v-bind:rules="$_rules.chordFontSizePx"
                  v-bind:min="chordFontSizePxMin"
                  v-bind:label="$t('chordFontSizePx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_pageWidthOnPrintPx"
                  v-bind:rules="$_rules.pageWidthOnPrintPx"
                  v-bind:min="pageWidthOnPrintPxMin"
                  v-bind:label="$t('pageWidthOnPrintPx')"
                >
                </dialog-text-field>
              </v-col>

              <v-col sm="4" cols="12">
                <v-select
                  density="compact"
                  v-model="$data.$_barEditorLocation"
                  v-bind:items="$_barEditorLocationItems"
                  v-bind:rules="$_rules.barEditorLocation"
                  v-bind:label="$t('barEditorLocation')"
                >
                </v-select>
              </v-col>

              <v-col sm="4" cols="12">
                <v-select
                  density="compact"
                  v-model="$data.$_locale"
                  v-bind:items="$_localeItems"
                  v-bind:rules="$_rules.locale"
                  v-bind:label="$t('languageSetting')"
                >
                </v-select>
              </v-col>

              <v-col sm="4" cols="12">
                <color-picker-input
                  density="compact"
                  v-model="$data.$_noteColor"
                  v-bind:label="$t('noteColor')"
                >
                </color-picker-input>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </template>

    <template v-slot:buttons="{ on }">
      <v-btn
        v-on:click="$_resetToDefault"
        v-bind:text="$t('resetToDefault')"
      >
      </v-btn>

      <v-spacer />

      <v-btn
        color="secondary"
        v-on:click="on.cancelClicked"
        v-bind:text="$t('cancel')"
      >
      </v-btn>

      <v-btn
        color="primary"
        v-on:click="on.okClicked"
        v-bind:disabled="!$data.$_valid"
        v-bind:text="$t('ok')"
      >
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import DialogBase from './DialogBase.vue';
import DialogTextField from '../parts/DialogTextField.vue';
import GridNoteSelector from '../parts/GridNoteSelector.vue';
import ColorPickerInput from '../parts/ColorPickerInput.vue';
import { NoteValue } from '../../modules/NoteValue';
import { isEmptyLike } from '../../modules/utils';
import { PublicConfig, defaultConfig, BarEditorLocationType } from '../../store/module/Config'
import Color from '@/modules/Color';

const staffLineStaffPxMin = 5;
const staffLineStaffPxMax = 15;
const systemMarginTopPxMin = 0;
const systemMerginBottomPxMin = 0;
const pagePaddingTopPxMin = 0;
const chordFontSizePxMin = 6;
const pageWidthOnPrintPxMin = 640;

export default {
  extends: DialogBase,

  setup(): {
    staffLineStaffPxMin: typeof staffLineStaffPxMin,
    staffLineStaffPxMax: typeof staffLineStaffPxMax,
    systemMarginTopPxMin: typeof systemMarginTopPxMin,
    systemMerginBottomPxMin: typeof systemMerginBottomPxMin,
    pagePaddingTopPxMin: typeof pagePaddingTopPxMin,
    chordFontSizePxMin: typeof chordFontSizePxMin,
    pageWidthOnPrintPxMin: typeof pageWidthOnPrintPxMin,
  } {
    return {
      staffLineStaffPxMin,
      staffLineStaffPxMax,
      systemMarginTopPxMin,
      systemMerginBottomPxMin,
      pagePaddingTopPxMin,
      chordFontSizePxMin,
      pageWidthOnPrintPxMin,
    };
  },

  components: {
    DialogBase,
    DialogTextField,
    GridNoteSelector,
    ColorPickerInput,
  },

  data(): {
    $_valid: boolean,
    $_staffLineStepPx: number,
    $_systemMarginTopPx: number,
    $_systemMarginBottomPx: number,
    $_pagePaddingTopPx: number,
    $_defaultGridNoteValue: NoteValue,
    $_chordFontSizePx: number,
    $_pageWidthOnPrintPx: number,
    $_locale: string,
    $_barEditorLocation: BarEditorLocationType,
    $_noteColor: Color,
  } {
    return {
      $_valid: true,
      $_staffLineStepPx: defaultConfig.staffLineStepPx,
      $_systemMarginTopPx: defaultConfig.systemMarginTopPx,
      $_systemMarginBottomPx: defaultConfig.systemMarginBottomPx,
      $_pagePaddingTopPx: defaultConfig.pagePaddingTopPx,
      $_defaultGridNoteValue: defaultConfig.defaultGridNoteValue.clone(),
      $_chordFontSizePx: defaultConfig.chordFontSizePx,
      $_pageWidthOnPrintPx: defaultConfig.pageWidthOnPrintPx,
      $_locale: defaultConfig.locale,
      $_barEditorLocation: defaultConfig.barEditorLocation,
      $_noteColor: defaultConfig.noteColor,
      // $_defaultChord: undefined,
      // $_selectedNoteColor: undefined,
    };
  },

  computed: {
    $_localeItems(): { title: string, value: string }[] {
      return [
        { title: '日本語', value: 'ja' },
        { title: 'English', value: 'en' },
      ];
    },

    $_barEditorLocationItems(): { title: string, value: BarEditorLocationType }[] {
      return [
        { title: this.$t('left'), value: 'left' },
        { title: this.$t('right'), value: 'right' },
        { title: this.$t('bottom'), value: 'bottom' },
      ];
    },

    $_rules(): { [key: string]: ((value: any) => string | true)[] } {
      return {
        staffLineStepPx: [
          (staffLineStepPx: any) => (isEmptyLike(staffLineStepPx)? 'Staff line step must not be empty.' : true),
          (staffLineStepPx: number) => {
            if (staffLineStepPx < staffLineStaffPxMin) {
              return `Staff line staff must be more than or equal to ${staffLineStaffPxMin}.`;
            } else if (staffLineStepPx > staffLineStaffPxMax) {
              return `Staff line staff must be less than or equal to ${staffLineStaffPxMax}.`;
            }
            return true;
          },
        ],

        systemMarginTopPx: [
          (systemMarginTopPx: any) => (isEmptyLike(systemMarginTopPx)? 'Staff margin top must not be empty.' : true),
          (systemMarginTopPx: number) => {
            if (systemMarginTopPx < systemMarginTopPxMin) {
              return `System margin must be more than or equal to ${systemMarginTopPxMin}.`;
            }
            return true;
          },
        ],

        systemMarginBottomPx: [
          (systemMarginBottomPx: any) => (isEmptyLike(systemMarginBottomPx)? 'Staff margin bottom must not be empty.' : true),
          (systemMarginBottomPx: number) => {
            if (systemMarginBottomPx < systemMerginBottomPxMin) {
              return `System margin must be more than or equal to ${systemMerginBottomPxMin}.`;
            }
            return true;
          },
        ],

        pagePaddingTopPx: [
          (pagePaddingTopPx: any) => (isEmptyLike(pagePaddingTopPx)? 'Page padding top must not be empty.' : true),
          (pagePaddingTopPx: number) => {
            if (pagePaddingTopPx < pagePaddingTopPxMin) {
              return `Page padding must be more than or equal to ${pagePaddingTopPxMin}.`;
            }
            return true;
          },
        ],

        defaultGridNoteValue: [
          (defaultGridNoteValue: any) => (isEmptyLike(defaultGridNoteValue)? 'Grid note value must not be empty.' : true),
        ],

        chordFontSizePx: [
          (chordFontSizePx: any) => (isEmptyLike(chordFontSizePx)? 'Chord font size must not be empty.' : true),
          (chordFontSizePx: number) => {
            if (chordFontSizePx < chordFontSizePxMin) {
              return `Chord font size must be more than or equal to ${chordFontSizePxMin}.`;
            }
            return true;
          },
        ],

        pageWidthOnPrintPx: [
          (pageWidthOnPrintPx: any) => (isEmptyLike(pageWidthOnPrintPx)? 'Page width must not be empty.' : true),
          (pageWidthOnPrintPx: number) => {
            if (pageWidthOnPrintPx < pageWidthOnPrintPxMin) {
              return `Page width must be more than or equal to ${pageWidthOnPrintPxMin}.`;
            }
            return true;
          },
        ],

        locale: [],

        barEditorLocation: [],

        // defaultChord: [
        //   () => { return true }
        // ],

        // selectedNoteColor: [
        //   () => { return true }
        // ],
      };
    },
  },

  methods: {
    $_loadData() {
      this.$data.$_staffLineStepPx = this.$store.state.config.staffLineStepPx;
      this.$data.$_systemMarginTopPx = this.$store.state.config.systemMarginTopPx;
      this.$data.$_systemMarginBottomPx = this.$store.state.config.systemMarginBottomPx;
      this.$data.$_defaultGridNoteValue = this.$store.state.config.defaultGridNoteValue.clone();
      this.$data.$_chordFontSizePx = this.$store.state.config.chordFontSizePx;
      this.$data.$_pageWidthOnPrintPx = this.$store.state.config.pageWidthOnPrintPx;
      this.$data.$_locale = this.$store.state.config.locale;
      this.$data.$_barEditorLocation = this.$store.state.config.barEditorLocation;
      this.$data.$_noteColor = this.$store.state.config.noteColor;
    },

    $_ok() {
      let publicConfig: PublicConfig = {
        staffLineStepPx: Number(this.$data.$_staffLineStepPx),
        systemMarginTopPx: Number(this.$data.$_systemMarginTopPx),
        systemMarginBottomPx: Number(this.$data.$_systemMarginBottomPx),
        pagePaddingTopPx: Number(this.$data.$_pagePaddingTopPx),
        defaultGridNoteValue: this.$data.$_defaultGridNoteValue,
        chordFontSizePx: Number(this.$data.$_chordFontSizePx),
        pageWidthOnPrintPx: Number(this.$data.$_pageWidthOnPrintPx),
        locale: this.$data.$_locale,
        barEditorLocation: this.$data.$_barEditorLocation,
        noteColor: this.$data.$_noteColor,
      };
      this.$store.dispatch('config/setConfig', publicConfig);
    },

    $_resetToDefault() {
      this.$data.$_staffLineStepPx      = defaultConfig.staffLineStepPx;
      this.$data.$_systemMarginTopPx    = defaultConfig.systemMarginTopPx;
      this.$data.$_systemMarginBottomPx = defaultConfig.systemMarginBottomPx;
      this.$data.$_pagePaddingTopPx    = defaultConfig.pagePaddingTopPx;
      this.$data.$_defaultGridNoteValue = defaultConfig.defaultGridNoteValue.clone();
      this.$data.$_chordFontSizePx      = defaultConfig.chordFontSizePx;
      this.$data.$_pageWidthOnPrintPx   = defaultConfig.pageWidthOnPrintPx;
      this.$data.$_locale               = defaultConfig.locale;
      this.$data.$_barEditorLocation    = defaultConfig.barEditorLocation;
      this.$data.$_noteColor            = defaultConfig.noteColor;
    },
  },
}
</script>