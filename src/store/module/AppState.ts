import { ActionContext, Module } from 'vuex';
import { RootState } from '..';

export type AppState = {
  snackBarMessage?: string,
  isPrintLayoutEnabled: boolean,
  isFooterEditorMinimized: boolean,
  isAutoScrollEnabled: boolean,
};

const AppStateModule: Module<AppState, RootState> = {
  namespaced: true,

  state: {
    snackBarMessage: undefined,
    isPrintLayoutEnabled: false,
    isFooterEditorMinimized: true,
    isAutoScrollEnabled: false,
  },

  mutations: {
    setSnackBarMessage(state: AppState, snackBarMessage?: string) {
      state.snackBarMessage = snackBarMessage;
    },

    setIsPrintLayoutEnabled(state: AppState, isPrintLayoutEnabled: boolean) {
      state.isPrintLayoutEnabled = isPrintLayoutEnabled;
    },

    setIsFooterEditorMinimized(state: AppState, isFooterEditorMinimized: boolean) {
      state.isFooterEditorMinimized = isFooterEditorMinimized;
    },
  },

  actions: {
    setSnackBarMessage(context: ActionContext<AppState, RootState>, snackBarMessage?: string) {
      context.commit('setSnackBarMessage', snackBarMessage);
    },

    setIsPrintLayoutEnabled(context: ActionContext<AppState, RootState>, isPrintLayoutEnabled: boolean) {
      context.commit('setIsPrintLayoutEnabled', isPrintLayoutEnabled);
    },

    setIsFooterEditorMinimized(context: ActionContext<AppState, RootState>, isFooterEditorMinimized: boolean) {
      context.commit('setIsFooterEditorMinimized', isFooterEditorMinimized);
    },

    reserveScroll(context: ActionContext<AppState, RootState>, element: HTMLElement) {
      context.commit('setScrollTargetElement', element);
    }
  },
}

export default AppStateModule;
