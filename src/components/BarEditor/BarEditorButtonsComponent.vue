<template>
  <v-card>
    <v-card-actions>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('insertBarBefore')"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-plus" size="x-small"
            v-bind="props"
            v-on:click="$_insertEmptyBarBeforeSelectedBar"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('selectPreviousBar')"
        v-bind:disabled="$_isSelectPreviousBarButtonDisabled"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-arrow-left" size="x-small"
            v-bind="props"
            v-bind:disabled="$_isSelectPreviousBarButtonDisabled"
            v-on:click="$_selectPreviousBar"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-spacer></v-spacer>
      <v-tooltip
        location="bottom"
        v-if="$_isSelectedNoteTypeRest"
        v-bind:text="$t('convertToNormalNote')"
        v-bind:disabled="!$_isTiedByNextNote || !$_isNoteSelected"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-music-note-quarter" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isTiedByNextNote || !$_isNoteSelected"
            v-on:click="$_toggleSelectedNoteType"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-else
        v-bind:text="$t('convertToRestNote')"
        v-bind:disabled="!$_isTiedByNextNote || !$_isNoteSelected"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-music-rest-quarter" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isTiedByNextNote || !$_isNoteSelected"
            v-on:click="$_toggleSelectedNoteType"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-if="$_isSelectedNoteTied"
        v-bind:text="$t('untie')"
        v-bind:disabled="!$_isSelectedNoteTieable"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon text="Untie" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isSelectedNoteTieable"
            v-on:click="$_toggleSelectedNoteTied"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-else
        v-bind:text="$t('tie')"
        v-bind:disabled="!$_isSelectedNoteTieable"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon text="Tie" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isSelectedNoteTieable"
            v-on:click="$_toggleSelectedNoteTied"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('removeNote')"
        v-bind:disabled="!$_isTiedByNextNote || !$_isNoteSelected"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-eraser" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isTiedByNextNote || !$_isNoteSelected"
            v-on:click="$_removeSelectedNote"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('copyNote')"
        v-bind:disabled="!$_isNoteSelected"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-content-copy" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isNoteSelected"
            v-on:click="$_copySelectedNote"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-if="$_isNoteCopied"
        v-bind:text="$t('pasteNote')"
        v-bind:disabled="!$_isNoteSelected"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-content-paste" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isNoteSelected"
            v-on:click="$_pasteCopiedNoteContent"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('removeBar')"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-delete" size="x-small"
            v-bind="props"
            v-on:click="$_removeSelectedBar"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('fillBarWithNote')"
        v-bind:disabled="$_isFillBarWithNoteButtonDisabled"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-music-note-plus" size="x-small"
            v-bind="props"
            v-bind:disabled="$_isFillBarWithNoteButtonDisabled"
            v-on:click="$_fillBarWithNote($event.shiftKey)"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-if="$_isSelectedNoteTypeChord"
        v-bind:text="$t('openChordTextDialog')"
        v-bind:disabled="!$_isNoteSelected"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-form-textbox" size="x-small"
            v-bind="props"
            v-bind:disabled="!$_isNoteSelected"
            v-on:click="$_openChordTextEditorDialog"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-spacer></v-spacer>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('selectNextBar')"
        v-bind:disabled="$_isSelectNextBarButtonDisabled"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-arrow-right" size="x-small"
            v-bind="props"
            v-bind:disabled="$_isSelectNextBarButtonDisabled"
            v-on:click="$_selectNextBar"
          >
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip
        location="bottom"
        v-bind:text="$t('insertBarAfter')"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-plus" size="x-small"
            v-bind="props"
            v-on:click="$_insertEmptyBarAfterSelectedBar"
          >
          </v-btn>
        </template>
      </v-tooltip>
    </v-card-actions>
    <v-card-text class="pa-0">
      <system-component
        v-bind:score="$_temporalScore"
        v-bind:section="$_temporalSection"
        v-bind:sectionIdx="0"
        v-bind:bar-range="$_temporalBarRange"
        v-bind:show-beat-on-first-bar="true"
        v-bind:selected-part-idx="0"
        v-model:selected-note-idx="$_selectedNoteIdx"
        v-bind:staff-background-color="$_colorTransparent"
        v-bind:selected-staff-background-color="$_colorTransparent"
        v-bind:show-bar-hover-menu="false"
        v-on:select-note="$_onSelectNote"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import SystemComponent from '../SystemComponent.vue';
import { Score } from '../../modules/Score';
import { Section } from '../../modules/Section';
import { PartInBar } from '../../modules/PartInBar';
import { Note } from '../../modules/Note';
import { nv } from '../../modules/NoteValue';
import { cl } from '../../modules/Color';
import { KeyEventType } from '../../modules/KeyEventType';
import { BarRange, SectionAndBarIdx, SectionAndBarRange } from '../../modules/SectionAndBarRange';
import { Bar } from '../../modules/Bar';
import { bb } from '../../modules/BarBreak';

export default {
  emits: {
    'update:selectedPartIdx': (partIdx: PartIdx) => true,
    'update:selectedNoteIdx': (noteIdx: NoteIdx) => true,
  },

  components: {
    SystemComponent,
  },

  props: {
    selectedPart:             { type: PartInBar, required: true },
    selectedBar:              { type: Bar, required: true },
    previousBar:              { type: Bar },
    nextBar:                  { type: Bar },
    selectedSectionAndBarIdx: { type: SectionAndBarIdx, required: true },
    selectedPartIdx:          { type: Number, required: true },
    selectedNoteIdx:          { type: Number },
  },

  data(): {
    $_copiedNote?: Note,
  } {
    return {
      $_copiedNote: undefined,
    };
  },

  computed: {
    $_temporalSection(): Section {
      let tempBars: Bar[] = [];
      if (this.previousBar !== undefined) {
        let previousBar = this.previousBar.clone();
        previousBar.break = bb.system;
        tempBars.push(previousBar);
      }
      let tempTargetBar = this.selectedBar.clone();
      tempTargetBar.parts = [ this.selectedPart ];
      tempTargetBar.break = bb.system;
      tempBars.push(tempTargetBar);
      if (this.nextBar !== undefined) {
        tempBars.push(this.nextBar);
      }
      return new Section('temporalSection', tempBars);
    },

    $_temporalScore(): Score {
      return new Score(this.$store.state.score.score.metadata, [ this.$_temporalSection ]);
    },

    $_temporalSelectedBarIdx(): BarIdx {
      return (this.previousBar === undefined)? 0 : 1;
    },

    $_temporalBarRange(): BarRange {
      return new BarRange(this.$_temporalSelectedBarIdx);
    },

    $_temporalSelectedSectionAndBarIdx(): SectionAndBarIdx {
      return new SectionAndBarIdx(0, this.$_temporalSelectedBarIdx);
    },

    $_selectedSectionAndBarRange(): SectionAndBarRange { return new SectionAndBarRange(this.selectedSectionAndBarIdx) },

    $_isNoteSelected() {
      return (this.selectedNoteIdx !== undefined);
    },

    $_selectedNoteIdx: {
      get(): NoteIdx | undefined    { return this.selectedNoteIdx },
      set(selectedNoteIdx: NoteIdx) { this.$emit('update:selectedNoteIdx', selectedNoteIdx) },
    },

    $_selectedNote: {
      get(): Note | undefined {
        if (this.selectedNoteIdx === undefined) return undefined;
        return this.selectedPart.getNote(this.selectedNoteIdx)
      },
      async set(note: Note) {
        if (this.selectedNoteIdx === undefined) return undefined;
        await this.$store.dispatch(
          'score/replaceNote',
          {
            sectionAndBarIdx: this.selectedSectionAndBarIdx,
            partIdx: this.selectedPartIdx,
            noteIdx: this.selectedNoteIdx,
            note,
          },
        );
      },
    },

    $_previousNote(): Note | undefined {
      if (this.selectedNoteIdx === undefined) return undefined;
      if (this.selectedPart.firstNoteIdx === undefined) return undefined;
      if (this.selectedNoteIdx > this.selectedPart.firstNoteIdx) {
        return this.selectedPart.getNote(this.selectedNoteIdx - 1);
      } else {
        if (this.previousBar === undefined) return undefined;
        let selectedPreviousPart = this.previousBar.findSameTypedPart(this.selectedPart.type);
        return selectedPreviousPart?.lastNote;
      }
    },

    $_nextNote(): Note | undefined {
      if (this.selectedNoteIdx === undefined) return undefined;
      if (this.selectedPart.lastNoteIdx === undefined) return undefined;
      if (this.selectedNoteIdx < this.selectedPart.lastNoteIdx) {
        return this.selectedPart.getNote(this.selectedNoteIdx + 1);
      } else {
        if (this.nextBar === undefined) return undefined;
        let selectedNextPart = this.nextBar.findSameTypedPart(this.selectedPart.type);
        if (selectedNextPart === undefined) return undefined;
        return selectedNextPart.firstNote;
      }
    },

    $_isNoteCopied(): boolean {
      return (this.$data.$_copiedNote !== undefined);
    },

    $_isSelectedNoteTypeChord(): boolean {
      if (this.selectedPart.type !== 'chord') return false;
      if (this.$_isSelectedNoteTypeRest) return false;
      return true;
    },

    $_isTiedByNextNote(): boolean {
      if (this.$_isSelectedNoteTypeRest) {
        return true;
      } else {
        if (this.$_nextNote === undefined) return true;
        return !this.$_nextNote.tied;
      }
    },

    $_isSelectedNoteTypeRest(): boolean {
      if (this.$_selectedNote === undefined) return false;
      return (this.$_selectedNote.type === 'rest');
    },

    $_isSelectedNoteTieable(): boolean {
      if (this.$_selectedNote === undefined) return false;
      if (this.$_selectedNote.type === 'rest') return false;
      if (this.$_previousNote === undefined) return false;
      if (this.$_previousNote.type === 'rest') return false;
      return true;
    },

    $_isSelectedNoteTied(): boolean {
      if (this.$_selectedNote === undefined) return false;
      if (this.$_previousNote === undefined) return false;
      if (this.$_previousNote.type === 'rest') return false;
      return this.$_selectedNote.tied;
    },

    $_isSelectNextBarButtonDisabled() {
      return (this.nextBar === undefined);
    },

    $_isSelectPreviousBarButtonDisabled() {
      return (this.previousBar === undefined);
    },

    $_remainingNoteValue() {
      let barValue = this.selectedBar.value.clone();
      let totalExistingNoteValue = nv.zero;
      for (let note of this.selectedPart.notes) {
        totalExistingNoteValue.add(note.value);
      }
      return barValue.subtract(totalExistingNoteValue);
    },

    $_isFillBarWithNoteButtonDisabled() {
      return this.$_remainingNoteValue.isLessThanOrEqualTo(nv.zero);
    },

    $_colorTransparent() {
      return cl.transparent;
    },
  },

  methods: {
    async onKeydown(keyEventType: KeyEventType, event: KeyboardEvent) {
      switch (keyEventType) {
        case 'key':
          switch (event.code) {
            case 'KeyT':
              if (!this.$_isSelectedNoteTieable) break;
              return this.$_toggleSelectedNoteTied();
            case 'KeyD':
              if (!this.$_isTiedByNextNote) break;
              return await this.$_removeSelectedNote();
            case 'KeyF':
              if (this.$_isFillBarWithNoteButtonDisabled) break;
              return await this.$_fillBarWithNote(false);
            case 'KeyR':
              if (!this.$_isTiedByNextNote) break;
              return this.$_toggleSelectedNoteType();
            case 'KeyC':
              if (!this.$_isSelectedNoteTypeChord) break;
              return this.$_openChordTextEditorDialog();
            case 'KeyY':
              return this.$_copySelectedNote();
            case 'KeyP':
              return this.$_pasteCopiedNoteContent();
            case 'KeyU':
              await this.$store.dispatch('score/undo');
              return true;
          }
          break;
        case 'key_with_ctrl':
          switch (event.code) {
            case 'KeyR':
              await this.$store.dispatch('score/redo');
              return true;
          }
          break;
        case 'key_with_shift':
          switch (event.code) {
            case 'KeyF':
              if (this.$_isFillBarWithNoteButtonDisabled) break;
              return await this.$_fillBarWithNote(true);
          }
          break;
      }
      return false;
    },

    async $_insertEmptyBarBeforeSelectedBar() {
      await this.$store.dispatch(
        'score/insertBars',
        {
          sectionAndBarIdx: this.selectedSectionAndBarIdx,
          bars: [ this.selectedBar.generateEmptyFrom() ],
          selects: true,
        },
      );
    },

    async $_insertEmptyBarAfterSelectedBar() {
      await this.$store.dispatch(
        'score/insertBars',
        {
          sectionAndBarIdx: new SectionAndBarIdx(
            this.selectedSectionAndBarIdx.sectionIdx,
            this.selectedSectionAndBarIdx.barIdx + 1,
          ),
          bars: [ this.selectedBar.generateEmptyFrom() ],
          selects: true,
        },
      );
    },

    $_toggleSelectedNoteType() {
      if (this.$_selectedNote === undefined) return false;
      let selectedNote = this.$_selectedNote.generateNewNoteFrom();
      selectedNote.type = (this.$_isSelectedNoteTypeRest)? 'normal' : 'rest';
      this.$_selectedNote = selectedNote;
      return true;
    },

    $_toggleSelectedNoteTied() {
      if (this.$_selectedNote === undefined) return false;
      let newNote = this.$_selectedNote.clone();
      newNote.tied = !newNote.tied;
      this.$_selectedNote = newNote; 
      return true;
    },

    $_copySelectedNote() {
      if (this.$_selectedNote === undefined) return false;
      this.$data.$_copiedNote = this.$_selectedNote.clone();
      return true;
    },

    $_pasteCopiedNoteContent() {
      if (this.$_selectedNote === undefined) return false;
      if (this.$data.$_copiedNote === undefined) return false;
      let pastedNote = this.$_selectedNote.clone();
      pastedNote.pitchOrChord = this.$data.$_copiedNote.pitchOrChord;
      pastedNote.type = this.$data.$_copiedNote.type;
      pastedNote.tied = this.$data.$_copiedNote.tied;
      this.$_selectedNote = pastedNote;
      return true;
    },

    async $_removeSelectedNote() {
      if (this.selectedNoteIdx === undefined) return false;
      let newPart = this.selectedPart.clone();
      newPart.notes.splice(this.selectedNoteIdx, 1);
      this.$_selectedNoteIdx = undefined;
      await this.$store.dispatch(
        'score/replacePart',
        {
          sectionAndBarIdx: this.selectedSectionAndBarIdx,
          partIdx: this.selectedPartIdx,
          partInBar: newPart,
        },
      );
      return true;
    },

    async $_removeSelectedBar() {
      await this.$store.dispatch('score/removeBars', this.$_selectedSectionAndBarRange);
    },

    async $_fillBarWithNote(withShiftKey: boolean): Promise<boolean> {
      let remainingNoteValue = this.$_remainingNoteValue.clone();
      let numExistingNotes = this.selectedPart.numNotes;
      let note: Note;
      if (withShiftKey) {
        note = new Note(null, remainingNoteValue, 'rest', false);
      } else {
        switch (this.selectedPart.type) {
          case 'chord':
            note = new Note(null, remainingNoteValue, 'normal', false);
            break;
        default:
          return false;
        }
      }
      await this.$store.dispatch(
        'score/insertNote',
        {
          sectionAndBarIdx: this.selectedSectionAndBarIdx,
          partIdx: this.selectedPartIdx,
          noteIdx: numExistingNotes,
          note: note,
        },
      );
      this.$emit('update:selectedNoteIdx', numExistingNotes);
      return true;
    },

    async $_openChordTextEditorDialog(): Promise<boolean> {
      await this.$store.dispatch(
        'dialog/setDialog',
        {
          componentName: 'chord-text-editor-dialog',
          props: {
            sectionAndBarIdx: this.selectedSectionAndBarIdx,
            partIdx: this.selectedPartIdx,
            noteIdx: this.selectedNoteIdx,
          },
        },
      );
      return true;
    },

    $_onSelectNote({ partIdx, noteIdx }: { partIdx: PartIdx, noteIdx: NoteIdx }) {
      this.$emit('update:selectedPartIdx', partIdx);
      this.$emit('update:selectedNoteIdx', noteIdx);
    },

    async $_selectPreviousBar() {
      await this.$store.dispatch('score/selectPreviousBar');
    },

    async $_selectNextBar() {
      await this.$store.dispatch('score/selectNextBar');
    },
  },
}
</script>