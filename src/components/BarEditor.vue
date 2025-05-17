<template>
  <div
    class="d-flex flex-column"
    v-bind:style="$_barEditorStyle"
  >
    <bar-editor-toolbar
      density="compact"
      v-model:selected-part-idx="$data.$_selectedPartIdx"
    >
    </bar-editor-toolbar>
    <v-container id="editor-container" class="flex-grow-1 overflow-scroll">
      <v-row v-if="$_selectedSectionAndBarRange">
        <v-col cols="3">
          <bar-detail-editor-component>
          </bar-detail-editor-component>
        </v-col>

        <v-col
          cols="9"
          v-if="($_selectedSectionAndBarIdx !== undefined) && ($data.$_selectedPartIdx !== undefined) && ($_selectedBar !== undefined)"
        >
          <bar-editor-buttons-component
            ref="barEditorButtonsComponent"
            flat class="pa-0"
            v-if="$_selectedPart !== undefined"
            v-bind:selected-bar="$_selectedBar"
            v-bind:previous-bar="$_previousBar"
            v-bind:next-bar="$_nextBar"
            v-bind:selected-part="$_selectedPart"
            v-bind:selected-section-and-bar-idx="$_selectedSectionAndBarIdx"
            v-bind:selected-part-idx="$data.$_selectedPartIdx"
            v-model:selected-note-idx="$_selectedNoteIdx"
          >
          </bar-editor-buttons-component>
          <note-editor-component
            flat class="pa-0"
            v-if="$_selectedNoteIdx !== undefined"
            v-model:temporal-selected-part="$data.$_temporalSelectedPart"
            v-bind:selected-bar="$_selectedBar"
            v-bind:selected-section-and-bar-idx="$_selectedSectionAndBarIdx"
            v-bind:selected-part-idx="$data.$_selectedPartIdx"
            v-model:selected-note-idx="$_selectedNoteIdx"
          >
          </note-editor-component>
        </v-col>
      </v-row>

      <div v-else>{{ $t('editorAppearsHereWhenBarsSelected') }}</div>
    </v-container>
  </div>
</template>

<style scoped>
#bar-component-container {
  position: relative;
}

#editor-container,
:deep(#bar-editor-toolbar-item-container) {
  max-width: 1000px;
}
</style>

<script lang="ts">
import { defineComponent, ref, CSSProperties } from 'vue';
import BarEditorToolbar from './BarEditor/BarEditorToolbar.vue';
import BarEditorButtonsComponent from './BarEditor/BarEditorButtonsComponent.vue';
import NoteEditorComponent from './BarEditor/NoteEditorComponent.vue';
import BarDetailEditorComponent from './BarEditor/BarDetailEditorComponent.vue';
import { getKeyEventType } from '../modules/KeyEventType';
import { Bar } from '../modules/Bar';
import { PartInBar, PartInBarType } from '../modules/PartInBar';
import { SectionAndBarIdx, SectionAndBarRange } from '../modules/SectionAndBarRange';
import { PartAndNoteIdx } from '@/modules/PartAndNoteIdx';

const BarEditor = defineComponent({
  setup() {
    return {
      barEditorButtonsComponent: ref<InstanceType<typeof BarEditorButtonsComponent>>(),
    };
  },

  components: {
    BarEditorToolbar,
    BarEditorButtonsComponent,
    NoteEditorComponent,
    BarDetailEditorComponent,
  },

  watch: {
    $_selectedSectionAndBarRange: {
      handler(
        newSelectedSectionAndBarRange?: SectionAndBarRange,
        oldSelectedSectionAndBarRange?: SectionAndBarRange,
      ) {
        if (
          newSelectedSectionAndBarRange &&
          oldSelectedSectionAndBarRange &&
          newSelectedSectionAndBarRange.isEqualTo(oldSelectedSectionAndBarRange)
        ) {
          return;
        }
        this.$_resetSelection();
      },
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
        if (selectedPart) {
          this.$data.$_lastPartInBarType = selectedPart.type;
        }
        this.$_truncateSelectedNoteIdx(selectedPart);
      },
      deep: true,
    },
  },

  props: {
    width: { type: Number },
    height: { type: Number },
  },

  data(): {
    $_selectedPartIdx?: PartIdx,
    $_temporalSelectedPart?: PartInBar,
    $_lastPartInBarType?: PartInBarType,
  } {
    return {
      $_selectedPartIdx: undefined,
      $_temporalSelectedPart: undefined,
      $_lastPartInBarType: undefined,
    };
  },

  computed: {
    $_selectedPartAndNoteIdx: {
      get(): PartAndNoteIdx | undefined {
        return this.$store.state.score.selectedPartAndNoteIdx;
      },
      set(selectedPartAndNoteIdx?: PartAndNoteIdx) {
        if (!this.$_selectedSectionAndBarIdx) return;
        if (selectedPartAndNoteIdx !== undefined) {
          this.$store.dispatch(
            'score/selectPartAndNote',
            {
              sectionAndBarIdx: this.$_selectedSectionAndBarIdx,
              partAndNoteIdx: selectedPartAndNoteIdx,
            },
          );
        } else {
          this.$store.dispatch('score/unselectPartAndNote');
        }
      },
    },

    $_selectedNoteIdx: {
      get(): NoteIdx | undefined {
        return this.$_selectedPartAndNoteIdx?.noteIdx;
      },
      set(noteIdx?: NoteIdx) {
        if (!this.$_selectedSectionAndBarIdx) return;
        if (this.$data.$_selectedPartIdx === undefined) return;
        if (noteIdx !== undefined) {
          this.$store.dispatch(
            'score/selectPartAndNote',
            {
              sectionAndBarIdx: this.$_selectedSectionAndBarIdx,
              partAndNoteIdx: new PartAndNoteIdx(
                this.$data.$_selectedPartIdx,
                noteIdx,
              ),
            },
          );
        } else {
          this.$store.dispatch('score/unselectPartAndNote');
        }
      },
    },

    $_barEditorStyle(): CSSProperties {
      const barEditorStyle: CSSProperties = {};
      if (this.width) {
        barEditorStyle.width = `${this.width}px`;
      } else {
        barEditorStyle.width = '100%';
      }
      if (this.height) {
        barEditorStyle.height = `${this.height}px`;
      } else {
        barEditorStyle.height = '100%';
      }
      return barEditorStyle;
    },

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
      const previousSectionAndBarIdx = this.$_score.getPreviousSectionAndBarIdx(this.$_selectedSectionAndBarIdx);
      if (previousSectionAndBarIdx === undefined) return undefined;
      return this.$_score.getBar(previousSectionAndBarIdx);
    },

    $_nextBar(): Bar | undefined {
      if (this.$_selectedSectionAndBarIdx === undefined) return undefined;
      const nextSectionAndBarIdx = this.$_score.getNextSectionAndBarIdx(this.$_selectedSectionAndBarIdx);
      if (nextSectionAndBarIdx === undefined) return undefined;
      return this.$_score.getBar(nextSectionAndBarIdx);
    },
  },

  mounted() {
    this.$_resetSelection();
  },

  methods: {
    async onKeydown(event: KeyboardEvent): Promise<boolean> {
      if (this.$store.state.appState.isBarEditorDrawerMinimized) return false;
      const keyEventType = getKeyEventType(event);
      if (await this.barEditorButtonsComponent?.onKeydown(keyEventType, event)) return true;
      switch (keyEventType) {
        case 'key':
          switch (event.code) {
            case 'KeyL':
              if (this.$_selectedNoteIdx === undefined) {
                return await selectFirstNoteInNextBar.apply(this);
              } else {
                return await incrementNoteIdx.apply(this);
              }
            case 'KeyH':
              if (this.$_selectedNoteIdx === undefined) {
                return await selectLastNoteInPreviousBar.apply(this);
              } else {
                return await decrementNoteIdx.apply(this);
              }
            case 'KeyN': {
              return await selectFirstNoteInNextBar.apply(this);
            }
            case 'KeyB': {
              return await selectLastNoteInPreviousBar.apply(this);
            }
          }
          break;
        case 'repeated_key':
          switch (event.code) {
            case 'KeyL':
              if (this.$_selectedNoteIdx === undefined) {
                return await selectFirstNoteInNextBar.apply(this);
              } else {
                return await incrementNoteIdx.apply(this);
              }
            case 'KeyH':
              if (this.$_selectedNoteIdx === undefined) {
                return await selectLastNoteInPreviousBar.apply(this);
              } else {
                return await decrementNoteIdx.apply(this);
              }
          }
          break;
      }
      return false;

      type This = InstanceType<typeof BarEditor>;
      async function incrementNoteIdx(this: This) {
        if (this.$_numNotesInSelectedPart === undefined) return false;
        if (this.$_numNotesInSelectedPart === 0) return false;
        if (this.$_selectedNoteIdx === undefined) return false;
        if (this.$_selectedNoteIdx === (this.$_numNotesInSelectedPart - 1)) {
          const selectedPart = this.$store.getters['score/selectedPart'];
          await this.$store.dispatch('score/selectNextBar');
          if (selectedPart !== undefined) {
            await this.$store.dispatch('score/selectFirstNoteInSelectedBar', selectedPart.type);
          }
          return true;
        } else {
          ++this.$_selectedNoteIdx;
          return true;
        }
      }

      async function decrementNoteIdx(this: This) {
        if (this.$_numNotesInSelectedPart === undefined) return false;
        if (this.$_numNotesInSelectedPart === 0) return false;
        if (this.$_selectedNoteIdx === undefined) return false;
        if (this.$_selectedNoteIdx === 0) {
          const selectedPart = this.$store.getters['score/selectedPart'];
          await this.$store.dispatch('score/selectPreviousBar');
          if (selectedPart !== undefined) {
            await this.$store.dispatch('score/selectLastNoteInSelectedBar', selectedPart.type);
          }
          return true;
        } else {
          --this.$_selectedNoteIdx;
          return true;
        }
      }

      async function selectFirstNoteInNextBar(this: This): Promise<boolean> {
        await this.$store.dispatch('score/selectNextBar');
        if (this.$data.$_lastPartInBarType !== undefined) {
          await this.$store.dispatch('score/selectFirstNoteInSelectedBar', this.$data.$_lastPartInBarType);
        }
        return true;
      }

      async function selectLastNoteInPreviousBar(this: This): Promise<boolean> {
        await this.$store.dispatch('score/selectPreviousBar');
        if (this.$data.$_lastPartInBarType !== undefined) {
          await this.$store.dispatch('score/selectLastNoteInSelectedBar', this.$data.$_lastPartInBarType);
        }
        return true;
      }
    },

    $_resetSelection() {
      if (
        (this.$_numPartsInSelectedBar === undefined) ||
        (this.$_numPartsInSelectedBar === 0)
      ) {
        this.$_selectedPartAndNoteIdx = undefined;
      } else {
        if (this.$data.$_lastPartInBarType === undefined) {
          this.$data.$_selectedPartIdx = 0;
        } else {
          this.$data.$_selectedPartIdx = this.$_selectedBar?.findSameTypedPartIndex(this.$data.$_lastPartInBarType) && 0;
        }
      }
      if ((this.$_numNotesInSelectedPart === undefined) || (this.$_numNotesInSelectedPart === 0)) {
        this.$_selectedNoteIdx = undefined;
      } else {
        this.$_selectedNoteIdx = 0;
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
        this.$_selectedNoteIdx = undefined;
      } else {
        if (this.$_selectedNoteIdx !== undefined) {
          if (this.$_selectedNoteIdx < selectedPart.firstNoteIdx) {
            this.$_selectedNoteIdx = selectedPart.firstNoteIdx;
          } else if (this.$_selectedNoteIdx > selectedPart.lastNoteIdx) {
            this.$_selectedNoteIdx = selectedPart.lastNoteIdx;
          }
        }
      }
    },
  },
});

export default BarEditor;
</script>