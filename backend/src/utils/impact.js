/**
 * impact.js — converts kilograms of rescued food into SDG impact numbers.
 * These are pure functions (no database), so they are easy to unit-test (see tests/).
 *
 * Assumptions (approximate, stated openly):
 *  - 1 meal ≈ 0.4 kg of food.
 *  - Wasted food ≈ 2.5 kg CO₂-equivalent per kg. Derived from FAO (2013) "Food Wastage
 *    Footprint": ~3.3 billion tonnes CO₂e from ~1.3 billion tonnes of food wasted.
 */
const KG_PER_MEAL = 0.4;
const CO2E_PER_KG = 2.5;

const mealsFromKg = (kg) => Math.floor((Number(kg) || 0) / KG_PER_MEAL);

const co2SavedFromKg = (kg) => Math.round((Number(kg) || 0) * CO2E_PER_KG * 10) / 10;

const impactFromKg = (kg) => ({
  kg: Math.round((Number(kg) || 0) * 10) / 10,
  meals: mealsFromKg(kg),
  co2SavedKg: co2SavedFromKg(kg),
});

module.exports = { KG_PER_MEAL, CO2E_PER_KG, mealsFromKg, co2SavedFromKg, impactFromKg };
