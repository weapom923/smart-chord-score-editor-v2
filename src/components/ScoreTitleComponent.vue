<template>
  <v-card flat color="transparent">
    <v-card-title class="d-flex align-center flex-column">
      <h1 v-if="$_title !== undefined">{{ $_title }}</h1>
      <h3 v-if="$_artistName !== undefined" class="ma-2">{{ $_artistName }}</h3>
    </v-card-title>

    <v-card-text class="d-flex flex-row-reverse px-0">
      <v-table density="compact" id="credit-table">
        <tbody>
          <tr
            v-for="(name, creditTitle) in $_credits"
            v-bind:key="creditTitle"
          >
            <td class="pr-2 text-left">{{ creditTitle }}</td>
            <td class="text-right">{{ name }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<style scoped>
#credit-table td {
  padding: 0;
  height: fit-content;
  min-width: fit-content;
  border: none !important;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { ScoreMetadata } from '../modules/ScoreMetadata';

export default defineComponent({
  computed: {
    $_scoreMetadata(): ScoreMetadata {
      return this.$store.state.score.score.metadata;
    },

    $_title(): string | undefined {
      return (this.$_scoreMetadata.title.length > 0)? this.$_scoreMetadata.title : undefined;
    },

    $_artistName(): string | undefined {
      return (this.$_scoreMetadata.artistName.length > 0)? this.$_scoreMetadata.artistName : undefined;
    },

    $_credits(): Record<string, string> {
      const credits: Record<string, string> = {};
      if (this.$_scoreMetadata.composerName.length > 0) {
        credits['Composed by'] = this.$_scoreMetadata.composerName;
      }
      if (this.$_scoreMetadata.arrangerName.length > 0) {
        credits['Arranged by'] = this.$_scoreMetadata.arrangerName;
      }
      if (this.$_scoreMetadata.lyricistName.length > 0) {
        credits['Lyrics by'] = this.$_scoreMetadata.lyricistName;
      }
      return credits;
    },
  },
})
</script>