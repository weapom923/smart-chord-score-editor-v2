import { createStore } from 'vuex';
import AppStateModule, { AppState } from './module/AppState';
import ConfigModule, { Config } from './module/Config';
import ScoreModule, { ScoreState } from './module/Score';
import DialogModule, { DialogState } from './module/Dialog';
import CanvasModule, { CanvasState } from './module/Canvas';
import ContextMenuModule, { ContextMenuState } from './module/ContextMenu';
import { SectionAndBarRange } from '@/modules/SectionAndBarRange';

export type RootState = { [key: symbol]: never }

export type State = RootState & {
  appState: AppState,
  config: Config,
  score: ScoreState,
  dialog: DialogState,
  canvas: CanvasState,
  contextMenu: ContextMenuState,
}

const store = createStore<State>({
  state: undefined,
  modules: {
    appState: AppStateModule,
    config: ConfigModule,
    score: ScoreModule,
    dialog: DialogModule,
    canvas: CanvasModule,
    contextMenu: ContextMenuModule,
  },
})

store.watch<SectionAndBarRange | undefined>(
  (state: State) => state.score.selectedBars,
  (
    newSectionAndBarRange: SectionAndBarRange | undefined,
    oldSectionAndBarRange: SectionAndBarRange | undefined,
  ) => {
    if (
      newSectionAndBarRange &&
      oldSectionAndBarRange &&
      !newSectionAndBarRange.isEqualTo(oldSectionAndBarRange)
    ) {
      store.commit('score/unselectPartAndNote')
    }
  },
);

export default store;
