<template>
  <div id="score-footer">
    <span v-if="$_scoreTitle.length > 0">{{ $_scoreTitle }}</span>
    <span v-if="numScorePages > 1">
      ({{ scorePageIndex + 1 }} / {{ numScorePages }})
    </span>
  </div>
</template>

<style scoped>
#score-footer {
  display: flex;
  height: 40px;
  align-content: center;
  justify-content: center;
  gap: 5px;
}
</style>

<script lang="ts">
export default {
  props: {
    scorePageIndex: { type: Number, required: true },
    numScorePages:  { type: Number, required: true },
  },

  computed: {
    $_scoreTitle(): string {
      return this.$store.state.score.score.metadata.title;
    },
  },
}
</script>