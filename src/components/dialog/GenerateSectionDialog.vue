<template>
  <dialog-base
    v-bind:initialize-callback="$_loadData"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>{{ $t('section') }}</v-card-title>
  
      <v-card-text>
        <v-form
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <dialog-text-field
                  autofocus
                  density="compact"
                  v-model="$data.$_name"
                  v-bind:rules="$_rules.name"
                  v-bind:label="$t('sectionName')"
                >
                </dialog-text-field>
              </v-col>

              <v-col sm="4" cols="12">
                <bar-value-text-area-and-selector
                  density="compact"
                  v-model:bar-value="$data.$_barValue"
                >
                </bar-value-text-area-and-selector>
              </v-col>

              <v-col sm="4" cols="12">
                <clef-selector
                  density="compact"
                  v-model:clef="$data.$_clef"
                  v-bind:label="$t('clefSign')"
                >
                </clef-selector>
              </v-col>

              <v-col sm="4" cols="12">
                <scale-selector
                  density="compact"
                  v-model:scale="$data.$_scale"
                >
                </scale-selector>
              </v-col>

              <v-col sm="4" cols="12">
                <part-in-bar-type-selector
                  density="compact"
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
import { defineComponent } from 'vue';
import DialogBase from './DialogBase.vue';
import DialogTextField from '../parts/DialogTextField.vue';
import ScaleSelector from '../parts/ScaleSelector.vue';
import ClefSelector from '../parts/ClefSelector.vue';
import BarValueTextAreaAndSelector from '../parts/BarValueTextAreaAndSelector.vue';
import PartInBarTypeSelector from '../parts/PartInBarTypeSelector.vue';
import { Section } from '../../modules/Section';
import { Clef } from '../../modules/Clef';
import { Scale } from '../../modules/Scale';
import { NoteValue } from '../../modules/NoteValue';
import { PartInBarType } from '../../modules/PartInBar';
import { isEmptyLike } from '../../modules/utils';

export default defineComponent({
  extends: DialogBase,

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
      $_barValue: this.$store.state.config.defaultBarValue,
      $_clef: this.$store.state.config.defaultClef,
      $_scale: this.$store.state.config.defaultScale,
      $_partInBarTypes: this.$store.state.config.defaultPartInBarTypes,
      $_gridNoteValue: this.$store.state.config.defaultGridNoteValue,
    };
  },

  computed: {
    $_rules(): { [key: string]: ((value: any) => string | true)[] } {
      return {
        name: [
          (name: string) => (isEmptyLike(name))? 'Name must not be empty.' : true,
        ],
      };
    },
  },

  methods: {
    $_loadData() {
      this.$data.$_name = '';
      this.$data.$_barValue = this.barValue ?? this.$store.state.config.defaultBarValue;
      this.$data.$_clef = this.clef ?? this.$store.state.config.defaultClef;
      this.$data.$_scale = this.scale ?? this.$store.state.config.defaultScale;
      this.$data.$_partInBarTypes = this.partInBarTypes ?? this.$store.state.config.defaultPartInBarTypes;
      this.$data.$_gridNoteValue = this.gridNoteValue ?? this.$store.state.config.defaultGridNoteValue;
    },

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
})
</script>