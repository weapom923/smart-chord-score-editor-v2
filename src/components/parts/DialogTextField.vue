<template>
  <v-text-field
    v-model="$_modelValue"
    v-bind="$props"
    v-on:compositionstart="$_onCompositionstart"
    v-on:compositionend="$_onCompositionend"
    v-on:keydown="$_onKeydown"
  >
    <template
      v-for="(slot, name) in $slots"
      v-slot:[name]="slotProps"
    >
      <slot v-bind:name="name" v-bind="slotProps"></slot>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { VTextField } from 'vuetify/lib/components/VTextField/index.mjs';

export default defineComponent({
  extends: VTextField,

  emits: {
    'update:modelValue': (modelValue: any) => true,
    keydown: (event: KeyboardEvent) => true,
  },

  data(): {
    $_isCompositionStarted: boolean,
  } {
    return {
      $_isCompositionStarted: false,
    };
  },

  mounted() {
    this.$_vTextFieldElement.addEventListener('compositionstart', this.$_onCompositionstart);
    this.$_vTextFieldElement.addEventListener('compositionend', this.$_onCompositionend);
  },

  beforeUnmount() {
    this.$_vTextFieldElement.removeEventListener('compositionstart', this.$_onCompositionstart);
    this.$_vTextFieldElement.removeEventListener('compositionend', this.$_onCompositionend);
  },

  computed: {
    $_modelValue: {
      get() { return this.modelValue },
      set(modelValue: any) { this.$emit('update:modelValue', modelValue) }
    },

    $_vTextFieldElement(): HTMLElement {
      return this.$el as HTMLElement;
    },
  },

  methods: {
    /* private */
    $_onCompositionstart() {
      this.$data.$_isCompositionStarted = true;
    },

    $_onCompositionend() {
      this.$data.$_isCompositionStarted = false;
    },

    $_onKeydown(event: KeyboardEvent) {
      if (this.$data.$_isCompositionStarted) {
        event.stopPropagation();
      } else {
        this.$emit('keydown', event);
      }
    },
  },
})
</script>