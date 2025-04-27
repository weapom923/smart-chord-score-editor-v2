import { ActionContext, Module } from 'vuex';
import { Score } from '../../modules/Score';
import { ScoreMetadata } from '../../modules/ScoreMetadata';
import { Section } from '../../modules/Section';
import { Bar } from '../../modules/Bar';
import { PartInBar, PartInBarType } from '../../modules/PartInBar';
import { BarBreak } from '../../modules/BarBreak';
import { Note } from '../../modules/Note';
import { ScoreChangeHistoryManager, ScoreChange } from '../../modules/ScoreChangeHistoryManager';
import { SectionAndBarIdx, SectionAndBarRange } from '../../modules/SectionAndBarRange';
import { PartAndNoteIdx } from '../../modules/PartAndNoteIdx';
import { BarTimeOffset } from '../../modules/BarTimeOffset';
import { NoteValue, nv } from '../../modules/NoteValue';
import { RootState } from '..';

export namespace ScorePageWHRatio {
  export const silver = 1 / 1.4142356;
};

export type ScoreState = {
  score: Score,
  scorePageWHRatio: number,
  scoreChangeHistoryManager: ScoreChangeHistoryManager,
  selectedBars?: SectionAndBarRange,
  selectedPartAndNoteIdx?: PartAndNoteIdx,
  isRedoable: boolean,
  isUndoable: boolean,
  copiedBars: Bar[],
  barTimeOffset: BarTimeOffset,
  beatPerMinutes: number,
  unitBeatValue: NoteValue,
  isAutoSelectBarByPlayTimeEnabled: boolean,
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
    barTimeOffset: new BarTimeOffset(0, 0),
    beatPerMinutes: 120,
    unitBeatValue: nv.divisible.quarter,
    isAutoSelectBarByPlayTimeEnabled: false,
  },

  getters: {
    selectedPart(state: ScoreState): PartInBar | undefined {
      if (state.selectedBars === undefined) return undefined;
      if (!state.selectedBars.includeSingleBarOnly) return undefined;
      if (state.selectedPartAndNoteIdx === undefined) return undefined;
      return state.score.getPart({
        sectionAndBarIdx: state.selectedBars.idx,
        partIdx: state.selectedPartAndNoteIdx.partIdx,
      });
    },
  },

  mutations: {
    clearChangeHistory(state: ScoreState) {
      state.scoreChangeHistoryManager.clear();
      state.isRedoable = state.scoreChangeHistoryManager.isRedoable;
      state.isUndoable = state.scoreChangeHistoryManager.isUndoable;
    },

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
                const selectedBarsIdxLast = state.score.getPreviousSectionAndBarIdx(insertedSectionAndBarRange.first);
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

    insertBars(state: ScoreState, { sectionAndBarIdx, bars, selects }: { sectionAndBarIdx: SectionAndBarIdx, bars: Bar[], selects: boolean }) {
      const targetSectionAndBarIdx = sectionAndBarIdx.clone();
      const newBars = bars.map(bar => bar.clone());
      const numBars = bars.length;
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            state.score.getSection(targetSectionAndBarIdx.sectionIdx).bars.splice(targetSectionAndBarIdx.barIdx, 0, ...newBars.map(bar => bar.clone()));
            if (state.selectedBars !== undefined) {
              if (selects) {
                state.selectedBars.last.barIdx = targetSectionAndBarIdx.barIdx;
                state.selectedBars.first.barIdx = targetSectionAndBarIdx.barIdx;
              } else {
                if (state.selectedBars.includeSingleBarOnly) {
                  if (state.selectedBars.idx.isPosteriorOrEqualTo(targetSectionAndBarIdx)) {
                    state.selectedBars.first.barIdx += numBars;
                    state.selectedBars.last.barIdx += numBars;
                  }
                } else {
                  if (state.selectedBars.first.isPosteriorOrEqualTo(targetSectionAndBarIdx)) {
                    state.selectedBars.first.barIdx += numBars;
                  }
                  if (state.selectedBars.last.isPosteriorOrEqualTo(targetSectionAndBarIdx)) {
                    state.selectedBars.last.barIdx += numBars;
                  }
                }
              }
            }
          },
          undo() {
            state.score.getSection(targetSectionAndBarIdx.sectionIdx).bars.splice(targetSectionAndBarIdx.barIdx, numBars);
            if (state.selectedBars !== undefined) {
              if (state.selectedBars.includes(targetSectionAndBarIdx)) {
                if (state.selectedBars.includeSingleBarOnly) {
                  state.selectedBars.first.barIdx -= numBars;
                  state.selectedBars.last.barIdx -= numBars;
                } else {
                  state.selectedBars.last.barIdx -= numBars;
                }
              } else {
                if (targetSectionAndBarIdx.isPriorOrEqualTo(state.selectedBars.first)) {
                  state.selectedBars.first.barIdx -= numBars;
                }
                if (targetSectionAndBarIdx.isPriorOrEqualTo(state.selectedBars.last)) {
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
      for (let [ sectionIdx, barRange ] of barRanges) {
        const section = state.score.getSection(sectionIdx);
        const bars = [ ...barRange.indices() ].map(barIdx => section.getBar(barIdx).clone());
        removedBarsBySection.set(sectionIdx, bars);
      }
      const removedSections = sectionIdcs.map(sectionIdx => state.score.getSection(sectionIdx).clone());
      const lastPriorSectionAndBarIdx = state.score.getPreviousSectionAndBarIdx(targetSectionAndBarRange.first);
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            let numOffsetSelectedBarsFirst: number | undefined = undefined;
            let numOffsetSelectedBarsLast: number | undefined = undefined;
            if (state.selectedBars !== undefined) {
              if (state.selectedBars.first.isPosteriorOrEqualTo(targetSectionAndBarRange.first)) {
                if (state.selectedBars.first.isPosteriorTo(targetSectionAndBarRange.last)) {
                  const offsetSectionAndBarRange = new SectionAndBarRange(targetSectionAndBarRange.first.clone(), state.selectedBars.first.clone());
                  numOffsetSelectedBarsFirst = [ ...state.score.getSectionAndBarIdxIterator(offsetSectionAndBarRange) ].length - numRemovedBars - 1;
                } else {
                  numOffsetSelectedBarsFirst = 0;
                }
              }
              if (state.selectedBars.last.isPosteriorOrEqualTo(targetSectionAndBarRange.first)) {
                if (state.selectedBars.last.isPosteriorTo(targetSectionAndBarRange.last)) {
                  const offsetSectionAndBarRange = new SectionAndBarRange(targetSectionAndBarRange.first.clone(), state.selectedBars.last.clone());
                  numOffsetSelectedBarsLast = [ ...state.score.getSectionAndBarIdxIterator(offsetSectionAndBarRange) ].length - numRemovedBars - 1;
                } else {
                  numOffsetSelectedBarsLast = 0;
                }
              }
            }

            for (let [ sectionIdx, removedBarRange ] of barRanges) {
              state.score.getSection(sectionIdx).bars.splice(removedBarRange.firstBarIdx, removedBarRange.numBars);
            }
            state.score.sections.splice(sectionIdcs[0], sectionIdcs.length);

            let selectedBarsOffsetBasis: SectionAndBarIdx | undefined;
            if (lastPriorSectionAndBarIdx !== undefined) {
              selectedBarsOffsetBasis = state.score.getNextSectionAndBarIdx(lastPriorSectionAndBarIdx);
            } else {
              selectedBarsOffsetBasis = state.score.firstSectionAndBarIdx;
            }
            if (selectedBarsOffsetBasis === undefined) {
              state.selectedBars = undefined;
            } else {
              if (state.selectedBars !== undefined) {
                if (numOffsetSelectedBarsLast !== undefined) {
                  state.selectedBars.last = selectedBarsOffsetBasis.clone();
                  for (let counter = 0; counter < numOffsetSelectedBarsLast; ++counter) {
                    const tempSelectedBarsLast = state.score.getNextSectionAndBarIdx(state.selectedBars.last);
                    if (tempSelectedBarsLast === undefined) {
                      state.selectedBars = undefined;
                      break;
                    }
                    state.selectedBars.last = tempSelectedBarsLast;
                  }
                }
              }
              if (state.selectedBars !== undefined) {
                if (numOffsetSelectedBarsFirst !== undefined) {
                  state.selectedBars.first = selectedBarsOffsetBasis.clone();
                  for (let counter = 0; counter < numOffsetSelectedBarsFirst; ++counter) {
                    const tempSelectedBarsFirst = state.score.getNextSectionAndBarIdx(state.selectedBars.first);
                    if (tempSelectedBarsFirst === undefined) {
                      state.selectedBars = undefined;
                      break;
                    }
                    state.selectedBars.first = tempSelectedBarsFirst;
                  }
                }
              }
            }
          },
          undo() {
            let numOffsetBarsFirst: undefined | number = undefined;
            let numOffsetBarsLast: undefined | number = undefined;
            if (state.selectedBars !== undefined) {
              let firstPosteriorSectionAndBarIdx: SectionAndBarIdx | undefined = undefined;
              if (lastPriorSectionAndBarIdx !== undefined) {
                firstPosteriorSectionAndBarIdx = state.score.getNextSectionAndBarIdx(lastPriorSectionAndBarIdx);
              } else {
                firstPosteriorSectionAndBarIdx = targetSectionAndBarRange.first;
              }
              if (firstPosteriorSectionAndBarIdx !== undefined) {
                if (state.selectedBars.first.isPosteriorOrEqualTo(firstPosteriorSectionAndBarIdx)) {
                  const offsetSectionAndBarRange = new SectionAndBarRange(firstPosteriorSectionAndBarIdx, state.selectedBars.first);
                  numOffsetBarsFirst = [ ...state.score.getSectionAndBarIdxIterator(offsetSectionAndBarRange) ].length - 1;
                }
                if (state.selectedBars.last.isPosteriorOrEqualTo(firstPosteriorSectionAndBarIdx)) {
                  const offsetSectionAndBarRange = new SectionAndBarRange(firstPosteriorSectionAndBarIdx, state.selectedBars.last);
                  numOffsetBarsLast = [ ...state.score.getSectionAndBarIdxIterator(offsetSectionAndBarRange) ].length - 1;
                }
              }
            }

            state.score.sections.splice(sectionIdcs[0], 0, ...removedSections.map(section => section.clone()));
            for (let [ sectionIdx, barRange ] of barRanges) {
              const removedBars = removedBarsBySection.get(sectionIdx);
              if (removedBars === undefined) throw new RangeError();
              state.score.getSection(sectionIdx).bars.splice(barRange.firstBarIdx, 0, ...removedBars.map(bar => bar.clone()));
            }

            if (state.selectedBars !== undefined) {
              if (numOffsetBarsLast !== undefined) {
                let newSelectedBarsLast = targetSectionAndBarRange.first.clone();
                for (let counter = 0; counter < (numRemovedBars + numOffsetBarsLast); ++counter) {
                  const selectedBarsLast = state.score.getNextSectionAndBarIdx(newSelectedBarsLast);
                  if (selectedBarsLast === undefined) break;
                  newSelectedBarsLast = selectedBarsLast;
                }
                state.selectedBars.last = newSelectedBarsLast;
              }
              if (numOffsetBarsFirst !== undefined) {
                let newSelectedBarsFirst = targetSectionAndBarRange.first.clone();
                for (let counter = 0; counter < (numRemovedBars + numOffsetBarsFirst); ++counter) {
                  const selectedBarsFirst = state.score.getNextSectionAndBarIdx(newSelectedBarsFirst);
                  if (selectedBarsFirst === undefined) break;
                  newSelectedBarsFirst = selectedBarsFirst;
                }
                state.selectedBars.first = newSelectedBarsFirst;
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
      const numCopiedBars = state.copiedBars.length;
      const numTargetBars = state.score.getBars(sectionAndBarRange).length;
      const modifiedSectionAndBarRange = sectionAndBarRange.clone();
      if (numTargetBars < numCopiedBars) {
        for (let barCount = 0; barCount < (numCopiedBars - numTargetBars); barCount++) {
          const nextSectionAndBarIdx = state.score.getNextSectionAndBarIdx(modifiedSectionAndBarRange.last);
          if (nextSectionAndBarIdx === undefined) break;
          modifiedSectionAndBarRange.last = nextSectionAndBarIdx;
        }
      }
      const copiedBars = state.copiedBars.map(bar => bar.clone());
      const currentBars = state.score.getBars(modifiedSectionAndBarRange).map(bar => bar.clone());
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(modifiedSectionAndBarRange)) {
              const cyclicBarIdx = barIdx % copiedBars.length;
              state.score.getSection(sectionAndBarIdx.sectionIdx).bars[sectionAndBarIdx.barIdx] = copiedBars[cyclicBarIdx].clone();
              ++barIdx;
            }
          },
          undo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(modifiedSectionAndBarRange)) {
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

    pasteCopiedBarsPartOnly(state: ScoreState, sectionAndBarRange: SectionAndBarRange) {
      const numCopiedBars = state.copiedBars.length;
      const numTargetBars = state.score.getBars(sectionAndBarRange).length;
      const modifiedSectionAndBarRange = sectionAndBarRange.clone();
      if (numTargetBars < numCopiedBars) {
        for (let barCount = 0; barCount < (numCopiedBars - numTargetBars); barCount++) {
          const nextSectionAndBarIdx = state.score.getNextSectionAndBarIdx(modifiedSectionAndBarRange.last);
          if (nextSectionAndBarIdx === undefined) break;
          modifiedSectionAndBarRange.last = nextSectionAndBarIdx;
        }
      }
      const copiedPartInBars = state.copiedBars.map(bar => bar.parts.map(part => part.clone()));
      const currentPartInBars = state.score.getBars(modifiedSectionAndBarRange).map(bar => bar.parts.map(part => part.clone()));
      state.scoreChangeHistoryManager.register(
        new ScoreChange({
          redo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(modifiedSectionAndBarRange)) {
              const cyclicBarIdx = barIdx % copiedPartInBars.length;
              const bar = state.score.getBar(sectionAndBarIdx);
              bar.parts.splice(0, bar.numParts, ...copiedPartInBars[cyclicBarIdx].map(partInBar => partInBar.clone()));
              ++barIdx;
            }
          },
          undo() {
            let barIdx = 0;
            for (const sectionAndBarIdx of state.score.getSectionAndBarIdxIterator(modifiedSectionAndBarRange)) {
              const bar = state.score.getBar(sectionAndBarIdx);
              bar.parts.splice(0, bar.numParts, ...currentPartInBars[barIdx].map(partInBar => partInBar.clone()));
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

    selectPartAndNote(state: ScoreState, { sectionAndBarIdx, partAndNoteIdx }: { sectionAndBarIdx: SectionAndBarIdx, partAndNoteIdx: PartAndNoteIdx }) {
      state.selectedBars = new SectionAndBarRange(sectionAndBarIdx);
      state.selectedPartAndNoteIdx = partAndNoteIdx;
    },

    unselectPartAndNote(state: ScoreState) {
      state.selectedPartAndNoteIdx = undefined;
    },

    expandSelectedBars(state: ScoreState, sectionAndBarIdx: SectionAndBarIdx) {
      if (state.selectedBars === undefined) {
        state.selectedBars = new SectionAndBarRange(sectionAndBarIdx);
      } else {
        state.score.expandSectionAndBarRange(state.selectedBars, sectionAndBarIdx);
      }
    },

    selectFirstNoteInSelectedBar(state: ScoreState, type: PartInBarType) {
      if (state.selectedBars === undefined) return;
      if (!state.selectedBars.includeSingleBarOnly) return;
      const selectedSectionAndBarIdx = state.selectedBars.idx;
      const partIdx = state.score.getBar(selectedSectionAndBarIdx).findSameTypedPartIndex(type);
      if (partIdx === undefined) return;
      const part = state.score.getPart({ sectionAndBarIdx: selectedSectionAndBarIdx, partIdx });
      if (part.numNotes === 0) return;
      const firstNoteIdx = 0;
      state.selectedPartAndNoteIdx = new PartAndNoteIdx(partIdx, firstNoteIdx);
    },

    selectLastNoteInSelectedBar(state: ScoreState, type: PartInBarType) {
      if (state.selectedBars === undefined) return;
      if (!state.selectedBars.includeSingleBarOnly) return;
      const selectedSectionAndBarIdx = state.selectedBars.idx;
      const partIdx = state.score.getBar(selectedSectionAndBarIdx).findSameTypedPartIndex(type);
      if (partIdx === undefined) return;
      const part = state.score.getPart({ sectionAndBarIdx: selectedSectionAndBarIdx, partIdx });
      if (part.numNotes === 0) return;
      const lastNoteIdx = part.numNotes - 1;
      state.selectedPartAndNoteIdx = new PartAndNoteIdx(partIdx, lastNoteIdx);
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
      const nextSectionAndBarIdx = state.score.getNextSectionAndBarIdx(state.selectedBars.first);
      if (nextSectionAndBarIdx === undefined) return;
      state.selectedBars.first = nextSectionAndBarIdx;
    },

    incrementSelectedBarsLastIdx(state: ScoreState) {
      if (state.selectedBars === undefined) return;
      const nextSectionAndBarIdx = state.score.getNextSectionAndBarIdx(state.selectedBars.last);
      if (nextSectionAndBarIdx === undefined) return;
      state.selectedBars.last = nextSectionAndBarIdx.clone();
    },

    decrementSelectedBarsFirstIdx(state: ScoreState) {
      if (state.selectedBars === undefined) return;
      const previousSectionAndBarIdx = state.score.getPreviousSectionAndBarIdx(state.selectedBars.first);
      if (previousSectionAndBarIdx === undefined) return;
      state.selectedBars.first = previousSectionAndBarIdx.clone();
    },

    decrementSelectedBarsLastIdx(state: ScoreState) {
      if (state.selectedBars === undefined) return;
      if (state.selectedBars.includeSingleBarOnly) return;
      const previousSectionAndBarIdx = state.score.getPreviousSectionAndBarIdx(state.selectedBars.last);
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

    setBarTimeOffset(state: ScoreState, barTimeOffset: BarTimeOffset) {
      state.barTimeOffset = barTimeOffset;
    },

    setBeatPerMinutes(state: ScoreState, { beatPerMinutes, unitBeatValue }: { beatPerMinutes: number, unitBeatValue: NoteValue }) {
      state.beatPerMinutes = beatPerMinutes;
      state.unitBeatValue = unitBeatValue;
    },

    setIsAutoSelectBarByPlayTimeEnabled(state: ScoreState, isAutoSelectBarByPlayTimeEnabled: boolean) {
      state.isAutoSelectBarByPlayTimeEnabled = isAutoSelectBarByPlayTimeEnabled;
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

    insertBars(context: ActionContext<ScoreState, RootState>, { sectionAndBarIdx, bars, selects }: { sectionAndBarIdx: SectionAndBarIdx, bars: Bar[], selects: boolean }) {
      context.commit('insertBars', { sectionAndBarIdx, bars, selects });
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
    clearChangeHistory(context: ActionContext<ScoreState, RootState>) {
      context.commit('clearChangeHistory');
    },

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

    selectPartAndNote(context: ActionContext<ScoreState, RootState>, { sectionAndBarIdx, partAndNoteIdx }: { sectionAndBarIdx: SectionAndBarIdx, partAndNoteIdx: PartAndNoteIdx }) {
      context.commit('selectPartAndNote', { sectionAndBarIdx, partAndNoteIdx });
    },

    unselectPartAndNote(context: ActionContext<ScoreState, RootState>) {
      context.commit('unselectPartAndNote');
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

    selectFirstNoteInSelectedBar(context: ActionContext<ScoreState, RootState>, type: PartInBarType) {
      context.commit('selectFirstNoteInSelectedBar', type);
    },

    selectLastNoteInSelectedBar(context: ActionContext<ScoreState, RootState>, type: PartInBarType) {
      context.commit('selectLastNoteInSelectedBar', type);
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

    // Others
    setBarTimeOffset(context: ActionContext<ScoreState, RootState>, barTimeOffset: BarTimeOffset) {
      context.commit('setBarTimeOffset', barTimeOffset);
    },

    setBeatPerMinutes(context: ActionContext<ScoreState, RootState>, { beatPerMinutes, unitBeatValue }: { beatPerMinutes: number, unitBeatValue: NoteValue }) {
      context.commit('setBeatPerMinutes', { beatPerMinutes, unitBeatValue });
    },

    setIsAutoSelectBarByPlayTimeEnabled(context: ActionContext<ScoreState, RootState>, isAutoSelectBarByPlayTimeEnabled: boolean) {
      context.commit('setIsAutoSelectBarByPlayTimeEnabled', isAutoSelectBarByPlayTimeEnabled);
    },
  },
}

export default ScoreModule;
