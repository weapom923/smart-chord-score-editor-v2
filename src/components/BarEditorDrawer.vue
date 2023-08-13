<template>
  <v-navigation-drawer
    class="pa-0 ma-0 no-print" rail-width="40"
    permanent
    v-bind:width="$_barEditorDrawerWidth"
    v-bind:rail="$store.state.appState.isBarEditorDrawerMinimized"
    v-bind:location="$store.state.config.barEditorLocation"
  >
    <v-btn
      class="w-100 h-100" rounded="0" size="small"
      v-show="$store.state.appState.isBarEditorDrawerMinimized"
      v-bind:icon="$_barEditorMaximizeIcon"
      v-on:click="$_toggleBarEditorMaximizedAndMinimized"
    >
    </v-btn>

    <bar-editor
      ref="barEditor"
      v-show="!$store.state.appState.isBarEditorDrawerMinimized"
    >
    </bar-editor>
  </v-navigation-drawer>
</template>

<script lang="ts">
import BarEditor from './BarEditor.vue';
import { SectionAndBarRange } from '../modules/SectionAndBarRange';

const idealDrawerWidthPx = 800;
const idealDrawerHeightPx = 700;

export default {
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
    $_barEditorDrawerWidthPx: number,
    $_barEditorDrawerHeightPx: number,
  } {
    return {
      $_barEditorDrawerWidthPx: idealDrawerWidthPx,
      $_barEditorDrawerHeightPx: idealDrawerHeightPx,
    };
  },

  computed: {
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
          return this.$data.$_barEditorDrawerWidthPx;
        case 'bottom':
          return this.$data.$_barEditorDrawerHeightPx;
        default:
          return 0;
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
      let barEditorDrawerWidthPxMax = window.innerWidth * 0.8;
      let barEditorDrawerHeightPxMax = window.innerHeight * 0.8;
      this.$data.$_barEditorDrawerWidthPx = (barEditorDrawerWidthPxMax > idealDrawerWidthPx)? idealDrawerWidthPx : barEditorDrawerWidthPxMax;
      this.$data.$_barEditorDrawerHeightPx = (barEditorDrawerHeightPxMax > idealDrawerHeightPx)? idealDrawerHeightPx : barEditorDrawerHeightPxMax;
    },

    $_getBarEditorComponent(): InstanceType<typeof BarEditor> | undefined | null {
      return this.$refs.barEditor as any;
    },

    async $_toggleBarEditorMaximizedAndMinimized() {
      await this.$store.dispatch('appState/setIsBarEditorMinimized', !this.$store.state.appState.isBarEditorDrawerMinimized);
    },

    async onKeydown(event: KeyboardEvent): Promise<boolean> {
      if (await this.$_getBarEditorComponent()?.onKeydown(event) ?? false) return true;
      return false;
    },
  },
};
</script>
