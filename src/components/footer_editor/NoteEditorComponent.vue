<template>
  <v-card>
    <v-card-text class="pa-0">
      <v-range-slider
        density="compact" color="primary" hide-details
        v-if="$data.$_noteValueSliderValues !== undefined"
        v-model="$data.$_noteValueSliderValues"
        v-bind:min="0"
        v-bind:max="$_numSliderTicks"
        v-bind:step="1"
        v-on:update:model-value="$_onChangeValues"
        v-on:start="$_onChangeValues"
        v-on:end="$_onFixValues"
        v-on:keydown="$_fixCurrentSliderValues"
      />
      <note-value-selector-buttons
        v-if="($_safeNoteValueSliderUnitValue !== undefined) && ($data.$_noteValueSliderUnitValue !== undefined)"
        v-model:unit-note-value="$data.$_noteValueSliderUnitValue"
        v-bind:safe-unit-note-value="$_safeNoteValueSliderUnitValue"
      />
      <chord-editor-component
        class="mt-3"
        v-if="($_selectedNoteChord !== undefined) && ($_selectedNote !== undefined)"
        v-model:chord="$_selectedNoteChord"
        v-bind:note-type="$_selectedNote.type"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Bar } from '../../modules/Bar';
import { PartInBar } from '../../modules/PartInBar';
import { Note } from '../../modules/Note';
import { NoteValue, nv } from '../../modules/NoteValue';
import { Chord } from '../../modules/Chord';
import { NotePitch } from '../../modules/NotePitch';
import NoteValueSelectorButtons from '../parts/NoteValueSelectorButtons.vue';
import ChordEditorComponent from '../footer_editor/ChordEditorComponent.vue';
import { SectionAndBarIdx } from '../../modules/SectionAndBarRange';

export default {
  emits: {
    'update:temporalSelectedPart': (part?: PartInBar) => true,
    'update:selectedNoteIdx': (noteIdx: NoteIdx) => true,
  },

  components: {
    NoteValueSelectorButtons,
    ChordEditorComponent,
  },

  watch: {
    selectedSectionAndBarIdx() { this.$_initialize() },
    selectedPartIdx() { this.$_initialize() },
    selectedNoteIdx() { this.$_initialize() },
    '$data.$_noteValueSliderUnitValue': {
      handler() { this.$_setNoteValueSliderValues() },
      deep: true,
    },
  },

  props: {
    selectedBar:              { type: Bar, required: true },
    selectedSectionAndBarIdx: { type: SectionAndBarIdx, required: true },
    selectedPartIdx:          { type: Number, required: true },
    selectedNoteIdx:          { type: Number, required: true },
    temporalSelectedPart:     { type: PartInBar },
  },

  data(): {
    $_noteValueSliderUnitValue?: NoteValue,
    $_noteValueSliderValues?: [ number, number ],
    $_isChangingNoteValue: boolean,
  } {
    return {
      $_noteValueSliderUnitValue: undefined,
      $_noteValueSliderValues: undefined,
      $_isChangingNoteValue: false,
    };
  },

  computed: {
    $_selectedPart(): PartInBar {
      if (this.temporalSelectedPart !== undefined) return this.temporalSelectedPart;
      return this.selectedBar.getPart(this.selectedPartIdx);
    },

    $_selectedNote(): Note | undefined {
      if (this.selectedNoteIdx >= this.$_numNotes) return undefined;
      return this.$_selectedPart.getNote(this.selectedNoteIdx);
    },

    $_selectedNoteChord: {
      get(): Chord | null | undefined {
        if (this.$_selectedNote === undefined) return undefined;
        if (this.$_selectedNote.pitchOrChord instanceof NotePitch) return undefined;
        return this.$_selectedNote.pitchOrChord;
      },
      async set(chord: Chord | null) {
        if (this.$_selectedNote === undefined) return;
        let newNote = this.$_selectedNote.clone();
        newNote.pitchOrChord = chord;
        await this.$store.dispatch(
          'score/replaceNote',
          {
            sectionAndBarIdx: this.selectedSectionAndBarIdx,
            partIdx: this.selectedPartIdx,
            noteIdx: this.selectedNoteIdx,
            note: newNote,
          },
        );
      },
    },

    $_numSliderTicks(): number | undefined {
      if (this.$data.$_noteValueSliderUnitValue === undefined) return undefined;
      return this.selectedBar.value.clone()
        .divide(this.$data.$_noteValueSliderUnitValue)
        .toNumber()
    },

    $_numNotes(): number { return this.$_selectedPart.numNotes },

    $_previousNoteIdx(): number | undefined {
      if (this.selectedNoteIdx === 0) return undefined;
      return this.selectedNoteIdx - 1;
    },

    $_previousNoteValue(): NoteValue {
      if (this.$_previousNoteIdx === undefined) return nv.zero;
      return this.$_selectedPart.notes[this.$_previousNoteIdx].value;
    },

    $_nextNoteIdx(): number | undefined {
      if (this.$_selectedPart.lastNoteIdx === undefined) return undefined;
      if (this.selectedNoteIdx >= this.$_selectedPart.lastNoteIdx) return undefined;
      return this.selectedNoteIdx + 1;
    },

    $_nextNote(): Note | undefined {
      if (this.$_nextNoteIdx === undefined) return undefined;
      return this.$_selectedPart.getNote(this.$_nextNoteIdx);
    },

    $_preNoteAccumulatedValue(): NoteValue {
      let preNoteAccumulatedValue = nv.zero;
      for (let selectedNoteIdxInPart of this.$_selectedPart.noteIndices()) {
        if (selectedNoteIdxInPart === this.selectedNoteIdx) break;
        let selectedNoteInPart = this.$_selectedPart.getNote(selectedNoteIdxInPart);
        preNoteAccumulatedValue.add(selectedNoteInPart.value);
      }
      return preNoteAccumulatedValue;
    },

    $_noteValueSliderValueMin(): number | undefined {
      if (this.$data.$_noteValueSliderUnitValue === undefined) return undefined;
      return this.$_preNoteAccumulatedValue.clone()
        .subtract(this.$_previousNoteValue)
        .divide(this.$data.$_noteValueSliderUnitValue)
        .toNumber();
    },

    $_noteValueSliderValueMax(): number | undefined {
      if (this.$data.$_noteValueSliderUnitValue === undefined) return undefined;
      if ((this.$_selectedNote !== undefined) && (this.$_nextNote !== undefined)) {
        return this.$_preNoteAccumulatedValue.clone()
          .add(this.$_selectedNote.value)
          .add(this.$_nextNote.value)
          .divide(this.$data.$_noteValueSliderUnitValue)
          .toNumber();
      } else {
        return this.selectedBar.value.clone()
          .divide(this.$data.$_noteValueSliderUnitValue)
          .toNumber();
      }
    },

    $_initialNoteValueSliderValues(): [ number, number ] | undefined {
      if (this.$_selectedNote === undefined) return undefined;
      if (this.$data.$_noteValueSliderUnitValue === undefined) return undefined;
      let noteValueSliderValueLow = this.$_preNoteAccumulatedValue.clone()
        .divide(this.$data.$_noteValueSliderUnitValue)
        .toNumber();
      let noteValueSliderValueHigh = this.$_preNoteAccumulatedValue.clone()
        .add(this.$_selectedNote.value)
        .divide(this.$data.$_noteValueSliderUnitValue)
        .toNumber()
      return [
        noteValueSliderValueLow,
        noteValueSliderValueHigh,
      ];
    },

    $_safeNoteValueSliderUnitValue() {
      if (this.$_selectedPart.firstNote === undefined) return undefined;
      let safeSliderUnitValueDenominator = this.$_selectedPart.firstNote.value.clone().reduce().denominator;
      for (let note of this.$_selectedPart.notes) {
        let currentNoteValueDenominator = note.value.clone().reduce().denominator;
        if (safeSliderUnitValueDenominator < currentNoteValueDenominator) {
          safeSliderUnitValueDenominator = currentNoteValueDenominator;
        }
      }
      return new NoteValue(1, safeSliderUnitValueDenominator);
    },
  },

  mounted() {
    this.$_initialize();
  },

  methods: {
    $_initialize() {
      if (!this.$data.$_isChangingNoteValue && (this.$_safeNoteValueSliderUnitValue !== undefined)) {
        if (this.$data.$_noteValueSliderUnitValue === undefined) {
          this.$data.$_noteValueSliderUnitValue = nv.divisible.eighth;
        }
        if (this.$data.$_noteValueSliderUnitValue.isGreaterThan(this.$_safeNoteValueSliderUnitValue)) {
          this.$data.$_noteValueSliderUnitValue = this.$_safeNoteValueSliderUnitValue.clone();
        }
      }
      this.$_setNoteValueSliderValues();
    },

    $_setNoteValueSliderValues() {
      this.$data.$_noteValueSliderValues = this.$_initialNoteValueSliderValues;
    },

    $_onChangeValues([ noteValueSliderValueLow, noteValueSliderValueHigh ]: [ number, number ]) {
      if (this.$data.$_noteValueSliderUnitValue === undefined) return;
      if (this.$_initialNoteValueSliderValues === undefined) return;
      if (this.$_noteValueSliderValueMin === undefined) return;
      if (this.$_noteValueSliderValueMax === undefined) return;
      this.$data.$_isChangingNoteValue = true;
      if (noteValueSliderValueLow < this.$_noteValueSliderValueMin) {
        noteValueSliderValueLow = this.$_noteValueSliderValueMin;
      }
      if (noteValueSliderValueHigh > this.$_noteValueSliderValueMax) {
        noteValueSliderValueHigh = this.$_noteValueSliderValueMax;
      }
      let numNotesInPart = this.$_selectedPart.numNotes;
      let isTargetNoteFirstNote = (this.selectedNoteIdx === 0);

      let oldValueLow = this.$_initialNoteValueSliderValues[0];
      let newValueLow = noteValueSliderValueLow;
      let oldValueHigh = this.$_initialNoteValueSliderValues[1];
      let newValueHigh = noteValueSliderValueHigh;

      let targetNoteValue = new NoteValue(newValueHigh - newValueLow).multiply(this.$data.$_noteValueSliderUnitValue);
      let leftNoteValueDifference = new NoteValue(newValueLow - oldValueLow).multiply(this.$data.$_noteValueSliderUnitValue);
      let rightNoteValueDifference = new NoteValue(newValueHigh - oldValueHigh).multiply(this.$data.$_noteValueSliderUnitValue);
      let isValueLowChanged = (newValueLow !== oldValueLow);

      let newNotes: Note[] = [];
      let newSelectedNoteIdx = this.selectedNoteIdx;
      let insertRestNoteToFront = isValueLowChanged && isTargetNoteFirstNote;
      if (insertRestNoteToFront) {
        let noteValue = leftNoteValueDifference;
        newNotes.push(new Note(null, noteValue, 'rest', false));
        ++newSelectedNoteIdx;
      }
      for (let currentNoteIdx = 0; currentNoteIdx < numNotesInPart; ++currentNoteIdx) {
        let currentNote = this.$_selectedPart.notes[currentNoteIdx].clone();
        if (currentNoteIdx === this.selectedNoteIdx) {
          currentNote.value.assign(targetNoteValue);
        } else if (currentNoteIdx === (this.$_previousNoteIdx)) {
          currentNote.value.add(leftNoteValueDifference);
        } else if (currentNoteIdx === (this.$_nextNoteIdx)) {
          currentNote.value.subtract(rightNoteValueDifference);
        }
        newNotes.push(currentNote);
      }
      this.$emit('update:temporalSelectedPart', new PartInBar(newNotes, this.$_selectedPart.type));
      this.$emit('update:selectedNoteIdx', newSelectedNoteIdx);
    },

    $_onFixValues([ noteValueSliderValueLow, noteValueSliderValueHigh ]: [ number, number ]) {
      this.$_onChangeValues(([ noteValueSliderValueLow, noteValueSliderValueHigh ]));
      this.$nextTick(async () => {
        let newNotes = new Array();
        let newSelectedNoteIdx = this.selectedNoteIdx;
        for (let currentNoteIdx = 0; currentNoteIdx < this.$_numNotes; ++currentNoteIdx) {
          let note = this.$_selectedPart.notes[currentNoteIdx];
          if (note.value.isGreaterThan(nv.zero)) {
            newNotes.push(note);
          } else {
            if (currentNoteIdx < this.selectedNoteIdx) {
              --newSelectedNoteIdx;
            }
            if (newSelectedNoteIdx < 0) {
              newSelectedNoteIdx = 0;
            }
          }
        }
        let newPartInBar = new PartInBar(newNotes, this.$_selectedPart.type);
        this.$emit('update:temporalSelectedPart', undefined);
        this.$emit('update:selectedNoteIdx', newSelectedNoteIdx);
        await this.$store.dispatch(
          'score/replacePart',
          {
            sectionAndBarIdx: this.selectedSectionAndBarIdx,
            partIdx: this.selectedPartIdx,
            partInBar: newPartInBar,
          },
        );
        this.$data.$_isChangingNoteValue = false;
      });
    },

    $_fixCurrentSliderValues() {
      if (this.$data.$_noteValueSliderValues !== undefined) {
        this.$_onFixValues(this.$data.$_noteValueSliderValues);
      }
    },
  },
}
</script>