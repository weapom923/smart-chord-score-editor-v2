<template>
  <v-select
    label="Scale"
    item-title="title"
    item-value="value"
    v-model="$_scale"
    v-bind:items="$_allScales"
    v-on:keydown.stop
  />
</template>

<script lang="ts">
import { Scale, sc } from '../../modules/Scale';

export default {
  emits: {
    'update:scale': (scale: Scale) => true,
  },

  props: {
    scale: { type: Scale },
  },

  computed: {
    $_allScales(): { title: string, value: Scale }[] {
      return [
        { title: 'C Major',  value: sc.cMajor },
        { title: 'G Major',  value: sc.gMajor },
        { title: 'D Major',  value: sc.dMajor },
        { title: 'A Major',  value: sc.aMajor },
        { title: 'E Major',  value: sc.eMajor },
        { title: 'B Major',  value: sc.bMajor },
        { title: 'F♯ Major', value: sc.fSharpMajor },
        { title: 'G♭ Major', value: sc.gFlatMajor },
        { title: 'C♯ Major', value: sc.cSharpMajor },
        { title: 'D♭ Major', value: sc.dFlatMajor },
        { title: 'A♭ Major', value: sc.aFlatMajor },
        { title: 'E♭ Major', value: sc.eFlatMajor },
        { title: 'B♭ Major', value: sc.bFlatMajor },
        { title: 'F Major',  value: sc.fMajor },
        { title: 'A Minor',  value: sc.aMinor },
        { title: 'D Minor',  value: sc.dMinor },
        { title: 'G Minor',  value: sc.gMinor },
        { title: 'C Minor',  value: sc.cMinor },
        { title: 'F Minor',  value: sc.fMinor },
        { title: 'B♭ Minor', value: sc.bFlatMinor },
        { title: 'E♭ Minor', value: sc.eFlatMinor },
        { title: 'G♯ Minor', value: sc.gSharpMinor },
        { title: 'C♯ Minor', value: sc.cSharpMinor },
        { title: 'F♯ Minor', value: sc.fSharpMinor },
        { title: 'B Minor',  value: sc.bMinor },
        { title: 'E Minor',  value: sc.eMinor },
      ]
    },

    $_scale: {
      get(): Scale | undefined { return this.scale },
      set(scale: Scale)        { this.$emit('update:scale', scale) },
    }
  },
}
</script>