<template>
  <dialog-base
    v-model:shows="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Section</v-card-title>
  
      <v-card-text>
        <v-form
          ref="form"
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <dialog-text-field
                  autofocus
                  v-model="$data.$_name"
                  v-bind:rules="$_rules.name"
                  label="Section Name"
                >
                </dialog-text-field>
              </v-col>

              <v-col sm="4" cols="12">
                <bar-value-text-area-and-selector
                  v-model:bar-value="$data.$_barValue"
                >
                </bar-value-text-area-and-selector>
              </v-col>

              <v-col sm="4" cols="12">
                <clef-selector
                  v-model:clef="$data.$_clef"
                  label="Clef Sign"
                >
                </clef-selector>
              </v-col>

              <v-col sm="4" cols="12">
                <scale-selector
                  v-model:scale="$data.$_scale"
                >
                </scale-selector>
              </v-col>

              <v-col sm="4" cols="12">
                <part-in-bar-type-selector
                  v-model:part-in-bar-types="$data.$_partInBarTypes"
                >
                </part-in-bar-type-selector>
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
import ScaleSelector from '../parts/ScaleSelector.vue';
import ClefSelector from '../parts/ClefSelector.vue';
import BarValueTextAreaAndSelector from '../parts/BarValueTextAreaAndSelector.vue';
import PartInBarTypeSelector from '../parts/PartInBarTypeSelector.vue';
import { Section } from '../../modules/Section';
import { Clef, cl } from '../../modules/Clef';
import { Scale, sc } from '../../modules/Scale';
import { NoteValue, nv } from '../../modules/NoteValue';
import { PartInBarType } from '../../modules/PartInBar';
import { isEmptyLike } from '../../modules/utils';

export default {
  components: {
    DialogBase,
    DialogTextField,
    ScaleSelector,
    ClefSelector,
    BarValueTextAreaAndSelector,
    PartInBarTypeSelector,
  },

  props: {
    sectionIdx:     { type: Number, required: true },
    barValue:       { type: NoteValue },
    clef:           { type: Clef },
    scale:          { type: Scale },
    partInBarTypes: { type: Array<PartInBarType> },
    gridNoteValue:  { type: NoteValue },
  },

  data(): {
    $_valid: boolean,
    $_name: string,
    $_barValue: NoteValue,
    $_clef: Clef,
    $_scale: Scale,
    $_partInBarTypes: PartInBarType[],
    $_gridNoteValue: NoteValue,
  } {
    return {
      $_valid: true,
      $_name: '',
      $_barValue: this.barValue ?? this.$store.state.config.defaultBarValue,
      $_clef: this.clef ?? this.$store.state.config.defaultClef,
      $_scale: this.scale ?? this.$store.state.config.defaultScale,
      $_partInBarTypes: this.partInBarTypes ?? this.$store.state.config.defaultPartInBarTypes,
      $_gridNoteValue: this.gridNoteValue ?? this.$store.state.config.defaultGridNoteValue,
    };
  },

  computed: {
    $_shows: {
      get(): boolean            { return this.$store.state.dialog.shows },
      async set(shows: boolean) { await this.$store.dispatch('dialog/setShows', shows) },
    },

    $_rules(): { [key: string]: ((value: any) => string | true)[] } {
      return {
        name: [
          (name: string) => (isEmptyLike(name))? 'Name must not be empty.' : true,
        ],
      };
    },
  },

  methods: {
    async $_ok() {
      await this.$store.dispatch(
        'score/insertSection',
        {
          sectionIdx: this.sectionIdx,
          section: Section.generateNew(
            this.$data.$_name,
            this.$data.$_barValue,
            this.$data.$_clef,
            this.$data.$_scale,
            this.$data.$_partInBarTypes,
            this.$data.$_gridNoteValue,
          ),
        },
      );
    },
  },
}
</script>