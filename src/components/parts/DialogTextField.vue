<template>
  <v-text-field
    ref="vTextField"
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
import { defineComponent, ref } from 'vue';
import { VTextField } from 'vuetify/lib/components/VTextField/index.mjs';

export default defineComponent({
  extends: VTextField,

  setup() {
    return {
      vTextField: ref<InstanceType<typeof VTextField>>(),
    };
  },

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
    if (this.vTextField) {
      this.vTextField.addEventListener('compositionstart', this.$_onCompositionstart);
      this.vTextField.addEventListener('compositionend', this.$_onCompositionend);
    }
  },

  beforeUnmount() {
    if (this.vTextField) {
      this.vTextField.removeEventListener('compositionstart', this.$_onCompositionstart);
      this.vTextField.removeEventListener('compositionend', this.$_onCompositionend);
    }
  },

  computed: {
    $_modelValue: {
      get() { return this.modelValue },
      set(modelValue: any) { this.$emit('update:modelValue', modelValue) }
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