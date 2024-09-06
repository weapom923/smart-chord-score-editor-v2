<template>
  <dialog-base>
    <template v-slot:body>
      <v-card-title>Smart Chord Score Editor</v-card-title>
      <v-card-text>
        Version {{ $_appVersion.major }}.{{ $_appVersion.minor }}.{{ $_appVersion.patch }}
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DialogBase from './DialogBase.vue';
import { AppVersion, AppVersionType } from '../../modules/AppVersion';

export default defineComponent({
  extends: DialogBase,

  components: { DialogBase },

  computed: {
    $_appVersion(): AppVersionType {
      return AppVersion;
    },
  },
})
</script>