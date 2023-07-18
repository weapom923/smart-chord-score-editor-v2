import { Note, NoteRawObj } from './Note';
import { NotePitch, NotePitchRawObj } from './NotePitch';

export type PartInBarType = typeof PartInBar.Type[number];

export type PartInBarRawObj = {
  notes: NoteRawObj[],
  type: PartInBarType,
  rest_note_pitch: NotePitchRawObj | null,
};

export class PartInBar {
  static readonly Type = [ 'normal', 'rhythm', 'chord' ] as const;

  notes: Note[];
  type: PartInBarType;
  restNotePitch?: NotePitch;

  constructor(
    notes: Note[] = [],
    type: PartInBarType = 'normal',
    restNotePitch?: NotePitch,
  ) {
    this.notes = notes;
    this.type = type;
    this.restNotePitch = restNotePitch;
  }

  getRawObj(): PartInBarRawObj {
    return {
      notes: this.notes.map(note => note.getRawObj()),
      type: this.type,
      rest_note_pitch: (this.restNotePitch === undefined)? null : this.restNotePitch.getRawObj(),
    };
  }

  static loadFromRawObj(rawObj: PartInBarRawObj): PartInBar {
    return new PartInBar(
      rawObj.notes.map(noteRawObj => Note.loadFromRawObj(noteRawObj)),
      rawObj.type,
      (rawObj.rest_note_pitch === null)? undefined : NotePitch.loadFromRawObj(rawObj.rest_note_pitch),
    );
  }

  clone(): PartInBar {
    return PartInBar.loadFromRawObj(this.getRawObj());
  }

  isEqualTo(that: PartInBar): boolean {
    if (this.numNotes !== that.numNotes) return false;
    for (let noteIdx = 0; noteIdx < this.numNotes; ++noteIdx) {
      const thisNote = this.getNote(noteIdx);
      const thatNote = that.getNote(noteIdx);
      if (!thisNote.isEqualTo(thatNote)) return false;
    }
    if (this.type !== that.type) return false;
    if ((this.restNotePitch !== undefined) && (that.restNotePitch === undefined)) return false;
    if ((this.restNotePitch === undefined) && (that.restNotePitch !== undefined)) return false;
    if ((this.restNotePitch !== undefined) && (that.restNotePitch !== undefined)) {
      if (!this.restNotePitch.isEqualTo(that.restNotePitch)) return false;
    }
    return true;
  }

  assign(that: PartInBar): PartInBar {
    this.notes.splice(0, this.numNotes, ...that.notes);
    this.type = that.type;
    this.restNotePitch = that.restNotePitch;
    return this;
  }

  get numNotes(): number {
    return this.notes.length;
  }

  get firstNoteIdx(): NoteIdx | undefined {
    if (this.numNotes === 0) return undefined;
    return 0;
  }

  get lastNoteIdx(): NoteIdx | undefined {
    if (this.numNotes === 0) return undefined;
    return this.numNotes - 1;
  }

  get firstNote(): Note | undefined {
    if (this.firstNoteIdx === undefined) return undefined;
    return this.getNote(this.firstNoteIdx);
  }

  get lastNote(): Note | undefined {
    if (this.lastNoteIdx === undefined) return undefined;
    return this.getNote(this.lastNoteIdx);
  }

  getNote(noteIdx: NoteIdx): Note {
    if ((noteIdx === null) || (noteIdx < 0) || (noteIdx >= this.numNotes)) throw new RangeError();
    return this.notes[noteIdx];
  }

  isFirstNoteTied(): boolean {
    return this.notes[0].tied;
  }

  includesNote(noteIdx: NoteIdx): boolean {
    if (this.firstNoteIdx === undefined) return false;
    if (this.lastNoteIdx === undefined) return false;
    if (noteIdx < this.firstNoteIdx) return false;
    if (noteIdx > this.lastNoteIdx) return false;
    return true;
  }

  noteIndices(): IterableIterator<NoteIdx> {
    let iterationCount = 0;
    return {
      next: (): IteratorResult<NoteIdx, number> => {
        if ((this.firstNoteIdx !== undefined) && this.lastNoteIdx !== undefined) {
          const barIdx = this.firstNoteIdx + iterationCount;
          if (barIdx <= this.lastNoteIdx) {
            ++iterationCount;
            return { value: barIdx, done: false };
          }
        }
        return { value: iterationCount, done: true };
      },
      [Symbol.iterator](): IterableIterator<number> {
        return this;
      },
    };
  }
}
