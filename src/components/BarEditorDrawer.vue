<template>
  <v-navigation-drawer
    class="pa-0 ma-0 overflow-hidden"
    permanent app touchless
    v-bind:width="$_barEditorDrawerWidth"
    v-bind:rail="$store.state.appState.isBarEditorDrawerMinimized"
    v-bind:rail-width="expandButtonWidthPx"
    v-bind:location="$store.state.config.barEditorLocation"
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

    <bar-editor
      ref="barEditor"
      v-else
      v-bind:width="$_barEditorWidth"
      v-bind:height="$_barEditorHeight"
    >
    </bar-editor>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BarEditor from './BarEditor.vue';
import { SectionAndBarRange } from '../modules/SectionAndBarRange';

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

    $_barEditorMaximizeButtonWidth(): number | string {
      switch (this.$store.state.config.barEditorLocation) {
        case 'left':
        case 'right':
          return expandButtonWidthPx;
        default:
          return '100%';
      }
    },

    $_barEditorMaximizeButtonHeight(): number | string {
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
