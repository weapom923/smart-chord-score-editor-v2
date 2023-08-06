import { ActionContext, Module } from 'vuex';
import { RootState } from '..';
import CanvasBase from '../../components/canvases/CanvasBase.vue';

type CanvasInstance = InstanceType<typeof CanvasBase>;

export type CanvasState = {
  canvas: Map<CanvasInstance, boolean>,
};

const AppStateModule: Module<CanvasState, RootState> = {
  namespaced: true,

  state: {
    canvas: new Map(),
  },

  mutations: {
    addCanvas(state: CanvasState, canvas: CanvasInstance) {
      state.canvas.set(canvas, true);
    },

    setDirty(state: CanvasState, canvas: CanvasInstance) {
      if (state.canvas.has(canvas)) {
        state.canvas.set(canvas, true);
      }
    },

    removeCanvas(state: CanvasState, canvas: CanvasInstance) {
      state.canvas.delete(canvas);
    },

    drawCanvas(state: CanvasState) {
      for (let [ canvas, isDirty ] of state.canvas.entries()) {
        if (isDirty) {
          canvas.draw();
          state.canvas.set(canvas, false);
        }
      }
    },
  },

  actions: {
    addCanvas(context: ActionContext<CanvasState, RootState>, canvas: CanvasInstance) {
      context.commit('addCanvas', canvas);
    },

    setDirty(context: ActionContext<CanvasState, RootState>, canvas: CanvasInstance) {
      context.commit('setDirty', canvas);
    },

    removeCanvas(context: ActionContext<CanvasState, RootState>, canvas: CanvasInstance) {
      context.commit('removeCanvas', canvas);
    },

    drawCanvas(context: ActionContext<CanvasState, RootState>) {
      context.commit('drawCanvas');
    },
  },
}

export default AppStateModule;
