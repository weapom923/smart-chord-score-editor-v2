<template>
  <v-navigation-drawer
    class="pa-0 ma-0 overflow-hidden"
    permanent app touchless
    v-bind:width="$_barEditorDrawerWidth"
    v-bind:rail="$store.state.appState.isBarEditorDrawerMinimized"
    v-bind:rail-width="expandButtonWidthPx"
    v-bind:location="$_barEditorLocation"
  >
    <v-btn
      rounded="0" size="small"
      v-if="$store.state.appState.isBarEditorDrawerMinimized"
      v-bind:icon="$_barEditorMaximizeIcon"
      v-bind:width="$_barEditorMaximizeButtonWidth"
      v-bind:height="$_barEditorMaximizeButtonHeight"
      v-on:click="$_maximizeBarEditor"
    >
    </v-btn>

    <bar-editor ref="barEditor" v-else></bar-editor>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BarEditor from './BarEditor.vue';
import type { BarEditorLocationType } from '@/store/module/Config';

const idealDrawerWidthPx = 800;
const idealDrawerHeightPx = 700;
const expandButtonWidthPx = 30;

export default defineComponent({
  setup() {
    return {
      expandButtonWidthPx,
      idealDrawerWidthPx,
      idealDrawerHeightPx,
      barEditor: ref<InstanceType<typeof BarEditor>>(),
    };
  },

  components: {
    BarEditor,
  },

  props: {
    windowInnerWidthPx: { type: Number, required: true },
    windowInnerHeightPx: { type: Number, required: true },
  },

  computed: {
    $_barEditorDrawerWidthPxMax(): number {
      if (this.$store.state.appState.isMobileLayoutEnabled) {
        return this.windowInnerWidthPx * 0.5;
      } else {
        return this.windowInnerWidthPx * 0.8 
      }
    },

    $_barEditorDrawerHeightPxMax(): number {
      if (this.$store.state.appState.isMobileLayoutEnabled) {
        return this.windowInnerHeightPx * 0.5;
      } else {
        return this.windowInnerHeightPx * 0.8 
      }
    },

    $_barEditorMaximizeIcon(): string | undefined {
      switch (this.$_barEditorLocation) {
        case 'left':
          return 'mdi-chevron-double-right';
        case 'right':
          return 'mdi-chevron-double-left';
        case 'bottom':
          return 'mdi-chevron-double-up';
        default:
          return undefined;
      }
    },

    $_barEditorDrawerWidth(): number {
      switch (this.$_barEditorLocation) {
        case 'left':
        case 'right':
          return Math.min(idealDrawerWidthPx, this.$_barEditorDrawerWidthPxMax);
        case 'bottom':
          return Math.min(idealDrawerHeightPx, this.$_barEditorDrawerHeightPxMax);
        default:
          return 0;
      }
    },

    $_barEditorLocation(): BarEditorLocationType {
      if (this.$store.state.appState.isMobileLayoutEnabled) {
        return 'bottom';
      } else {
        return this.$store.state.config.barEditorLocation;
      }
    },

    $_barEditorMaximizeButtonWidth(): number | string {
      switch (this.$_barEditorLocation) {
        case 'left':
        case 'right':
          return expandButtonWidthPx;
        default:
          return '100%';
      }
    },

    $_barEditorMaximizeButtonHeight(): number | string {
      switch (this.$_barEditorLocation) {
        case 'bottom':
        case 'top':
          return expandButtonWidthPx;
        default:
          return '100%';
      }
    },
  },

  methods: {
    async $_maximizeBarEditor() {
      await this.$store.dispatch('appState/setIsBarEditorMinimized', false);
    },

    async onKeydown(event: KeyboardEvent): Promise<boolean> {
      if (await this.barEditor?.onKeydown(event)) return true;
      return false;
    },
  },
});
</script>
