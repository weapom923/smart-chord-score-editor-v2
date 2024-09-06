import { ActionContext, Module } from 'vuex';
import { RootState } from '..';
import CanvasBase from '../../components/canvases/CanvasBase.vue';

type CanvasInstance = InstanceType<typeof CanvasBase>;

export type CanvasState = {
  tieCanvas: Set<CanvasInstance>,
};

const AppStateModule: Module<CanvasState, RootState> = {
  namespaced: true,

  state: {
    tieCanvas: new Set(),
  },

  mutations: {
    reserveTieCanvas(state: CanvasState, tieCanvas: CanvasInstance) {
      state.tieCanvas.add(tieCanvas);
    },

    drawTieCanvas(state: CanvasState) {
      for (const tieCanvas of state.tieCanvas) {
        tieCanvas.draw();
        state.tieCanvas.delete(tieCanvas);
      }
    },
  },

  actions: {
    reserveTieCanvas(context: ActionContext<CanvasState, RootState>, tieCanvas: CanvasInstance) {
      context.commit('reserveTieCanvas', tieCanvas);
    },

    drawTieCanvas(context: ActionContext<CanvasState, RootState>) {
      context.commit('drawTieCanvas');
    },
  },
}

export default AppStateModule;
