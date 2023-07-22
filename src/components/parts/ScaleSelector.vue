<template>
  <v-select
    item-title="title"
    item-value="value"
    v-model="$_scale"
    v-bind:label="$t('scale')"
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
        { title: `C ${this.$t('major')}`,  value: sc.cMajor },
        { title: `G ${this.$t('major')}`,  value: sc.gMajor },
        { title: `D ${this.$t('major')}`,  value: sc.dMajor },
        { title: `A ${this.$t('major')}`,  value: sc.aMajor },
        { title: `E ${this.$t('major')}`,  value: sc.eMajor },
        { title: `B ${this.$t('major')}`,  value: sc.bMajor },
        { title: `F♯ ${this.$t('major')}`, value: sc.fSharpMajor },
        { title: `G♭ ${this.$t('major')}`, value: sc.gFlatMajor },
        { title: `C♯ ${this.$t('major')}`, value: sc.cSharpMajor },
        { title: `D♭ ${this.$t('major')}`, value: sc.dFlatMajor },
        { title: `A♭ ${this.$t('major')}`, value: sc.aFlatMajor },
        { title: `E♭ ${this.$t('major')}`, value: sc.eFlatMajor },
        { title: `B♭ ${this.$t('major')}`, value: sc.bFlatMajor },
        { title: `F ${this.$t('major')}`,  value: sc.fMajor },
        { title: `A ${this.$t('minor')}`,  value: sc.aMinor },
        { title: `D ${this.$t('minor')}`,  value: sc.dMinor },
        { title: `G ${this.$t('minor')}`,  value: sc.gMinor },
        { title: `C ${this.$t('minor')}`,  value: sc.cMinor },
        { title: `F ${this.$t('minor')}`,  value: sc.fMinor },
        { title: `B♭ ${this.$t('minor')}`, value: sc.bFlatMinor },
        { title: `E♭ ${this.$t('minor')}`, value: sc.eFlatMinor },
        { title: `G♯ ${this.$t('minor')}`, value: sc.gSharpMinor },
        { title: `C♯ ${this.$t('minor')}`, value: sc.cSharpMinor },
        { title: `F♯ ${this.$t('minor')}`, value: sc.fSharpMinor },
        { title: `B ${this.$t('minor')}`,  value: sc.bMinor },
        { title: `E ${this.$t('minor')}`,  value: sc.eMinor },
      ]
    },

    $_scale: {
      get(): Scale | undefined { return this.scale },
      set(scale: Scale)        { this.$emit('update:scale', scale) },
    }
  },
}
</script>