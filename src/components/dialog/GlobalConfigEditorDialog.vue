<template>
  <dialog-base
    v-model:shows="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Global Config</v-card-title>
  
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
                  type="number"
                  v-model.number="$data.$_staffLineStepPx"
                  v-bind:rules="$_rules.staffLineStepPx"
                  v-bind:max="$_staffLineStaffPxMax"
                  v-bind:min="$_staffLineStaffPxMin"
                  label="Staff Line Step(px)"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number"
                  v-model.number="$data.$_systemMarginTopPx"
                  v-bind:rules="$_rules.systemMarginTopPx"
                  v-bind:min="$_systemMarginTopPxMin"
                  label="System Margin Top(px)"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number"
                  v-model.number="$data.$_systemMarginBottomPx"
                  v-bind:rules="$_rules.systemMarginBottomPx"
                  v-bind:min="$_systemMerginBottomPxMin"
                  label="Staff Margin Bottom(px)"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <grid-note-selector
                  v-model:grid-note-value="$data.$_defaultGridNoteValue"
                  v-bind:rules="$_rules.defaultGridNoteValue"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number"
                  v-model.number="$data.$_chordFontSizePx"
                  v-bind:rules="$_rules.chordFontSizePx"
                  v-bind:min="$_chordFontSizePxMin"
                  label="Chord Font Size(px)"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <dialog-text-field
                  number
                  type="number"
                  v-model.number="$data.$_pageWidthOnPrintPx"
                  v-bind:rules="$_rules.pageWidthOnPrintPx"
                  v-bind:min="$_pageWidthOnPrintPxMin"
                  label="Page Width On Print(px)"
                >
                </dialog-text-field>
              </v-col>

            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import DialogBase from './DialogBase.vue';
import DialogTextField from '../parts/DialogTextField.vue';
import GridNoteSelector from '../parts/GridNoteSelector.vue';
import { NoteValue, nv } from '../../modules/NoteValue';
import { isEmptyLike } from '../../modules/utils';

const staffLineStaffPxMin = 5;
const staffLineStaffPxMax = 15;
const systemMarginTopPxMin = 0;
const systemMerginBottomPxMin = 0;
const chordFontSizePxMin = 6;
const pageWidthOnPrintPxMin = 640;

export default {
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
  } {
    return {
      $_valid: true,
      $_staffLineStepPx: this.$store.state.config.staffLineStepPx,
      $_systemMarginTopPx: this.$store.state.config.systemMarginTopPx,
      $_systemMarginBottomPx: this.$store.state.config.systemMarginBottomPx,
      $_defaultGridNoteValue: this.$store.state.config.defaultGridNoteValue,
      $_chordFontSizePx: this.$store.state.config.chordFontSizePx,
      $_pageWidthOnPrintPx: this.$store.state.config.pageWidthOnPrintPx,
      // $_defaultChord: undefined,
      // $_selectedNoteColor: undefined,
    };
  },

  computed: {
    $_shows: {
      get(): boolean            { return this.$store.state.dialog.shows },
      async set(shows: boolean) { await this.$store.dispatch('dialog/setShows', shows) },
    },

    $_staffLineStaffPxMin() { return staffLineStaffPxMin },

    $_staffLineStaffPxMax() { return staffLineStaffPxMax },

    $_systemMarginTopPxMin() { return systemMarginTopPxMin },

    $_systemMerginBottomPxMin() { return systemMerginBottomPxMin },

    $_chordFontSizePxMin() { return chordFontSizePxMin },

    $_pageWidthOnPrintPxMin() { return pageWidthOnPrintPxMin },

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
      this.$store.dispatch(
        'config/setConfig',
        {
          staffLineStepPx: Number(this.$data.$_staffLineStepPx),
          systemMarginTopPx: Number(this.$data.$_systemMarginTopPx),
          systemMarginBottomPx: Number(this.$data.$_systemMarginBottomPx),
          defaultGridNoteValue: this.$data.$_defaultGridNoteValue,
          chordFontSizePx: Number(this.$data.$_chordFontSizePx),
          pageWidthOnPrintPx: Number(this.$data.$_pageWidthOnPrintPx),
        },
      )
    },
  },
}
</script>