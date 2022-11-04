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
}

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

/**
 * Downloads a JSON file
 * 
 * @param {data} data
 */
export function downloadJSON(data) {
  let filename;
  if (data instanceof Array) {
    filename = "harmlesskey_npcs.json";
  }
  else {
    filename = data.name.trim() + ".json";
  }

  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null ,2)); 
  var downloadAnchorNode = document.createElement('a'); 
  downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);  // required for firefox 
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}