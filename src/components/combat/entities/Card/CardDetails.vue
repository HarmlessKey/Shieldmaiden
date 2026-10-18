<template>
	<div class="card-details">
		<div class="card-details__top">
			<Avatar v-if="avatar" :entity="full_entity" :size="56" />
			<div class="card-details__top-title">
				<Name :entity="full_entity" />
				<em v-if="full_entity.entityType !== 'player'" class="subtitle">
					<template v-if="full_entity.size">{{ full_entity.size }}</template>
					<template v-if="full_entity.type"> {{ full_entity.type }}</template>
					<span v-if="full_entity.subtype"> ({{ full_entity.subtype }})</span>
					<template v-if="full_entity.alignment">, {{ full_entity.alignment }}</template>
				</em>
				<em v-else class="subtitle">
					Level {{ full_entity.level || calculatedLevel(full_entity.experience) }}
				</em>
				<small v-if="full_entity.source" class="neutral-2"> | {{ full_entity.source }}</small>
			</div>
		</div>
		<Effects :entity="full_entity" />
		<div class="stats">
			<template v-for="(stat, key) of stats">
				<div v-if="displayStats(full_entity)[key] !== undefined" :key="key">
					<div class="truncate label value__label">{{ stat.label }}</div>
					<div
						class="value"
						:class="{ clickable: in_encounter }"
						@click="in_encounter && openBonuses(stat.bonus)"
					>
						<hk-icon :icon="stat.icon" class="mr-1" />
						<template v-if="key === 'maxHp'">
							<hk-animated-integer :value="displayStats(full_entity).curHp" class="ml-1" /> /
						</template>
						<!-- Initiative is a roll too: its advantage and dice from effects (Invisible) -->
						<EffectModifiedValue
							:entity="full_entity"
							:field="key"
							:value="key === 'initiative_modifier' ? initiative_value : displayStats(full_entity)[key]"
							:advantage="key === 'initiative_modifier' ? initiative_plan.advantage : undefined"
							:extra-notes="key === 'initiative_modifier' ? initiative_plan.notes : undefined"
							:changed="key === 'initiative_modifier' && initiative_plan.changed ? true : undefined"
						/>
					</div>
				</div>
			</template>
		</div>
		<div class="card-details__abilities">
			<template v-for="(ability, index) in abilities">
				<div
					v-if="index === 0 || index === 3"
					:key="index"
					class="card-details__abilities-header label"
				>
					<div class="placeholder" />
					<div>mod</div>
					<div>save</div>
				</div>
				<div :key="ability" class="ability">
					<div class="label">{{ ability.substring(0, 3) }}</div>
					<div
						class="ability__score"
						:class="{ clickable: in_encounter }"
						@click="in_encounter && openBonuses([ability, `check_${ability}`, `save_${ability}`])"
					>
						<EffectModifiedValue
							:entity="full_entity"
							:field="ability"
							:value="full_entity[ability] ?? 10"
						/>
					</div>
					<hk-roll
						v-for="type in ['mod', 'save']"
						:key="type"
						class="pointer"
						:class="`ability__${type}`"
						:roll="{
							d: 20,
							n: 1,
							m: ability_plans[ability][type].m,
							advantage: ability_plans[ability][type].advantage,
							plan: ability_plans[ability][type],
							title: `${ability.capitalize()} ${type === 'save' ? 'save' : 'check'}`,
							entity_name: full_entity.name.capitalizeEach(),
							notify: true,
							trigger:
								type === 'mod' ? { name: 'on_check', entity_key: full_entity.key } : undefined,
						}"
						:share="
							shares.includes('ability_rolls')
								? {
										encounter_id: encounterId,
										entity_key: full_entity.key,
									}
								: null
						"
					>
						<EffectModifiedValue
							:notes="ability_plans[ability][type].notes"
							:changed="ability_plans[ability][type].changed"
							:advantage="ability_plans[ability][type].advantage"
							:value="signed(ability_plans[ability][type].m)"
						/>
					</hk-roll>
				</div>
			</template>
		</div>
		<p v-if="!full_entity.old && full_entity.entityType !== 'player'" class="card-details__summary">
			<template v-if="full_entity.skills">
				<strong class="neutral-2">Skills </strong>
				<span class="skills">
					<hk-roll
						v-for="(skill, idx) in full_entity.skills"
						:key="skill"
						:tooltip="`Roll ${skill}`"
						:roll="{
							d: 20,
							n: 1,
							m: skillModifier(skills[skill]),
							title: `${skill} check`,
							entity_name: full_entity.name.capitalizeEach(),
							notify: true,
							trigger: { name: 'on_check', entity_key: full_entity.key },
						}"
						:share="
							shares.includes('skill_rolls')
								? {
										encounter_id: encounterId,
										entity_key: entity.key,
									}
								: null
						"
					>
						<span class="skill">
							{{ skill }} {{ skillModifier(skills[skill])
							}}<span class="mr-2" v-if="idx < full_entity.skills.length - 1">,</span>
						</span>
					</hk-roll>
				</span>
				<br />
			</template>
			<!-- Defenses, with the ones from effects marked (Petrified, Stoneskin) -->
			<template v-for="list in defense_lists">
				<template v-if="list.items.length">
					<strong :key="`${list.field}-label`" class="neutral-2">{{ list.label }}</strong>
					<span
						v-for="(item, i) in list.items"
						:key="`${list.field}-${item.value}`"
						class="effect-modified-value"
						:class="{ modified: item.sources }"
						>{{ item.text }}<q-tooltip v-if="item.sources" anchor="top middle" self="center middle">{{
							item.sources.join(", ")
						}}</q-tooltip
						><template v-if="i < list.items.length - 1">, </template></span
					><br :key="`${list.field}-br`" />
				</template>
			</template>

			<strong class="neutral-2">Senses</strong>
			<template v-if="full_entity.senses">
				<span v-for="(sense, key) in full_entity.senses" :key="key">
					{{ key }} {{ sense.range ? `${sense.range} ft.` : ``
					}}{{ sense.comments ? `${sense.comments}` : `` }},
				</span>
			</template>
			passive perception
			<EffectModifiedValue
				:entity="full_entity"
				field="passive_perception"
				bonus="passive_perception"
				:value="full_entity.passive_perception ?? passivePerception()"
			/><br />

			<template v-if="full_entity.languages && full_entity.languages.length > 0"
				><strong class="neutral-2">Languages</strong> {{ full_entity.languages.join(", ") }}<br
			/></template>
			<template v-if="full_entity.challenge_rating">
				<strong class="neutral-2">Challenge Rating</strong> {{ full_entity.challenge_rating }} ({{
					monster_challenge_rating[full_entity.challenge_rating].xp | numeral("0,0")
				}}
				XP)<br />
			</template>
		</p>

		<h3 class="label card-details__skills-header">
			Skills
			<button
				v-if="in_encounter"
				class="btn btn-sm bg-neutral-5"
				@click="openBonuses(roll_bonus_stats)"
			>
				<i aria-hidden="true" class="fas fa-plus" />
				<q-tooltip anchor="top middle" self="center middle">Roll bonuses</q-tooltip>
			</button>
		</h3>
		<CardSkills :entity="full_entity" :skill-modifier="skillModifier" :skill-plans="skill_plans" />
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { abilities, skills } from "src/utils/generalConstants";
import { calc_mod, calc_skill_mod } from "src/utils/generalFunctions";
import { monsterMixin } from "src/mixins/monster.js";
import { experience } from "src/mixins/experience";
import { displayStats, skillBonusKey } from "src/utils/entityFunctions";
import { rollPlan } from "src/utils/effectFunctions";
import Effects from "../effects";
import Avatar from "../Avatar.vue";
import Name from "../Name.vue";
import CardSkills from "./CardSkills.vue";
import EffectModifiedValue from "../EffectModifiedValue.vue";

export default {
	name: "CardDetails",
	mixins: [monsterMixin, experience],
	components: {
		Effects,
		Avatar,
		Name,
		CardSkills,
		EffectModifiedValue,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
		avatar: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			abilities,
			skills,
			stats: {
				ac: {
					icon: "fas fa-shield",
					label: "Armor Class",
					bonus: "ac",
				},
				maxHp: {
					icon: "fas fa-heart",
					label: "Hit Points",
					bonus: "max_hp",
				},
				speed: {
					icon: "fas fa-running",
					label: "Walk Speed",
					bonus: "speed",
				},
				initiative_modifier: {
					icon: "fas fa-chevron-double-up",
					label: "Initiative",
					bonus: "initiative",
				},
			},
		};
	},
	computed: {
		...mapGetters(["broadcast", "targeted"]),
		shares() {
			return this.broadcast.shares || [];
		},
		full_entity() {
			let entity = JSON.parse(JSON.stringify(this.entity));
			if (entity.entityType === "npc" && !entity.no_linked_npc && !entity.proficiency) {
				entity.proficiency = this.monster_challenge_rating[entity.challenge_rating].proficiency;
			}
			return entity;
		},
		/**
		 * Damage vulnerabilities, resistances, immunities and condition immunities as shown:
		 * [{ field, label, items: [{ value, text, sources }] }], sources naming the effects that
		 * give an entry (defense_sources of the effective entity)
		 */
		defense_lists() {
			const sources = this.full_entity.defense_sources || {};
			const lists = [
				{ field: "damage_vulnerabilities", kind: "v", label: "Damage vulnerabilities" },
				{ field: "damage_resistances", kind: "r", label: "Damage resistances" },
				{ field: "damage_immunities", kind: "i", label: "Damage immunities" },
				{ field: "condition_immunities", kind: "ci", label: "Condition immunities" },
			];
			return lists.map((list) => ({
				...list,
				items: (this.full_entity[list.field] || []).map((value) => ({
					value,
					text:
						list.kind === "ci" ? value : value.split("_").join(" ").capitalizeEach(),
					sources: sources[`${list.kind}:${value}`],
				})),
			}));
		},
		// Bonuses can only be edited for entities in the running encounter
		in_encounter() {
			return !!this.$store.getters.entities?.[this.entity.key];
		},
		/**
		 * Roll plans (effects and manual bonuses) of the ability checks and saves:
		 * { [ability]: { mod, save } }
		 */
		ability_plans() {
			const plans = {};
			for (const ability of this.abilities) {
				plans[ability] = {
					mod: this.rollPlanFor({ kind: "check", ability }, this.modifier(ability, "mod")),
					save: this.rollPlanFor({ kind: "save", ability }, this.modifier(ability, "save")),
				};
			}
			return plans;
		},
		// The initiative roll's plan, as the set initiative screen rolls it: its advantage, dice and
		// flat Dexterity check bonuses on top of the initiative modifier (which has its own effect
		// modifiers and manual bonuses)
		initiative_plan() {
			return this.rollPlanFor({ kind: "initiative" }, 0);
		},
		initiative_value() {
			const shown = displayStats(this.full_entity).initiative_modifier;
			if (!this.initiative_plan.flat) return shown;
			return this.signed((parseInt(this.full_entity.initiative_modifier) || 0) + this.initiative_plan.flat);
		},
		// All roll bonuses, for the drawer opened from the skill list
		roll_bonus_stats() {
			return [
				"attack",
				"damage",
				"check_all",
				"save_all",
				"death_save",
				"concentration_save",
				...Object.values(this.skills).map((skill) => skillBonusKey(skill.value)),
			];
		},
		/**
		 * Roll plans of the skill checks: { [skill value]: plan }
		 */
		skill_plans() {
			const plans = {};
			for (const skill of Object.values(this.skills)) {
				plans[skill.value] = this.rollPlanFor({ kind: "skill", skill: skill.value }, this.skillModifier(skill));
			}
			return plans;
		},
	},
	methods: {
		calc_mod,
		displayStats,
		openBonuses(stats) {
			this.$store.dispatch("setDrawer", {
				show: true,
				type: "drawers/encounter/StatBonuses",
				data: { entityKey: this.entity.key, ...(Array.isArray(stats) ? { stats } : { stat: stats }) },
			});
		},
		/**
		 * Roll plan for a d20 roll of this entity: its modifier with effects and manual bonuses
		 */
		rollPlanFor(roll, modifier) {
			const modifiers = this.in_encounter
				? this.$store.getters.roll_modifiers(this.entity.key, roll)
				: undefined;
			return rollPlan(modifiers, { modifier: parseInt(modifier) || 0 });
		},
		signed(value) {
			return value > 0 ? `+${value}` : value;
		},
		savingThrow(ability) {
			let proficiency;
			if (this.full_entity.entityType === "player") {
				proficiency = this.returnProficiency(
					this.full_entity.level
						? this.full_entity.level
						: this.calculatedLevel(this.full_entity.experience)
				);
			} else {
				proficiency = this.full_entity.proficiency;
			}
			return this.full_entity.saving_throws && this.full_entity.saving_throws.includes(ability)
				? parseInt(calc_mod(this.full_entity[ability] || 10)) + proficiency
				: parseInt(calc_mod(this.full_entity[ability] || 10));
		},
		modifier(ability, type) {
			return type === "mod" ? calc_mod(this.full_entity[ability] || 10) : this.savingThrow(ability);
		},
		passivePerception() {
			return 10 + parseInt(this.skillModifier({ ability: "wisdom", value: "perception" }));
		},
		skillModifier(skill) {
			const ability_mod = this.calcMod(this.full_entity[skill.ability]);
			const proficiency = this.entity.npc
				? this.entity.proficiency
				: this.returnProficiency(
						this.entity.level ? this.entity.level : this.calculatedLevel(this.entity.experience)
					);
			const bonus =
				this.entity.skill_modifiers && this.entity.skill_modifiers[skill.value]
					? this.entity.skill_modifiers[skill.value]
					: 0;
			const proficient = this.entity.skills ? this.entity.skills.includes(skill.value) : false;
			const expertise = this.entity.skills_expertise
				? this.entity.skills_expertise.includes(skill.value)
				: false;

			const jack_oa_trades = this.entity.skills_jack_of_all_trades;

			return calc_skill_mod(ability_mod, proficiency, bonus, proficient, expertise, jack_oa_trades);
		},
	},
};
</script>

<style lang="scss" scoped>
// Defenses from effects, marked like other values changed by effects
.effect-modified-value.modified {
	color: $blue;
	font-weight: bold;
}
.stats .value.clickable {
	cursor: pointer;

	&:hover {
		background-color: $neutral-4;
	}
}
.card-details {
	&__top {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-bottom: 5px;

		&-title {
			min-width: 0;

			.entity-name {
				font-weight: bold;
			}
			.subtitle {
				color: $neutral-2;
				font-size: 13px;
			}
		}
	}
	.entity-effects {
		border-bottom: solid 1px $neutral-5;
		padding-bottom: 5px;
	}
	&__skills-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	&__abilities {
		columns: 2;
		margin-bottom: 15px;

		&-header {
			display: flex;
			justify-content: space-between;

			&:before {
				content: "";
				display: block;
				width: 100%;
			}
			> div {
				width: 100%;
				text-align: center;
				font-size: 13px;

				&.placeholder {
					column-span: 2;
				}
			}
		}
		.ability {
			display: flex;
			justify-content: space-evenly;
			gap: 1px;
			line-height: 30px;
			margin-bottom: 3px;

			> div,
			> button {
				width: 100%;
			}
			button {
				background-color: $neutral-5;
				transition: all 0.2s linear;
				font-weight: bold;
				&:hover {
					background-color: $neutral-4;

					&.advantage {
						color: $green;
					}
					&.disadvantage {
						color: $red;
					}
				}
			}
			&__score {
				background-color: $neutral-9;
				text-align: center;
				border-bottom-left-radius: $border-radius;
				border-top-left-radius: $border-radius;

				&.clickable {
					cursor: pointer;

					&:hover {
						background-color: $neutral-8;
					}
				}
			}
			&__save {
				border-bottom-right-radius: $border-radius;
				border-top-right-radius: $border-radius;
			}
		}
	}
	&__summary {
		padding: 12px 0;
		border-top: solid 1px $neutral-5;
		border-bottom: solid 1px $neutral-5;
	}
}
</style>
