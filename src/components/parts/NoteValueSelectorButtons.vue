<template>
  <v-btn-toggle
    mandatory density="compact" color="primary"
    v-model="$_unitNoteValueLabel"
  >
    <v-btn
      size="x-small"
      v-for="( props, idx ) of $_divisibleUnitNoteValueButtonProps"
      v-bind:key="idx"
      v-bind="props"
      v-on:keydown.stop
    >
    </v-btn>
  </v-btn-toggle>
</template>

<script lang="ts">
import { NoteValue, nv } from '../../modules/NoteValue';
import { VBtn } from 'vuetify/lib/components/index.mjs';

type VBtnPropsType = InstanceType<typeof VBtn>['$props'];

export default {
  emits: {
    'update:unitNoteValue': (noteValue: NoteValue) => true,
  },

  props: {
    unitNoteValue:     { type: NoteValue, required: true },
    safeUnitNoteValue: { type: NoteValue, required: true },
  },

  computed: {
    $_divisibleUnitNoteLabelToValue(): Map<string, NoteValue> {
      return new Map<string, NoteValue>([
        [ '1',  nv.divisible.whole        ],
        [ '2',  nv.divisible.half         ],
        [ '4',  nv.divisible.quarter      ],
        [ '8',  nv.divisible.eighth       ],
        [ '16', nv.divisible.sixteenth    ],
        [ '32', nv.divisible.thirtySecond ],
        [ '64', nv.divisible.sixtyFourth  ],
      ]);
    },

    $_divisibleUnitNoteValueButtonProps(): VBtnPropsType[] {
      return [ ...this.$_divisibleUnitNoteLabelToValue.entries() ].map(([ label, unitNoteValue ]): VBtnPropsType => {
        return {
          text: label,
          value: label, 
          disabled: unitNoteValue.isGreaterThan(this.safeUnitNoteValue),
        };
      });
    },

    $_unitNoteValueLabel: {
      get(): string | undefined {
        if (this.unitNoteValue === undefined) {
          for (let { value, disabled } of this.$_divisibleUnitNoteValueButtonProps) {
            if (!disabled) return value;
          }
        } else {
          for (let [ label, divisibleUnitNoteValue ] of this.$_divisibleUnitNoteLabelToValue.entries()) {
            if (this.unitNoteValue.isEqualTo(divisibleUnitNoteValue)) return label;
          }
        }
        return undefined;
      },
      set(unitNoteValueLabel: string) {
        let unitNoteValue = this.$_divisibleUnitNoteLabelToValue.get(unitNoteValueLabel);
        if (unitNoteValue === undefined) return;
        this.$emit('update:unitNoteValue', unitNoteValue.clone());
      },
    },
  },
}
</script>