import { dice } from "src/mixins/dice.js";
import { experience } from "src/mixins/experience";
import { calc_mod, calc_skill_mod } from "src/utils/generalFunctions";

/**
 * Rolls for effects: repeat saves and escape attempts of an effect's holder.
 * The modifier formulas are copied from Targeted.vue (savingThrow) and CardDetails.vue
 * (skillModifier); keep them in sync until rolls are routed through effects (step 3).
 */
export const effectRolls = {
	mixins: [dice, experience],
	methods: {
		effectProficiency(entity) {
			return entity.entityType === "player"
				? this.returnProficiency(entity.level ? entity.level : this.calculatedLevel(entity.experience))
				: entity.proficiency || 0;
		},
		/**
		 * Saving throw modifier of an entity for an ability
		 */
		effectSaveModifier(entity, ability) {
			const mod = parseInt(calc_mod(entity[ability] || 10));
			return entity.saving_throws && entity.saving_throws.includes(ability)
				? mod + this.effectProficiency(entity)
				: mod;
		},
		/**
		 * Skill check modifier of an entity, e.g. ("strength", "athletics")
		 */
		effectSkillModifier(entity, ability, skill) {
			const ability_mod = calc_mod(entity[ability] || 10);
			const bonus = entity.skill_modifiers?.[skill] || 0;
			const proficient = entity.skills ? entity.skills.includes(skill) : false;
			const expertise = entity.skills_expertise ? entity.skills_expertise.includes(skill) : false;
			return calc_skill_mod(
				ability_mod,
				this.effectProficiency(entity),
				bonus,
				proficient,
				expertise,
				entity.skills_jack_of_all_trades
			);
		},
		/**
		 * Rolls a d20 with a modifier for an effect, shows the roll and returns its total
		 */
		rollEffectCheck({ entity, title, modifier, advantage }) {
			const roll = this.rollD(
				{},
				20,
				1,
				modifier,
				title,
				entity?.name?.capitalizeEach(),
				true,
				advantage ? { advantage: true } : {}
			);
			return roll?.total;
		},
	},
};
