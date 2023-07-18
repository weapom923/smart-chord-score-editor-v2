import { SectionAndBarIdx, BarRange, SectionAndBarRange } from '../../src/modules/SectionAndBarRange'

test('basic', () => {
  expect(new SectionAndBarIdx(0, 0).isEqualTo(new SectionAndBarIdx(0, 1))).toBe(false);
  expect(new SectionAndBarIdx(0, 0).isEqualTo(new SectionAndBarIdx(0, 0))).toBe(true);
  expect(new SectionAndBarIdx(0, 0).isPriorTo(new SectionAndBarIdx(0, 1))).toBe(true);
  expect(new SectionAndBarIdx(0, 0).isPriorTo(new SectionAndBarIdx(0, 0))).toBe(false);
  expect(new SectionAndBarIdx(0, 0).isPriorOrEqualTo(new SectionAndBarIdx(0, 1))).toBe(true);
  expect(new SectionAndBarIdx(0, 0).isPriorOrEqualTo(new SectionAndBarIdx(0, 0))).toBe(true);
  expect(new SectionAndBarIdx(0, 0).isPosteriorTo(new SectionAndBarIdx(0, 1))).toBe(false);
  expect(new SectionAndBarIdx(0, 0).isPosteriorTo(new SectionAndBarIdx(0, 0))).toBe(false);
  expect(new SectionAndBarIdx(0, 0).isPosteriorOrEqualTo(new SectionAndBarIdx(0, 1))).toBe(false);
  expect(new SectionAndBarIdx(0, 0).isPosteriorOrEqualTo(new SectionAndBarIdx(0, 0))).toBe(true);
  expect(new BarRange(0, 0).numBars).toBe(1);
  expect(new BarRange(0, 3).numBars).toBe(4);
  {
    let sectionAndBarRange = new SectionAndBarRange(new SectionAndBarIdx(0, 3), new SectionAndBarIdx(2, 4));
    expect(sectionAndBarRange.includes(new SectionAndBarIdx(0, 2))).toBe(false);
    expect(sectionAndBarRange.includes(new SectionAndBarIdx(0, 3))).toBe(true);
    expect(sectionAndBarRange.includes(new SectionAndBarIdx(1, 100))).toBe(true);
    expect(sectionAndBarRange.includes(new SectionAndBarIdx(2, 4))).toBe(true);
    expect(sectionAndBarRange.includes(new SectionAndBarIdx(2, 5))).toBe(false);
  }
});