<template>
  <div id="score-footer">
    {{ $_scoreTitle }} ({{ scorePageIndex + 1 }} / {{ numScorePages }})
  </div>
</template>

<style scoped>
#score-footer {
  display: flex;
  height: 40px;
  align-content: center;
  justify-content: center;
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