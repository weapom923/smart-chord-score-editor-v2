import { ActionContext, Module } from 'vuex';
import { RootState } from '..';

export type DialogDefinition = {
  componentName: string,
  props?: {},
}

export type DialogState = {
  shows: boolean,
  dialog?: DialogDefinition,
};

const DialogModule: Module<DialogState, RootState> = {
  namespaced: true,

  state: <DialogState> {
    shows: false,
    dialog: undefined,
  },

  mutations: {
    setShows(state: DialogState, shows: boolean) {
      state.shows = shows;
    },

    setDialog(state: DialogState, dialog: DialogDefinition) {
      state.dialog = dialog;
    },
  },

  actions: {
    setShows(context: ActionContext<DialogState, RootState>, shows: boolean) {
      context.commit('setShows', shows);
    },

    setDialog(context: ActionContext<DialogState, RootState>, dialog: DialogDefinition) {
      context.commit('setShows', true);
      context.commit('setDialog', dialog);
    },
  },
}

export default DialogModule;
