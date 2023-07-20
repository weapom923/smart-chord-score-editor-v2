import { ActionContext, Module } from 'vuex';
import { Score } from '../../modules/Score';
import { ScoreMetadata } from '../../modules/ScoreMetadata';
import { Section } from '../../modules/Section';
import { Bar } from '../../modules/Bar';
import { PartInBar } from '../../modules/PartInBar';
import { BarBreak } from '../../modules/BarBreak';
import { Note } from '../../modules/Note';
import { ScoreChangeHistoryManager, ScoreChange } from '../../modules/ScoreChangeHistoryManager';
import { SectionAndBarIdx, SectionAndBarRange } from '../../modules/SectionAndBarRange';
import { RootState } from '..';

export namespace ScorePageWHRatio {
  export const silver = 1 / 1.4142356;
};

export type ScoreState = {
  score: Score,
  scorePageWHRatio: number,
  scoreChangeHistoryManager: ScoreChangeHistoryManager,
  selectedBars?: SectionAndBarRange,
  isRedoable: boolean,
  isUndoable: boolean,
  copiedBars: Bar[],
};

const ScoreModule: Module<ScoreState, RootState> = {
  namespaced: true,

  state: {
    score: new Score(),
    scorePageWHRatio: ScorePageWHRatio.silver,
    scoreChangeHistoryManager: new ScoreChangeHistoryManager(),
    isRedoable: false,
    isUndoable: false,
    selectedBars: undefined,
    copiedBars: [],
  },

  mutations: {
    redo(state: ScoreState) {
      state.scoreChangeHistoryManager.redo();
    },

    undo(state: ScoreState) {
      state.scoreChangeHistoryManager.undo();
    },

    setScoreMetadata(state: ScoreState, scoreMetadata: ScoreMetadata) {
      const newScoreMetadata = scoreMetadata.clone();
      const currentScoreMetadata = state.score.metadata.clone();
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() { state.score.metadata = newScoreMetadata.clone() },
          undo() { state.score.metadata = currentScoreMetadata.clone() },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    setSectionName(state: ScoreState, { sectionIdx, sectionName }: { sectionIdx: number, sectionName: string }) {
      const currentSectionName = state.score.getSection(sectionIdx).name;
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() { state.score.getSection(sectionIdx).name = sectionName },
          undo() { state.score.getSection(sectionIdx).name = currentSectionName },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    setScore(state: ScoreState, score: Score) {
      const newScore = score.clone();
      const currentScore = state.score.clone();
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            state.selectedBars = undefined;
            state.score = newScore.clone();
          },
          undo() {
            state.selectedBars = undefined;
            state.score = currentScore.clone();
          },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    insertSections(state: ScoreState, { sectionIdx, sections }: { sectionIdx: number, sections: Section[] }) {
      const newSections = sections.map(section => section.clone());
      const numSections = sections.length;
      const insertedSectionAndBarRange = new SectionAndBarRange(
        new SectionAndBarIdx(sectionIdx, newSections[0].firstBarIdx ?? 0),
        new SectionAndBarIdx(sectionIdx + numSections - 1, newSections[0].lastBarIdx ?? 0),
      );
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            state.score.sections.splice(sectionIdx, 0, ...newSections.map(section => section.clone()));
            if (state.selectedBars !== undefined) {
              if ((state.selectedBars.first.sectionIdx < sectionIdx) && (state.selectedBars.last.sectionIdx >= sectionIdx)) {
                state.selectedBars.last.sectionIdx += numSections;
              } else if (state.selectedBars.first.sectionIdx >= sectionIdx) {
                state.selectedBars.first.sectionIdx += numSections;
                state.selectedBars.last.sectionIdx += numSections;
              }
            }
          },
          undo() {
            state.score.sections.splice(sectionIdx, numSections);
            if (state.selectedBars !== undefined) {
              if (state.selectedBars.isCompletelyIncludedIn(insertedSectionAndBarRange)) {
                state.selectedBars = undefined;
                return;
              }
              if (insertedSectionAndBarRange.includes(state.selectedBars.last)) {
                let selectedBarsIdxLast = state.score.getPreviousSectionAndBarIdx(insertedSectionAndBarRange.first);
                if (selectedBarsIdxLast === undefined) {
                  state.selectedBars = undefined;
                  return
                }
                state.selectedBars.last = selectedBarsIdxLast;
              } else if (insertedSectionAndBarRange.last.isPriorTo(state.selectedBars.last)) {
                state.selectedBars.last.sectionIdx -= numSections;
              }
              if (insertedSectionAndBarRange.includes(state.selectedBars.first)) {
                state.selectedBars.first = insertedSectionAndBarRange.first.clone();
              } else if (insertedSectionAndBarRange.last.isPriorTo(state.selectedBars.first)) {
                state.selectedBars.first.sectionIdx -= numSections;
              }
            }
          },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    insertBars(state: ScoreState, { sectionAndBarIdx, bars }: { sectionAndBarIdx: SectionAndBarIdx, bars: Bar[] }) {
      const newBars = bars.map(bar => bar.clone());
      const numBars = bars.length;
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            state.score.getSection(sectionAndBarIdx.sectionIdx).bars.splice(sectionAndBarIdx.barIdx, 0, ...newBars.map(bar => bar.clone()));
            if (state.selectedBars !== undefined) {
              if (state.selectedBars.includeSingleBarOnly) {
                if (state.selectedBars.idx.isPosteriorOrEqualTo(sectionAndBarIdx)) {
                  state.selectedBars.first.barIdx += numBars;
                  state.selectedBars.last.barIdx += numBars;
                }
              } else {
                if (state.selectedBars.first.isPosteriorOrEqualTo(sectionAndBarIdx)) {
                  state.selectedBars.first.barIdx += numBars;
                }
                if (state.selectedBars.last.isPosteriorOrEqualTo(sectionAndBarIdx)) {
                  state.selectedBars.last.barIdx += numBars;
                }
              }
            }
          },
          undo() {
            state.score.getSection(sectionAndBarIdx.sectionIdx).bars.splice(sectionAndBarIdx.barIdx, numBars);
            if (state.selectedBars !== undefined) {
              if (state.selectedBars.includes(sectionAndBarIdx)) {
                if (!state.selectedBars.includeSingleBarOnly) state.selectedBars.last.barIdx -= numBars;
              } else {
                if (sectionAndBarIdx.isPosteriorOrEqualTo(state.selectedBars.first)) {
                  state.selectedBars.first.barIdx -= numBars;
                }
                if (sectionAndBarIdx.isPosteriorOrEqualTo(state.selectedBars.last)) {
                  state.selectedBars.last.barIdx -= numBars;
                }
              }
            }
          },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    removeBars(state: ScoreState, sectionAndBarRange: SectionAndBarRange) {
      const targetSectionAndBarRange = sectionAndBarRange.clone();
      const numRemovedBars = [ ...state.score.getSectionAndBarIdxIterator(targetSectionAndBarRange) ].length;
      const { barRanges, sectionIdcs } = state.score.decomposeSectionAndBarRange(targetSectionAndBarRange);
      const removedBarsBySection = new Map<SectionIdx, Bar[]>();
      for (const [ sectionIdx, barRange ] of barRanges) {
        let section = state.score.getSection(sectionIdx);
        let bars = [ ...barRange.indices() ].map(barIdx => section.getBar(barIdx).clone());
        removedBarsBySection.set(sectionIdx, bars);
      }
      const removedSections = sectionIdcs.map(sectionIdx => state.score.getSection(sectionIdx).clone());
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            let numOffsetSelectedBarsFirst: number | undefined = undefined;
            let numOffsetSelectedBarsLast: number | undefined = undefined;
            if (state.selectedBars !== undefined) {
              if (state.selectedBars.first.isPosteriorOrEqualTo(targetSectionAndBarRange.first)) {
                if (state.selectedBars.first.isPosteriorTo(targetSectionAndBarRange.last)) {
                  let offsetSectionAndBarRange = new SectionAndBarRange(targetSectionAndBarRange.first.clone(), state.selectedBars.first.clone());
                  numOffsetSelectedBarsFirst = [ ...state.score.getSectionAndBarIdxIterator(offsetSectionAndBarRange) ].length - numRemovedBars - 1;
                } else {
                  numOffsetSelectedBarsFirst = 0;
                }
              }
              if (state.selectedBars.last.isPosteriorOrEqualTo(targetSectionAndBarRange.first)) {
                if (state.selectedBars.last.isPosteriorTo(targetSectionAndBarRange.last)) {
                  let offsetSectionAndBarRange = new SectionAndBarRange(targetSectionAndBarRange.first.clone(), state.selectedBars.last.clone());
                  numOffsetSelectedBarsLast = [ ...state.score.getSectionAndBarIdxIterator(offsetSectionAndBarRange) ].length - numRemovedBars - 1;
                } else {
                  numOffsetSelectedBarsLast = 0;
                }
              }
            }
            let lastPriorSectionAndBarIdx = state.score.getPreviousSectionAndBarIdx(targetSectionAndBarRange.first);

            for (const [ sectionIdx, removedBarRange ] of barRanges) {
              state.score.getSection(sectionIdx).bars.splice(removedBarRange.firstBarIdx, removedBarRange.numBars);
            }
            state.score.sections.splice(sectionIdcs[0], sectionIdcs.length);

            if (state.selectedBars !== undefined) {
              let selectedBarsOffsetBasis: SectionAndBarIdx | undefined;
              if (lastPriorSectionAndBarIdx !== undefined) {
                selectedBarsOffsetBasis = state.score.getNextSectionAndBarIdx(lastPriorSectionAndBarIdx);
              } else {
                selectedBarsOffsetBasis = state.score.firstSectionAndBarIdx;
              }
              if (selectedBarsOffsetBasis !== undefined) {
                if (numOffsetSelectedBarsLast !== undefined) {
                  state.selectedBars.last = selectedBarsOffsetBasis.clone();
                  for (let counter = 0; counter < numOffsetSelectedBarsLast; ++counter) {
                    let newSelectedBarsLast = state.score.getNextSectionAndBarIdx(state.selectedBars.last);
                    if (newSelectedBarsLast === undefined) break;
                    state.selectedBars.last = newSelectedBarsLast;
                  }
                }
                if (numOffsetSelectedBarsFirst !== undefined) {
                  state.selectedBars.first = selectedBarsOffsetBasis.clone();
                  for (let counter = 0; counter < numOffsetSelectedBarsFirst; ++counter) {
                    let newSelectedBarsFirst = state.score.getNextSectionAndBarIdx(state.selectedBars.first);
                    if (newSelectedBarsFirst === undefined) break;
                    state.selectedBars.first = newSelectedBarsFirst;
                  }
                }
              }
            }
          },
          undo() {
            state.score.sections.splice(sectionIdcs[0], 0, ...removedSections.map(section => section.clone()));
            for (const [ sectionIdx, barRange ] of barRanges) {
              const removedBars = removedBarsBySection.get(sectionIdx);
              if (removedBars === undefined) throw new RangeError();
              state.score.getSection(sectionIdx).bars.splice(barRange.firstBarIdx, 0, ...removedBars.map(bar => bar.clone()));
            }
            if (state.selectedBars !== undefined) {
              if (state.selectedBars.last.isPriorOrEqualTo(targetSectionAndBarRange.first)) {
                for (let counter = 0; counter < numRemovedBars; ++counter) {
                  let newSelectedBarsLast = state.score.getNextSectionAndBarIdx(state.selectedBars.last);
                  if (newSelectedBarsLast === undefined) break;
                  state.selectedBars.last = newSelectedBarsLast;
                }
              }
              if (state.selectedBars.first.isPriorOrEqualTo(targetSectionAndBarRange.first)) {
                for (let counter = 0; counter < numRemovedBars; ++counter) {
                  let newSelectedBarsFirst = state.score.getNextSectionAndBarIdx(state.selectedBars.first);
                  if (newSelectedBarsFirst === undefined) break;
                  state.selectedBars.first = newSelectedBarsFirst;
                }
              }
            }
          },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    pasteCopiedBars(state: ScoreState, sectionAndBarRange: SectionAndBarRange) {
      const numTargetBars = state.score.getBars(sectionAndBarRange).length;
      const copiedBars = state.copiedBars.map(bar => bar.clone());
      const currentBars = state.score.getBars(sectionAndBarRange).map(bar => bar.clone());
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(sectionAndBarRange)) {
              state.score.getSection(sectionAndBarIdx.sectionIdx).bars[sectionAndBarIdx.barIdx] = copiedBars[barIdx].clone();
              ++barIdx;
              if (barIdx >= numTargetBars) break;
            }
          },
          undo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(sectionAndBarRange)) {
              state.score.getSection(sectionAndBarIdx.sectionIdx).bars[sectionAndBarIdx.barIdx] = currentBars[barIdx].clone();
              ++barIdx;
              if (barIdx >= numTargetBars) break;
            }
          },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    pasteCopiedBarsPartOnly(state: ScoreState, sectionAndBarRange: SectionAndBarRange) {
      const numTargetBars = state.score.getBars(sectionAndBarRange).length;
      const copiedPartInBars = state.copiedBars.map(bar => bar.parts.map(part => part.clone()));
      const currentPartInBars = state.score.getBars(sectionAndBarRange).map(bar => bar.parts.map(part => part.clone()));
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(sectionAndBarRange)) {
              let bar = state.score.getBar(sectionAndBarIdx);
              bar.parts.splice(0, bar.numParts, ...copiedPartInBars[barIdx].map(partInBar => partInBar.clone()));
              ++barIdx;
              if (barIdx >= numTargetBars) break;
            }
          },
          undo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(sectionAndBarRange)) {
              let bar = state.score.getBar(sectionAndBarIdx);
              bar.parts.splice(0, bar.numParts, ...currentPartInBars[barIdx].map(partInBar => partInBar.clone()));
              ++barIdx;
              if (barIdx >= numTargetBars) break;
            }
          },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    replaceBars(state: ScoreState, { sectionAndBarRange, bars }: { sectionAndBarRange: SectionAndBarRange, bars: Bar[] }) {
      const newBars = bars.map(bar => bar.clone());
      const currentBars = state.score.getBars(sectionAndBarRange).map(bar => bar.clone());
      if (currentBars.length !== bars.length) throw new RangeError();
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(sectionAndBarRange)) {
              state.score.getSection(sectionAndBarIdx.sectionIdx).bars[sectionAndBarIdx.barIdx] = newBars[barIdx].clone();
              ++barIdx;
            }
          },
          undo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(sectionAndBarRange)) {
              state.score.getSection(sectionAndBarIdx.sectionIdx).bars[sectionAndBarIdx.barIdx] = currentBars[barIdx].clone();
              ++barIdx;
            }
          },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    setBarBreak(state: ScoreState, { sectionAndBarIdx, barBreak }: { sectionAndBarIdx: SectionAndBarIdx, barBreak: BarBreak }) {
      const newBarBreak = barBreak.clone();
      const currentBarBreak = state.score.getBar(sectionAndBarIdx).break;
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() { state.score.getBar(sectionAndBarIdx).break = newBarBreak },
          undo() { state.score.getBar(sectionAndBarIdx).break = currentBarBreak },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    unselectBar(state: ScoreState) {
      state.selectedBars = undefined;
    },

    selectBar(state: ScoreState, sectionAndBarIdx: SectionAndBarIdx) {
      state.selectedBars = new SectionAndBarRange(sectionAndBarIdx);
    },

    selectBars(state: ScoreState, sectionAndBarRange: SectionAndBarRange) {
      state.selectedBars = sectionAndBarRange;
    },

    expandSelectedBars(state: ScoreState, sectionAndBarIdx: SectionAndBarIdx) {
      if (state.selectedBars === undefined) {
        state.selectedBars = new SectionAndBarRange(sectionAndBarIdx);
      } else {
        state.score.expandSectionAndBarRange(state.selectedBars, sectionAndBarIdx);
      }
    },

    selectNextBar(state: ScoreState) {
      if (state.selectedBars === undefined) {
        state.selectedBars = new SectionAndBarRange(new SectionAndBarIdx(0, 0));
      } else {
        const nextSelectedBarsLast = state.score.getNextSectionAndBarIdx(state.selectedBars.last);
        if (nextSelectedBarsLast === undefined) {
          state.selectedBars.first = state.selectedBars.last.clone();
        } else {
          state.selectedBars.first = nextSelectedBarsLast.clone();
          state.selectedBars.last = nextSelectedBarsLast.clone();
        }
      }
    },

    selectPreviousBar(state: ScoreState) {
      if (state.selectedBars === undefined) {
        const lastSectionIdx = state.score.sections.length - 1;
        const lastBarIdx = state.score.sections[lastSectionIdx].bars.length - 1;
        state.selectedBars = new SectionAndBarRange(new SectionAndBarIdx(lastSectionIdx, lastBarIdx));
      } else {
        const previousSelectedBarsLast = state.score.getPreviousSectionAndBarIdx(state.selectedBars.last);
        if (previousSelectedBarsLast === undefined) {
          state.selectedBars.last = state.selectedBars.first.clone();
        } else {
          state.selectedBars.first = previousSelectedBarsLast.clone();
          state.selectedBars.last = previousSelectedBarsLast.clone();
        }
      }
    },

    incrementSelectedBarsFirstIdx(state: ScoreState) {
      if (state.selectedBars === undefined) return;
      if (state.selectedBars.includeSingleBarOnly) return;
      let nextSectionAndBarIdx = state.score.getNextSectionAndBarIdx(state.selectedBars.first);
      if (nextSectionAndBarIdx === undefined) return;
      state.selectedBars.first = nextSectionAndBarIdx;
    },

    incrementSelectedBarsLastIdx(state: ScoreState) {
      if (state.selectedBars === undefined) return;
      let nextSectionAndBarIdx = state.score.getNextSectionAndBarIdx(state.selectedBars.last);
      if (nextSectionAndBarIdx === undefined) return;
      state.selectedBars.last = nextSectionAndBarIdx.clone();
    },

    decrementSelectedBarsFirstIdx(state: ScoreState) {
      if (state.selectedBars === undefined) return;
      let previousSectionAndBarIdx = state.score.getPreviousSectionAndBarIdx(state.selectedBars.first);
      if (previousSectionAndBarIdx === undefined) return;
      state.selectedBars.first = previousSectionAndBarIdx.clone();
    },

    decrementSelectedBarsLastIdx(state: ScoreState) {
      if (state.selectedBars === undefined) return;
      if (state.selectedBars.includeSingleBarOnly) return;
      let previousSectionAndBarIdx = state.score.getPreviousSectionAndBarIdx(state.selectedBars.last);
      if (previousSectionAndBarIdx === undefined) return;
      state.selectedBars.last = previousSectionAndBarIdx.clone();
    },

    setCopiedBars(state: ScoreState, sectionAndBarRange: SectionAndBarRange) {
      state.copiedBars = [ ...state.score.getBars(sectionAndBarRange) ].map(bar => bar.clone());
    },

    replacePart(state: ScoreState, { sectionAndBarIdx, partIdx, partInBar }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx, partInBar: PartInBar }) {
      const newPartInBar = partInBar.clone();
      const currentPartInBar = state.score.getPart({ sectionAndBarIdx, partIdx }).clone();
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() { state.score.getBar(sectionAndBarIdx).parts[partIdx] = newPartInBar.clone() },
          undo() { state.score.getBar(sectionAndBarIdx).parts[partIdx] = currentPartInBar.clone() },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    replaceNote(state: ScoreState, { sectionAndBarIdx, partIdx, noteIdx, note }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx, noteIdx: NoteIdx, note: Note }) {
      const newNote = note.clone();
      const currentNote = state.score.getNote({ sectionAndBarIdx, partIdx, noteIdx }).clone();
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() { state.score.getPart({ sectionAndBarIdx, partIdx }).notes[noteIdx] = newNote.clone() },
          undo() { state.score.getPart({ sectionAndBarIdx, partIdx }).notes[noteIdx] = currentNote.clone() },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },

    insertNotes(state: ScoreState, { sectionAndBarIdx, partIdx, noteIdx, notes }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx, noteIdx: NoteIdx, notes: Note[] }) {
      const newNotes = notes.map(bar => bar.clone());
      const numNotes = notes.length;
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() { state.score.getPart({ sectionAndBarIdx, partIdx }).notes.splice(noteIdx, 0, ...newNotes) },
          undo() { state.score.getPart({ sectionAndBarIdx, partIdx }).notes.splice(noteIdx, numNotes) },
          afterChange() {
            state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
            state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
          },
        }),
      );
    },
  },

  actions: {
    // Score
    setScore(context: ActionContext<ScoreState, RootState>, score: Score) {
      context.commit('setScore', score);
    },

    setScoreMetadata(context: ActionContext<ScoreState, RootState>, scoreMetadata: ScoreMetadata) {
      context.commit('setScoreMetadata', scoreMetadata);
    },

    setSectionName(context: ActionContext<ScoreState, RootState>, { sectionIdx, sectionName }: { sectionIdx: number, sectionName: string }) {
      context.commit('setSectionName', { sectionIdx, sectionName });
    },

    insertSection(context: ActionContext<ScoreState, RootState>, { sectionIdx, section }: { sectionIdx: number, section: Section }) {
      context.commit('insertSections', { sectionIdx, sections: [ section ] });
    },

    insertBars(context: ActionContext<ScoreState, RootState>, { sectionAndBarIdx, bars }: { sectionAndBarIdx: SectionAndBarIdx, bars: Bar[] }) {
      context.commit('insertBars', { sectionAndBarIdx, bars });
    },

    removeBars(context: ActionContext<ScoreState, RootState>, sectionAndBarRange: SectionAndBarRange) {
      context.commit('removeBars', sectionAndBarRange);
    },

    replaceBars(context: ActionContext<ScoreState, RootState>, { sectionAndBarRange, bars }: { sectionAndBarRange: SectionAndBarRange, bars: Bar[] }) {
      context.commit('replaceBars', { sectionAndBarRange, bars });
    },

    replacePart(context: ActionContext<ScoreState, RootState>, { sectionAndBarIdx, partIdx, partInBar }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx, partInBar: PartInBar }) {
      context.commit('replacePart', { sectionAndBarIdx, partIdx, partInBar });
    },

    replaceNote(context: ActionContext<ScoreState, RootState>, { sectionAndBarIdx, partIdx, noteIdx, note }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx, noteIdx: NoteIdx, note: Note }) {
      context.commit('replaceNote', { sectionAndBarIdx, partIdx, noteIdx, note });
    },

    insertNote(context: ActionContext<ScoreState, RootState>, { sectionAndBarIdx, partIdx, noteIdx, note }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx, noteIdx: NoteIdx, note: Note }) {
      context.commit('insertNotes', { sectionAndBarIdx, partIdx, noteIdx, notes: [ note ] });
    },

    setBarBreak(context: ActionContext<ScoreState, RootState>, { sectionAndBarIdx, barBreak }: { sectionAndBarIdx: SectionAndBarIdx, barBreak: BarBreak }) {
      context.commit('setBarBreak', { sectionAndBarIdx, barBreak });
    },

    // Copied Bars
    setCopiedBars(context: ActionContext<ScoreState, RootState>, sectionAndBarRange: SectionAndBarRange) {
      context.commit('setCopiedBars', sectionAndBarRange);
    },

    pasteCopiedBars(context: ActionContext<ScoreState, RootState>, sectionAndBarRange: SectionAndBarRange) {
      context.commit('pasteCopiedBars', sectionAndBarRange);
    },

    pasteCopiedBarsPartOnly(context: ActionContext<ScoreState, RootState>, sectionAndBarRange: SectionAndBarRange) {
      context.commit('pasteCopiedBarsPartOnly', sectionAndBarRange);
    },

    // Change History
    redo(context: ActionContext<ScoreState, RootState>) {
      context.commit('redo');
    },

    undo(context: ActionContext<ScoreState, RootState>) {
      context.commit('undo');
    },

    // Selected Bars
    selectBar(context: ActionContext<ScoreState, RootState>, sectionAndBarIdx: SectionAndBarIdx) {
      context.commit('selectBars', new SectionAndBarRange(sectionAndBarIdx));
    },

    selectBars(context: ActionContext<ScoreState, RootState>, sectionAndBarRange: SectionAndBarRange) {
      context.commit('selectBars', sectionAndBarRange);
    },

    selectAllBars(context: ActionContext<ScoreState, RootState>) {
      if (context.state.score.allSectionAndBarRange === undefined) return;
      context.commit('selectBars', context.state.score.allSectionAndBarRange);
    },

    unselectBar(context: ActionContext<ScoreState, RootState>) {
      context.commit('unselectBar');
    },

    expandSelectedBars(context: ActionContext<ScoreState, RootState>, sectionAndBarIdx: SectionAndBarIdx) {
      context.commit('expandSelectedBars', sectionAndBarIdx);
    },

    selectNextBar(context: ActionContext<ScoreState, RootState>) {
      context.commit('selectNextBar');
    },

    selectPreviousBar(context: ActionContext<ScoreState, RootState>) {
      context.commit('selectPreviousBar');
    },

    incrementSelectedBarsFirstIdx(context: ActionContext<ScoreState, RootState>) {
      context.commit('incrementSelectedBarsFirstIdx');
    },

    incrementSelectedBarsLastIdx(context: ActionContext<ScoreState, RootState>) {
      context.commit('incrementSelectedBarsLastIdx');
    },

    decrementSelectedBarsFirstIdx(context: ActionContext<ScoreState, RootState>) {
      context.commit('decrementSelectedBarsFirstIdx');
    },

    decrementSelectedBarsLastIdx(context: ActionContext<ScoreState, RootState>) {
      context.commit('decrementSelectedBarsLastIdx');
    },
  },
}

export default ScoreModule;
