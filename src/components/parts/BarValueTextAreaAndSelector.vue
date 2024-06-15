<template>
  <div class="d-flex align-center">
    <v-text-field
      number
      type="number"
      v-model.number="$_barValueNumerator"
      v-bind:label="$t('beat')"
      v-bind="$attrs"
      v-bind:rules="$_rules"
      v-bind:min="barValueNumeratorMin"
    />
    <div>/</div>
    <v-select
      variant="solo-filled"
      v-model="$_barValueDenominator"
      v-bind="$attrs"
      v-bind:items="barValueDenominators"
    />
  </div>
</template>

<script lang="ts">
import { NoteValue } from '../../modules/NoteValue';
import { isEmptyLike } from '../../modules/utils';

const barValueNumeratorMin = 1;

export default {
  setup(): {
    barValueNumeratorMin: typeof barValueNumeratorMin,
    barValueDenominators: number[],
  } {
    return {
      barValueNumeratorMin,
      barValueDenominators: [ 4, 8, 16, 32 ],
    };
  },

  inheritAttrs: false,

  emits: {
    'update:barValue': (barValue: NoteValue) => true,
  },

  props: {
    barValue: { type: NoteValue },
  },

  data(): {
    $_tempNumerator?: number,
    $_tempDenominator?: number,
  } {
    return {
      $_tempNumerator: this.barValue?.numerator,
      $_tempDenominator: this.barValue?.denominator,
    };
  },

  computed: {
    $_barValueNumerator: {
      get(): number | undefined { return this.$data.$_tempNumerator },
      set(barValueNumerator: number) {
        this.$data.$_tempNumerator = barValueNumerator;
        if (this.$_barValueDenominator === undefined) return;
        this.$emit('update:barValue', new NoteValue(barValueNumerator, this.$_barValueDenominator));
      },
    },

    $_barValueDenominator: {
      get(): number | undefined { return this.$data.$_tempDenominator },
      set(barValueDenominator: number) {
        this.$data.$_tempDenominator = barValueDenominator;
        if (this.$_barValueNumerator === undefined) return;
        this.$emit('update:barValue', new NoteValue(this.$_barValueNumerator, barValueDenominator));
      },
    },

    $_rules(): ((value: any) => string | true)[] {
      return [
        (barValueNumerator: any) => (isEmptyLike(barValueNumerator)? 'Bar value numerator must not be empty' : true),
        (barValueNumerator: number) => {
          if (barValueNumerator < barValueNumeratorMin) {
            return `Bar value numerator must be more than or equal to ${barValueNumeratorMin}.`;
          }
          return true;
        },
      ];
    },
  },
}
</script>