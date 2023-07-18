<template>
  <div id="chord-container">
    <div id="chord">
      <note-pitch-component
        v-bind:note-pitch="$_rootNote"
        v-bind:base-font-size-px="$_fontSizePx"
      >
      </note-pitch-component>
      <div
        class="chord-text"
        v-if="$_basicChordText"
        v-bind:style="$_chordTextStyle"
      >
        {{ $_basicChordText }}
      </div>
      <div id="additionals" v-if="($_sortedTensionNotes.length > 0) || ($_additionalChordText.length > 0)">
        <div v-if="$_sortedTensionNotes.length > 0" id="tension-notes-container">
          (
          <div id="tension-notes">
            <tension-note-pitch-component
              v-for="(tensionNote, tensionNoteIdx) in $_sortedTensionNotes"
              v-bind:key="tensionNoteIdx"
              v-bind:tension-note-pitch="tensionNote"
              v-bind:base-font-size-px="$_fontSizePx"
            />
          </div>
          )
        </div>
        <div
          class="chord-text"
          v-if="$_additionalChordText.length > 0"
          v-bind:style="$_chordTextStyle"
        >
          {{ $_additionalChordText }}
        </div>
      </div>
    </div>
    <template v-if="$_bassNotePitch !== undefined">
      <hr id="bass-separator" />
      <div id="bass-text-container">
        <note-pitch-component
          v-bind:note-pitch="$_bassNotePitch"
          v-bind:base-font-size-px="$_fontSizePx"
        >
        </note-pitch-component>
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
  display: flex;
  width: fit-content;
  flex-flow: column;
  align-items: center;
  justify-content: flex-end;
}

#chord-container > * {
  text-transform: none;
}

#chord {
  display: flex;
  flex-flow: row;
  align-items: flex-end;
}

#additionals {
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
}

#tension-notes-container {
  display: flex;
  flex-flow: row;
  align-items: center;
}

#tension-notes {
  display: flex;
  flex-flow: column-reverse;
  align-items: center;
}

.chord-text {
  position: relative;
  margin-left: 2px;
}

#bass-separator {
  border-color: black;
  border-style: solid;
  border-width: 1px 0 0;
  width: 100%;
  margin: 2px 0;
}

#bass-text-container {
  position: relative;
}
</style>

<script lang="ts">
import { CSSProperties } from 'vue';
import { TensionNotePitch } from '../modules/TensionNotePitch';
import { Chord } from '../modules/Chord';
import { NotePitch } from '../modules/NotePitch';
import NotePitchComponent from './NotePitchComponent.vue';
import TensionNotePitchComponent from './TensionNotePitchComponent.vue';

export default {
  emits: {
    widthUpdate: (widthPx: number) => true,
  },

  components: {
    NotePitchComponent,
    TensionNotePitchComponent,
  },

  props: {
    chord: { type: Chord, required: true },
    fontSizePx: { type: Number }
  },

  data(): {
    $_resizeObverber: ResizeObserver,
  } {
    return {
      $_resizeObverber: new ResizeObserver(() => {
        if ((this.$el === undefined) || (this.$el === null)) return;
        let chordComponentElement = (this.$el as HTMLElement);
        this.$emit('widthUpdate', chordComponentElement.getBoundingClientRect().width);
      }),
    };
  },

  mounted() {
    this.$data.$_resizeObverber.observe(this.$el);
  },

  beforeUnmount() {
    let chordComponentElement = (this.$el as HTMLElement);
    this.$emit('widthUpdate', chordComponentElement.getBoundingClientRect().width);
    this.$data.$_resizeObverber.disconnect();
  },

  computed: {
    $_isOnChord(): boolean { return (this.$_bassNotePitch !== undefined) },

    $_rootNote(): NotePitch { return this.chord.root },

    $_bassNotePitch(): NotePitch | undefined { return this.chord.bass },

    $_basicChordText(): string { return this.chord.basicChordText },

    $_additionalChordText(): string { return this.chord.additionalChordText },

    $_sortedTensionNotes(): TensionNotePitch[] { return this.chord.sortedTensionNotes },

    $_fontSizePx(): number {
      return (this.fontSizePx === undefined)? this.$store.state.config.chordFontSizePx : this.fontSizePx;
    },

    $_chordTextStyle(): CSSProperties {
      return {
        fontSize: `${this.$_fontSizePx * 0.8}px`,
        lineHeight: `${this.$_fontSizePx * 0.8}px`,
      };
    },
  },
};
</script>
