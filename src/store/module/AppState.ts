import { ActionContext, Module } from 'vuex';
import { RootState } from '..';

export type AppState = {
  snackBarMessage?: string,
  isPrintLayoutEnabled: boolean,
  isMobileLayoutEnabled: boolean,
  isFooterEditorMinimized: boolean,
  isAutoScrollEnabled: boolean,
};

const AppStateModule: Module<AppState, RootState> = {
  namespaced: true,

  state: {
    snackBarMessage: undefined,
    isPrintLayoutEnabled: false,
    isMobileLayoutEnabled: false,
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

    setIsMobileLayoutEnabled(state: AppState, isMobileLayoutEnabled: boolean) {
      state.isMobileLayoutEnabled = isMobileLayoutEnabled;
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

    setIsMobileLayoutEnabled(context: ActionContext<AppState, RootState>, isMobileLayoutEnabled: boolean) {
      context.commit('setIsMobileLayoutEnabled', isMobileLayoutEnabled);
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
