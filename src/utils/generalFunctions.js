/**
 * Calculate the average value of given dice
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