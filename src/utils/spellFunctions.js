import numeral from "numeral";

/**
 * Generates description for each level tier for spell level scaling
 *
 * @param {object[]} tiers
 * @param {string} scaling character_level | spell_scale | spell_level
 * @param {number} level base spell level
 *
 * @returns {string}
 * */
export function spellScalingDescription(tiers, scaling, level, dice_type) {
	let description = [];

	// CHARACTER LEVEL
	if (scaling === "character_level") {
		description = [
			"This spell's damage/projectiles increases when your character reaches a higher level.",
		];
		for (let tier of tiers) {
			let count_txt = `${tier.projectile_count} projectile${tier.projectile_count > 1 ? "s" : ""}`;
			let level_txt = `at ${numeral(tier.level).format("0o")} level`;
			let damage_txt = "this spell roll does ";
			damage_txt +=
				tier.dice_count || dice_type
					? `${tier.dice_count || "..."}d${dice_type || "..."}`
					: "";

			if (tier.fixed_val) {
				damage_txt += `${tier.dice_count || dice_type ? "+" : ""}${tier.fixed_val || ""}`;
			}

			let new_line = `${tier.projectile_count ? count_txt : ""} `;
			new_line += `${
				!tier.projectile_count && tier.dice_count ? level_txt.capitalize() + "s," : level_txt
			}`;
			new_line += `${tier.projectile_count && tier.dice_count ? ", and " : "."}`;
			new_line += `${tier.dice_count ? damage_txt : ""}`;
			description.push(new_line);
		}
	}

	// SPELL SCALE
	else if (scaling === "spell_scale") {
		let tier = tiers[0];
		// Opening line
		let level_txt = "When you cast this spell using a spell slot of ";
		level_txt += `${numeral(parseInt(level) + 1).format("0o")} level or higher,`;

		// Damage modifier text
		let damage_txt = "the damage of this roll increases by ";
		damage_txt +=
			tier.dice_count || dice_type
				? `${tier.dice_count || "..."}d${dice_type || "..."}`
				: "";

		if (tier.fixed_val) {
			damage_txt += `${tier.dice_count || dice_type ? "+" : ""}${tier.fixed_val || ""}`;
		}

		// Projectile count text
		let count_txt = `the spell creates ${tier.projectile_count} more projectile${
			tier.projectile_count > 1 ? "s" : ""
		}`;
		// Spell slot text
		let slot_txt = `for ${
			tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"
		} above ${numeral(level).format("0o")}.`;

		let text = `${level_txt} ${tier.projectile_count ? count_txt : ""} ${
			tier.projectile_count && tier.dice_count ? "and " : ""
		}${tier.dice_count ? damage_txt : ""} ${slot_txt}`;
		description = [text];
	}

	// SPELL LEVEL
	else if (scaling === "spell_level") {
		for (let tier of tiers) {
			let new_line = "When you cast this spell using a ";
			new_line += `${numeral(tier.level).format("0o")}-level spell slot, this spell roll does `;
			new_line += `${tier.dice_count || "..."}d${dice_type || "..."}${
				tier.fixed_val ? "+" : ""
			}${tier.fixed_val || ""} damage.`;

			description.push(new_line);
		}
	}
	return description.join("\n");
}
