<template>
  <div class="overflow-x-hidden overflow-y-auto" v-on:keydown="onKeydown">
    <bar-editor-toolbar
      density="compact"
      v-model:selected-part-idx="$data.$_selectedPartIdx"
    >
    </bar-editor-toolbar>
    <v-container id="editor-container" class="overflow-auto">
      <v-row>
        <v-col cols="3">
          <v-card>
            <v-card-text class="pa-0">
              <bar-detail-editor-component
                flat tile
              >
              </bar-detail-editor-component>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="9"
          id="bar-component-container"
          v-if="($_selectedSectionAndBarIdx !== undefined) && ($data.$_selectedPartIdx !== undefined) && ($_selectedBar !== undefined)"
        >
          <bar-editor-component
            ref="barEditorComponent"
            flat class="pa-0"
            v-if="$_selectedPart !== undefined"
            v-bind:selected-bar="$_selectedBar"
            v-bind:previous-bar="$_previousBar"
            v-bind:next-bar="$_nextBar"
            v-bind:selected-part="$_selectedPart"
            v-bind:selected-section-and-bar-idx="$_selectedSectionAndBarIdx"
            v-model:selected-part-idx="$data.$_selectedPartIdx"
            v-model:selected-note-idx="$data.$_selectedNoteIdx"
          >
          </bar-editor-component>
          <note-editor-component
            flat class="pa-0"
            v-if="$data.$_selectedNoteIdx !== undefined"
            v-model:temporal-selected-part="$data.$_temporalSelectedPart"
            v-bind:selected-bar="$_selectedBar"
            v-bind:selected-section-and-bar-idx="$_selectedSectionAndBarIdx"
            v-bind:selected-part-idx="$data.$_selectedPartIdx"
            v-model:selected-note-idx="$data.$_selectedNoteIdx"
          >
          </note-editor-component>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style>
#bar-component-container {
  position: relative;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import BarEditorToolbar from '../footer_editor/BarEditorToolbar.vue';
import BarEditorComponent from '../footer_editor/BarEditorComponent.vue';
import NoteEditorComponent from '../footer_editor/NoteEditorComponent.vue';
import BarDetailEditorComponent from '../footer_editor/BarDetailEditorComponent.vue';
import { getKeyEventType } from '../../modules/KeyEventType';
import { Bar } from '../../modules/Bar';
import { PartInBar, PartInBarType } from '../../modules/PartInBar';
import { SectionAndBarIdx, SectionAndBarRange } from '../../modules/SectionAndBarRange';

const EditorComponent = defineComponent({
  components: {
    BarEditorToolbar,
    BarEditorComponent,
    NoteEditorComponent,
    BarDetailEditorComponent,
  },

  watch: {
    $_selectedSectionAndBarRange: {
      handler() { this.$_resetSelection() },
      deep: true,
    },

    $_selectedBar: {
      handler(selectedBar?: Bar) {
        this.$_truncateSelectedPartIdx(selectedBar);
      },
      deep: true,
    },

    $_selectedPart: {
      handler(selectedPart?: PartInBar) {
        this.$data.$_lastPartInBarType = selectedPart?.type;
        this.$_truncateSelectedNoteIdx(selectedPart);
      },
      deep: true,
    },
  },

  data(): {
    $_selectedPartIdx?: PartIdx,
    $_selectedNoteIdx?: NoteIdx,
    $_temporalSelectedPart?: PartInBar,
    $_lastPartInBarType?: PartInBarType,
  } {
    return {
      $_selectedPartIdx: undefined,
      $_selectedNoteIdx: undefined,
      $_temporalSelectedPart: undefined,
      $_lastPartInBarType: undefined,
    };
  },

  computed: {
    $_score() {
      return this.$store.state.score.score;
    },

    $_selectedSectionAndBarRange(): SectionAndBarRange | undefined {
      return this.$store.state.score.selectedBars;
    },

    $_selectedSectionAndBarIdx(): SectionAndBarIdx | undefined {
      if (this.$_selectedSectionAndBarRange === undefined) return undefined;
      if (!this.$_selectedSectionAndBarRange.includeSingleBarOnly) return undefined;
      return this.$_selectedSectionAndBarRange.first;
    },

    $_selectedBar(): Bar | undefined {
      if (this.$_selectedSectionAndBarIdx === undefined) return undefined;
      return this.$_score.getBar(this.$_selectedSectionAndBarIdx);
    },

    $_selectedPart(): PartInBar | undefined {
      if (this.$data.$_selectedPartIdx === undefined) return undefined;
      if (this.$data.$_temporalSelectedPart !== undefined) return this.$data.$_temporalSelectedPart;
      return this.$_selectedBar?.getPart(this.$data.$_selectedPartIdx);
    },

    $_numPartsInSelectedBar(): number | undefined {
      return this.$_selectedBar?.numParts;
    },

    $_numNotesInSelectedPart(): number | undefined {
      return this.$_selectedPart?.numNotes;
    },

    $_previousBar(): Bar | undefined {
      if (this.$_selectedSectionAndBarIdx === undefined) return undefined;
      let previousSectionAndBarIdx = this.$_score.getPreviousSectionAndBarIdx(this.$_selectedSectionAndBarIdx);
      if (previousSectionAndBarIdx === undefined) return undefined;
      return this.$_score.getBar(previousSectionAndBarIdx);
    },

    $_nextBar(): Bar | undefined {
      if (this.$_selectedSectionAndBarIdx === undefined) return undefined;
      let nextSectionAndBarIdx = this.$_score.getNextSectionAndBarIdx(this.$_selectedSectionAndBarIdx);
      if (nextSectionAndBarIdx === undefined) return undefined;
      return this.$_score.getBar(nextSectionAndBarIdx);
    },
  },

  mounted() {
    this.$_resetSelection();
  },

  methods: {
    $_getBarEditorComponent(): InstanceType<typeof BarEditorComponent> | undefined | null {
      return this.$refs.barEditorComponent as any;
    },

    async onKeydown(event: KeyboardEvent): Promise<boolean> {
      let keyEventType = getKeyEventType(event);
      if (await this.$_getBarEditorComponent()?.onKeydown(keyEventType, event) ?? false) return true;
      switch (keyEventType) {
        case 'key':
          switch (event.code) {
            case 'KeyL':
              return incrementNoteIdx.apply(this);
            case 'KeyH':
              return decrementNoteIdx.apply(this);
            case 'KeyN':
              await this.$store.dispatch('score/selectNextBar');
              return true;
            case 'KeyB':
              await this.$store.dispatch('score/selectPreviousBar');
              return true;
          }
          break;
        case 'repeated_key':
          switch (event.code) {
            case 'KeyL':
              incrementNoteIdx.apply(this);
              return true;
            case 'KeyH':
              decrementNoteIdx.apply(this);
              return true;
          }
          break;
      }
      return false;

      type This = InstanceType<typeof EditorComponent>;
      function incrementNoteIdx(this: This) {
        if (this.$_numNotesInSelectedPart === undefined) return false;
        if (this.$_numNotesInSelectedPart === 0) return false;
        if (this.$data.$_selectedNoteIdx === undefined) return false;
        if (this.$data.$_selectedNoteIdx === (this.$_numNotesInSelectedPart - 1)) return true;
        ++this.$data.$_selectedNoteIdx;
        return true;
      }

      function decrementNoteIdx(this: This) {
        if (this.$_numNotesInSelectedPart === undefined) return false;
        if (this.$_numNotesInSelectedPart === 0) return false;
        if (this.$data.$_selectedNoteIdx === undefined) return false;
        if (this.$data.$_selectedNoteIdx === 0) return true;
        --this.$data.$_selectedNoteIdx;
        return true;
      }
    },

    $_resetSelection() {
      if ((this.$_numPartsInSelectedBar === undefined) || (this.$_numPartsInSelectedBar === 0)) {
        this.$data.$_selectedPartIdx = undefined;
      } else {
        if (this.$data.$_lastPartInBarType === undefined) {
          this.$data.$_selectedPartIdx = 0;
        } else {
          this.$data.$_selectedPartIdx = this.$_selectedBar?.findSameTypedPartIndex(this.$data.$_lastPartInBarType) && 0;
        }
      }
      if ((this.$_numNotesInSelectedPart === undefined) || (this.$_numNotesInSelectedPart === 0)) {
        this.$data.$_selectedNoteIdx = undefined;
      } else {
        this.$data.$_selectedNoteIdx = 0;
      }
      this.$data.$_temporalSelectedPart = undefined;
    },

    $_truncateSelectedPartIdx(selectedBar?: Bar) {
      if ((selectedBar?.firstPartIdx === undefined) || (selectedBar?.lastPartIdx === undefined)) {
        this.$data.$_selectedPartIdx = undefined;
      } else {
        if (this.$data.$_selectedPartIdx !== undefined) {
          if (this.$data.$_selectedPartIdx < selectedBar.firstPartIdx) {
            this.$data.$_selectedPartIdx = selectedBar.firstPartIdx;
          } else if (this.$data.$_selectedPartIdx > selectedBar.lastPartIdx) {
            this.$data.$_selectedPartIdx = selectedBar.lastPartIdx;
          }
        }
      }
    },

    $_truncateSelectedNoteIdx(selectedPart?: PartInBar) {
      if ((selectedPart?.firstNoteIdx === undefined) || (selectedPart?.lastNoteIdx === undefined)) {
        this.$data.$_selectedNoteIdx = undefined;
      } else {
        if (this.$data.$_selectedNoteIdx !== undefined) {
          if (this.$data.$_selectedNoteIdx < selectedPart.firstNoteIdx) {
            this.$data.$_selectedNoteIdx = selectedPart.firstNoteIdx;
          } else if (this.$data.$_selectedNoteIdx > selectedPart.lastNoteIdx) {
            this.$data.$_selectedNoteIdx = selectedPart.lastNoteIdx;
          }
        }
      }
    },
  },
});

export default EditorComponent;
</script>