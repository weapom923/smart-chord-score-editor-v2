<template>
  <div class="d-flex align-center">
    <v-text-field
      type="number"
      class="w-50"
      v-model.number="$_barValueNumerator"
      v-bind:label="$t('beat')"
      v-bind="$attrs"
      v-bind:rules="$_rules"
      v-bind:min="barValueNumeratorMin"
    >
    </v-text-field>
    <v-select
      class="w-50"
      v-model="$_barValueDenominator"
      v-bind="$attrs"
      v-bind:items="barValueDenominators"
    >
      <template v-slot:prepend-inner>/</template>
    </v-select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NoteValue } from '../../modules/NoteValue';
import { isEmptyLike } from '../../modules/utils';

const barValueNumeratorMin = 1;

export default defineComponent({
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
      $_tempNumerator: undefined,
      $_tempDenominator: undefined,
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

  watch: {
    barValue: {
      handler(barValue?: NoteValue) {
        if (barValue) {
          this.$data.$_tempNumerator = barValue.numerator;
          this.$data.$_tempDenominator = barValue.denominator;
        } else {
          this.$data.$_tempNumerator = undefined;
          this.$data.$_tempDenominator = undefined;
        }
      },
      immediate: true,
      deep: true,
    }
  },
})
</script>