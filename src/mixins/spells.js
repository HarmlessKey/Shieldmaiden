import { dice } from 'src/mixins/dice.js';

export const spells = {
	mixins: [dice],
	data() {
		return {
			spell_levels: [
				{
					value: 0,
					label: "Cantrip"
				},
				{
					value: 1,
					label: "1st"
				},
				{
					value: 2,
					label: "2nd"
				},
				{
					value: 3,
					label: "3rd"
				},
				{
					value: 4,
					label: "4th"
				},
				{
					value: 5,
					label: "5th"
				},
				{
					value: 5,
					label: "6th"
				},
				{
					value: 7,
					label: "7th"
				},
				{
					value: 8,
					label: "8th"
				},
				{
					value: 9,
					label: "9th"
				},
			],
			spell_schools: [
				{ label: "Abjuration", value: "abjuration" },
				{ label: "Conjuration", value: "conjuration" },
				{ label: "Divination", value: "divination" },
				{ label: "Enchantment", value: "enchantment" },
				{ label: "Evocation", value: "evocation" },
				{ label: "Illusion", value: "illusion" },
				{ label: "Necromancy", value: "necromancy" },
				{ label: "Transmutation", value: "transmutation" },
			],
			spell_components: [
				{ label: "Verbal", value: "verbal" },
				{ label: "Somatic", value: "somatic" },
				{ label: "Material", value: "material" }
			],
			spell_cast_time_types: [
				{ label: "Action", value: "action" },
				{ label: "Bonus Action", value: "bonus_action" }, 
				{ label: "Reaction", value: "reaction" }, 
				{ label: "Minute", value: "minute" }, 
				{ label: "Hour", value: "hour" }, 
				{ label: "No Action", value: "no_action" }, 
				{ label: "Special", value: "special" },
			],
			spell_range_types: [
				{ label: "Self", value: "self" },
				{ label: "Touch", value: "touch" },
				{ label: "Ranged", value: "ranged" },
				{ label: "Sight", value: "sight" },
				{ label: "Unlimited", value: "unlimited" },
			],
			spell_duration_types: [
				{ label: "Concentration", value: "concentration" },
				{ label: "Instantaneous", value: "instantaneous" },
				{ label: "Special", value: "special" },
				{ label: "Time", value: "time" },
				{ label: "Until Dispelled", value: "until_dispelled" },
				{ label: "Until Dispelled or Triggered", value: "until_dispelled_or_triggered" },
			],
			spell_duration_types_time: [ "concentration", "time" ],
			spell_duration_times: [
				{ label: "Round", value: "round" },
				{ label: "Minute", value: "minute" },
				{ label: "Hour", value: "hour" },
				{ label: "Day", value: "day" },
			],
			aoe_types: [
				{ label: "None", value: "none" },
				{ label: "Cone", value: "cone" },
				{ label: "Cube", value: "cube" },
				{ label: "Cylinder", value: "cylinder" },
				{ label: "Line", value: "line" },
				{ label: "Sphere", value: "sphere" },
				{ label: "Square", value: "square" },
				{ label: "Square Feet", value: "square feet" },
			],
			level_scaling: [
				{ label: "None", value: "none" },
				{ label: "Character Level", value: "character_level" },
				{ label: "Spell Scale", value: "spell_scale" },
				{ label: "Spell Level", value: "spell_level" },
			],
		}
	},
	methods: {
	}
}
