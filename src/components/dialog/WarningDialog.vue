<template>
  <dialog-base
    :ok-callback="okCallback"
    :ok-label="okLabel"
  >
    <template v-slot:body>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import DialogBase from './DialogBase.vue';
import { AppVersion, AppVersionType } from '../../modules/AppVersion';

export default defineComponent({
  extends: DialogBase,

  components: { DialogBase },

  props: {
    okCallback: { type: Function as PropType<() => void | Promise<void>> },
    okLabel:    { type: String },
    title:      { type: String, required: true },
    message:    { type: String, required: true },
  },

  computed: {
    $_appVersion(): AppVersionType {
      return AppVersion;
    },
  },
})
</script>