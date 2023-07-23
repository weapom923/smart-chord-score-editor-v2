import { raw } from './utils';

type ScoreChangeFunction = () => void;
type Callback = (...args: any) => void;

export class ScoreChange {
  readonly redo: ScoreChangeFunction;
  readonly undo: ScoreChangeFunction;
  readonly afterChange: Callback;

  constructor({ redo, undo, afterChange }: { redo: ScoreChangeFunction, undo: ScoreChangeFunction, afterChange: Callback }) {
    this.redo = redo;
    this.undo = undo;
    this.afterChange = afterChange;
  }
}

export class ScoreChangeHistoryManager {
  #history: ScoreChange[] = [];
  #nextChangeIdx = 0;

  clear() {
    const self = raw(this);
    self.#history.splice(0);
    self.#nextChangeIdx = 0;
  }

  get #latestChangeIdx(): number | undefined {
    const self = raw(this);
    if (self.#history.length === 0) return undefined;
    return self.#history.length - 1;
  }

  get #currentChangeToRedo(): ScoreChange | undefined {
    const self = raw(this);
    if (self.#latestChangeIdx === undefined) return undefined;
    if (self.#nextChangeIdx > self.#latestChangeIdx) return undefined;
    return self.#history[self.#nextChangeIdx];
  }

  get #currentChangeToUndo(): ScoreChange | undefined {
    const self = raw(this);
    if (self.#nextChangeIdx === 0) return undefined;
    return self.#history[self.#nextChangeIdx - 1];
  }

  register(scoreChange: ScoreChange) {
    const self = raw(this);
    self.#history.splice(self.#nextChangeIdx, self.#history.length - self.#nextChangeIdx, scoreChange);
    self.redo();
  }

  redo() {
    const self = raw(this);
    let currentChangeToRedo = self.#currentChangeToRedo;
    if (currentChangeToRedo !== undefined) {
      currentChangeToRedo.redo();
      ++self.#nextChangeIdx;
      currentChangeToRedo.afterChange();
    }
  }

  undo() {
    const self = raw(this);
    let currentChangeToUndo = self.#currentChangeToUndo;
    if (currentChangeToUndo !== undefined) {
      currentChangeToUndo.undo();
      --self.#nextChangeIdx;
      currentChangeToUndo.afterChange();
    }
  }

  get isRedoable(): boolean {
    return raw(this).#currentChangeToRedo !== undefined;
  }

  get isUndoable(): boolean {
    return raw(this).#currentChangeToUndo !== undefined;
  }
}