export const characterDescriptions = {
	data() {
		return {
			replaceStats: [
				{
					ref: "\\[str\\]",
					value: this.calcMod(this.computed.sheet.abilities.strength),
					description: "strength score"
				},
				{
					ref: "\\[dex\\]",
					value: this.calcMod(this.computed.sheet.abilities.dexterity),
					description: "dexterity score"
				},
				{
					ref: "\\[con\\]",
					value: this.calcMod(this.computed.sheet.abilities.constitution),
					description: "constitution score"
				},
				{
					ref: "\\[int\\]",
					value: this.calcMod(this.computed.sheet.abilities.intelligence),
					description: "intelligence score"
				},
				{
					ref: "\\[wis\\]",
					value: this.calcMod(this.computed.sheet.abilities.wisdom),
					description: "wisdom score"
				},
				{
					ref: "\\[cha\\]",
					value: this.calcMod(this.computed.sheet.abilities.charisma),
					description: "charisma score"
				},
				{
					ref: "\\[str_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.strength),
					description: "strength modifier"
				},
				{
					ref: "\\[dex_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.dexterity),
					description: "dexterity modifier"
				},
				{
					ref: "\\[con_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.constitution),
					description: "constitution modifier"
				},
				{
					ref: "\\[int_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.intelligence),
					description: "intelligence modifier"
				},
				{
					ref: "\\[wis_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.wisdom),
					description: "wisdom modifier"
				},
				{
					ref: "\\[cha_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.charisma),
					description: "charisma modifier"
				},
				{
					ref: "\\[proficiency\\]",
					value: this.computed.display.level,
					description: "proficiency bonus"
				},
				{
					ref: "\\[character_level\\]",
					value: this.computed.display.level,
					description: "characters level"
				}
			]
		}
	},
	methods: {
		replaceDescriptionStats(description, Class = undefined) {
			if(description) {
				for(const replace of this.replaceStats) {
					const regex = new RegExp(replace.ref, "g");
					const replace_value = replace.value || replace.description;
					description = description.replace(regex, `**<span data-toggle="tooltip" title="${replace.description}">${replace_value}</span>**`);
				}
				//Class level
				if(Class) {
					const level_regex = /\[class_level\]/g;
					const level_replace_value = Class.level || Class.class + " level";
					description = description.replace(level_regex, `**<span data-toggle="tooltip" title="${Class.class} level">${level_replace_value}**`);

					//Spell attack
					const attack_regex = /\[spell_attack\]/g;
					const attack_replace_value = Class.spell_attack || "spell attack modifier";
					description = description.replace(attack_regex, `**<span data-toggle="tooltip" title="Spell attack modifier">${attack_replace_value}</span>**`);

					//Spell save DC
					const save_regex = /\[spell_save_dc\]/g;
					const save_replace_value = Class.spell_save_dc || "spell save DC";
					description = description.replace(save_regex, `**<span data-toggle="tooltip" title="Spell save DC">${save_replace_value}</span>**`);
				}
			}

			return description;
		}
	}
}
