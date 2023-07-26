<template>
  <dialog-base v-bind:ok-callback="$_ok">
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
                  v-bind:max="$_staffLineStaffPxMax"
                  v-bind:min="$_staffLineStaffPxMin"
                  v-bind:label="$t('staffLineStepPx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_systemMarginTopPx"
                  v-bind:rules="$_rules.systemMarginTopPx"
                  v-bind:min="$_systemMarginTopPxMin"
                  v-bind:label="$t('systemMarginTopPx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_systemMarginBottomPx"
                  v-bind:rules="$_rules.systemMarginBottomPx"
                  v-bind:min="$_systemMerginBottomPxMin"
                  v-bind:label="$t('systemMarginBottomPx')"
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
                  v-bind:min="$_chordFontSizePxMin"
                  v-bind:label="$t('chordFontSizePx')"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number" density="compact"
                  v-model.number="$data.$_pageWidthOnPrintPx"
                  v-bind:rules="$_rules.pageWidthOnPrintPx"
                  v-bind:min="$_pageWidthOnPrintPxMin"
                  v-bind:label="$t('pageWidthOnPrintPx')"
                >
                </dialog-text-field>
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
import { NoteValue } from '../../modules/NoteValue';
import { isEmptyLike } from '../../modules/utils';
import { PublicConfig, defaultConfig } from '../../store/module/Config'

const staffLineStaffPxMin = 5;
const staffLineStaffPxMax = 15;
const systemMarginTopPxMin = 0;
const systemMerginBottomPxMin = 0;
const chordFontSizePxMin = 6;
const pageWidthOnPrintPxMin = 640;

export default {
  extends: DialogBase,

  components: {
    DialogBase,
    DialogTextField,
    GridNoteSelector,
  },

  data(): {
    $_valid: boolean,
    $_staffLineStepPx: number,
    $_systemMarginTopPx: number,
    $_systemMarginBottomPx: number,
    $_defaultGridNoteValue: NoteValue,
    $_chordFontSizePx: number,
    $_pageWidthOnPrintPx: number,
    $_locale: string,
  } {
    return {
      $_valid: true,
      $_staffLineStepPx: this.$store.state.config.staffLineStepPx,
      $_systemMarginTopPx: this.$store.state.config.systemMarginTopPx,
      $_systemMarginBottomPx: this.$store.state.config.systemMarginBottomPx,
      $_defaultGridNoteValue: this.$store.state.config.defaultGridNoteValue.clone(),
      $_chordFontSizePx: this.$store.state.config.chordFontSizePx,
      $_pageWidthOnPrintPx: this.$store.state.config.pageWidthOnPrintPx,
      $_locale: this.$store.state.config.locale,
      // $_defaultChord: undefined,
      // $_selectedNoteColor: undefined,
    };
  },

  computed: {
    $_staffLineStaffPxMin() { return staffLineStaffPxMin },

    $_staffLineStaffPxMax() { return staffLineStaffPxMax },

    $_systemMarginTopPxMin() { return systemMarginTopPxMin },

    $_systemMerginBottomPxMin() { return systemMerginBottomPxMin },

    $_chordFontSizePxMin() { return chordFontSizePxMin },

    $_pageWidthOnPrintPxMin() { return pageWidthOnPrintPxMin },

    $_localeItems(): { title: string, value: string }[] {
      return [
        { title: '日本語', value: 'ja' },
        { title: 'English', value: 'en' },
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
    $_ok() {
      let publicConfig: PublicConfig = {
        staffLineStepPx: Number(this.$data.$_staffLineStepPx),
        systemMarginTopPx: Number(this.$data.$_systemMarginTopPx),
        systemMarginBottomPx: Number(this.$data.$_systemMarginBottomPx),
        defaultGridNoteValue: this.$data.$_defaultGridNoteValue,
        chordFontSizePx: Number(this.$data.$_chordFontSizePx),
        pageWidthOnPrintPx: Number(this.$data.$_pageWidthOnPrintPx),
        locale: this.$data.$_locale,
      };
      this.$store.dispatch('config/setConfig', publicConfig);
    },

    $_resetToDefault() {
      this.$data.$_staffLineStepPx      = defaultConfig.staffLineStepPx;
      this.$data.$_systemMarginTopPx    = defaultConfig.systemMarginTopPx;
      this.$data.$_systemMarginBottomPx = defaultConfig.systemMarginBottomPx;
      this.$data.$_defaultGridNoteValue = defaultConfig.defaultGridNoteValue.clone();
      this.$data.$_chordFontSizePx      = defaultConfig.chordFontSizePx;
      this.$data.$_pageWidthOnPrintPx   = defaultConfig.pageWidthOnPrintPx;
      this.$data.$_locale               = defaultConfig.locale;
    },
  },
}
</script>