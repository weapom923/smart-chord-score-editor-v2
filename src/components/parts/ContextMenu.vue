<template>
  <v-menu
    close-on-back
    close-on-content-click
    location="bottom"
    open-delay="0"
    close-delay="0"
    transition="none"
    min-width="0"
    v-model="$data.$_isMenuActive"
    v-bind:activator="$data.$_focusRetainer"
    v-bind:disabled="$store.state.appState.isPrintLayoutEnabled"
  >
    <v-list
      min-width="fit-content"
      max-width="fit-content"
      v-on:keydown.stop="$_onKeydownAtMenu"
    >
      <v-list-item
        density="compact"
        v-for="({ icon, text, callback, disabled }, menuItemIdx) in $_menuItems"
        v-bind:key="menuItemIdx"
        v-bind:prepend-icon="icon"
        v-bind:disabled="disabled"
        v-bind:value="menuItemIdx"
        v-on:click="callback"
        v-on:keydown.enter="callback"
      >
        <v-list-item-title>
          {{ text }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ContextMenuItem } from '@/store/module/ContextMenu';
import { VMenu } from 'vuetify/components';

export default defineComponent({
  extends: VMenu,

  data(): {
    $_isMenuActive: boolean,
    $_focusRetainer?: HTMLElement,
  } {
    return  {
      $_isMenuActive: true,
      $_focusRetainer: undefined,
    };
  },

  computed: {
    $_activator(): HTMLElement | undefined {
      return this.$store.state.contextMenu.parameters?.activator;
    },

    $_menuItems(): ContextMenuItem[] {
      return this.$store.state.contextMenu.parameters?.menuItems ?? [];
    },
  },

  watch: {
    async '$data.$_isMenuActive'(isMenuActive: boolean) {
      if (!isMenuActive) {
        await this.$store.dispatch('contextMenu/clearParameters');
      }
    },

    $_activator(newActivator?: HTMLElement, oldActivator?: HTMLElement) {
      if (oldActivator) {
        if (this.$data.$_focusRetainer) {
          this.$data.$_focusRetainer.blur();
          if (
            !oldActivator.isSameNode(this.$data.$_focusRetainer) &&
            oldActivator.contains(this.$data.$_focusRetainer)
          ) {
            oldActivator.removeChild(this.$data.$_focusRetainer);
          }
          this.$data.$_focusRetainer = undefined;
        }
      }
      if (newActivator) {
        this.$data.$_focusRetainer = document.createElement('div');
        this.$data.$_focusRetainer.tabIndex = -1;
        this.$data.$_focusRetainer.style.position = 'absolute';
        this.$data.$_focusRetainer.style.top = '0';
        this.$data.$_focusRetainer.style.left = '0';
        this.$data.$_focusRetainer.style.width = '100%';
        this.$data.$_focusRetainer.style.height = '100%';
        this.$data.$_focusRetainer.style.outline = 'none';
        this.$data.$_focusRetainer.style.pointerEvents = 'none';
        newActivator.appendChild(this.$data.$_focusRetainer);
        this.$data.$_focusRetainer.focus();
        this.$data.$_isMenuActive = true;
      }
    },
  },

  methods: {
    $_onKeydownAtMenu(event: KeyboardEvent): boolean {
      switch (event.key) {
        case 'Enter':
        case 'Space':
        case 'Escape':
          this.$data.$_isMenuActive = false;
          return true;
      }
      return false;
    },
  },

})
</script>