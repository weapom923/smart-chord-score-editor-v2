import { createStore } from 'vuex';
import AppStateModule, { AppState } from './module/AppState';
import ConfigModule, { Config } from './module/Config';
import ScoreModule, { ScoreState } from './module/Score';
import DialogModule, { DialogState } from './module/Dialog';
import CanvasModule, { CanvasState } from './module/Canvas';

export type RootState = { [key: symbol]: never }

export type State = RootState & {
  appState: AppState,
  config: Config,
  score: ScoreState,
  dialog: DialogState,
  canvas: CanvasState,
}

export default createStore<RootState>({
  state: {},
  modules: {
    appState: AppStateModule,
    config: ConfigModule,
    score: ScoreModule,
    dialog: DialogModule,
    canvas: CanvasModule,
  },
})
