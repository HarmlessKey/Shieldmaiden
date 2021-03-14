<template>
	<div class="pb-1" ref="entity" :class="{ smallWidth: is_small }">
		<h2>
			<q-badge v-if="entity.old" label="DEPRECATED" color="red" />
			{{ entity.name.capitalizeEach() }}
			<small v-if="entity.source">{{ entity.source }}</small>
		</h2>
		<p v-if="entity.old" class="red">
			Some values might not show, or show incorrectly. 
			Please update your NPC at the
			<router-link to="/npcs">NPC's page</router-link>.
		</p>
		<i>
			<template v-if="entity.size">{{ entity.size }}</template>
			<template v-if="entity.type"> {{ entity.type }}</template>
			<span v-if="entity.subtype">({{ entity.subtype }})</span>
			<template v-if="entity.alignment">, {{ entity.alignment }}</template>
		</i>
		<hr>
		<p>
			<template v-if="entity.entityType === 'player'">
				<b>Level</b>: 
				<span> {{ entity.level || calculatedLevel(entity.experience) }}</span><br/>
			</template>
			<template v-if="entity.armor_class">
				<b>Armor Class</b>: 
				<span> {{ entity.armor_class }}</span><br/>
			</template>
			<template v-else>
				<b>Armor Class</b>: 
				<span> {{ entity.ac }}</span><br/>
			</template>
			<template v-if="entity.hit_points">
				<b>Hit Points</b>: 
				<span> {{ entity.hit_points }}</span>
			</template>
			<template v-else>
				<b>Hit Points</b>: 
				<span> {{ entity.maxHp }}</span>
			</template>
			<template v-if="entity.hit_dice"> {{ entity.hit_dice ? `(${hitDiceStr(data)})` : '' }}</template>
			<template v-if="entity.old || entity.entityType === 'player'">
				<template v-if="entity.speed">
					<br/><b>Speed</b>: 
					<span> {{ entity.speed }}</span>
				</template>
			</template>
			<template v-else>
				<br/><b>Speed</b>: {{ entity.walk_speed ? entity.walk_speed : 0 }} ft.{{ 
					entity.swim_speed ? `, swim ${entity.swim_speed} ft.` : `` 
				}}{{ 
					entity.fly_speed ? `, fly ${entity.fly_speed} ft.` : `` 
				}}{{ 
					entity.burrow_speed ? `, burrow ${entity.burrow_speed} ft.` : `` 
				}}{{ 
					entity.climb_speed ? `, climb ${entity.climb_speed} ft.` : ``
				}}
			</template>
		</p>
		<hr>
		<div class="abilities">
			<hk-roll 
				v-for="(ability, index) in abilities" 
				:key="index" 
				tooltip="Roll"
				:roll="{
					d: 20, 
					n: 1, 
					m: modifier(data[ability]),
					title: `${entity.name}: ${ability.capitalize()} check`, 
					notify: true
				}"
			>
				<div v-if="data[ability]" class="ability">
					<div class="abilityName">{{ ability.substring(0,3).toUpperCase() }}</div>
					{{ data[ability] }}
					({{ modifier(data[ability]) }})
				</div>
			</hk-roll>
		</div>
		<hr>

		<p v-if="!entity.old && entity.entityType !== 'player'">
			<template v-if="entity.saving_throws">
				<b>Saving Throws </b>
				<span class="saves">
					<hk-roll 
						tooltip="Roll save" 
						v-for="(ability, index) in entity.saving_throws" 
						:key="ability"
						:roll="{
							d: 20, 
							n: 1, 
							m: calcMod(data[ability]) + entity.proficiency,
							title: `${entity.name}: ${ability.capitalize()} save`, 
							notify: true
						}"
					>
						<span class="save">
							{{ ability.substring(0,3).capitalize() }} 
							+{{ 
								calcMod(data[ability]) + entity.proficiency 
							}}{{ 
								index+1 &lt; entity.saving_throws.length ? "," : ""
							}}
						</span>
					</hk-roll>
				</span>
				<br/>
			</template>
			<template v-if="entity.skills">
				<b>Skills</b>
				<span class="saves">
					<hk-roll 
						v-for="(skill, index) in entity.skills" 
						:key="skill" 
						:tooltip="`Roll ${skill}`"
						:roll="{
							d: 20, 
							n: 1, 
							m: skillModifier(skillList[skill].ability, skill),
							title: `${skill} check`, 
							notify: true
						}"
					>
						<span class="save">
							{{ skill }} {{ skillModifier(skillList[skill].ability, skill) }}{{ index+1 &lt; entity.skills.length ? "," : "" }}
						</span>
					</hk-roll>
					<br/>
				</span>
			</template>
			<template v-if="entity.damage_vulnerabilities && entity.damage_vulnerabilities.length > 0">
				<b>Damage vulnerabilities</b> {{ entity.damage_vulnerabilities.join(", ") }}<br/>
			</template>
			<template v-if="entity.damage_resistances && entity.damage_resistances.length > 0">
				<b>Damage resistances</b> {{ entity.damage_resistances.join(", ") }}<br/>
			</template>
			<template v-if="entity.damage_immunities && entity.damage_immunities.length > 0">
				<b>Damage immunities</b> {{ entity.damage_immunities.join(", ") }}<br/>
			</template>
			<template v-if="entity.condition_immunities && entity.condition_immunities.length > 0">
				<b>Condition immunities</b> {{ entity.condition_immunities.join(", ") }}<br/>
			</template>

			<b>Senses</b> 
			<template v-if="entity.senses">
				<span v-for="(sense, key) in entity.senses" :key="key">
					{{ key }} {{ sense.range ? `${sense.range} ft.` : `` }}{{ 
						sense.comments ? `${sense.comments}` : ``
					}},
				</span>
			</template>
			passive Perception {{ passivePerception() }}<br/>

			<template v-if="entity.languages"><b>Languages</b> {{ entity.languages.join(", ") }}<br/></template>
			<template v-if="entity.challenge_rating">
					<b>Challenge Rating</b> {{ entity.challenge_rating }} 
					({{ monster_challenge_rating[entity.challenge_rating].xp | numeral('0,0') }} XP)<br/>
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
						title: `${entity.name}: ${skill.skill} check`, 
						notify: true
					}"
				>
					<span class="playerSkill">
						<span class="truncate">
							<template v-if="entity.skills && entity.skills.includes(key)">
								<i v-if="entity.skills_expertise && entity.skills_expertise.includes(key)" class="far fa-dot-circle"></i>
								<i v-else class="fas fa-circle"></i>
							</template>
							<i v-else class="far fa-circle"></i>
							{{ skill.skill }}
						</span>
						<span>{{ skillModifier(skill, key) }}</span>
					</span>
				</hk-roll>
			</div>
			<hr>
		</template>

		<!-- SPELLCASTING -->
		<template v-if="entity.caster_ability">
			<p>
				<b><i>
					Spellcasting
				</i></b>
				The {{ entity.name.capitalizeEach() }} is a {{ entity.caster_level | numeral('Oo')}}-level spellcaster.
				It's spellcasting ability is {{ entity.caster_ability.capitalize() }}
				(spell save DC {{ entity.caster_save_dc }}, 
				{{ entity.caster_spell_attack > 0 ? `+${entity.caster_spell_attack}` : entity.caster_spell_attack }} to hit with spell attacks). 
				The {{ entity.name.capitalizeEach() }} has the following spells prepared:
			</p>
			<p>
				<template v-for="level in caster_spell_levels" >
					<div :key="`spell-${level}`">
						<template v-if="level === 0">
							Cantrips (at will):
						</template>
						<template v-else>
							{{ level | numeral('Oo') }} level ({{ entity.caster_spell_slots[level] }} slots):
						</template>
						<i v-for="(spell, index) in spellsForLevel(level)" :key="spell.name">
							{{ spell.name }}{{ index+1 &lt; spellsForLevel(level).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>

		<!-- INNATE SPELLCASTING -->
		<template v-if="entity.innate_ability">
			<p>
				<b><i>
					Innate spellcasting
				</i></b>
				The {{ entity.name.capitalizeEach() }}'s innate spellcasting ability is {{ entity.innate_ability.capitalize() }}
				(spell save DC {{ entity.innate_save_dc }}, 
				{{ entity.innate_spell_attack > 0 ? `+${entity.innate_spell_attack}` : entity.innate_spell_attack }} to hit with spell attacks). 
				The {{ entity.name.capitalizeEach() }} can cast the following spells, requiring no material components:
			</p>
			<p>
				<template v-for="limit in innate_spell_levels" >
					<div :key="`spell-${limit}`">
						<template v-if="limit === 0">
							At will:
						</template>
						<template v-else>
							{{ limit }}/day each:
						</template>
						<i v-for="(spell, index) in spellsForLimit(limit)" :key="spell.name">
							{{ spell.name }}{{ index+1 &lt; spellsForLimit(limit).length ? "," : "" }}
						</i>
					</div>
				</template>
			</p>
		</template>

		<div class="monster-actions" v-if="entity.entityType !== 'player'">
			<div v-for="{category, name} in actions" :key="category">
				<template v-if="entity[category] && entity[category].length > 0">
					<h3 v-if="category !== 'special_abilities'">{{ name }}</h3>
					<p v-if="entity.lengendary_count && category === 'legendary_actions'">
						{{ entity.name.capitalizeEach() }} can take {{ entity.lengendary_count }} legendary actions, choosing from the options below. 
						Only one legendary action option can be used at a time and only at the end of another creature’s turn. {{ entity.name }} regains spent legendary actions at the start of their turn.
					</p>
					<p v-for="(ability, index) in entity[category]" :key="`${category}-${index}`">
						<b><i>
							{{ ability.name }}
							{{ ability.recharge ? `(Recharge ${ability.recharge === 'rest' ? "after a Short or Long Rest" : ability.recharge})` : ``}}
							{{ ability.limit ? `(${ability.limit}/${ability.limit_type ? ability.limit_type.capitalize(): `Day`})` : ``}}
							{{ ability.legendary_cost > 1 ? `(Costs ${ability.legendary_cost} Actions)` : ``}}			
						</i></b>
						<hk-dice-text v-if="ability.desc" :input_text="ability.desc"/>
					</p>
				</template>
			</div>
		</div>

	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';
	import { skills } from '@/mixins/skills.js';
	import { monsterMixin } from '@/mixins/monster.js';
	import { experience } from '@/mixins/experience.js';
	import { abilities } from '@/mixins/abilities.js';

	export default {
		name: 'NPC',
		mixins: [
			general, 
			dice, 
			experience, 
			skills, 
			monsterMixin,
			abilities
		],
		props: [
		'data'
		],
		data() {
			return {
				is_small: false,
				actions: [
					{ category: 'special_abilities', name: 'Special Abilities', name_single: 'Special ability' },
					{ category: 'actions', name: 'Actions', name_single: 'Action' },
					{ category: 'legendary_actions', name: 'Legendary Actions', name_single: 'Legendary action' },
					{ category: 'reactions', name: 'Reactions', name_single: 'Reaction' }
				],
			}
		},
		computed: {
			entity() {
				let entity = this.data;
				if(entity.entityType === 'npc' && !entity.old) {
					entity.proficiency = this.monster_challenge_rating[entity.challenge_rating].proficiency;
				}
				return entity;
			},
			caster_spell_levels() {
				if(this.entity.caster_spells) {
					let levels = [];
					for(const spell of Object.values(this.entity.caster_spells)) {
						if(!levels.includes(spell.level)) levels.push(spell.level);
					}
					return levels.sort();
				} return [];
			},
			innate_spell_levels() {
				if(this.entity.innate_spells) {
					let levels = [];
					for(const spell of Object.values(this.entity.innate_spells)) {
						const limit = (spell.limit) ? spell.limit : 0;
						if(!levels.includes(limit)) levels.push(limit);
					}
					return levels.sort();
				} return [];
			}
		},
		methods: {
			setSize() {
				let width = this.$refs.entity.clientWidth
				let small = 300;

				this.is_small = (width <= small) ? true : false;

				//sets new width on resize
				this.width = this.$refs.entity.clientWidth;
			},
			modifier(score) {
				var mod = Math.floor((score - 10) / 2)
				if(mod > 0) {
					return '+' + mod;
				}
				else {
					return mod;
				}
			},
			passivePerception() {
				return 10 + parseInt(this.skillModifier('wisdom', 'perception'));
			},
			skillModifier(skill, key) {
				return this.calculateSkillModifier(
					this.calcMod(this.data[skill.ability]),
					this.entity.skills ? (
					this.entity.skills.includes(key) ? 
					this.returnProficiency(this.entity.level ? this.entity.level : this.calculatedLevel(this.entity.experience)): 0) 
					: 0,
					this.entity.skills_expertise ? this.entity.skills_expertise.includes(key) : false
				) 
			},
			spellsForLevel(level) {
				return Object.values(this.entity.caster_spells).filter(item => { 
					return item.level == level;
				});
			},
			spellsForLimit(limit) {
				return Object.values(this.entity.innate_spells).filter(item => { 
					return item.limit == limit;
				});
			},
		},
		mounted() {
			this.$nextTick(function() {
				window.addEventListener('resize', this.setSize);
				//Init
				this.setSize();
			});
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.setSize);
		}
	};
</script>

<style lang="scss" scoped>
h2 {
	margin-bottom:5px !important;

	small {
		font-size: 12px;
	}
}
h3 {
	text-transform: none;
	font-weight: bold !important;
	border-bottom: solid 1px$gray-hover;
	padding-bottom: 3px;
}
a {
	color: $gray-light !important;
}
.abilities {
	user-select: none;
	display: grid;
	grid-template-columns: 	repeat(6, 40px);
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
		color: $green
	}
	.disadvantage .ability:hover {
		color:$red
	}
}
.playerSkills {
	user-select: none;
	column-count: 3;
	column-gap: 20px;
	column-rule: 1px solid$gray-hover;


	.playerSkill {
		display: flex;
		justify-content: space-between;
		cursor: pointer;

		&:hover {
			color:$white;
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
		color: $green
	}
	.disadvantage .playerSkill:hover {
		color:$red
	}
}
.skills .skill, .saves .hk-roll {
	&::after {
		content: ', ';
	}
	&:last-child::after {
		content: '';
	}
}
.saves {
	user-select: none;

	.save {
		cursor: pointer;
	}
	.advantage .save:hover {
		color: $green
	}
	.disadvantage .save:hover {
		color:$red
	}
}
.smallWidth {
	.abilities {
		grid-template-columns: 	repeat(3, auto);
		grid-template-rows: auto auto;
		grid-row-gap: 15px;
	}
	.playerSkills {
		column-count: 2;
	}
}

</style>
