import { ActionContext, Module } from 'vuex';
import { RootState } from '..';

export type ContextMenuItem = {
  icon?: string,
  text: string,
  callback: (x?: Event) => void | Promise<void>,
  disabled?: boolean,
};

export type ContextMenuParameters = {
  activator: HTMLElement,
  menuItems: ContextMenuItem[],
};

export type ContextMenuState = {
  parameters?: ContextMenuParameters,
};

const DialogModule: Module<ContextMenuState, RootState> = {
  namespaced: true,

  state: <ContextMenuState> {
    parameters: undefined,
  },

  mutations: {
    setParameters(state: ContextMenuState, parameters: ContextMenuParameters) {
      state.parameters = parameters;
    },

    clearParameters(state: ContextMenuState) {
      state.parameters = undefined;
    },
  },

  actions: {
    setParameters(context: ActionContext<ContextMenuState, RootState>, parameters: ContextMenuParameters) {
      context.commit('setParameters', parameters);
    },

    clearParameters(context: ActionContext<ContextMenuState, RootState>) {
      context.commit('clearParameters');
    },
  },
}

export default DialogModule;
