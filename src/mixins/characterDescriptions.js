import { mapGetters } from "vuex";
import { general } from 'src/mixins/general.js';

export const characterDescriptions = {
	mixins: [general],
	computed: {
		...mapGetters([
			"get_computed_character"
		]),
		computed() {
			return this.get_computed_character(this.userId, this.playerId);
		},
		replaceStats() {
			return	[
					{
						ref: "\\[str\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.computed.sheet.abilities.strength : undefined,
						description: "strength score"
					},
					{
						ref: "\\[dex\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.computed.sheet.abilities.dexterity : undefined,
						description: "dexterity score"
					},
					{
						ref: "\\[con\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.computed.sheet.abilities.constitution : undefined,
						description: "constitution score"
					},
					{
						ref: "\\[int\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.computed.sheet.abilities.intelligence : undefined,
						description: "intelligence score"
					},
					{
						ref: "\\[wis\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.computed.sheet.abilities.wisdom : undefined,
						description: "wisdom score"
					},
					{
						ref: "\\[cha\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.computed.sheet.abilities.charisma : undefined,
						description: "charisma score"
					},
					{
						ref: "\\[str_mod\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.calcMod(this.computed.sheet.abilities.strength) : undefined,
						description: "strength modifier"
					},
					{
						ref: "\\[dex_mod\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.calcMod(this.computed.sheet.abilities.dexterity) : undefined,
						description: "dexterity modifier"
					},
					{
						ref: "\\[con_mod\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.calcMod(this.computed.sheet.abilities.constitution) : undefined,
						description: "constitution modifier"
					},
					{
						ref: "\\[int_mod\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.calcMod(this.computed.sheet.abilities.intelligence) : undefined,
						description: "intelligence modifier"
					},
					{
						ref: "\\[wis_mod\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.calcMod(this.computed.sheet.abilities.wisdom) : undefined,
						description: "wisdom modifier"
					},
					{
						ref: "\\[cha_mod\\]",
						value: (this.computed.sheet && this.computed.sheet.abilities) ? this.calcMod(this.computed.sheet.abilities.charisma) : undefined,
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
				];
			}
	},
	methods: {
		replaceDescriptionStats(description, classKey = undefined) {
			const Class = (classKey) ? this.computed.sheet.classes[classKey] : undefined;

			if(description) {
				for(const replace of this.replaceStats) {
					const regex = new RegExp(replace.ref, "g");
					const replace_value = replace.value || replace.description;
					description = description.replace(regex, `<b class="hk-tooltip" data-content="${replace.description}">${replace_value}</b>`);
				}
				
				if(Class) {
					//Class level
					const level_regex = /\[class_level\]/g;
					const level_replace_value = Class.level || Class.class + " level";
					description = description.replace(level_regex, `<b class="hk-tooltip" data-content="${Class.class} level">${level_replace_value}</b>`);

					//Spell attack
					const attack_regex = /\[spell_attack\]/g;
					const attack_replace_value = Class.spell_attack || "spell attack modifier";
					description = description.replace(attack_regex, `<b class="hk-tooltip" data-content="Spell attack modifier">${attack_replace_value}</b>`);

					//Spell save DC
					const save_regex = /\[spell_save_dc\]/g;
					const save_replace_value = Class.spell_save_dc || "spell save DC";
					description = description.replace(save_regex, `<b class="hk-tooltip" data-content="Spell save DC">${save_replace_value}</b>`);
				}
			}

			return description;
		}
	}
}
