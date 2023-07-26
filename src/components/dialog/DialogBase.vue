<template>
  <v-dialog
    width="unset"
    scrollable
    v-model="$data.$_tempShows"
    v-on:update:model-value="$_onShowsChange"
    v-on:keydown.stop
    v-on:keydown.escape="$_onEscapeKeydown"
    v-on:keydown.enter="$_onEnterKeydown"
  >
    <v-card id="dialog-window" v-on:vue:unmounted="$_restoreState">
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
  watch: {
    '$store.state.dialog.shows': {
      handler(newShows) { if (newShows) this.$_initialize() },
      immediate: true,
    },
  },

  data(): {
    $_tempShows: boolean,
    $_isOkCallbackCalled: boolean,
    $_isFinalizeCallbackCalled: boolean,
  } {
    return {
      $_tempShows: false,
      $_isOkCallbackCalled: false,
      $_isFinalizeCallbackCalled: false,
    };
  },

  props: {
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
      this.$data.$_tempShows = true;
      this.$data.$_isOkCallbackCalled = false;
      this.$data.$_isFinalizeCallbackCalled = false;
      if (this.initializeCallback) {
        this.initializeCallback();
      }
    },

    $_onEscapeKeydown(event: KeyboardEvent) {
      this.$_onCancelClicked();
      event.preventDefault();
    },

    $_onEnterKeydown(event: KeyboardEvent) {
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
      this.$data.$_tempShows = false;
    },

    async $_restoreState() {
      await this.$store.dispatch('dialog/setShows', false);
    },
  },
}
</script>