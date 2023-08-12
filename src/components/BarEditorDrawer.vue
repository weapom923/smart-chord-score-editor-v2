<template>
  <v-navigation-drawer
    class="pa-0 ma-0 no-print" rail-width="40"
    permanent
    v-bind:width="$_barEditorDrawerWidth"
    v-bind:rail="$store.state.appState.isFooterEditorMinimized"
    v-bind:location="$store.state.config.barEditorLocation"
  >
    <v-btn
      class="w-100 h-100" rounded="0" size="small"
      v-show="$store.state.appState.isFooterEditorMinimized"
      v-bind:icon="$_barEditorMaximizeIcon"
      v-on:click="$_toggleFooterEditorMaximizedAndMinimized"
    >
    </v-btn>

    <editor-component
      ref="editorComponent"
      v-show="!$store.state.appState.isFooterEditorMinimized"
    >
    </editor-component>
  </v-navigation-drawer>
</template>

<script lang="ts">
import EditorComponent from './footer_editor/EditorComponent.vue';
import { SectionAndBarRange } from '../modules/SectionAndBarRange';

const idealDrawerWidthPx = 800;
const idealDrawerHeightPx = 700;

export default {
  components: {
    EditorComponent,
  },

  watch: {
    '$store.state.score.selectedBars'(selectedBars?: SectionAndBarRange) {
      if (selectedBars === undefined) {
        this.$store.dispatch('appState/setIsFooterEditorMinimized', true);
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
    window.addEventListener('keydown', this.onKeydown);
    window.addEventListener('resize', this.$_updateBarEditorDrawerSize);
  },

  async mounted() {
    this.$_updateBarEditorDrawerSize();
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('resize', this.$_updateBarEditorDrawerSize);
  },

  methods: {
    $_updateBarEditorDrawerSize() {
      let barEditorDrawerWidthPxMax = window.innerWidth * 0.8;
      let barEditorDrawerHeightPxMax = window.innerHeight * 0.8;
      this.$data.$_barEditorDrawerWidthPx = (barEditorDrawerWidthPxMax > idealDrawerWidthPx)? idealDrawerWidthPx : barEditorDrawerWidthPxMax;
      this.$data.$_barEditorDrawerHeightPx = (barEditorDrawerHeightPxMax > idealDrawerHeightPx)? idealDrawerHeightPx : barEditorDrawerHeightPxMax;
    },

    $_getEditorComponent(): InstanceType<typeof EditorComponent> | undefined | null {
      return this.$refs.editorComponent as any;
    },

    async $_toggleFooterEditorMaximizedAndMinimized() {
      await this.$store.dispatch('appState/setIsFooterEditorMinimized', !this.$store.state.appState.isFooterEditorMinimized);
    },

    onKeydown(event: KeyboardEvent): boolean {
      if (this.$_getEditorComponent()?.onKeydown(event) ?? false) return true;
      return false;
    },
  },
};
</script>
