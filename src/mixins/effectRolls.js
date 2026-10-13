import { mapActions } from "vuex";
import { dice, escapeHtml } from "src/mixins/dice.js";
import { experience } from "src/mixins/experience";
import { calc_mod, calc_skill_mod } from "src/utils/generalFunctions";
import {
	effectRollParts,
	formulaVars,
	isSrdCondition,
	proficiencyBonus,
	tempHpParts,
	rollPlan,
} from "src/utils/effectFunctions";

/**
 * Rolls for effects: repeat saves and escape attempts of an effect's holder, and the damage
 * and healing sub-effects of effect prompts.
 * The modifier formulas are copied from Targeted.vue (savingThrow) and CardDetails.vue
 * (skillModifier); keep them in sync until rolls are routed through effects (step 3).
 */
export const effectRolls = {
	mixins: [dice, experience],
	methods: {
		...mapActions(["setActionRoll"]),
		/**
		 * Icon class of an effect notification: the condition's icon, else the default effect icon
		 *
		 * @param {object} instance { source, source_key } of the effect, if there is one
		 */
		effectToastIcon(instance) {
			return isSrdCondition(instance?.source, instance?.source_key)
				? `hki-${instance.source_key}`
				: "fas fa-sparkles";
		},
		/**
		 * Shows an effect notification with a small effect icon instead of snotify's own icon.
		 * The toast is rendered as html, so the title isn't truncated; newlines in the body
		 * become line breaks.
		 *
		 * @param {string} type Snotify type: "info" or "warning"
		 * @param {string} title
		 * @param {string} body
		 * @param {object} instance { source, source_key } of the effect, for its icon
		 * @param {object} config Snotify config (timeout, buttons…)
		 */
		effectToast(type, { title, body, instance, config = {} }) {
			const text = String(body || "")
				.split("\n")
				.map(escapeHtml)
				.join("<br />");
			const html =
				`<div class="effect-toast">` +
				`<i aria-hidden="true" class="effect-toast__icon ${this.effectToastIcon(instance)}"></i>` +
				`<div class="effect-toast__text">` +
				(title ? `<div class="snotifyToast__title">${escapeHtml(title)}</div>` : "") +
				(text ? `<div class="snotifyToast__body">${text}</div>` : "") +
				`</div></div>`;
			return this.$snotify[type](body, title, { ...config, html });
		},
		/**
		 * Formula variables of an entity: ability scores and modifiers, pb and max_hp
		 */
		effectFormulaVars(entity) {
			return formulaVars(entity && this.effectEntity(entity));
		},
		/**
		 * The entity with the values its active effects give it (ability scores, max HP)
		 */
		effectEntity(entity) {
			return (entity?.key && this.$store.getters.effective_entity?.(entity.key)) || entity;
		},
		/**
		 * The damage and healing of an effect prompt that can be rolled, one part per recipient
		 */
		effectPromptParts(prompt) {
			const entities = this.$store.getters.entities || {};
			const instance = prompt.instance || {};
			return effectRollParts({
				sub_effects: prompt.sub_effects || [],
				instance,
				holderKey: prompt.holderKey,
				event: prompt.event || {},
				entities,
				vars: {
					self: this.effectFormulaVars(entities[prompt.holderKey]),
					caster: this.effectFormulaVars(entities[instance.caster_key]),
				},
			});
		},
		/**
		 * Rolls the damage and healing of an effect prompt and opens each roll in the roll
		 * dialog, where the DM applies it
		 *
		 * @returns {number} Number of rolls opened
		 */
		rollEffectParts(prompt) {
			const entities = this.$store.getters.entities || {};
			const parts = this.effectPromptParts(prompt);
			for (const part of parts) {
				const name = part.notes.length
					? `${prompt.effectName} (${part.notes.join("; ")})`
					: prompt.effectName;
				const roll = this.rollAction({ e: {} }, { name, action_list: part.action_list }, {});

				// rollAction falls back to DC 10; without a known DC the DM marks the save result
				roll.actions.forEach((action, index) => {
					if (action.type === "save") action.save_dc = part.action_list[index].save_dc;
				});
				roll.target = entities[part.recipientKey];
				roll.current = entities[part.dealerKey];
				this.setActionRoll(roll);
			}
			return parts.length;
		},
		/**
		 * The temporary hit point grants of an effect prompt (fixed temp_hp sub-effects)
		 */
		effectTempHpParts(prompt) {
			const entities = this.$store.getters.entities || {};
			const instance = prompt.instance || {};
			if (!entities[prompt.holderKey]) return [];
			return tempHpParts({
				sub_effects: prompt.sub_effects || [],
				instance,
				event: prompt.event || {},
				vars: {
					self: this.effectFormulaVars(entities[prompt.holderKey]),
					caster: this.effectFormulaVars(entities[instance.caster_key]),
				},
			});
		},
		/**
		 * Grants the temporary hit points of an effect prompt to its holder: rolls or evaluates
		 * each grant and keeps the higher of the holder's current and the new temporary HP
		 *
		 * @returns {number|undefined} The amount granted, undefined when nothing could be granted
		 */
		async grantEffectTempHp(prompt) {
			const holder = this.$store.getters.entities?.[prompt.holderKey];
			const parts = this.effectTempHpParts(prompt);
			if (!holder || !parts.length) return;

			let amount = 0;
			// Whether the highest grant ends with its effect
			let expires = false;
			const notes = [...new Set(parts.flatMap((part) => part.notes || []))];
			for (const part of parts) {
				const value =
					part.dice_count && part.dice_type
						? this.rollD(
								{},
								part.dice_type,
								part.dice_count,
								part.fixed_val,
								`${prompt.effectName}: temporary hit points`,
								holder.name?.capitalizeEach(),
								true
							).total
						: part.fixed_val;
				if (value > amount) {
					amount = value;
					expires = part.expires_with_effect;
				}
			}

			// Part of the amount couldn't be worked out, e.g. the caster isn't in the encounter
			if (notes.length) {
				const casterMissing = notes.some((note) => note.startsWith("caster."));
				this.effectToast("warning", {
					title: `${prompt.effectName}: amount incomplete`,
					body: `${notes.join("; ")}.${
						casterMissing
							? " The caster chosen when the effect was applied isn't in the encounter, or there was none."
							: ""
					}`,
					instance: prompt.instance,
					config: { timeout: 8000, showProgressBar: false },
				});
			}

			const current = parseInt(holder.tempHp) || 0;
			if (amount > current) {
				await this.$store.dispatch("set_hp", { key: prompt.holderKey, pool: "temp", newHp: amount });
				// Lost when the effect ends; nothing is saved when the instance is already gone
				if (expires && prompt.effectKey) {
					await this.$store.dispatch("set_effect_prop", {
						key: prompt.holderKey,
						effectKey: prompt.effectKey,
						property: "temp_hp_granted",
						value: amount,
					});
				}
			} else if (!notes.length) {
				this.effectToast("info", {
					title: holder.name?.capitalizeEach() || "Temporary hit points",
					body: `Keeps its ${current} temporary hit points (rolled ${amount}).`,
					instance: prompt.instance,
					config: { timeout: 4000, showProgressBar: false },
				});
			}
			return amount;
		},
		effectProficiency(entity) {
			return proficiencyBonus(entity);
		},
		/**
		 * Saving throw modifier of an entity for an ability
		 */
		effectSaveModifier(entity, ability) {
			entity = this.effectEntity(entity);
			const mod = parseInt(calc_mod(entity[ability] || 10));
			return entity.saving_throws && entity.saving_throws.includes(ability)
				? mod + this.effectProficiency(entity)
				: mod;
		},
		/**
		 * Skill check modifier of an entity, e.g. ("strength", "athletics")
		 */
		effectSkillModifier(entity, ability, skill) {
			entity = this.effectEntity(entity);
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
		rollEffectCheck({ entity, title, modifier, advantage, roll }) {
			// The roller's roll modifiers (rollModifiers) for this check or save
			const key = entity?.key;
			const modifiers =
				roll && key && this.$store.getters.entities?.[key]
					? this.$store.getters.roll_modifiers(key, roll)
					: undefined;
			const plan = rollPlan(modifiers, {
				modifier: parseInt(modifier) || 0,
				advantage: advantage ? { advantage: true } : {},
			});

			// Automatic failure or success: no roll
			if (plan.auto) {
				const result = plan.auto.result === "fail" ? "fails" : "succeeds";
				this.effectToast("warning", {
					title: entity?.name?.capitalizeEach() || "Automatic result",
					body: `${title}: ${result} automatically (${plan.auto.names.join(", ")})`,
					config: { timeout: 4000, showProgressBar: false },
				});
				return { auto: plan.auto.result };
			}

			const result = this.rollD(
				{},
				20,
				1,
				plan.m,
				title,
				entity?.name?.capitalizeEach(),
				true,
				plan.advantage,
				null,
				{ bonus_dice: plan.bonus_dice, notes: plan.roll_notes, floor: plan.floor, rerolls: plan.rerolls }
			);
			if (plan.consume.length) this.$store.dispatch("consume_roll_modifiers", plan.consume);
			return { total: result?.total };
		},
		/**
		 * Ability check modifier of an entity (effective score)
		 */
		effectCheckModifier(entity, ability) {
			entity = this.effectEntity(entity);
			return parseInt(calc_mod(entity[ability] || 10));
		},
	},
};
