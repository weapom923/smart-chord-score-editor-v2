<template>
  <div id="chord-component-selector-container">
    <v-btn-toggle
      mandatory
      class="chord-component-selector root"
      v-model="$_rootNoteSymbolText"
    >
      <v-btn
        size="small"
        class="chord-component-selector-button"
        v-for="rootNoteSymbolText in $_rootNoteSymbolTexts"
        v-bind:key="rootNoteSymbolText"
        v-bind:value="rootNoteSymbolText"
        v-bind:text="rootNoteSymbolText"
      >
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector accidental-sign"
      v-model="$_rootNoteAccidentalSign"
    >
      <v-btn
        size="small"
        class="chord-component-selector-button"
        v-for="noteAccidentalSign in $_allNoteAccidentalSigns"
        v-bind:key="noteAccidentalSign"
        v-bind:value="noteAccidentalSign"
        v-bind:text="noteAccidentalSign"
        v-bind:disabled="!$_chordExists"
      >
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector"
      v-model="$_triadText"
    >
      <v-btn
        size="small"
        class="chord-component-selector-button"
        v-for="triadText in $_allTriadTexts"
        v-bind:key="triadText"
        v-bind:value="triadText"
        v-bind:text="triadText"
        v-bind:disabled="!$_chordExists"
      >
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      tile
      class="chord-component-selector"
      v-model="$_sixthOrSeventhText"
    >
      <v-btn
        size="small"
        class="chord-component-selector-button"
        v-for="sixthOrSeventhText in $_sixthOrSeventhTexts"
        v-bind:key="sixthOrSeventhText"
        v-bind:value="sixthOrSeventhText"
        v-bind:text="sixthOrSeventhText"
        v-bind:disabled="$_isSixthOrSeventhDisabled.get(sixthOrSeventhText) && true"
      >
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      multiple tile
      class="chord-component-selector"
      v-model="$_tensionNoteTexts"
    >
      <v-btn
        size="small"
        class="chord-component-selector-button"
        v-for="tensionNotePitchText in $_allTensionNotePitchTexts"
        v-bind:key="tensionNotePitchText"
        v-bind:value="tensionNotePitchText"
        v-bind:text="tensionNotePitchText"
        v-bind:disabled="$_isTensionNoteDisabled.get(tensionNotePitchText) && true"
      >
        {{ tensionNotePitchText }}
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      tile
      class="chord-component-selector"
      v-model="$_bassNoteSymbolText"
    >
      <v-btn
        size="small"
        class="chord-component-selector-button"
        v-for="bassNoteSymbolText in $_allBassNoteSymbolTexts"
        v-bind:key="bassNoteSymbolText"
        v-bind:value="bassNoteSymbolText"
        v-bind:text="bassNoteSymbolText"
        v-bind:disabled="!$_chordExists"
      >
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector accidental-sign"
      v-model="$_bassNoteAccidentalSign"
    >
      <v-btn
        size="small"
        class="chord-component-selector-button"
        v-bind:disabled="!$_isChordWithBass"
        v-for="noteAccidentalSign in $_allNoteAccidentalSigns"
        v-bind:key="noteAccidentalSign"
        v-bind:value="noteAccidentalSign"
        v-bind:text="noteAccidentalSign"
      >
      </v-btn>
    </v-btn-toggle>

  </div>
</template>

<style scoped>
#chord-component-selector-container {
  display: flex;
  flex-direction: row;
}

.chord-component-selector {
  flex-direction: column;
  height: 300px;
}

.chord-component-selector-button {
  flex-grow: 1;
}

.chord-component-selector:not(.accidental-sign):not(.root) {
  flex-grow: 1;
}

.chord-component-selector.root {
  flex-grow: 2;
}

.chord-component-selector.accidental-sign {
  flex-grow: 0;
}
</style>

<script lang="ts">
import { PropType } from 'vue';
import { Chord, ChordTriadType, ChordSixthOrSeventhType } from '../../modules/Chord';
import { NotePitch } from '../../modules/NotePitch';
import { NotePitchSymbol, nps } from '../../modules/NotePitchSymbol';
import { TensionNotePitch, tnp } from '../../modules/TensionNotePitch';

export default {
  emits: {
    'update:chord': (chord: Chord | null) => true,
  },

  props: {
    noteType: { type: String, required: true },
    chord: { type: null as unknown as PropType<Chord | null>, required: true },
  },

  computed: {
    $_chordExists() {
      return (this.chord !== null);
    },

    $_isNoteRest() {
      return this.noteType === 'rest';
    },

    $_isChordWithBass() {
      if (this.chord === null) return false;
      return (this.chord.bass !== undefined);
    },

    $_rootNoteSymbolTextToInstance(): Map<string, NotePitchSymbol | undefined> {
      return new Map<string, NotePitchSymbol | undefined>([
        [ '(Clear)', undefined ],
        [ 'A', nps.a ],
        [ 'B', nps.b ],
        [ 'C', nps.c ],
        [ 'D', nps.d ],
        [ 'E', nps.e ],
        [ 'F', nps.f ],
        [ 'G', nps.g ],
      ]);
    },
    $_rootNoteSymbolTexts(): string[] { return [ ...this.$_rootNoteSymbolTextToInstance.keys() ] },
    $_rootNoteSymbolText: {
      get(): string | undefined {
        if (this.chord === null) return undefined;
        let chord = this.chord;
        return this.$_rootNoteSymbolTexts.find(rootNoteSymbolText => {
          let rootNotePitchSymbol = this.$_rootNoteSymbolTextToInstance.get(rootNoteSymbolText);
          if (rootNotePitchSymbol === undefined) return false;
          return chord.root.symbol.isEqualTo(rootNotePitchSymbol);
        });
      },
      set(rootNoteSymbolText: string) {
        let rootNoteSymbol = this.$_rootNoteSymbolTextToInstance.get(rootNoteSymbolText);
        if (rootNoteSymbol === undefined) {
          this.$emit('update:chord', null);
        } else {
          if (this.chord !== null) {
            let newChord = new Chord(
              NotePitch.findPredefinedNotePitch(rootNoteSymbol, this.chord.root.shift),
              this.chord.triad,
              this.chord.sixthOrSeventh,
              this.chord.tensionNotes,
              this.chord.bass,
              { makesValid: true },
            );
            this.$emit('update:chord', newChord);
          } else {
            let newChord = Chord.default;
            newChord.root = NotePitch.findPredefinedNotePitch(rootNoteSymbol, 0);
            this.$emit('update:chord', newChord);
          }
        }
      },
    },

    $_bassNoteSymbolTextToInstance(): Map<string, NotePitchSymbol> {
      return new Map<string, NotePitchSymbol>([
        [ '/A', nps.a ],
        [ '/B', nps.b ],
        [ '/C', nps.c ],
        [ '/D', nps.d ],
        [ '/E', nps.e ],
        [ '/F', nps.f ],
        [ '/G', nps.g ],
      ]);
    },
    $_allBassNoteSymbolTexts(): string[] { return [ ...this.$_bassNoteSymbolTextToInstance.keys() ] },
    $_bassNoteSymbolText: {
      get(): string | undefined {
        if (this.chord === null) return undefined;
        let chord = this.chord;
        return this.$_allBassNoteSymbolTexts.find(bassNoteSymbolText => {
          let bassNotePitchSymbol = this.$_bassNoteSymbolTextToInstance.get(bassNoteSymbolText);
          if (bassNotePitchSymbol === undefined) return false;
          if (chord.bass === undefined) return false;
          return chord.bass.symbol.isEqualTo(bassNotePitchSymbol);
        });
      },
      set(bassNoteSymbolText: string | undefined) {
        if (this.chord === null) return;
        let bassNotePitch: NotePitch | undefined = undefined;
        if (bassNoteSymbolText !== undefined) {
          let bassNoteSymbol = this.$_bassNoteSymbolTextToInstance.get(bassNoteSymbolText);
          if (bassNoteSymbol !== undefined) {
            bassNotePitch = NotePitch.findPredefinedNotePitch(bassNoteSymbol, this.chord.root.shift);
          }
        }
        let newChord = new Chord(
          this.chord.root,
          this.chord.triad,
          this.chord.sixthOrSeventh,
          this.chord.tensionNotes,
          bassNotePitch,
          { makesValid: true },
        );
        this.$emit('update:chord', newChord);
      },
    },

    $_noteAccidentalSignToPitchShift(): Map<string, number> {
      return new Map<string, number>([
        [ '♭', -1 ],
        [ '♮', 0 ],
        [ '♯', 1 ],
      ]);
    },
    $_allNoteAccidentalSigns(): string[] { return [ ...this.$_noteAccidentalSignToPitchShift.keys() ] },
    $_notePitchShifts(): number[] { return [ ...this.$_noteAccidentalSignToPitchShift.values() ] },
    $_rootNoteAccidentalSign: {
      get(): string | undefined {
        if (this.chord === null) return undefined;
        let chord = this.chord;
        return this.$_allNoteAccidentalSigns.find(rootNoteAccidentalSign => {
          let rootNotePitchShift = this.$_noteAccidentalSignToPitchShift.get(rootNoteAccidentalSign);
          if (rootNotePitchShift === undefined) return false;
          return chord.root.shift === rootNotePitchShift;
        });
      },
      set(rootNoteAccidentalSign: string) {
        let rootNotePitchShift = this.$_noteAccidentalSignToPitchShift.get(rootNoteAccidentalSign);
        if ((rootNotePitchShift !== undefined) && (this.chord !== null)) {
          let rootNotePitch = NotePitch.findPredefinedNotePitch(this.chord.root.symbol, rootNotePitchShift);
          let newChord = new Chord(
            rootNotePitch,
            this.chord.triad,
            this.chord.sixthOrSeventh,
            this.chord.tensionNotes,
            this.chord.bass,
            { makesValid: true },
          );
          this.$emit('update:chord', newChord);
        }
      },
    },
    $_bassNoteAccidentalSign: {
      get(): string | undefined {
        if (this.chord === null) return undefined;
        let chord = this.chord;
        return this.$_allNoteAccidentalSigns.find(rootNoteAccidentalSign => {
          let bassNotePitchShift = this.$_noteAccidentalSignToPitchShift.get(rootNoteAccidentalSign);
          if (bassNotePitchShift === undefined) return false;
          if (chord.bass === undefined) return false;
          return chord.bass.shift === bassNotePitchShift;
        });
      },
      set(bassNoteAccidentalSign: string) {
        if (this.chord === null) return;
        let bassNotePitchShift = this.$_noteAccidentalSignToPitchShift.get(bassNoteAccidentalSign);
        if (bassNotePitchShift === undefined) return;
        let bassNotePitch: NotePitch | undefined = undefined;
        if (this.chord.bass !== undefined) {
          bassNotePitch = NotePitch.findPredefinedNotePitch(this.chord.bass.symbol, bassNotePitchShift);
        }
        let newChord = new Chord(
          this.chord.root,
          this.chord.triad,
          this.chord.sixthOrSeventh,
          this.chord.tensionNotes,
          bassNotePitch,
          { makesValid: true },
        );
        this.$emit('update:chord', newChord);
      },
    },

    $_triadTextToInstance(): Map<string, ChordTriadType> {
      return new Map<string, ChordTriadType>([
        [ 'maj', 'major' ],
        [ 'min', 'minor' ],
        [ 'sus4', 'suspendedFourth' ],
        [ 'sus2', 'suspendedSecond' ],
        [ 'dim', 'diminished' ],
        [ 'aug', 'augumented' ],
      ]);
    },
    $_allTriadTexts(): string[] { return [ ...this.$_triadTextToInstance.keys() ] },
    $_triadText: {
      get(): string | undefined {
        if (this.chord === null) return undefined;
        let chord = this.chord;
        return this.$_allTriadTexts.find(triadText => {
          let triad = this.$_triadTextToInstance.get(triadText);
          if (triad === undefined) return false;
          return chord.triad === triad;
        });
      },
      set(triadText: string) {
        let triad = this.$_triadTextToInstance.get(triadText);
        if ((triad !== undefined) && (this.chord !== null)) {
          let newChord = new Chord(
            NotePitch.findPredefinedNotePitch(this.chord.root.symbol, this.chord.root.shift),
            triad,
            this.chord.sixthOrSeventh,
            this.chord.tensionNotes,
            this.chord.bass,
            { makesValid: true },
          );
          this.$emit('update:chord', newChord);
        }
      },
    },

    $_sixthOrSeventhTextToInstance(): Map<string, ChordSixthOrSeventhType> {
      return new Map<string, ChordSixthOrSeventhType>([
        [ '6', 'sixth' ],
        [ '7', 'dominantSeventh' ],
        [ 'M7', 'majorSeventh' ],
        [ 'dim7', 'diminishedSeventh' ],
      ]);
    },
    $_sixthOrSeventhTexts(): string[] { return [ ...this.$_sixthOrSeventhTextToInstance.keys() ] },
    $_sixthOrSeventhText: {
      get(): string | undefined {
        if (this.chord === null) return undefined;
        let chord = this.chord;
        return this.$_sixthOrSeventhTexts.find(rootNoteAccidentalSign => {
          let sixthOrSeventh = this.$_sixthOrSeventhTextToInstance.get(rootNoteAccidentalSign);
          if (sixthOrSeventh === undefined) return false;
          return chord.sixthOrSeventh === sixthOrSeventh;
        });
      },
      set(sixthOrSeventhText?: string) {
        if (this.chord === null) return;
        let sixthOrSeventh: ChordSixthOrSeventhType | undefined;
        if (sixthOrSeventhText === undefined) {
          sixthOrSeventh = undefined;
        } else {
          sixthOrSeventh = this.$_sixthOrSeventhTextToInstance.get(sixthOrSeventhText);
        }
        let newChord = new Chord(
          this.chord.root,
          this.chord.triad,
          sixthOrSeventh,
          this.chord.tensionNotes,
          this.chord.bass,
          { makesValid: true },
        );
        this.$emit('update:chord', newChord);
      },
    },

    $_tensionNotePitchTextToInstance(): Map<string, TensionNotePitch> {
      return new Map<string, TensionNotePitch>([
        [ '♭9', tnp.flatNinth ],
        [ '9', tnp.ninth ],
        [ '♯9', tnp.sharpNinth ],
        [ '11', tnp.eleventh ],
        [ '♯11', tnp.sharpEleventh ],
        [ '♭13', tnp.flatThirteenth ],
        [ '13', tnp.thirteenth ],
      ]);
    },
    $_allTensionNotePitchTexts(): string[] { return [ ...this.$_tensionNotePitchTextToInstance.keys() ] },
    $_tensionNotes(): TensionNotePitch[] { return [ ...this.$_tensionNotePitchTextToInstance.values() ] },
    $_tensionNoteTexts: {
      get(): string[] {
        let tensionNotePitchTexts: string[] = [];
        if (this.chord === null) return tensionNotePitchTexts;
        for (let tensionNotePitchText of this.$_allTensionNotePitchTexts) {
          let tensionNotePitch = this.$_tensionNotePitchTextToInstance.get(tensionNotePitchText);
          if (tensionNotePitch === undefined) continue;
          for (let tensionNotePitchInChord of this.chord.tensionNotes) {
            if (tensionNotePitchInChord.isEqualTo(tensionNotePitch)) {
            tensionNotePitchTexts.push(tensionNotePitchText);
          }
        }
        }
        return tensionNotePitchTexts;
      },
      set(tensionNotePitchTexts: string[]) {
        if (this.chord === null) return;
        let tensionNotePitches = new Set<TensionNotePitch>();
        for (let tentionNotePitchText of tensionNotePitchTexts) {
          let tensionNotePitch = this.$_tensionNotePitchTextToInstance.get(tentionNotePitchText);
          if (tensionNotePitch === undefined) continue;
          tensionNotePitches.add(tensionNotePitch);
        }
        let newChord = new Chord(
          NotePitch.findPredefinedNotePitch(this.chord.root.symbol, this.chord.root.shift),
          this.chord.triad,
          this.chord.sixthOrSeventh,
          tensionNotePitches,
          this.chord.bass,
          { makesValid: true },
        );
        this.$emit('update:chord', newChord);
      },
    },

    $_isSixthOrSeventhDisabled(): Map<string, boolean> {
      let isSixthOrSeventhDisabled = new Map<string, boolean>();
      for (let [ sixthOrSevenceText, sixthOrSeventh ] of this.$_sixthOrSeventhTextToInstance) {
        isSixthOrSeventhDisabled.set(
          sixthOrSevenceText,
          (this.chord === null)? true : !this.chord.selectableSixthOrSevenths.has(sixthOrSeventh),
        );
      }
      return isSixthOrSeventhDisabled;
    },

    $_isTensionNoteDisabled(): Map<string, boolean> {
      let isTensionNoteDisabled = new Map<string, boolean>();
      for (let [ tentionNotePitchText, tensionNotePitch ] of this.$_tensionNotePitchTextToInstance) {
        isTensionNoteDisabled.set(
          tentionNotePitchText,
          (this.chord === null)? true : !this.chord.selectableTensionNotes.has(tensionNotePitch),
        );
      }
      return isTensionNoteDisabled;
    },
  },
}
</script>
