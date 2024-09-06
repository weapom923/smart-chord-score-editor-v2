import { describe, test, expect } from '@jest/globals'
import { Bar } from '../../src/modules/Bar'
import { PartInBar } from '../../src/modules/PartInBar'
import { Chord } from '../../src/modules/Chord'
import { sc } from '../../src/modules/Scale'
import { nv } from '../../src/modules/NoteValue'
import { Note } from '../../src/modules/Note'
import { np } from '../../src/modules/NotePitch'

describe(
  'transpose bar',
  () => {
    test(
      'basic',
      () => {
        {
          const bar = new Bar();
          bar.scale = sc.dFlatMajor;
          bar.parts.push(new PartInBar([ new Note(new Chord(np.dFlat, 'major'), nv.divisible.whole, 'normal', false) ]));
          const transposedBar = bar.transpose(-1);
          expect(transposedBar.scale).toBe(sc.cMajor);
          const transposedChord = transposedBar.parts[0].notes[0].pitchOrChord;
          if (!(transposedChord instanceof Chord)) throw Error();
          expect(transposedChord.root).toBe(np.c);
        }

        {
          const bar = new Bar();
          bar.scale = sc.cSharpMajor;
          bar.parts.push(new PartInBar([ new Note(new Chord(np.eSharp, 'minor'), nv.divisible.whole, 'normal', false) ]));
          const transposedBar = bar.transpose(1);
          expect(transposedBar.scale).toBe(sc.dMajor);
          const transposedChord = transposedBar.parts[0].notes[0].pitchOrChord;
          if (!(transposedChord instanceof Chord)) throw Error();
          expect(transposedChord.root).toBe(np.fSharp);
        }

        {
          const bar = new Bar();
          bar.scale = sc.cSharpMajor;
          bar.parts.push(new PartInBar([ new Note(new Chord(np.cSharp, 'major', undefined, undefined, np.eSharp), nv.divisible.whole, 'normal', false) ]));
          const transposedBar = bar.transpose(1);
          expect(transposedBar.scale).toBe(sc.dMajor);
          const transposedChord = transposedBar.parts[0].notes[0].pitchOrChord;
          if (!(transposedChord instanceof Chord)) throw Error();
          expect(transposedChord.root).toBe(np.d);
          expect(transposedChord.bass).toBe(np.fSharp);
        }
      },
    );
  },
)
