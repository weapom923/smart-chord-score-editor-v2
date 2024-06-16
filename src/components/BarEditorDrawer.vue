<template>
  <v-navigation-drawer
    class="pa-0 ma-0 overflow-hidden"
    permanent app touchless
    v-bind:model-value="$_showBarEditorDrawer"
    v-bind:width="$_barEditorDrawerWidth"
    v-bind:rail="$store.state.appState.isBarEditorDrawerMinimized"
    v-bind:rail-width="expandButtonWidthPx"
    v-bind:location="$store.state.config.barEditorLocation"
  >
    <v-btn
      rounded="0" size="small"
      v-show="$store.state.appState.isBarEditorDrawerMinimized"
      v-bind:icon="$_barEditorMaximizeIcon"
      v-bind:width="$_barEditorExpandButtonWidth"
      v-bind:height="$_barEditorExpandButtonHeight"
      v-on:click="$_maximizeBarEditor"
    >
    </v-btn>

    <bar-editor
      ref="barEditor"
      v-show="!$store.state.appState.isBarEditorDrawerMinimized"
      v-bind:width="$_barEditorWidth"
      v-bind:height="$_barEditorHeight"
    >
    </bar-editor>
  </v-navigation-drawer>
</template>

<script lang="ts">
import BarEditor from './BarEditor.vue';
import { SectionAndBarRange } from '../modules/SectionAndBarRange';

const idealDrawerWidthPx = 800;
const idealDrawerHeightPx = 700;
const expandButtonWidthPx = 30;

export default {
  setup(): {
    expandButtonWidthPx: typeof expandButtonWidthPx,
    idealDrawerWidthPx: typeof idealDrawerWidthPx,
    idealDrawerHeightPx: typeof idealDrawerHeightPx,
  } {
    return {
      expandButtonWidthPx,
      idealDrawerWidthPx,
      idealDrawerHeightPx,
    };
  },

  components: {
    BarEditor,
  },

  watch: {
    '$store.state.score.selectedBars'(selectedBars?: SectionAndBarRange) {
      if (selectedBars === undefined) {
        this.$store.dispatch('appState/setIsBarEditorMinimized', true);
      }
    },
  },

  data(): {
    $_barEditorDrawerWidthPxMax: number,
    $_barEditorDrawerHeightPxMax: number,
  } {
    return {
      $_barEditorDrawerWidthPxMax: window.innerWidth * 0.8,
      $_barEditorDrawerHeightPxMax: window.innerHeight * 0.8,
    };
  },

  computed: {
    $_railWidth(): number {
      if (!this.$_showBarEditorDrawer) return 0;
      return expandButtonWidthPx;
    },

    $_showBarEditorDrawer(): boolean {
      if (this.$store.state.score.selectedBars === undefined) return false;
      if (this.$store.state.appState.isPrintLayoutEnabled) return false;
      return true;
    },

    $_barEditorMaximizeIcon(): string | undefined {
      switch (this.$store.state.config.barEditorLocation) {
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
      switch (this.$store.state.config.barEditorLocation) {
        case 'left':
        case 'right':
          return Math.min(idealDrawerWidthPx, this.$data.$_barEditorDrawerWidthPxMax);
        case 'bottom':
          return Math.min(idealDrawerHeightPx, this.$data.$_barEditorDrawerHeightPxMax);
        default:
          return 0;
      }
    },

    $_barEditorExpandButtonWidth(): number | string {
      switch (this.$store.state.config.barEditorLocation) {
        case 'left':
        case 'right':
          return expandButtonWidthPx;
        default:
          return '100%';
      }
    },

    $_barEditorExpandButtonHeight(): number | string {
      switch (this.$store.state.config.barEditorLocation) {
        case 'bottom':
        case 'top':
          return expandButtonWidthPx;
        default:
          return '100%';
      }
    },

    $_barEditorWidth(): number | undefined {
      switch (this.$store.state.config.barEditorLocation) {
        case 'left':
        case 'right':
          return idealDrawerWidthPx;
        default:
          return undefined;
      }
    },

    $_barEditorHeight(): number | undefined {
      switch (this.$store.state.config.barEditorLocation) {
        case 'top':
        case 'bottom':
          return idealDrawerHeightPx;
        default:
          return undefined;
      }
    },
  },

  created() {
    window.addEventListener('resize', this.$_updateBarEditorDrawerSize);
  },

  async mounted() {
    this.$_updateBarEditorDrawerSize();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.$_updateBarEditorDrawerSize);
  },

  methods: {
    $_updateBarEditorDrawerSize() {
      this.$data.$_barEditorDrawerWidthPxMax = window.innerWidth * 0.8;
      this.$data.$_barEditorDrawerHeightPxMax = window.innerHeight * 0.8;
    },

    $_getBarEditorComponent(): InstanceType<typeof BarEditor> | undefined | null {
      return this.$refs.barEditor as any;
    },

    async $_maximizeBarEditor() {
      await this.$store.dispatch('appState/setIsBarEditorMinimized', false);
    },

    async onKeydown(event: KeyboardEvent): Promise<boolean> {
      if (await this.$_getBarEditorComponent()?.onKeydown(event) ?? false) return true;
      return false;
    },
  },
};
</script>
