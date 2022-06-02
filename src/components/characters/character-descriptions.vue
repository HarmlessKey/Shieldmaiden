<template>
  <div :is="html" />
</template>

<script>
import sanitizeHtml from 'sanitize-html';
import { marked } from "marked";
import { calc_mod } from "src/utils/generalFunctions";
import HkTooltip from "../hk-components/hk-tooltip.vue";

export default {
  name: "CharacterDescription",
  props: {
    value: {
      type: String
    },
    classIndex: {
      type: Number,
      required: false
    }
  },
  components: {
    "hk-tooltip": HkTooltip
  },
  inject: ["characterState"],
  computed: {
    marked() {
      return sanitizeHtml(marked.parse(this.value || ""));
    },
    computed_character() {
      return this.characterState.computed_character;
    },
    html() {
      let description = this.marked;
      if(description) {
        const Class = (this.classIndex) ? this.computed_character.classes[this.classIndex] : undefined;

				for(const replace of this.replaceStats) {
					const regex = new RegExp(replace.ref, "g");
					const replace_value = replace.value || replace.description;
					description = description.replace(regex, `<span class="stat">${replace_value}<hk-tooltip>${replace.description}</hk-tooltip></span>`);
				}
				
				if(Class) {
					//Class level
					const level_regex = /\[class_level\]/g;
					const level_replace_value = Class.level || Class.class + " level";
					description = description.replace(level_regex, `<span class="stat">${level_replace_value}<hk-tooltip>${Class.class}</hk-tooltip></span>`);

					//Spell attack
					const attack_regex = /\[spell_attack\]/g;
					const attack_replace_value = Class.spell_attack || "spell attack modifier";
					description = description.replace(attack_regex, `<span class="stat">${attack_replace_value}<hk-tooltip>Spell attack modifier</hk-tooltip></span>`);

					//Spell save DC
					const save_regex = /\[spell_save_dc\]/g;
					const save_replace_value = Class.spell_save_dc || "spell save DC";
					description = description.replace(save_regex, `<span class="stat">${save_replace_value}<hk-tooltip>Spell save DC</hk-tooltip></span>`);
				}
			}
			return { 
        components: {
          "hk-tooltip": HkTooltip
        },
        template: '<div class="character-description">' + description + "</div>"
      };
    },
    replaceStats() {
			return	[
        {
          ref: "\\[str\\]",
          value: (this.computed_character.abilities) ? this.computed_character.abilities.strength : undefined,
          description: "strength score"
        },
        {
          ref: "\\[dex\\]",
          value: (this.computed_character.abilities) ? this.computed_character.abilities.dexterity : undefined,
          description: "dexterity score"
        },
        {
          ref: "\\[con\\]",
          value: (this.computed_character.abilities) ? this.computed_character.abilities.constitution : undefined,
          description: "constitution score"
        },
        {
          ref: "\\[int\\]",
          value: (this.computed_character.abilities) ? this.computed_character.abilities.intelligence : undefined,
          description: "intelligence score"
        },
        {
          ref: "\\[wis\\]",
          value: (this.computed_character.abilities) ? this.computed_character.abilities.wisdom : undefined,
          description: "wisdom score"
        },
        {
          ref: "\\[cha\\]",
          value: (this.computed_character.abilities) ? this.computed_character.abilities.charisma : undefined,
          description: "charisma score"
        },
        {
          ref: "\\[str_mod\\]",
          value: (this.computed_character.abilities) ? calc_mod(this.computed_character.abilities.strength) : undefined,
          description: "strength modifier"
        },
        {
          ref: "\\[dex_mod\\]",
          value: (this.computed_character.abilities) ? calc_mod(this.computed_character.abilities.dexterity) : undefined,
          description: "dexterity modifier"
        },
        {
          ref: "\\[con_mod\\]",
          value: (this.computed_character.abilities) ? calc_mod(this.computed_character.abilities.constitution) : undefined,
          description: "constitution modifier"
        },
        {
          ref: "\\[int_mod\\]",
          value: (this.computed_character.abilities) ? calc_mod(this.computed_character.abilities.intelligence) : undefined,
          description: "intelligence modifier"
        },
        {
          ref: "\\[wis_mod\\]",
          value: (this.computed_character.abilities) ? calc_mod(this.computed_character.abilities.wisdom) : undefined,
          description: "wisdom modifier"
        },
        {
          ref: "\\[cha_mod\\]",
          value: (this.computed_character.abilities) ? calc_mod(this.computed_character.abilities.charisma) : undefined,
          description: "charisma modifier"
        },
        {
          ref: "\\[proficiency\\]",
          value: this.computed_character.proficiency,
          description: "proficiency bonus"
        },
        {
          ref: "\\[character_level\\]",
          value: this.computed_character.level,
          description: "characters level"
        }
      ];
    }
  },
  methods: {
    
  }
}
</script>