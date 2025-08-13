<template>
	<div v-if="!loading" class="monster-card__wrapper">
		<hk-compendium-image :value="monster.url" size="large" :icon="false" />
		<div ref="card" class="monster-card">
			<h1 v-if="monster.name">
				{{ monster.name.capitalizeEach() }}
			</h1>
			<div class="monster-card__subtitle">
				<template v-if="monster.size">{{ monster.size }}</template>
				<template v-if="monster.type"> {{ monster.type }}</template>
				<span v-if="monster.subtype"> ({{ monster.subtype }})</span>
				<template v-if="monster.alignment">, {{ monster.alignment?.capitalizeEach() }}</template>
			</div>
			<div class="monster-card__attributes">
				<div>
					<strong>AC </strong> {{ monster.armor_class || monster.ac }}
					<span class="ml-2">
						<strong>Initiative </strong> {{ monster.dexterity > 10 ? `+${calcMod(monster.dexterity)}` : calcMod(monster.dexterity) }}
						({{ 10 + calcMod(monster.dexterity) }})
					</span>
				</div>
				<div>
					<strong>HP</strong> {{ monster.hit_points || monster.maxHp }}
					<template v-if="monster.hit_dice">
						({{ monster.hit_dice ? hitDiceStr(monster) : "" }})
					</template>
				</div>
				<div>
					<strong>Speed</strong> {{ monster.walk_speed ? monster.walk_speed : 0 }} ft.{{
						monster.swim_speed ? `, swim ${monster.swim_speed} ft.` : ``
					}}{{ monster.fly_speed ? `, fly ${monster.fly_speed} ft.` : ``
					}}{{ monster.burrow_speed ? `, burrow ${monster.burrow_speed} ft.` : ``
					}}{{ monster.climb_speed ? `, climb ${monster.climb_speed} ft.` : `` }}
				</div>
			</div>
			<div class="d-flex gap-1 mb-4">	
				<table
					v-for="table in [0, 1]"
					:key="`table-${table}`" 
					class="monster-card__abilities" 
					:class="table === 0 ? 'left' : 'right'">
					<tr>
						<th colspan="2"></th>
						<th>mod</th>
						<th>save</th>
					</tr>
					<tr v-for="(ability, index) in abilities.slice(table*3, table*3+3)" :class="`ability ability__${ability}`" :key="index">
						<td class="ability__label">{{ ability2str(ability.toUpperCase()) }}</td>
						<td  class="ability__score">{{ monster[ability] }}</td>
						<td class="mod">			
							<hk-roll
								:roll="{
									d: 20,
									n: 1,
									m: calcMod(monster[ability]),
									title: `${ability.capitalize()} check`,
									entity_name: monster.name.capitalizeEach(),
									notify: true,
								}"
								:share="
									shares.includes('ability_rolls')
										? {
												encounter_id: encounterId,
												entity_key: monster.key,
											}
										: null
								"
							>
								{{ mod2str(calcMod(monster[ability])) }}
							</hk-roll>
						</td>
						<td class="save">
							<hk-roll
								:roll="{
									d: 20,
									n: 1,
									m: monster.saving_throws.includes(ability) ? calcMod(monster[ability]) + monster.proficiency : calcMod(monster[ability]),
									title: `${ability.capitalize()} save`,
									entity_name: monster.name.capitalizeEach(),
									notify: true,
								}"
								:share="
									shares.includes('ability_rolls')
										? {
												encounter_id: encounterId,
												entity_key: monster.key,
											}
										: null
								"
							>
								{{ mod2str(monster.saving_throws.includes(ability) ? calcMod(monster[ability]) + monster.proficiency : calcMod(monster[ability])) }}
							</hk-roll>
						</td>
					</tr>
				</table>
			</div>
	
			<div class="monster-card__stats">
				<template v-if="monster.skills?.length > 0"
					><strong>Skills </strong>
					<hk-roll
						v-for="skill, index in monster.skills"
						:key="skill"
						:tooltip="`Roll ${skill}`"
						:roll="{
							d: 20,
							n: 1,
							m: skillModifier(skillList[skill].ability, skill),
							title: `${skill} check`,
							entity_name: monster.name.capitalizeEach(),
							notify: true,
						}"
						:share="
							shares.includes('skill_rolls')
								? {
										encounter_id: encounterId,
										entity_key: monster.key,
									}
								: null
						"
					>
						<span>{{ skill.capitalize() }}</span>
						<span>
							{{ mod2str(skillModifier(skillList[skill].ability, skill)) }}{{ 
								index + 1 &lt; monster.skills.length ? "," : ""
							}}
						</span>
					</hk-roll>
				</template>
				<div
					v-if="monster.damage_vulnerabilities && monster.damage_vulnerabilities.length > 0"
				>
					<strong>Damage vulnerabilities</strong>
					{{ defensesDisplay(monster.damage_vulnerabilities).join(", ") }}
				</div>
				<div v-if="monster.damage_resistances && monster.damage_resistances.length > 0">
					<strong>Damage resistances</strong>
					{{ defensesDisplay(monster.damage_resistances).join(", ") }}
				</div>
				<div v-if="monster.damage_immunities && monster.damage_immunities.length > 0">
					<strong>Damage immunities</strong>
					{{ defensesDisplay(monster.damage_immunities).join(", ") }}
				</div>
				<div v-if="monster.condition_immunities && monster.condition_immunities.length > 0">
					<strong>Condition immunities</strong> {{ monster.condition_immunities.join(", ") }}
				</div>
				
				<div>
					<strong>Senses</strong>
					<template v-if="monster.senses">
						<span v-for="(sense, key) in monster.senses" :key="key">
							{{ key }} {{ sense.range ? `${sense.range} ft.` : ``
							}}{{ sense.comments ? `${sense.comments}` : `` }},
						</span>
					</template>
					Passive Perception {{ passivePerception() }}
				</div>
	
				<div v-if="monster.languages && monster.languages.length > 0">
					<strong>Languages</strong> {{ monster.languages.join(", ") }}
				</div>
				<div v-if="monster.challenge_rating">
					<strong>Challenge Rating</strong> {{ monster.challenge_rating }} ({{
						monster_challenge_rating[monster.challenge_rating].xp | numeral("0,0")
					}}
					XP; <template v-if="monster.challenge_rating">PB +{{ monster.proficiency }}</template>)
				</div>	
			</div>
	
			<!-- <h3>Skills</h3>
			<div class="skills">
				<hk-roll
					v-for="(skill, key) in skillList"
					class="d-block"
					:key="key"
					:tooltip="`Roll ${key}`"
					:roll="{
						d: 20,
						n: 1,
						m: skillModifier(skill.ability, key),
						title: `${skill.skill} check`,
						entity_name: monster.name.capitalizeEach(),
						notify: true,
					}"
					:share="
						shares.includes('skill_rolls')
							? {
									encounter_id: encounterId,
									entity_key: monster.key,
								}
							: null
					"
				>
					<span class="skill">
						<span class="truncate">
							<template v-if="monster.skills && monster.skills.includes(key)">
								<i
									aria-hidden="true"
									v-if="monster.skills_expertise && monster.skills_expertise.includes(key)"
									class="far fa-dot-circle"
								></i>
								<i aria-hidden="true" v-else class="fas fa-circle"></i>
							</template>
							<i aria-hidden="true" v-else class="far fa-circle"></i>
							{{ skill.skill }}
						</span>
						<span>{{ mod2str(skillModifier(skill.ability, key)) }}</span>
					</span>
				</hk-roll>
			</div> -->
	
	
			<!-- SPELLCASTING -->
			<template v-if="monster.caster_ability">
				<p>
					<strong><em> Spellcasting </em></strong>
					The {{ monster.name.capitalizeEach() }} is a
					{{ monster.caster_level | numeral("Oo") }}-level spellcaster. its spellcasting ability
					is {{ monster.caster_ability.capitalize() }} (spell save DC
					{{ monster.caster_save_dc }},
					{{
						monster.caster_spell_attack > 0
							? `+${monster.caster_spell_attack}`
							: monster.caster_spell_attack
					}}
					to hit with spell attacks). The {{ monster.name.capitalizeEach() }} has the following
					spells prepared:
				</p>
				<p>
					<template v-for="level in caster_spell_levels">
						<div :key="`spell-${level}`">
							<template v-if="level === 0"><strong>Cantrips</strong> (at will): </template>
							<template v-else>
								<strong>{{ level | numeral("Oo") }} level</strong> ({{ monster.caster_spell_slots[level] }} slots):
							</template>
							<i
								aria-hidden="true"
								v-for="(spell, index) in spellsForLevel(level)"
								:key="spell.name"
							>
								<hk-popover>
									{{ spell.name }}<Spell slot="content" :id="spell.key" />
								</hk-popover
								>{{ index + 1 &lt; spellsForLevel(level).length ? "," : "" }}
							</i>
						</div>
					</template>
				</p>
			</template>
	
			<!-- INNATE SPELLCASTING -->
			<template v-if="monster.innate_ability">
				<p>
					<strong><em> Innate spellcasting </em></strong>
					The {{ monster.name.capitalizeEach() }}'s innate spellcasting ability is
					{{ monster.innate_ability.capitalize() }} (spell save DC {{ monster.innate_save_dc }},
					{{
						monster.innate_spell_attack > 0
							? `+${monster.innate_spell_attack}`
							: monster.innate_spell_attack
					}}
					to hit with spell attacks). The {{ monster.name.capitalizeEach() }} can cast the
					following spells, requiring no material components:
				</p>
				<p>
					<template v-for="limit in innate_spell_levels">
						<div :key="`spell-${limit}`">
							<template v-if="limit === Infinity"> At will: </template>
							<template v-else> {{ limit }}/day each: </template>
							<i
								aria-hidden="true"
								v-for="(spell, index) in spellsForLimit(limit)"
								:key="spell.name"
							>
								<hk-popover>
									{{ spell.name }}
									<template #content>
										<Spell :id="spell.key" />
									</template> </hk-popover
								>{{ index + 1 &lt; spellsForLimit(limit).length ? "," : "" }}
							</i>
						</div>
					</template>
				</p>
			</template>
	
			
			<div class="monster-card__traits">
				<div v-for="{ category, name } in actions" :key="category">
					<template v-if="monster[category] && monster[category].length > 0">
						<h2>{{ name }}</h2>
						<p v-if="monster.legendary_count && category === 'legendary_actions'" class="monster-card__traits-legendary">
							Legendary Action Uses: {{ monster.legendary_count }}. 
							Immediately after another creature's turn, the {{ monster.name.capitalizeEach() }} can expend a use to take one of the following actions. 
							The {{ monster.name.capitalizeEach() }} regains all expended uses at the start of each of its turns.
						</p>
						<template v-for="(ability, index) in monster[category]">
							<hk-dice-text
								v-if="ability.desc"
								:key="`${category}-${index}`"
								class="monster-card__traits-description"
								:input_text="ability.desc"><template
									v-if="
										ability.action_list &&
										ability.action_list[0] &&
										ability.action_list[0].type !== 'other' &&
										ability.action_list[0].rolls &&
										ability.action_list[0].rolls.length
									"
								><hk-roll-action :tooltip="`Roll ${ability.name}`" :action="ability"><span class="roll-button" 
									/></hk-roll-action></template><span class="monster-card__traits-description__title">{{ ability.name }}{{
											ability.recharge
												? ` (Recharge ${
														ability.recharge === "rest"
															? "after a Short or Long Rest"
															: ability.recharge
													})`
												: ``
										}}{{
											ability.limit
												? ` (${ability.limit}/${
														ability.limit_type ? ability.limit_type.capitalize() : `Day`
													})`
												: ``
										}}{{
											ability.legendary_cost > 1 ? ` (Costs ${ability.legendary_cost} Actions)` : ``
										}}. </span></hk-dice-text>
						</template>
					</template>
				</div>
			</div>
			
			<div v-if="monster.source || monster.environment" class="mt-4">
				<span v-if="monster.source">
					<strong>Source:</strong> {{ monster.source }}
				</span>		
				<template v-if="monster.environment?.length" class="mt-3">
					<strong>Environment:</strong> {{ monster.environment.join(", ").capitalizeEach() }}
				</template>
			</div>
		</div>
		<button class="btn" @click="generatePDF">Download PDF</button>
	</div>
	<hk-loader v-else name="monster" />
</template>

<script>
import { general } from "src/mixins/general.js";
import { dice } from "src/mixins/dice.js";
import { monsterMixin } from "src/mixins/monster.js";
import { mapActions, mapGetters } from "vuex";
import Spell from "src/components/compendium/Spell";
import { skills, abilities } from "src/utils/generalConstants";
import { calc_skill_mod } from "src/utils/generalFunctions";

export default {
	name: "ViewMonster",
	mixins: [general, dice, monsterMixin],
	components: {
		Spell,
	},
	props: {
		// If the monster is fetched in a parent component you can send the full monster object in de data prop
		data: {
			type: Object,
		},
		// If the id prop is passed, the monster is fetched in the Monster component
		id: {
			type: String,
		},
	},
	data() {
		return {
			monster: {},
			loading: true,
			abilities: abilities,
			skillList: skills,
			actions: [
				{
					category: "special_abilities",
					name: "Traits",
					name_single: "Trait",
				},
				{ category: "actions", name: "Actions", name_single: "Action" },
				{
					category: "legendary_actions",
					name: "Legendary Actions",
					name_single: "Legendary action",
				},
				{ category: "reactions", name: "Reactions", name_single: "Reaction" },
			],
		};
	},
	async beforeMount() {
		if (this.data) {
			let monster = this.data;
			if (this.monster_challenge_rating[monster.challenge_rating]) {
				monster.proficiency = this.monster_challenge_rating[monster.challenge_rating].proficiency;
			}
			this.monster = monster;
			this.loading = false;
		} else {
			await this.fetch_monster(this.id).then((result) => {
				if (this.monster_challenge_rating[result.challenge_rating]) {
					result.proficiency = this.monster_challenge_rating[result.challenge_rating].proficiency;
				}
				this.monster = result;
				this.loading = false;
			});
		}
	},
	computed: {
		...mapGetters(["encounterId", "broadcast"]),
		shares() {
			return this.broadcast.shares || [];
		},
		caster_spell_levels() {
			if (this.monster.caster_spells) {
				let levels = [];
				for (const spell of Object.values(this.monster.caster_spells)) {
					if (!levels.includes(spell.level)) levels.push(spell.level);
				}
				return levels.sort();
			}
			return [];
		},
		innate_spell_levels() {
			if (this.monster.innate_spells) {
				let levels = [];
				for (const spell of Object.values(this.monster.innate_spells)) {
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
		...mapActions("api_monsters", ["fetch_monster"]),
		passivePerception() {
			return 10 + parseInt(this.skillModifier("wisdom", "perception"));
		},
		spellsForLevel(level) {
			return Object.entries(this.monster.caster_spells)
				.filter(([key, spell]) => {
					spell.key = key;
					return spell.level == level;
				})
				.map((item) => {
					return item[1];
				});
		},
		spellsForLimit(limit) {
			return Object.entries(this.monster.innate_spells)
				.filter(([key, spell]) => {
					spell.key = key;
					if (spell.limit === 0) spell.imit = Infinity;
					return spell.limit == limit;
				})
				.map((item) => {
					return item[1];
				});
		},
		skillModifier(ability, skill) {
			const ability_mod = this.calcMod(this.monster[ability]);
			const proficiency = this.monster.challenge_rating ? this.monster.proficiency : 0;
			const bonus =
				this.monster.skill_modifiers && this.monster.skill_modifiers[skill]
					? this.monster.skill_modifiers[skill]
					: 0;
			const proficient = this.monster.skills ? this.monster.skills.includes(skill) : false;
			const expertise = this.monster.skills_expertise
				? this.monster.skills_expertise.includes(skill)
				: false;

			return calc_skill_mod(ability_mod, proficiency, bonus, proficient, expertise);
		},
		mod2str(mod_value) {
			if (mod_value > 0) {
				return `+${mod_value}`;
			}
			return `${mod_value}`;
		},
		ability2str(ability) {
			return ability.substring(0, 3);
		},
	}
};
</script>

<style lang="scss" scoped>
.monster-card {
	color: $black;
	padding: 1em;
	font-size: 15px;

	h1, h2 {
		color: #5b160c;
		border-bottom: solid 1px #5b160c;
		margin: 0.45em 0;
	}
	h1 {
		margin-top: 0;
		font-size: 1.75em;
		line-height: 1.5em;
		column-span: all;
	}
	h2 {
		font-size: 1.3em;
		line-height: 1.5em;
		font-weight: normal;
	}
	p {
		margin-bottom: 1em;
		break-inside: avoid;
	}
	&__subtitle {
		color: #68747b;
		font-style: italic;
		margin-bottom: 1em;
	}
	&__attributes, &__stats {
		color: #5b160c;
		margin-bottom: 1em;
		line-height: 1.5em;
		break-inside: avoid;
	}
	&__abilities {
		color: #5b160c;
		margin-bottom: 0;
		font-size: inherit;
		
		tr {			
			th {
				color: #68747b;
				text-transform: uppercase;
				text-align: center;
				font-size: 0.8em;
				font-weight: normal;
				height: unset;
				padding: 0 0.3em;
			}
			td {
				text-align: center;
				height: unset;
				background-color: #ede6d9;
				padding: 0.2em 0.3em;

				&:first-child {
					font-weight: bold;
				}
				button {
					width: 100%;
				}
				&.mod, &.save {
					background-color: #ded4cc;
					cursor: pointer;
				}
			}
		}
		&.right {
			tr td {
				background-color: #d8dad1;
				&.mod, &.save {
					background-color: #d0caca;
				}
			}
		}
	}
	&__traits {
		&-description {
			margin-bottom: 1em;
			break-inside: avoid;

			&__title {
				font-weight: bold;
				font-style: italic;
			}
		}
		&-legendary {
			color: #68747b;
			font-style: italic;
			margin-bottom: 1em;
			break-inside: avoid;
		}
	}
	&__wrapper {
		container-type: inline-size;
		container-name: monster-card;
		background-color: #f5f3ee;
		background-color: #f5f3ee;

		.roll-button {
			display: inline-block;
			cursor: pointer;
			background-image: url("../../assets/_img/logo/logo-icon-no-shield-cyan.svg");
			height: 1.5em;
			width: 1.5em;
			background-position: center;
			background-size: cover;
			vertical-align: -0.35em;
			user-select: none;
			margin-right: .25em;
		}
		.advantage .roll-button:hover {
			background-image: url("../../assets/_img/logo/logo-icon-no-shield-green.svg");
		}
		.disadvantage .roll-button:hover {
			background-image: url("../../assets/_img/logo/logo-icon-no-shield-red.svg");
		}

		@container (min-width: 600px) {
			.monster-card {
				column-count: 2;
				gap: 1.5em;
			}
		}
	}
	&.download-mode {
		font-size: 15px;
		border: solid 1px #5b160c;
		border-radius: 0.5em;

		.roll-button {
			display: none;
		}

		&.columned {
			column-count: 2;
			gap: 1.5em;
		}
		&.single-column {
			font-size: 30px;
		}
		&.single-column, &.full {
			column-count: 1 !important;
		}
	}
}
</style>
