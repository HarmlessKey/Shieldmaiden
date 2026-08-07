// Ported verbatim from the app so the harness saves exactly what a real user
// save would produce. Keep these in sync by hand if the source changes.

// src/views/UserContent/Npcs/EditNpc.vue:320 (convertVersatileToOptions)
function convertVersatileToOptions(npc) {
	if (npc.actions && npc.actions.length > 0) {
		for (const action of npc.actions) {
			if (action.versatile === true) {
				const versTwoName = action.versatile_two;
				action.options = [action.versatile_one, action.versatile_two];
				delete action.versatile;
				delete action.versatile_one;
				delete action.versatile_two;

				for (const sub_action of action.action_list) {
					for (const roll of sub_action.rolls) {
						roll.options = {
							[versTwoName]: {
								damage_type: roll.versatile_damage_type || null,
								dice_count: roll.versatile_dice_count || null,
								dice_type: roll.versatile_dice_type || null,
								fixed_val: roll.versatile_fixed_val || null,
							},
						};
						delete roll.versatile_damage_type;
						delete roll.versatile_dice_count;
						delete roll.versatile_dice_type;
						delete roll.versatile_fixed_val;
					}
				}
			}
		}
	}
	return npc;
}

// src/store/modules/userContent/npcs.js:6 (convert_npc)
function convertNpc(npc) {
	const properties = ["name", "challenge_rating", "avatar", "storage_avatar", "type", "groups"];
	const returnNpc = {};
	for (const prop of properties) {
		if (Object.prototype.hasOwnProperty.call(npc, prop)) {
			returnNpc[prop] = prop === "name" ? npc[prop].toLowerCase() : npc[prop];
		}
	}
	return returnNpc;
}

// src/store/modules/userContent/spells.js:6 (convert_spell)
function convertSpell(spell) {
	const properties = ["name", "school", "level"];
	const returnSpell = {};
	for (const prop of properties) {
		if (Object.prototype.hasOwnProperty.call(spell, prop)) {
			returnSpell[prop] = prop === "name" ? spell[prop].toLowerCase() : spell[prop];
		}
	}
	return returnSpell;
}

module.exports = { convertVersatileToOptions, convertNpc, convertSpell };
