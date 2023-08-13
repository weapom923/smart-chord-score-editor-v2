<template>
  <v-dialog
    width="unset"
    scrollable
    v-model="$data.$_tempShows"
    v-on:update:model-value="$_onShowsChange"
    v-on:keydown.stop="onKeydown"
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
import { defineComponent } from 'vue';

function initialize(self: InstanceType<typeof DialogBase>) {
  self.$data.$_tempShows = true;
  self.$data.$_isOkCallbackCalled = false;
  self.$data.$_isFinalizeCallbackCalled = false;
  if (self.initializeCallback) {
    self.initializeCallback();
  }
}

function finalize(self: InstanceType<typeof DialogBase>) {
  if (!self.$data.$_isFinalizeCallbackCalled && self.finalizeCallback) {
    self.finalizeCallback();
    self.$data.$_isFinalizeCallbackCalled = true;
  }
  self.$data.$_tempShows = false;
}

const DialogBase = defineComponent({
  watch: {
    '$store.state.dialog.shows': {
      handler(newShows) { if (newShows) initialize(this) },
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
    onKeydown(event: KeyboardEvent): boolean {
      switch (event.key) {
        case 'Enter':
          if (this.okDisabled) return false;
          this.$_onOkClicked();
          return true;
        case 'Escape':
          this.$_onCancelClicked();
          return true;
      }
      return false;
    },

    /* private */
    $_onCancelClicked() {
      finalize(this);
    },

    $_onOkClicked() {
      if (!this.$data.$_isOkCallbackCalled && this.okCallback) {
        this.okCallback();
        this.$data.$_isOkCallbackCalled = true;
      }
      finalize(this);
    },

    $_onShowsChange(shows: boolean) {
      if (!shows) finalize(this);
    },

    async $_restoreState() {
      await this.$store.dispatch('dialog/setShows', false);
    },
  },
});

export default DialogBase;
</script>