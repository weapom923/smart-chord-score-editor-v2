import { ScoreMetadata, ScoreMetadataRawObj } from './ScoreMetadata'
import { ScoreDataVersion, ScoreDataVersionRawObj, sdv } from './ScoreDataVersion'
import { Section, SectionRawObj, SectionRawObjV0_2 } from '../modules/Section'
import { PartInBar } from './PartInBar'
import { Note } from './Note'
import { Bar } from '../modules/Bar'
import { nv } from '../modules/NoteValue'
import { SectionAndBarIdx, SectionAndBarRange, BarRange } from './SectionAndBarRange'
import { raw } from './utils'

export interface ScoreRawObjBase {
  version: ScoreDataVersionRawObj,
}

interface ScoreRawObjV0_2_0 extends ScoreRawObjBase {
  metadata: ScoreMetadataRawObj,
  sections: SectionRawObjV0_2[],
}

interface ScoreRawObjV0_3_0 extends ScoreRawObjBase{
  metadata: ScoreMetadataRawObj,
  sections: SectionRawObj[],
}

export type ScoreRawObj = ScoreRawObjV0_3_0;

export class Score {
  public metadata: ScoreMetadata;
  public sections: Section[];
  public version: ScoreDataVersion;

  constructor(
    metadata: ScoreMetadata = new ScoreMetadata(),
    sections: Section[] = [],
    version: ScoreDataVersion = ScoreDataVersion.latest,
  ) {
    this.metadata = metadata;
    this.sections = sections;
    this.version = version;
  }

  getRawObj(): ScoreRawObj {
    return {
      metadata: this.metadata.getRawObj(),
      sections: this.sections.map(section => section.getRawObj()),
      version: this.version.getRawObj(),
    }
  }

  static loadFromRawObj(rawObjBase: ScoreRawObjBase) {
    while (Score.updateRawObj(rawObjBase)) {}
    const rawObj = rawObjBase as ScoreRawObj;
    return new Score(
      ScoreMetadata.loadFromRawObj(rawObj.metadata),
      rawObj.sections.map(Section.loadFromRawObj),
      ScoreDataVersion.loadFromRawObj(rawObj.version),
    );
  }

  clone(): Score {
    return Score.loadFromRawObj(this.getRawObj());
  }

  assign(that: Score): Score {
    this.metadata.assign(that.metadata);
    this.sections.splice(0, this.numSections, ...that.sections.map(section => section.clone()));
    this.version = that.version;
    return this;
  }

  static loadJson(jsonString: string): Score {
    return Score.loadFromRawObj(JSON.parse(jsonString))
  }

  isEqualTo(that: Score): boolean {
    if (!this.metadata.isEqualTo(that.metadata)) return false;
    if (this.sections.length !== that.sections.length) return false;
    for (let sectionIdx = 0; sectionIdx < this.sections.length; ++sectionIdx) {
      if (!this.getSection(sectionIdx).isEqualTo(that.getSection(sectionIdx))) return false;
    }
    if (!this.version.isEqualTo(that.version)) return false;
    return true;
  }

  dumpJson(): string {
    return JSON.stringify(this.getRawObj());
  }

  static updateRawObj(scoreRawObj: ScoreRawObjBase): boolean  {
    const targetScoreDataVersion = ScoreDataVersion.getUpgradeTargetVersion(scoreRawObj.version);
    switch (raw(targetScoreDataVersion)) {
      case sdv.v0_2_0:
        {
          const scoreRawObjV0_2_0 = scoreRawObj as ScoreRawObjV0_2_0;
          scoreRawObjV0_2_0.version = new ScoreDataVersion(0, 2, 0).getRawObj();
          scoreRawObjV0_2_0.metadata.artist_name = '';
          return true;
        }
      case sdv.v0_3_0:
        {
          const scoreRawObjV0_3_0 = scoreRawObj as ScoreRawObjV0_3_0;
          scoreRawObjV0_3_0.version = new ScoreDataVersion(0, 3, 0).getRawObj();
          for (const sectionRawObj of scoreRawObjV0_3_0.sections) {
            for (const barRawObj of sectionRawObj.bars) {
              barRawObj.grid_note_value = nv.divisible.half;
            }
          }
          return true;
        }
      default:
        return false;
    }
  }

  getPreviousSectionAndBarIdx(sectionAndBarIdx: SectionAndBarIdx): SectionAndBarIdx | undefined {
    if (sectionAndBarIdx.barIdx < 0) return undefined;
    const previousBarIdx = sectionAndBarIdx.barIdx - 1;
    if (previousBarIdx === -1) {
      for (let previousSectionIdx = sectionAndBarIdx.sectionIdx - 1; previousSectionIdx >= 0; --previousSectionIdx) {
        const numBars = this.getNumBars(previousSectionIdx);
        if (numBars > 0) return new SectionAndBarIdx(previousSectionIdx, numBars - 1);
      }
      return undefined;
    } else {
      const previousSectionAndBarIdx = new SectionAndBarIdx(sectionAndBarIdx.sectionIdx, previousBarIdx);
      if (!this.barExists(previousSectionAndBarIdx)) return undefined;
      return previousSectionAndBarIdx;
    }
  }

  getPreviousBar(sectionAndBarIdx: SectionAndBarIdx): Bar | undefined {
    let previousSectionAndBarIdx = this.getPreviousSectionAndBarIdx(sectionAndBarIdx);
    if (previousSectionAndBarIdx === undefined) return undefined;
    return this.getBar(previousSectionAndBarIdx);
  }

  getNextSectionAndBarIdx(sectionAndBarIdx: SectionAndBarIdx): SectionAndBarIdx | undefined {
    const numBars = this.getNumBars(sectionAndBarIdx.sectionIdx);
    if (sectionAndBarIdx.barIdx >= numBars) return undefined;
    const nextBarIdx = sectionAndBarIdx.barIdx + 1;
    if (nextBarIdx === numBars) {
      for (let nextSectionIdx = sectionAndBarIdx.sectionIdx + 1; nextSectionIdx < this.numSections; ++nextSectionIdx) {
        const numBars = this.getNumBars(nextSectionIdx);
        if (numBars > 0) return new SectionAndBarIdx(nextSectionIdx, 0);
      }
      return undefined;
    } else {
      const nextSectionAndBarIdx = new SectionAndBarIdx(sectionAndBarIdx.sectionIdx, nextBarIdx);
      if (!this.barExists(nextSectionAndBarIdx)) return undefined;
      return nextSectionAndBarIdx;
    }
  }

  getNextBar(sectionAndBarIdx: SectionAndBarIdx): Bar | undefined {
    let nextSectionAndBarIdx = this.getNextSectionAndBarIdx(sectionAndBarIdx);
    if (nextSectionAndBarIdx === undefined) return undefined;
    return this.getBar(nextSectionAndBarIdx);
  }

  findSameTypedPartIndexInPreviousBar(
    { sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx },
  ): { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx } | undefined {
    const currentPartInBarType = this.getPart({ sectionAndBarIdx, partIdx }).type;
    const previousSectionAndBarIdx = this.getPreviousSectionAndBarIdx(sectionAndBarIdx);
    if (previousSectionAndBarIdx === undefined) return undefined;
    const foundPartIdx = this.getBar(previousSectionAndBarIdx).findSameTypedPartIndex(currentPartInBarType);
    if (foundPartIdx === undefined) return undefined;
    return { sectionAndBarIdx: previousSectionAndBarIdx, partIdx: foundPartIdx };
  }

  findSameTypedPartInPreviousBar(
    { sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx },
  ): PartInBar | undefined {
    let foundIdcs = this.findSameTypedPartIndexInPreviousBar({ sectionAndBarIdx, partIdx });
    if (foundIdcs === undefined) return undefined;
    return this.getPart(foundIdcs);
  }

  findSameTypedPartIndexInNextBar(
    { sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx },
  ): { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx } | undefined {
    const currentPartInBarType = this.getPart({ sectionAndBarIdx, partIdx }).type;
    const nextSectionAndBarIdx = this.getNextSectionAndBarIdx(sectionAndBarIdx);
    if (nextSectionAndBarIdx === undefined) return undefined;
    const foundPartIdx = this.getBar(nextSectionAndBarIdx).findSameTypedPartIndex(currentPartInBarType);
    if (foundPartIdx === undefined) return undefined;
    return { sectionAndBarIdx: nextSectionAndBarIdx, partIdx: foundPartIdx };
  }

  findSameTypedPartInNextBar(
    { sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx },
  ): PartInBar | undefined {
    let foundIdcs = this.findSameTypedPartIndexInNextBar({ sectionAndBarIdx, partIdx });
    if (foundIdcs === undefined) return undefined;
    return this.getPart(foundIdcs);
  }

  getNumNotes({ sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }): number {
    return this.getPart({ sectionAndBarIdx, partIdx }).numNotes;
  }

  getFirstNoteIdx({ sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }): NoteIdx | undefined {
    return this.getPart({ sectionAndBarIdx, partIdx }).firstNoteIdx;
  }

  getLastNoteIdx({ sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx }): NoteIdx | undefined {
    return this.getPart({ sectionAndBarIdx, partIdx }).lastNoteIdx;
  }

  getNote({ sectionAndBarIdx, partIdx, noteIdx }: { sectionAndBarIdx: SectionAndBarIdx , partIdx: PartIdx, noteIdx: NoteIdx }): Note {
    return this.getPart({ sectionAndBarIdx, partIdx }).getNote(noteIdx);
  }

  getNumParts(sectionAndBarIdx: SectionAndBarIdx): number {
    return this.getBar(sectionAndBarIdx).numParts;
  }

  getPart({ sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx}): PartInBar {
    return this.getBar(sectionAndBarIdx).getPart(partIdx);
  }

  getPreviousSameTypedPart({ sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx}): PartInBar | undefined {
    return this.findSameTypedPartInPreviousBar({ sectionAndBarIdx: sectionAndBarIdx, partIdx: partIdx });
  }

  getNextSameTypedPart({ sectionAndBarIdx, partIdx }: { sectionAndBarIdx: SectionAndBarIdx, partIdx: PartIdx}): PartInBar | undefined {
    return this.findSameTypedPartInNextBar({ sectionAndBarIdx: sectionAndBarIdx, partIdx: partIdx });
  }

  getNumBars(sectionIdx: SectionIdx): number {
    return this.getSection(sectionIdx).numBars;
  }

  getSectionAndBarIdxIterator(sectionAndBarRange: SectionAndBarRange): IterableIterator<SectionAndBarIdx> {
    let sectionAndBarIdx: SectionAndBarIdx | undefined = sectionAndBarRange.first;
    let iterationCount = 0;
    return {
      next: (): IteratorResult<SectionAndBarIdx, number> => {
        if (sectionAndBarIdx !== undefined) {
          if (sectionAndBarRange.includes(sectionAndBarIdx)) {
            let value = sectionAndBarIdx;
            sectionAndBarIdx = this.getNextSectionAndBarIdx(sectionAndBarIdx);
            ++iterationCount;
            return { value, done: false };
          }
        }
        return { value: iterationCount, done: true };
      },
      [Symbol.iterator](): IterableIterator<SectionAndBarIdx> {
        return this;
      },
    };
  }

  decomposeSectionAndBarRange(sectionAndBarRange: SectionAndBarRange)
  : { sectionIdcs: SectionIdx[], barRanges: Map<SectionIdx, BarRange> }
  {
    const barRanges = new Map<SectionIdx, BarRange>();
    const sectionIdcs: SectionIdx[] = [];
    for (const sectionIdx of sectionAndBarRange.sectionIndices()) {
      const sectionFirstBarIdx = this.getFirstBarIdx(sectionIdx);
      const sectionLastBarIdx = this.getLastBarIdx(sectionIdx);
      const rangeFirstBarIdx = (sectionIdx === sectionAndBarRange.first.sectionIdx)? sectionAndBarRange.first.barIdx : sectionFirstBarIdx;
      const rangeLastBarIdx = (sectionIdx === sectionAndBarRange.last.sectionIdx)? sectionAndBarRange.last.barIdx : sectionLastBarIdx;
      if ((rangeFirstBarIdx === sectionFirstBarIdx) && (rangeLastBarIdx === sectionLastBarIdx)) {
        sectionIdcs.push(sectionIdx);
      } else {
        if ((rangeFirstBarIdx === undefined) || (rangeLastBarIdx === undefined)) throw new RangeError();
        barRanges.set(sectionIdx, new BarRange(rangeFirstBarIdx, rangeLastBarIdx))
      }
    }
    return { sectionIdcs, barRanges };
  }

  expandSectionAndBarRange(sectionAndBarRange: SectionAndBarRange, sectionAndBarIdx: SectionAndBarIdx): SectionAndBarRange {
    if (sectionAndBarIdx.isPriorTo(sectionAndBarRange.first)) {
      sectionAndBarRange.first.assign(sectionAndBarIdx);
    } else if (sectionAndBarIdx.isPosteriorTo(sectionAndBarRange.last)) {
      sectionAndBarRange.last.assign(sectionAndBarIdx);
    }
    return sectionAndBarRange;
  }

  generateSectionAndBarRange(firstSectionAndBarIdx: SectionAndBarIdx, numBars: number): SectionAndBarRange {
    if (this.lastSectionIdx === undefined) throw new RangeError();
    const numBarsOffset = -firstSectionAndBarIdx.barIdx;
    let accumulatedNumBars = numBarsOffset;
    let currentSectionIdx = firstSectionAndBarIdx.sectionIdx;
    do {
      const currentSection = this.getSection(currentSectionIdx);
      if (currentSection.lastBarIdx !== undefined) {
        const nextAccumulatedNumBars = accumulatedNumBars + currentSection.numBars;
        if (nextAccumulatedNumBars >= numBars) {
          return new SectionAndBarRange(
            firstSectionAndBarIdx,
            new SectionAndBarIdx(currentSectionIdx, (numBars - accumulatedNumBars - 1)),
          );
        }
        accumulatedNumBars = nextAccumulatedNumBars;
      }
      ++currentSectionIdx;
    } while (currentSectionIdx <= this.lastSectionIdx)
    if (this.lastSectionAndBarIdx === undefined) throw new RangeError();
    return new SectionAndBarRange(firstSectionAndBarIdx, this.lastSectionAndBarIdx);
  }

  getBars(sectionAndBarRange: SectionAndBarRange): Bar[] {
    return [ ...this.getSectionAndBarIdxIterator(sectionAndBarRange) ].map(sectionAndBarIdx => this.getBar(sectionAndBarIdx));
  }

  getBar(sectionAndBarIdx: SectionAndBarIdx): Bar {
    return this.getSection(sectionAndBarIdx.sectionIdx).getBar(sectionAndBarIdx.barIdx) ?? new Bar();
  }

  barExists(sectionAndBarIdx: SectionAndBarIdx): boolean {
    try {
      this.getBar(sectionAndBarIdx);
      return true;
    } catch {
      return false;
    }
  }

  getFirstBarIdx(sectionIdx: SectionIdx): BarIdx | undefined {
    return this.getSection(sectionIdx)?.firstBarIdx;
  }

  getLastBarIdx(sectionIdx: SectionIdx): BarIdx | undefined {
    return this.getSection(sectionIdx)?.lastBarIdx;
  }

  get numSections(): number {
    return this.sections.length;
  }

  get firstSectionIdx(): SectionIdx | undefined {
    return (this.numSections === 0)? undefined : 0;
  }

  get lastSectionIdx(): SectionIdx | undefined {
    return (this.numSections === 0)? undefined : (this.numSections - 1);
  }

  includesSection(sectionIdx: SectionIdx): boolean {
    if (this.firstSectionIdx === undefined) return false;
    if (this.lastSectionIdx === undefined) return false;
    if (sectionIdx < this.firstSectionIdx) return false;
    if (sectionIdx > this.lastSectionIdx) return false;
    return true;
  }

  get firstSectionAndBarIdx(): SectionAndBarIdx | undefined {
    if (this.firstSectionIdx === undefined) return undefined;
    let firstBarIdxOfFirstSection = this.getFirstBarIdx(this.firstSectionIdx);
    if (firstBarIdxOfFirstSection === undefined) return undefined;
    return new SectionAndBarIdx(this.firstSectionIdx, firstBarIdxOfFirstSection);
  }

  get lastSectionAndBarIdx(): SectionAndBarIdx | undefined {
    if (this.lastSectionIdx === undefined) return undefined;
    let lastSectionIdx = this.lastSectionIdx;
    do {
      const lastBarIdx = this.getSection(this.lastSectionIdx).lastBarIdx;
      if (lastBarIdx !== undefined) {
        return new SectionAndBarIdx(lastSectionIdx, lastBarIdx);
      }
      --lastSectionIdx;
    } while (lastSectionIdx > 0)
    return undefined;
  }

  get allSectionAndBarRange(): SectionAndBarRange | undefined {
    if (this.firstSectionAndBarIdx === undefined) return undefined;
    if (this.lastSectionAndBarIdx === undefined) return undefined;
    return new SectionAndBarRange(this.firstSectionAndBarIdx, this.lastSectionAndBarIdx);
  }

  getSection(sectionIdx: SectionIdx): Section {
    if (sectionIdx >= this.numSections) throw new RangeError();
    return this.sections[sectionIdx];
  }
}