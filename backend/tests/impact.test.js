/**
 * UNIT TESTS (Jest) for the pure impact functions.
 * Run: npm test
 */
const { mealsFromKg, co2SavedFromKg, impactFromKg } = require('../src/utils/impact');

describe('Impact calculations', () => {
  test('converts kg to meals (0.4 kg per meal)', () => {
    expect(mealsFromKg(10)).toBe(25);
    expect(mealsFromKg(1)).toBe(2); // 2.5 → rounded down
  });

  test('converts kg to CO2 saved (2.5 kg CO2e per kg)', () => {
    expect(co2SavedFromKg(10)).toBe(25);
    expect(co2SavedFromKg(0.3)).toBe(0.8);
  });

  test('handles empty / invalid input safely', () => {
    expect(mealsFromKg(undefined)).toBe(0);
    expect(impactFromKg('abc')).toEqual({ kg: 0, meals: 0, co2SavedKg: 0 });
  });
});
