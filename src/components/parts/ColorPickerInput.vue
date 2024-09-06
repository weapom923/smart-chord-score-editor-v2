<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <div v-bind="props">
        <v-text-field
          readonly
          v-bind="$attrs"
          v-bind:model-value="$_colorText"
        >
        </v-text-field>
      </div>
    </template>

    <v-card>
      <v-color-picker
        id="color-picker"
        v-model="$_modelValue"
        v-on:click.stop
      >
      </v-color-picker>
    </v-card>
  </v-menu>
</template>

<style scoped>
#color-picker {
  max-width: inherit !important;
  width: inherit !important;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import Color from '../../modules/Color'

type RGBA = {
  r: number,
  g: number,
  b: number,
  a: number,
};

export default defineComponent({
  emits: {
    'update:modelValue': (modelValue: Color) => true,
  },

  props: {
    modelValue: { type: Color, required: true }
  },

  computed: {
    $_colorText(): string {
      return [
        '#',
        Math.floor(this.modelValue.red).toString(16).padStart(2, '0'),
        Math.floor(this.modelValue.green).toString(16).padStart(2, '0'),
        Math.floor(this.modelValue.blue).toString(16).padStart(2, '0'),
        Math.floor(this.modelValue.alpha * 255).toString(16).padStart(2, '0'),
      ].join('');
    },

    $_modelValue: {
      get(): RGBA {
        return {
          r: this.modelValue.red,
          g: this.modelValue.green,
          b: this.modelValue.blue,
          a: this.modelValue.alpha,
        }
      },
      set(modelValue: RGBA) {
        this.$emit(
          'update:modelValue',
          new Color(
            modelValue.r,
            modelValue.g,
            modelValue.b,
            modelValue.a,
          ),
        );
      },
    },
  },
})
</script>