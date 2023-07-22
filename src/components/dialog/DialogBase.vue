<template>
  <v-dialog
    width="unset"
    scrollable
    v-bind:value="shows"
    v-bind:retain-focus="$data.$_retainsFocus"
    v-on:update:model-value="$_onShowsChange"
    v-on:keydown.stop
    v-on:keydown.enter="$_onEnterKeyDown"
  >
    <v-card id="dialog-window">
      <slot name="body">
      </slot>

      <v-card-actions>
        <slot
          name="buttons"
          v-bind:on="$_buttonEventHandlers"
        >
          <v-spacer />
          <v-btn
            color="secondary"
            v-on:click="$_onCancelClicked"
            v-bind:text="$t('cancel')"
          >
          </v-btn>

          <v-btn
            color="primary"
            v-on:click="$_onOkClicked"
            v-bind:disabled="okDisabled"
            v-bind:text="$t('ok')"
          >
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
#dialog-window {
  width: 600px;
  max-width: 100%;
}
</style>

<script lang="ts">
export default {
  emits: {
    'update:shows': (shows: boolean) => true,
  },

  watch: {
    shows: {
      handler(newShows) { if (newShows) this.$_initialize() },
      immediate: true,
    },
  },

  data(): {
    $_retainsFocus: boolean,
    $_focusBackElement: typeof document.activeElement,
    $_isOkCallbackCalled: boolean,
    $_isFinalizeCallbackCalled: boolean,
  } {
    return {
      $_retainsFocus: false,
      $_focusBackElement: null,
      $_isOkCallbackCalled: false,
      $_isFinalizeCallbackCalled: false,
    };
  },

  props: {
    shows:              { type: Boolean, default: false },
    initializeCallback: { type: Function },
    okCallback:         { type: Function },
    finalizeCallback:   { type: Function },
    okDisabled:         { type: Boolean, default: false }
  },

  computed: {
    $_buttonEventHandlers() {
      return {
        okClicked: this.$_onOkClicked,
        cancelClicked: this.$_onCancelClicked,
      };
    },
  },

  methods: {
    /* private */
    $_initialize() {
      this.$data.$_focusBackElement = document.activeElement;
      this.$data.$_isOkCallbackCalled = false;
      this.$data.$_isFinalizeCallbackCalled = false;
      this.$data.$_retainsFocus = true;
      if (this.initializeCallback) {
        this.initializeCallback();
      }
    },

    $_onEnterKeyDown(event: KeyboardEvent) {
      if (this.okDisabled) return;
      this.$_onOkClicked();
      event.preventDefault();
    },

    $_onCancelClicked() {
      this.$_finalize();
    },

    $_onOkClicked() {
      if (!this.$data.$_isOkCallbackCalled && this.okCallback) {
        this.okCallback();
        this.$data.$_isOkCallbackCalled = true;
      }
      this.$_finalize();
    },

    $_onShowsChange(shows: boolean) {
      if (!shows) this.$_finalize();
    },

    $_finalize() {
      if (!this.$data.$_isFinalizeCallbackCalled && this.finalizeCallback) {
        this.finalizeCallback();
        this.$data.$_isFinalizeCallbackCalled = true;
      }
      this.$data.$_retainsFocus = false;
      this.$nextTick(() => {
        if (this.$data.$_focusBackElement instanceof HTMLElement) {
          this.$data.$_focusBackElement.focus();
        }
      });
      this.$emit('update:shows', false);
    },
  },
}
</script>