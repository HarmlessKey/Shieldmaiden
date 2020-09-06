export const characterDescriptions = {
	data() {
		return {
			replaceStats: [
				{
					ref: "\\[str\\]",
					value: this.calcMod(this.computed.sheet.abilities.strength),
					description: "your strength score"
				},
				{
					ref: "\\[dex\\]",
					value: this.calcMod(this.computed.sheet.abilities.dexterity),
					description: "your dexterity score"
				},
				{
					ref: "\\[con\\]",
					value: this.calcMod(this.computed.sheet.abilities.constitution),
					description: "your constitution score"
				},
				{
					ref: "\\[int\\]",
					value: this.calcMod(this.computed.sheet.abilities.intelligence),
					description: "your intelligence score"
				},
				{
					ref: "\\[wis\\]",
					value: this.calcMod(this.computed.sheet.abilities.wisdom),
					description: "your wisdom score"
				},
				{
					ref: "\\[cha\\]",
					value: this.calcMod(this.computed.sheet.abilities.charisma),
					description: "your charisma score"
				},
				{
					ref: "\\[str_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.strength),
					description: "your strength modifier"
				},
				{
					ref: "\\[dex_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.dexterity),
					description: "your dexterity modifier"
				},
				{
					ref: "\\[con_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.constitution),
					description: "your constitution modifier"
				},
				{
					ref: "\\[int_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.intelligence),
					description: "your intelligence modifier"
				},
				{
					ref: "\\[wis_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.wisdom),
					description: "your wisdom modifier"
				},
				{
					ref: "\\[cha_mod\\]",
					value: this.calcMod(this.computed.sheet.abilities.charisma),
					description: "your charisma modifier"
				},
				{
					ref: "\\[proficiency\\]",
					value: this.computed.display.level,
					description: "your proficiency bonus"
				},
				{
					ref: "\\[character_level\\]",
					value: this.computed.display.level,
					description: "your characters level"
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
					description = description.replace(regex, `**${replace_value}**`);
				}
				//Class level
				if(Class) {
					const level_regex = /\[class_level\]/g;
					const level_replace_value = Class.level || Class.class;
					description = description.replace(level_regex, `**${level_replace_value}**`);

					//Spell attack
					const attack_regex = /\[spell_attack\]/g;
					const attack_replace_value = Class.spell_attack || "spell attack modifier";
					description = description.replace(attack_regex, `**${attack_replace_value}**`);

					//Spell save DC
					const save_regex = /\[spell_save_dc\]/g;
					const save_replace_value = Class.spell_save_dc || "spell save DC";
					description = description.replace(save_regex, `**${save_replace_value}**`);
				}
			}

			return description;
		}
	}
}
