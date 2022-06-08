/**
 * Calculate the average value of given dice
 * 
 * @param {number} value 
 * @param {number} amount 
 * @returns {number}
 */
export function calc_dice_average(value, amount = 1) {
  return Math.ceil(((value + 1)/2)*amount);
}

/**
 * Calculates the modifier from an ability score
 * 
 * @param {number} value 
 * @returns {number}
 */
export function calc_mod(value) {
  return (value) ? Math.floor((value - 10) / 2) : 0;
};

/**
 * Returns the modifier for a given skill
 * 
 * @param {number} ability_mod
 * @param {number} proficiency
 * @param {number} bonus
 * @param {boolean} proficient
 * @param {boolean} expertise
 * @returns {number}
 */
export function calc_skill_mod(ability_mod, proficiency, bonus=0, proficient=false, expertise=false) {
  let mod = ability_mod;
  if(proficient) {
    mod = (expertise) ? (mod + proficiency * 2) : mod + proficiency;
  }
  return parseInt(mod) + parseInt(bonus);
}