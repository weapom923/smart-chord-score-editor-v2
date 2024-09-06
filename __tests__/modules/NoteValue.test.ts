import { describe, test, expect } from '@jest/globals'
import { NoteValue } from '../../src/modules/NoteValue'

describe(
  'note value number',
  () => {
    test(
      'basic',
      () => {
        expect(new NoteValue(1, 3).isDivisible()).toBe(false);
        expect(new NoteValue(1, 4).isDivisible()).toBe(true);
        expect(new NoteValue(3, 8).isDottedOfDivisible()).toBe(true);
        expect(new NoteValue(5, 8).isDottedOfDivisible()).toBe(false);
        expect(new NoteValue(5, 8).dot()).toBeUndefined();
        expect(new NoteValue(1, 2).dot()).not.toBeUndefined();
        expect(new NoteValue(3, 4).undot()).not.toBeUndefined();
        expect(new NoteValue(1, 2).undot()).toBeUndefined();
        expect(new NoteValue(1, 2).getRate(new NoteValue(1, 4))).toBe(2);
        {
            const divisibleNoteValues = new NoteValue(1, 2).splitIntoDivisibleNoteValues(new NoteValue(1, 8));
            expect(divisibleNoteValues).toHaveLength(2);
            expect(divisibleNoteValues[0].isEqualTo(new NoteValue(3, 8))).toBe(true);
            expect(divisibleNoteValues[1].isEqualTo(new NoteValue(1, 8))).toBe(true);
        }
        {
            const divisibleNoteValues = new NoteValue(1, 2).splitIntoDivisibleNoteValues(new NoteValue(1, 4));
            expect(divisibleNoteValues).toHaveLength(2);
            expect(divisibleNoteValues[0].isEqualTo(new NoteValue(1, 4))).toBe(true);
            expect(divisibleNoteValues[1].isEqualTo(new NoteValue(1, 4))).toBe(true);
        }
        {
            const divisibleNoteValues = new NoteValue(7, 8).splitIntoDivisibleNoteValues(new NoteValue(1, 8), NoteValue.instance.divisible.half);
            expect(divisibleNoteValues).toHaveLength(2);
            expect(divisibleNoteValues[0].isEqualTo(new NoteValue(3, 8))).toBe(true);
            expect(divisibleNoteValues[1].isEqualTo(new NoteValue(1, 2))).toBe(true);
        }
        {
            const divisibleNoteValues = new NoteValue(7, 8).splitIntoDivisibleNoteValues(new NoteValue(1, 8), NoteValue.instance.divisible.quarter);
            expect(divisibleNoteValues).toHaveLength(2);
            expect(divisibleNoteValues[0].isEqualTo(new NoteValue(1, 8))).toBe(true);
            expect(divisibleNoteValues[1].isEqualTo(new NoteValue(3, 4))).toBe(true);
        }
      },
    );
  },
)
