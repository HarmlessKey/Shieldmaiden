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
					<div class="value">
						<hk-icon :icon="stat.icon" class="mr-1" />
						<template v-if="key === 'maxHp'">
							<hk-animated-integer :value="displayStats(full_entity).curHp" class="ml-1" /> /
						</template>
						{{ displayStats(full_entity)[key] }}
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
					<div class="ability__score">{{ full_entity[ability] ?? 10 }}</div>
					<hk-roll
						v-for="type in ['mod', 'save']"
						:key="type"
						class="pointer"
						:class="`ability__${type}`"
						:roll="{
							d: 20,
							n: 1,
							m: modifier(ability, type),
							title: `${ability.capitalize()} check`,
							entity_name: full_entity.name.capitalizeEach(),
							notify: true,
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
						{{
							modifier(ability, type) > 0 ? `+${modifier(ability, type)}` : modifier(ability, type)
						}}
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
			<template
				v-if="full_entity.damage_vulnerabilities && full_entity.damage_vulnerabilities.length > 0"
			>
				<strong class="neutral-2">Damage vulnerabilities</strong>
				{{ defensesDisplay(full_entity.damage_vulnerabilities).join(", ") }}<br />
			</template>
			<template v-if="full_entity.damage_resistances && full_entity.damage_resistances.length > 0">
				<strong class="neutral-2">Damage resistances</strong>
				{{ defensesDisplay(full_entity.damage_resistances).join(", ") }}<br />
			</template>
			<template v-if="full_entity.damage_immunities && full_entity.damage_immunities.length > 0">
				<strong class="neutral-2">Damage immunities</strong>
				{{ defensesDisplay(full_entity.damage_immunities).join(", ") }}<br />
			</template>
			<template
				v-if="full_entity.condition_immunities && full_entity.condition_immunities.length > 0"
			>
				<strong class="neutral-2">Condition immunities</strong>
				{{ full_entity.condition_immunities.join(", ") }}<br />
			</template>

			<strong class="neutral-2">Senses</strong>
			<template v-if="full_entity.senses">
				<span v-for="(sense, key) in full_entity.senses" :key="key">
					{{ key }} {{ sense.range ? `${sense.range} ft.` : ``
					}}{{ sense.comments ? `${sense.comments}` : `` }},
				</span>
			</template>
			passive perception {{ passivePerception() }}<br />

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

		<h3 class="label">Skills</h3>
		<CardSkills :entity="full_entity" :skill-modifier="skillModifier" />
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { abilities, skills } from "src/utils/generalConstants";
import { calc_mod, calc_skill_mod } from "src/utils/generalFunctions";
import { monsterMixin } from "src/mixins/monster.js";
import { experience } from "src/mixins/experience";
import { displayStats } from "src/utils/entityFunctions";
import Effects from "../effects";
import Avatar from "../Avatar.vue";
import Name from "../Name.vue";
import CardSkills from "./CardSkills.vue";

export default {
	name: "CardDetails",
	mixins: [monsterMixin, experience],
	components: {
		Effects,
		Avatar,
		Name,
		CardSkills,
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
				},
				maxHp: {
					icon: "fas fa-heart",
					label: "Hit Points",
				},
				speed: {
					icon: "fas fa-running",
					label: "Walk Speed",
				},
				initiative_bonus: {
					icon: "fas fa-chevron-double-up",
					label: "Initiative",
				},
			},
			calc_mod,
			displayStats,
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
	},
	methods: {
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
