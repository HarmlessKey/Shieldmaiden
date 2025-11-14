<template>
	<div
		class="py-1 actor"
		ref="entity"
		:class="{ smallWidth: is_small }"
		v-if="!entity.no_linked_npc"
	>
		<template v-if="!current">
			<h2>
				{{ entity.name.capitalizeEach() }}
				<small v-if="entity.source">{{ entity.source }}</small>
			</h2>
			<em>
				<template v-if="entity.size">{{ entity.size }}</template>
				<template v-if="entity.type"> {{ entity.type }}</template>
				<span v-if="entity.subtype">({{ entity.subtype }})</span>
				<template v-if="entity.alignment">, {{ entity.alignment }}</template>
			</em>
			<hr />
			<p>
				<template v-if="entity.entityType === 'player'">
					<strong>Level</strong>:
					<span> {{ entity.level || calculatedLevel(entity.experience) }}</span
					><br />
				</template>
				<strong>Armor Class</strong>:
				<span> {{ entity.armor_class ? entity.armor_class : entity.ac }}</span
				><br />
				<template>
					<strong>Hit Points</strong>:
					<span> {{ entity.hit_points ? entity.hit_points : entity.maxHp }}</span>
				</template>
				<template v-if="entity.hit_dice">
					{{ entity.hit_dice ? `(${hitDiceStr(data)})` : "" }}</template
				>
				<template v-if="entity.old || entity.entityType === 'player'">
					<template v-if="entity.speed">
						<br /><strong>Speed</strong>:
						<span> {{ entity.speed }}</span>
					</template>
					<template v-if="entity.initiative_bonus">
						<br /><strong>Initiative</strong>:
						<span>
							{{
								entity.initiative_bonus > 0
									? `+${entity.initiative_bonus}`
									: entity.initiative_bonus
							}}</span
						>
					</template>
				</template>
				<template v-else>
					<br /><strong>Speed</strong>: {{ entity.walk_speed ? entity.walk_speed : 0 }} ft.{{
						entity.swim_speed ? `, swim ${entity.swim_speed} ft.` : ``
					}}{{ entity.fly_speed ? `, fly ${entity.fly_speed} ft.` : ``
					}}{{ entity.burrow_speed ? `, burrow ${entity.burrow_speed} ft.` : ``
					}}{{ entity.climb_speed ? `, climb ${entity.climb_speed} ft.` : `` }}
				</template>
			</p>
			<hr />
			<div class="abilities">
				<hk-roll
					v-for="(ability, index) in abilities"
					:key="index"
					tooltip="Roll"
					:roll="{
						d: 20,
						n: 1,
						m: modifier(data[ability]),
						title: `${ability.capitalize()} check`,
						entity_name: entity.name.capitalizeEach(),
						notify: true,
					}"
					:share="
						shares.includes('ability_rolls')
							? {
									encounter_id: encounterId,
									entity_key: entity.key,
								}
							: null
					"
				>
					<div v-if="data[ability]" class="ability">
						<div class="abilityName">{{ ability.substring(0, 3).toUpperCase() }}</div>
						{{ data[ability] }}
						({{
							modifier(data[ability]) > 0 ? `+${modifier(data[ability])}` : modifier(data[ability])
						}})
					</div>
				</hk-roll>
			</div>
			<hr />

			<p v-if="!entity.old && entity.entityType !== 'player'">
				<template v-if="entity.saving_throws">
					<strong>Saving Throws </strong>
					<span class="saves">
						<hk-roll
							tooltip="Roll save"
							v-for="ability in entity.saving_throws"
							:key="ability"
							:roll="{
								d: 20,
								n: 1,
								m: calcMod(data[ability]) + entity.proficiency,
								title: `${ability.capitalize()} save`,
								entity_name: entity.name.capitalizeEach(),
								notify: true,
							}"
							:share="
								shares.includes('save_rolls')
									? {
											encounter_id: encounterId,
											entity_key: entity.key,
										}
									: null
							"
						>
							<span class="save"
								>{{ ability.substring(0, 3).capitalize() }} +{{
									calcMod(data[ability]) + entity.proficiency
								}}</span
							>
						</hk-roll>
					</span>
					<br />
				</template>
				<template v-if="entity.skills">
					<strong>Skills </strong>
					<span class="saves">
						<hk-roll
							v-for="skill in entity.skills"
							:key="skill"
							:tooltip="`Roll ${skill}`"
							:roll="{
								d: 20,
								n: 1,
								m: skillModifier(skillList[skill].ability, skill),
								title: `${skill} check`,
								entity_name: entity.name.capitalizeEach(),
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
							<span class="save"
								>{{ skill }} {{ skillModifier(skillList[skill].ability, skill) }}</span
							>
						</hk-roll>
					</span>
					<br />
				</template>
				<template v-if="entity.damage_vulnerabilities && entity.damage_vulnerabilities.length > 0">
					<strong>Damage vulnerabilities</strong>
					{{ defensesDisplay(entity.damage_vulnerabilities).join(", ") }}<br />
				</template>
				<template v-if="entity.damage_resistances && entity.damage_resistances.length > 0">
					<strong>Damage resistances</strong>
					{{ defensesDisplay(entity.damage_resistances).join(", ") }}<br />
				</template>
				<template v-if="entity.damage_immunities && entity.damage_immunities.length > 0">
					<strong>Damage immunities</strong>
					{{ defensesDisplay(entity.damage_immunities).join(", ") }}<br />
				</template>
				<template v-if="entity.condition_immunities && entity.condition_immunities.length > 0">
					<strong>Condition immunities</strong>
					{{ entity.condition_immunities.join(", ") }}<br />
				</template>

				<strong>Senses</strong>
				<template v-if="entity.senses">
					<span v-for="(sense, key) in entity.senses" :key="key">
						{{ key }} {{ sense.range ? `${sense.range} ft.` : ``
						}}{{ sense.comments ? `${sense.comments}` : `` }},
					</span>
				</template>
				passive Perception {{ passivePerception() }}<br />

				<template v-if="entity.languages && entity.languages.length > 0"
					><strong>Languages</strong> {{ entity.languages.join(", ") }}<br
				/></template>
				<template v-if="entity.challenge_rating">
					<strong>Challenge Rating</strong> {{ entity.challenge_rating }} ({{
						monster_challenge_rating[entity.challenge_rating].xp | numeral("0,0")
					}}
					XP)<br />
				</template>
			</p>

			<!-- SKILLS -->
			<template v-if="!entity.old">
				<h3>Skills</h3>
				<div class="playerSkills">
					<hk-roll
						v-for="(skill, key) in skillList"
						:key="key"
						tooltip="Roll"
						:roll="{
							d: 20,
							n: 1,
							m: skillModifier(skill, key),
							title: `${skill.skill} check`,
							entity_name: entity.name.capitalizeEach(),
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
						<span class="playerSkill">
							<span class="truncate">
								<template v-if="entity.skills && entity.skills.includes(key)">
									<i
										aria-hidden="true"
										v-if="entity.skills_expertise && entity.skills_expertise.includes(key)"
										class="far fa-dot-circle"
									></i>
									<i aria-hidden="true" v-else class="fas fa-circle"></i>
								</template>
								<i aria-hidden="true" v-else class="far fa-circle"></i>
								{{ skill.skill }}
							</span>
							<span>{{ skillModifier(skill, key) }}</span>
						</span>
					</hk-roll>
				</div>
				<hr />
			</template>
		</template>

		<!-- SPELLCASTING -->
		<template v-if="entity.caster_ability">
			<p v-if="!current">
				<strong><em> Spellcasting </em></strong>
				The {{ entity.name.capitalizeEach() }} is a {{ entity.caster_level | numeral("Oo") }}-level
				spellcaster. its spellcasting ability is {{ entity.caster_ability.capitalize() }} (spell
				save DC {{ entity.caster_save_dc }},
				{{
					entity.caster_spell_attack > 0
						? `+${entity.caster_spell_attack}`
						: entity.caster_spell_attack
				}}
				to hit with spell attacks). The {{ entity.name.capitalizeEach() }} has the following spells
				prepared:
			</p>
			<template v-else>
				<div class="caster-info">
					<div>
						<div>Casting ability</div>
						<div class="value">{{ entity.caster_ability.substring(0, 3).toUpperCase() }}</div>
					</div>
					<div class="mx-3">
						<div>Save DC</div>
						<div class="value">{{ entity.caster_save_dc }}</div>
					</div>
					<div>
						<div>Attack modifier</div>
						<div class="value">
							{{
								entity.caster_spell_attack > 0
									? `+${entity.caster_spell_attack}`
									: entity.caster_spell_attack
							}}
						</div>
					</div>
				</div>
				<strong><em>Spells</em></strong
				><br />
			</template>
			<p>
				<template v-for="level in caster_spell_levels">
					<div :key="`spell-${level}`">
						<template v-if="level === 0"> Cantrips (at will): </template>
						<template v-else>
							{{ level | numeral("Oo") }} level ({{ entity.caster_spell_slots[level] }} slots):
						</template>
						<i aria-hidden="true" v-for="(spell, index) in spellsForLevel(level)" :key="spell.name">
							<hk-popover>
								{{ spell.name }}
								<template #content> <Spell :id="spell.key" /> </template
							></hk-popover>
							<!-- eslint-disable-next-line vue/no-parsing-error -->
							{{ index + 1 < spellsForLevel(level).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>

		<!-- INNATE SPELLCASTING -->
		<template v-if="entity.innate_ability">
			<p v-if="!current">
				<strong><em> Innate spellcasting </em></strong>
				The {{ entity.name.capitalizeEach() }}'s innate spellcasting ability is
				{{ entity.innate_ability.capitalize() }} (spell save DC {{ entity.innate_save_dc }},
				{{
					entity.innate_spell_attack > 0
						? `+${entity.innate_spell_attack}`
						: entity.innate_spell_attack
				}}
				to hit with spell attacks). The {{ entity.name.capitalizeEach() }} can cast the following
				spells, requiring no material components:
			</p>
			<template v-else>
				<div class="caster-info">
					<div>
						<div>Innate ability</div>
						<div class="value">{{ entity.innate_ability.substring(0, 3).toUpperCase() }}</div>
					</div>
					<div class="mx-3">
						<div>Save DC</div>
						<div class="value">{{ entity.innate_save_dc }}</div>
					</div>
					<div>
						<div>Attack modifier</div>
						<div class="value">
							{{
								entity.innate_spell_attack > 0
									? `+${entity.innate_spell_attack}`
									: entity.innate_spell_attack
							}}
						</div>
					</div>
				</div>
				<strong><em>Innate spells</em></strong
				><br />
			</template>
			<p>
				<template v-for="limit in innate_spell_levels">
					<div :key="`spell-${limit}`">
						<template v-if="limit === Infinity"> At will: </template>
						<template v-else> {{ limit }}/day each: </template>
						<i aria-hidden="true" v-for="(spell, index) in spellsForLimit(limit)" :key="spell.name">
							<hk-popover>
								{{ spell.name }}
								<template #content>
									<Spell :id="spell.key" />
								</template>
							</hk-popover>
							<!-- eslint-disable-next-line vue/no-parsing-error -->
							{{ index + 1 < spellsForLimit(limit).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>
		<CardActions v-if="current_actor.entityType !== 'player'" :entity="current_actor" />
		<q-resize-observer @resize="setSize" />
	</div>
	<div v-else>
		There is no monster card for this entity.<br />
		It was probably added during the encounter without linking a monster to it.
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { general } from "src/mixins/general.js";
import { dice } from "src/mixins/dice.js";
import { monsterMixin } from "src/mixins/monster.js";
import { experience } from "src/mixins/experience.js";
import { abilities, skills } from "src/utils/generalConstants";
import Spell from "src/components/compendium/Spell";
import { calc_skill_mod } from "src/utils/generalFunctions";
import CardActions from "./entities/Card/CardActions.vue";

export default {
	name: "ViewEntity",
	mixins: [general, dice, experience, monsterMixin],
	components: {
		Spell,
		CardActions,
	},
	props: {
		data: {
			type: Object,
			required: true,
		},
		current: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			is_small: false,
			abilities: abilities,
			skillList: skills,
			width: 0,
		};
	},
	computed: {
		...mapGetters(["encounterId", "broadcast"]),
		current_actor() {
			return this.data;
		},
		shares() {
			return this.broadcast.shares || [];
		},
		entity() {
			let entity = JSON.parse(JSON.stringify(this.data));
			if (entity.entityType === "npc" && !entity.no_linked_npc && !entity.proficiency) {
				entity.proficiency = this.monster_challenge_rating[entity.challenge_rating].proficiency;
			}
			return entity;
		},
		spellCasting() {
			let casting = [];
			if (this.entity.innate_ability)
				casting.push({
					name: "innate",
					label: "Innate spellcasting",
				});
			if (this.entity.caster_ability)
				casting.push({
					name: "caster",
					label: "Spellcasting",
				});
			return casting;
		},
		caster_spell_levels() {
			if (this.entity.caster_spells) {
				let levels = [];
				for (const spell of Object.values(this.entity.caster_spells)) {
					if (!levels.includes(spell.level)) levels.push(spell.level);
				}
				return levels.sort();
			}
			return [];
		},
		innate_spell_levels() {
			if (this.entity.innate_spells) {
				let levels = [];
				for (const spell of Object.values(this.entity.innate_spells)) {
					const limit = spell.limit ? spell.limit : Infinity;
					if (!levels.includes(limit)) levels.push(limit);
				}
				levels = levels.sort();
				return levels.reverse();
			}
			return [];
		},
	},
	methods: {
		...mapActions(["setActionRoll", "set_limitedUses"]),
		setSize(size) {
			let width = size.width;
			let small = 310;

			this.is_small = width <= small ? true : false;

			//sets new width on resize
			this.width = width;
		},
		modifier(score) {
			return Math.floor((score - 10) / 2);
		},
		passivePerception() {
			return 10 + parseInt(this.skillModifier("wisdom", "perception"));
		},
		skillModifier(skill, key) {
			const ability_mod = this.calcMod(this.data[skill.ability]);
			const proficiency = this.returnProficiency(
				this.entity.level ? this.entity.level : this.calculatedLevel(this.entity.experience)
			);
			const bonus =
				this.entity.skill_modifiers && this.entity.skill_modifiers[skill]
					? this.entity.skill_modifiers[skill]
					: 0;
			const proficient = this.entity.skills ? this.entity.skills.includes(key) : false;
			const expertise = this.entity.skills_expertise
				? this.entity.skills_expertise.includes(key)
				: false;

			const jack_oa_trades = this.entity.skills_jack_of_all_trades;

			return calc_skill_mod(ability_mod, proficiency, bonus, proficient, expertise, jack_oa_trades);
		},
		spellsForLevel(level) {
			return Object.entries(this.entity.caster_spells)
				.filter(([key, item]) => {
					item.key = key;
					return item.level == level;
				})
				.map((item) => {
					return item[1];
				});
		},
		spellsForLimit(limit) {
			return Object.entries(this.entity.innate_spells)
				.filter(([key, item]) => {
					item.key = key;
					if (item.limit === 0) item.limit = Infinity;
					return item.limit == limit;
				})
				.map((item) => {
					return item[1];
				});
		},
	},
};
</script>

<style lang="scss" scoped>
h2 {
	margin-bottom: 5px !important;

	small {
		font-size: 12px;
	}
}
h3 {
	text-transform: none;
	font-weight: bold !important;
	border-bottom: solid 1px $neutral-4;
	padding-bottom: 3px;
}
a {
	color: $neutral-2 !important;
}
.abilities {
	user-select: none;
	display: grid;
	grid-template-columns: repeat(6, 40px);
	grid-column-gap: 15px;
	text-align: center;
	font-size: 12px;
	max-width: 650px;

	.abilityName {
		font-size: 15px;
		font-weight: bold;
	}
	.ability {
		cursor: pointer;
	}
	.advantage .ability:hover {
		color: $green;
	}
	.disadvantage .ability:hover {
		color: $red;
	}
}
.caster-info {
	text-align: center;
	display: flex;
	justify-content: center;
	margin-bottom: 15px;

	.value {
		font-size: 18px;
		font-weight: bold;
		color: $neutral-1;
	}
}

.playerSkills {
	user-select: none;
	column-count: 3;
	column-gap: 20px;
	column-rule: 1px solid $neutral-5;

	.hk-roll {
		width: 100%;
	}
	.playerSkill {
		display: flex;
		gap: 5px;
		cursor: pointer;
		width: 100%;
		text-align: left;

		.truncate {
			min-width: 0;
			flex-grow: 1;
		}
		&:hover {
			color: $neutral-1;
		}
		i {
			&.fa-circle {
				margin: 0 3px;
				font-size: 6px;
				vertical-align: 2px;
			}
		}
	}
	.advantage .playerSkill:hover {
		color: $green;
	}
	.disadvantage .playerSkill:hover {
		color: $red;
	}
}
.skills .skill,
.saves .hk-roll {
	&::after {
		content: ",";
		padding-right: 5px;
	}
	&:last-child::after {
		content: "";
		padding: 0;
	}
}
.saves {
	user-select: none;

	.save {
		cursor: pointer;
	}
	.advantage .save:hover {
		color: $green;
	}
	.disadvantage .save:hover {
		color: $red;
	}
}
.smallWidth {
	.abilities {
		grid-template-columns: repeat(3, auto);
		grid-template-rows: auto auto;
		grid-row-gap: 15px;
	}
	.playerSkills {
		column-count: 2;
	}
}
</style>
