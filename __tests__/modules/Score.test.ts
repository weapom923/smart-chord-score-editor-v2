import { test, expect } from '@jest/globals'
import { Chord } from '../../src/modules/Chord'
import { Bar } from '../../src/modules/Bar'
import { BarRepeatEnding } from '../../src/modules/BarRepeatEnding'
import { BarBreak } from '../../src/modules/BarBreak'
import { BarLine } from '../../src/modules/BarLine'
import { Clef } from '../../src/modules/Clef'
import { PartInBar } from '../../src/modules/PartInBar'
import { Score } from '../../src/modules/Score'
import { ScoreMetadata } from '../../src/modules/ScoreMetadata'
import { Section } from '../../src/modules/Section'
import { Scale } from '../../src/modules/Scale'
import { NoteValue } from '../../src/modules/NoteValue'
import { NotePitch } from '../../src/modules/NotePitch'
import { Note } from '../../src/modules/Note'
import { TensionNotePitch } from '../../src/modules/TensionNotePitch'
import { SectionAndBarIdx, SectionAndBarRange } from '../../src/modules/SectionAndBarRange'

test('equality 1', () => {
  let score = new Score(
    new ScoreMetadata('Title', 'Composer', 'Arranger'),
    [
      new Section(
        'Section',
        [
          new Bar(
            new NoteValue(4, 4),
            [
              new PartInBar(
                [
                  new Note(
                    new Chord(
                      NotePitch.instance.c,
                      'minor',
                      'dominantSeventh',
                      new Set([
                        TensionNotePitch.instance.flatNinth,
                      ]),
                      NotePitch.instance.d,
                    ),
                    NoteValue.instance.divisible.whole,
                    'normal',
                    false,
                  ),
                ],
                'chord',
              ),
            ],
            Clef.instance.treble,
            Scale.instance.cMajor,
            BarBreak.instance.empty,
            BarLine.instance.start.repeatStart,
            BarLine.instance.end.single,
            BarRepeatEnding.instance.empty,
            NoteValue.instance.divisible.half,
          ),
        ],
      ),
    ],
  );
  expect(score.isEqualTo(score.clone())).toBe(true);
});

test('range and indices', () => {
  let tempBar = new Bar(
    new NoteValue(4, 4),
    [],
    Clef.instance.treble,
    Scale.instance.cMajor,
    BarBreak.instance.empty,
    BarLine.instance.start.repeatStart,
    BarLine.instance.end.single,
    BarRepeatEnding.instance.empty,
    NoteValue.instance.divisible.half,
  );

  {
    let score = new Score(
      new ScoreMetadata(),
      [
        new Section('A', [ ...Array(4) ].map(() => tempBar.clone())),
        new Section('B', [ ...Array(5) ].map(() => tempBar.clone())),
        new Section('C', [ ...Array(6) ].map(() => tempBar.clone())),
      ],
    );

    {
      let sectionAndBarRange = new SectionAndBarRange(new SectionAndBarIdx(0, 0));
      score.expandSectionAndBarRange(sectionAndBarRange, new SectionAndBarIdx(2, 5));
      let { sectionIdcs, barRanges } = score.decomposeSectionAndBarRange(sectionAndBarRange);
      expect(sectionIdcs.length).toBe(3);
      expect(barRanges.size).toBe(0);
      expect(score.getPreviousSectionAndBarIdx(new SectionAndBarIdx(0, 0))).toBeUndefined();
      expect(score.getPreviousSectionAndBarIdx(new SectionAndBarIdx(0, 1))).not.toBeUndefined();
      expect(score.getPreviousSectionAndBarIdx(new SectionAndBarIdx(0, 4))).not.toBeUndefined();
      expect(score.getPreviousSectionAndBarIdx(new SectionAndBarIdx(0, 5))).toBeUndefined();
    }

    {
      let sectionAndBarRange = score.generateSectionAndBarRange(new SectionAndBarIdx(0, 1), 4)
      expect(sectionAndBarRange.last.sectionIdx).toBe(1);
      expect(sectionAndBarRange.last.barIdx).toBe(0);
    }

    {
      let sectionAndBarRange = score.generateSectionAndBarRange(new SectionAndBarIdx(0, 1), 10)
      expect(sectionAndBarRange.last.sectionIdx).toBe(2);
      expect(sectionAndBarRange.last.barIdx).toBe(1);
    }
  }

  try {
    new Score(
      new ScoreMetadata(),
      [
        new Section('A', [ ...Array(4) ].map(() => tempBar.clone())),
        new Section('B', []),
        new Section('C', [ ...Array(6) ].map(() => tempBar.clone())),
      ],
    );
  } catch (error) {
    expect(error instanceof RangeError).toBe(true);
  }
});
