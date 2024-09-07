<template>
  <div
    id="chord-container"
    ref="chordContainer"
    class="d-flex flex-column align-center"
    v-bind:style="$_chordContainerStyle"
  >
    <div class="d-flex align-end">
      <div class="d-flex align-end">
        <div v-bind:style="$_noteTextStyle">{{ $_rootNoteText }}</div>
        <div v-bind:style="$_chordBasicStyle">
          <template v-if="$_containsChordText">
            <div
              class="no-height left-n3px text-left pos-relative"
              v-bind:style="$_noteFlatOrSharpTextStyle"
            >
              {{ $_rootNoteFlatOrSharpText }}
            </div>
            <div class="d-flex">
              <div
                class="ml-n2px pos-relative"
                v-if="$_basicChordText.length > 0"
                v-bind:style="$_chordTextStyle" 
              >
                {{ $_basicChordText }}
              </div>
              <div
                class="ml-n2px pos-relative"
                v-if="$_additionalChordText.length > 0"
                v-bind:style="$_chordTextStyle"
              >
                {{ $_additionalChordText }}
              </div>
            </div>
          </template>

          <div
            v-else
            class="no-width no-height left-n3px text-left pos-relative"
            v-bind:style="$_noteFlatOrSharpTextStyle"
          >
            {{ $_rootNoteFlatOrSharpText }}
          </div>
        </div>
      </div>
      <div
        class="pos-relative"
        v-if="$_containsChordAdditional"
      >
        <div
          class="d-flex align-center left-n3px"
          v-if="$_sortedTensionNotes.length > 0"
          v-bind:style="$_tensionNoteContainerStyle"
        >
          (
          <div class="d-flex flex-column-reverse align-center">
            <tension-note-pitch-component
              v-for="(tensionNote, tensionNoteIdx) in $_sortedTensionNotes"
              v-bind:key="tensionNoteIdx"
              v-bind:tension-note-pitch="tensionNote"
              v-bind:base-font-size-px="$_fontSizePx"
            >
            </tension-note-pitch-component>
          </div>
          )
        </div>
      </div>
    </div>
    <template v-if="$_bassNotePitch !== undefined">
      <hr id="bass-separator" v-bind:color="color.hex" />
      <div class="d-flex align-end">
        <div v-bind:style="$_noteTextStyle">{{ $_bassNoteText }}</div>
        <div v-bind:style="$_chordBasicStyle">
          <div
            class="no-width no-height left-n3px text-left pos-relative"
            v-bind:style="$_noteFlatOrSharpTextStyle"
          >
            {{ $_bassNoteFlatOrSharpText }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Yusei+Magic:wght@400&display=swap');

#chord-container {
  font-family: 'Yusei Magic';
  color: #2c3e50;
  border-color: #2c3e50;
  overflow-y: visible;
  width: fit-content;
}

#chord-container > * {
  text-transform: none;
}

.pos-relative {
  position: relative;
}

.no-height {
  height: 0;
}

.no-width {
  width: 0;
}

.left-n3px {
  left: -3px;
}

.ml-n2px {
  margin-left: 2px;
}

#bass-separator {
  border-style: solid;
  border-width: 1px 0 0;
  width: 100%;
  margin: 2px 0;
}
</style>

<script lang="ts">
import { defineComponent, CSSProperties, ref } from 'vue';
import { TensionNotePitch } from '../modules/TensionNotePitch';
import { Chord } from '../modules/Chord';
import { Color } from '../modules/Color';
import { NotePitch } from '../modules/NotePitch';
import { nps } from '../modules/NotePitchSymbol';
import { raw } from '../modules/utils';
import TensionNotePitchComponent from './TensionNotePitchComponent.vue';

function getNoteSymbolText(notePitch: NotePitch): string {
  switch (raw(notePitch.symbol)) {
    case nps.a: return 'A';
    case nps.b: return 'B';
    case nps.c: return 'C';
    case nps.d: return 'D';
    case nps.e: return 'E';
    case nps.f: return 'F';
    case nps.g: return 'G';
  }
  throw new RangeError();
}

function getNoteFlatOrSharpText(notePitch: NotePitch): string {
  if (notePitch.isSharp) return '♯';
  if (notePitch.isFlat) return '♭';
  return '';
}

export default defineComponent({
  setup() {
    return {
      chordContainer: ref<HTMLDivElement>(),
    };
  },

  emits: {
    widthUpdate: (widthPx: number) => true,
    mounted: (element: HTMLDivElement) => true,
    beforeUnmount: () => true,
  },

  components: {
    TensionNotePitchComponent,
  },

  props: {
    chord: { type: Chord, required: true },
    fontSizePx: { type: Number },
    color: { type: Color, required: true },
  },

  data(): {
    $_resizeObverber: ResizeObserver,
  } {
    return {
      $_resizeObverber: new ResizeObserver(() => { this.$_emitWidthUpdate() }),
    };
  },

  mounted() {
    if (this.chordContainer) {
      this.$data.$_resizeObverber.observe(this.chordContainer);
      this.$emit('mounted', this.chordContainer);
    }
  },

  beforeUnmount() {
    this.$emit('beforeUnmount');
    this.$_emitWidthUpdate();
    this.$data.$_resizeObverber.disconnect();
  },

  computed: {
    $_rootNoteText(): string { return getNoteSymbolText(this.chord.root) },

    $_rootNoteFlatOrSharpText(): string { return getNoteFlatOrSharpText(this.chord.root) },

    $_bassNoteText(): string | undefined {
      if (this.chord.bass === undefined) return undefined;
      return getNoteSymbolText(this.chord.bass);
    },

    $_bassNoteFlatOrSharpText(): string | undefined {
      if (this.chord.bass === undefined) return undefined;
      return getNoteFlatOrSharpText(this.chord.bass);
    },

    $_noteTextStyle(): CSSProperties {
      return {
        fontSize: `${this.$_fontSizePx}px`,
        lineHeight: `${this.$_fontSizePx}px`,
      };
    },

    $_noteFlatOrSharpTextStyle(): CSSProperties {
      return {
        fontSize: `${Math.floor(this.$_fontSizePx * 0.6)}px`,
        lineHeight: `${Math.floor(this.$_fontSizePx * 0.6)}px`,
        bottom: `${Math.floor(this.$_fontSizePx * 0.5)}px`,
      };
    },

    $_bassNotePitch(): NotePitch | undefined { return this.chord.bass },

    $_basicChordText(): string { return this.chord.basicChordText },

    $_additionalChordText(): string { return this.chord.additionalChordText },

    $_sortedTensionNotes(): TensionNotePitch[] { return this.chord.sortedTensionNotes },

    $_fontSizePx(): number {
      return (this.fontSizePx === undefined)? this.$store.state.config.chordFontSizePx : this.fontSizePx;
    },

    $_chordContainerStyle(): CSSProperties {
      return {
        color: `${this.color.styleString(false)}`,
        opacity: this.color.alpha,
      };
    },

    $_chordBasicStyle(): CSSProperties {
      return {
        height: `${this.$_fontSizePx * 0.8}px`,
      };
    },

    $_chordTextStyle(): CSSProperties {
      return {
        fontSize: `${this.$_fontSizePx * 0.8}px`,
        lineHeight: `${this.$_fontSizePx * 0.8}px`,
      };
    },

    $_tensionNoteContainerStyle(): CSSProperties {
      return {
        position: 'absolute',
        bottom: `${this.$_fontSizePx * 0.5}px`,
      };
    },

    $_containsChordText(): boolean {
      return (this.$_basicChordText.length > 0) || this.$_containsChordAdditional;
    },

    $_containsChordAdditional(): boolean {
      return (this.$_sortedTensionNotes.length > 0) || (this.$_additionalChordText.length > 0);
    },
  },

  methods: {
    $_emitWidthUpdate() {
      if (this.chordContainer) {
        this.$emit('widthUpdate', this.chordContainer.getBoundingClientRect().width);
      }
    },
  },
})
</script>
