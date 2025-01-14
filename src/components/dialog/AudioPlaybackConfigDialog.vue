<template>
  <dialog-base
    v-bind:initialize-callback="$_loadData"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>{{ $t('audioPlaybackConfig') }}</v-card-title>
  
      <v-card-text>
        <v-form
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <v-card-subtitle>{{ $t('barTimeOffsetInSec') }}</v-card-subtitle>
          <v-container>
            <v-row>
              <v-col sm="6" cols="12">
                <v-text-field
                  density="compact"
                  v-model.number="$data.$_timeOffsetSec"
                  v-bind:label="$t('barTimeOffsetInSec')"
                  v-bind:rules="$_rules.timeOffset"
                >
                </v-text-field>
              </v-col>

              <v-col sm="6" cols="12">
                <v-number-input
                  density="compact"
                  v-model="$_barNumber"
                  v-bind:min="1"
                  v-bind:label="$t('bar')"
                  v-bind:rules="$_rules.barNumber"
                >
                </v-number-input>
              </v-col>
            </v-row>
          </v-container>

          <v-card-subtitle>{{ $t('beatPerMinutes') }}</v-card-subtitle>
          <v-container>
            <v-row>
              <v-col sm="6" cols="12">
                <v-number-input
                  density="compact"
                  v-model="$data.$_beatPerMinutes"
                  v-bind:min="1"
                  v-bind:label="$t('beatPerMinutes')"
                  v-bind:rules="$_rules.beatPerMinutes"
                >
                </v-number-input>
              </v-col>

              <v-col sm="6" cols="12">
                <unit-beat-value-selector
                  density="compact"
                  v-model:unit-beat-value="$data.$_unitBeatValue"
                  v-bind:rules="$_rules.defaultGridNoteValue"
                >
                </unit-beat-value-selector>
              </v-col>
            </v-row>
          </v-container>

          <v-container>
            <v-row>
              <v-col sm="6" cols="12">
                <v-switch
                  density="compact"
                  v-bind:label="$t('autoSelectBarByPlayTime')"
                  v-model="$data.$_isAutoSelectBarByPlayTimeEnabled"
                >
                </v-switch>
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
import UnitBeatValueSelector from '../parts/UnitBeatValueSelector.vue';
import { isEmptyLike } from '../../modules/utils';
import { BarTimeOffset } from '@/modules/BarTimeOffset';
import { NoteValue } from '@/modules/NoteValue';

export default defineComponent({
  extends: DialogBase,

  components: {
    DialogBase,
    DialogTextField,
    UnitBeatValueSelector,
  },

  props: {
    timeOffsetSec: { type: Number },
  },

  data(): {
    $_valid: boolean,
    $_timeOffsetSec: number,
    $_barIdx: BarIdx,
    $_beatPerMinutes: number,
    $_unitBeatValue: NoteValue,
    $_isAutoSelectBarByPlayTimeEnabled: boolean,
  } {
    return {
      $_valid: true,
      $_timeOffsetSec: this.timeOffsetSec ?? this.$store.state.score.barTimeOffset.timeSec,
      $_barIdx: this.$store.state.score.barTimeOffset.barIdx,
      $_beatPerMinutes: this.$store.state.score.beatPerMinutes,
      $_unitBeatValue: this.$store.state.score.unitBeatValue.clone(),
      $_isAutoSelectBarByPlayTimeEnabled: this.$store.state.score.isAutoSelectBarByPlayTimeEnabled,
    };
  },

  computed: {
    $_barNumber: {
      get(): number { return this.$data.$_barIdx + 1 },
      set(barNumber: number) { this.$data.$_barIdx = Math.trunc(barNumber - 1) },
    },

    $_rules(): { [key: string]: ((value: any) => string | true)[] } {
      return {
        timeOffset: [
          (timeOffsetSec: any) => (isEmptyLike(timeOffsetSec)? 'Time offset must not be empty.' : true),
        ],
        barNumber: [
          (barNumber: any) => (isEmptyLike(barNumber)? 'Bar number must not be empty.' : true),
          (barNumber: number) => ((barNumber <= 0)? 'Bar number must be more than 0.' : true),
        ],
        beatPerMinutes: [
          (beatPerMinutes: any) => (isEmptyLike(beatPerMinutes)? 'BPM must not be empty.' : true),
          (beatPerMinutes: number) => ((beatPerMinutes <= 0)? 'BPM must be more than 0.' : true),
        ],
        unitBeatValue: [
          (unitBeatValue: any) => (isEmptyLike(unitBeatValue)? 'Unit beat value must not be empty.' : true),
        ],
      };
    },
  },

  methods: {
    $_loadData() {
      this.$data.$_timeOffsetSec = this.timeOffsetSec ?? this.$store.state.score.barTimeOffset.timeSec;
      this.$data.$_barIdx = this.$store.state.score.barTimeOffset.barIdx;
      this.$data.$_beatPerMinutes = this.$store.state.score.beatPerMinutes;
      this.$data.$_unitBeatValue = this.$store.state.score.unitBeatValue.clone();
      this.$data.$_isAutoSelectBarByPlayTimeEnabled = this.$store.state.score.isAutoSelectBarByPlayTimeEnabled;
    },

    async $_ok() {
      await this.$store.dispatch(
        'score/setBarTimeOffset',
        new BarTimeOffset(
          this.$data.$_timeOffsetSec,
          this.$data.$_barIdx,
        ),
      );
      await this.$store.dispatch(
        'score/setBeatPerMinutes',
        {
          beatPerMinutes: this.$data.$_beatPerMinutes,
          unitBeatValue: this.$data.$_unitBeatValue.clone(),
        }
      );
      await this.$store.dispatch(
        'score/setIsAutoSelectBarByPlayTimeEnabled',
        this.$data.$_isAutoSelectBarByPlayTimeEnabled,
      );
    },
  },
})
</script>