<template>
	<div class="monster monster-card" ref="entity" :class="{ smallWidth: is_small }">
		<div class="monster-stats">
			<h2>{{ monster.name.capitalizeEach() }} <span v-if="monster.source" class="source">{{ monster.source }}</span></h2>
			<span class="size">
				<template v-if="monster.size">{{ monster.size }}</template>
				<template v-if="monster.type"> {{ monster.type }}</template>
				<span v-if="monster.subtype">({{ monster.subtype }})</span>
				<template v-if="monster.alignment">, {{ monster.alignment }}</template>
			</span>
			<hr>
			<span class="attributes">
				<template v-if="monster.armor_class">
					<b>Armor Class: </b> {{ monster.armor_class }}<br/>
				</template>
				<template v-else>
					<b>Armor Class</b>: {{ monster.ac }}<br/>
				</template>
				<template v-if="monster.hit_points">
					<b>Hit Points</b>: {{ monster.hit_points }}
				</template>
				<template v-else>
					<b>Hit Points</b>: {{ monster.maxHp }}
				</template>
				<template v-if="monster.hit_dice"> ({{ monster.hit_dice ? hitDiceStr(data) : '' }})</template>
				<template>
					<br/><b>Speed</b>: {{ monster.walk_speed ? monster.walk_speed : 0 }} ft.{{ 
						monster.swim_speed ? `, swim ${monster.swim_speed} ft.` : `` 
					}}{{ 
						monster.fly_speed ? `, fly ${monster.fly_speed} ft.` : `` 
					}}{{ 
						monster.burrow_speed ? `, burrow ${monster.burrow_speed} ft.` : `` 
					}}{{ 
						monster.climb_speed ? `, climb ${monster.climb_speed} ft.` : ``
					}}
				</template>
			</span>
			<hr>
			<div class="abilities">
				<hk-roll 
					v-for="(ability, index) in abilities"	
					:key="index" 
					tooltip="Roll"
					:roll="{
						d: 20, 
						n: 1, 
						m: calcMod(monster[ability]),
						title: `${monster.name}: ${ability.capitalize()} check`, 
						notify: true
					}"
				>
					<div v-if="monster[ability]" class="ability">
						<div class="abilityName">{{ ability.substring(0,3).toUpperCase() }}</div>
						{{ monster[ability] }}
						({{ calcMod(monster[ability]) > 0 ? `+${calcMod(monster[ability])}` : calcMod(monster[ability]) }})
					</div>
				</hk-roll>
			</div>
			<hr>

			<div class="stats mb-2">
				<template v-if="monster.saving_throws">
					<b>Saving Throws </b>
					<span class="saves">
						<hk-roll 
							tooltip="Roll save" 
							v-for="(ability, index) in monster.saving_throws" 
							:key="ability"
							:roll="{
								d: 20, 
								n: 1, 
								m: calcMod(monster[ability]) + monster.proficiency,
								title: `${monster.name}: ${ability.capitalize()} save`, 
								notify: true
							}"
						>
							<span class="save">
								{{ ability.substring(0,3).capitalize() }} 
								+{{ 
									calcMod(monster[ability]) + monster.proficiency 
								}}{{ 
									index+1 &lt; monster.saving_throws.length ? "," : ""
								}}
							</span>
						</hk-roll>
					</span>
					<br/>
				</template>
				<template v-if="monster.skills"><b>Skills</b>
					<span class="saves">
						<hk-roll 
							v-for="(skill, index) in monster.skills" 
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
								{{ skill }} {{ skillModifier(skillList[skill].ability, skill) }}{{ index+1 &lt; monster.skills.length ? "," : "" }}
							</span>
						</hk-roll>
						<br/>
					</span>
				</template>
				<template v-if="monster.damage_vulnerabilities && monster.damage_vulnerabilities.length > 0">
					<b>Damage vulnerabilities</b> {{ monster.damage_vulnerabilities.join(", ") }}<br/>
				</template>
				<template v-if="monster.damage_resistances && monster.damage_resistances.length > 0">
					<b>Damage resistances</b> {{ monster.damage_resistances.join(", ") }}<br/>
				</template>
				<template v-if="monster.damage_immunities && monster.damage_immunities.length > 0">
					<b>Damage immunities</b> {{ monster.damage_immunities.join(", ") }}<br/>
				</template>
				<template v-if="monster.condition_immunities && monster.condition_immunities.length > 0">
					<b>Condition immunities</b> {{ monster.condition_immunities.join(", ") }}<br/>
				</template>

				<b>Senses</b> 
				<template v-if="monster.senses">
					<span v-for="(sense, key) in monster.senses" :key="key">
						{{ key }} {{ sense.range ? `${sense.range} ft.` : `` }}{{ 
							sense.comments ? `${sense.comments}` : ``
						}},
					</span>
				</template>
				passive Perception {{ passivePerception() }}<br/>

				<template v-if="monster.languages"><b>Languages</b> {{ monster.languages.join(", ") }}<br/></template>
				<template v-if="monster.challenge_rating">
					<b>Challenge Rating</b> {{ monster.challenge_rating }} 
					({{ monster_challenge_rating[monster.challenge_rating].xp | numeral('0,0') }} XP)<br/>
				</template>
				<template v-if="monster.challenge_rating"><b>Proficiency bonus</b> +{{ monster.proficiency }}</template>
			</div>

			<h3>Skills</h3>
			<div class="skills">
				<hk-roll 
					v-for="(skill, key) in skillList" 
					:key="key" 
					:tooltip="`Roll ${key}`"
					:roll="{
						d: 20, 
						n: 1, 
						m: skillModifier(skill, key),
						title: `${skill.skill} check`, 
						notify: true
					}"
				>
					<span class="skill">
						<span class="truncate">
							<template v-if="monster.skills && monster.skills.includes(key)">
								<i v-if="monster.skills_expertise && monster.skills_expertise.includes(key)" class="far fa-dot-circle"></i>
								<i v-else class="fas fa-circle"></i>
							</template>
							<i v-else class="far fa-circle"></i>
							{{ skill.skill }}
						</span>
						<span>{{ skillModifier(skill.ability, key) }}</span>
					</span>
				</hk-roll>
			</div>

			<hr>

			<!-- SPELLCASTING -->
			<template v-if="monster.caster_ability">
				<p>
					<b><i>
						Spellcasting
					</i></b>
					The {{ monster.name.capitalizeEach() }} is a {{ monster.caster_level | numeral('Oo')}}-level spellcaster.
					It's spellcasting ability is {{ monster.caster_ability.capitalize() }}
					(spell save DC {{ monster.caster_save_dc }}, 
					{{ monster.caster_spell_attack > 0 ? `+${monster.caster_spell_attack}` : monster.caster_spell_attack }} to hit with spell attacks). 
					The {{ monster.name.capitalizeEach() }} has the following spells prepared:
				</p>
				<p>
					<template v-for="level in caster_spell_levels" >
						<div :key="`spell-${level}`">
							<template v-if="level === 0">
								Cantrips (at will):
							</template>
							<template v-else>
								{{ level | numeral('Oo') }} level ({{ monster.caster_spell_slots[level] }} slots):
							</template>
							<i v-for="(spell, index) in spellsForLevel(level)" :key="spell.name">
								{{ spell.name }}{{ index+1 &lt; spellsForLevel(level).length ? "," : "" }}
							</i>
						</div>
					</template>
				</p>
			</template>

			<!-- INNATE SPELLCASTING -->
			<template v-if="monster.innate_ability">
				<p>
					<b><i>
						Innate spellcasting
					</i></b>
					The {{ monster.name.capitalizeEach() }}'s innate spellcasting ability is {{ monster.innate_ability.capitalize() }}
					(spell save DC {{ monster.innate_save_dc }}, 
					{{ monster.innate_spell_attack > 0 ? `+${monster.innate_spell_attack}` : monster.innate_spell_attack }} to hit with spell attacks). 
					The {{ monster.name.capitalizeEach() }} can cast the following spells, requiring no material components:
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
		</div>

		<div class="monster-actions">
			<div v-for="{category, name} in actions" :key="category">
				<template v-if="monster[category] && monster[category].length > 0">
					<h3 v-if="category !== 'special_abilities'">{{ name }}</h3>
					<p v-if="monster.lengendary_count && category === 'legendary_actions'">
						{{ monster.name.capitalizeEach() }} can take {{ monster.lengendary_count }} legendary actions, choosing from the options below. 
						Only one legendary action option can be used at a time and only at the end of another creature’s turn. {{ monster.name }} regains spent legendary actions at the start of their turn.
					</p>
	
					<p v-for="(ability, index) in monster[category]" :key="`${category}-${index}`">
						<template v-if="ability.action_list && ability.action_list[0].type !== 'other'">
							<span v-if="ability.versatile" class="roll-button" @click.stop>
								<q-popup-proxy square dark>
									<q-list dark square>
										<q-item clickable v-close-popup>
											<q-item-section avatar>1</q-item-section>
											<q-item-section>
												<hk-roll @roll="roll($event, ability, 0)">
													{{ ability.versatile_one || 'Option 1' }}
												</hk-roll>
											</q-item-section>
										</q-item>
										<q-item clickable v-close-popup>
											<q-item-section avatar>2</q-item-section>
											<q-item-section>
												<hk-roll @roll="roll($event, ability, 1)">
													{{ ability.versatile_two || 'Option 2' }}
												</hk-roll>
											</q-item-section>
										</q-item>
									</q-list>
								</q-popup-proxy>
							</span>
							<hk-roll 
								v-else
								:tooltip="`Roll ${ability.name}`" 
								@roll="roll($event, ability)"
							>
								<span class="roll-button" />
							</hk-roll>
						</template>
						<b><i>
							{{ ability.name }}
							{{ ability.recharge ? `(Recharge ${ability.recharge === 'rest' ? "after a Short or Long Rest" : ability.recharge})` : ``}}
							{{ ability.limit ? `(${ability.limit}/${ability.limit_type ? ability.limit_type.capitalize(): `Day`})` : ``}}
							{{ ability.legendary_cost > 1 ? `(Costs ${ability.legendary_cost} Actions)` : ``}}			
						</i></b>
						{{ ability.desc }}
					</p>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';
	import { abilities } from '@/mixins/abilities.js';
	import { monsterMixin } from '@/mixins/monster.js';
	import { skills } from '@/mixins/skills.js';
	import { mapActions } from 'vuex';

	export default {
		name: 'NPC',
		mixins: [
			general, 
			dice,
			abilities,
			monsterMixin,
			skills
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
			monster() {
				let monster = this.data;
				monster.proficiency = this.monster_challenge_rating[monster.challenge_rating].proficiency;
				return monster;
			},
			caster_spell_levels() {
				if(this.monster.caster_spells) {
					let levels = [];
					for(const spell of Object.values(this.monster.caster_spells)) {
						if(!levels.includes(spell.level)) levels.push(spell.level);
					}
					return levels.sort();
				} return [];
			},
			innate_spell_levels() {
				if(this.monster.innate_spells) {
					let levels = [];
					for(const spell of Object.values(this.monster.innate_spells)) {
						const limit = (spell.limit) ? spell.limit : 0;
						if(!levels.includes(limit)) levels.push(limit);
					}
					return levels.sort();
				} return [];
			}
		},
		methods: {
			...mapActions([
				"setActionRoll"
			]),
			setSize() {
				let width = this.$refs.entity.clientWidth
				let small = 300;

				this.is_small = (width <= small) ? true : false;

				//sets new width on resize
				this.width = this.$refs.entity.clientWidth;
			},	
			roll(e, action, versatile) {
				const config = {
					type: "monster_action",
					versatile
				}
				this.setActionRoll(this.rollAction(e, action, config));
			},
			passivePerception() {
				return 10 + parseInt(this.skillModifier('wisdom', 'perception'));
			},
			spellsForLevel(level) {
				return Object.values(this.monster.caster_spells).filter(item => { 
					return item.level == level;
				});
			},
			spellsForLimit(limit) {
				return Object.values(this.monster.innate_spells).filter(item => { 
					return item.limit == limit;
				});
			},
			skillModifier(ability, skill) {
				let mod = this.calculateSkillModifier(
					this.calcMod(this.monster[ability]),
					this.monster.skills ? (
					this.monster.skills.includes(skill) ? 
					(this.monster.challenge_rating ? this.monster.proficiency : '')
					: 0) : 0,
					this.monster.skills_expertise ? this.monster.skills_expertise.includes(skill) : false
				);

				if(this.monster.skill_modifiers && this.monster.skill_modifiers[skill]) {
					mod = parseInt(mod) + parseInt(this.monster.skill_modifiers[skill]);
				}
				return (mod) >= 0 ? '+' + parseInt(mod) : parseInt(mod);
			}
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
@import url('https://fonts.googleapis.com/css?family=Playfair+Display+SC:700&display=swap');

.monster {
	padding: 10px;
	color: $black;
	font-family: Helvetica, sans-serif, serif;

	h2 {
		color: #6e1d10;
		text-transform: none;
		font-size: 32px;
		margin-bottom: 0;
		font-family: 'Playfair Display SC', serif;
		font-weight: normal;

		.source {
			font-size: 15px;
			font-family: Helvetica, sans-serif, serif;
			color: $black;
		}
	}
	h3 {
		font-family: sans-serif;
		color: #6e1d10;
		border-bottom: solid 1px rgb(165,42,42);
		font-size: 20px;
		padding-bottom: 2px;
		margin-bottom: 5px;
	}
	p {
		margin-bottom: 10px;
	}
	.size {
		font-size: 18px;
		font-style: italic;
	}
	.attributes, .stats {
		color: #6e1d10;
		
		.saves{
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
	}
	.skills {
		user-select: none;
		column-count: 3;
		column-gap: 20px;
		column-rule: 1px solid rgb(165,42,42);


		.skill {
			display: flex;
			justify-content: space-between;
			cursor: pointer;

			&:hover {
				color: rgb(165,42,42);
			}
			i {
				
				&.fa-circle {
					margin: 0 3px;
					font-size: 6px;
					vertical-align: 2px;
				}
			}
		}
		.advantage .skill:hover {
			color: $green
		}
		.disadvantage .skill:hover {
			color:$red
		}
	}
	.saves .hk-roll {
		&::after {
			content: ', ';
		}
		&:last-child::after {
			content: '';
		}
	}


	hr {
		border-top: 2px solid rgb(165,42,42);
		margin: 10px 0;
	}
	ul {
		padding-left: 20px;
	}
	.abilities {
		user-select: none;
		color: #6e1d10;
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
}
.roll-button {
	display: inline-block;
	cursor: pointer;
	background-image: url('../../../assets/_img/logo/logo-icon-no-shield-cyan.svg');
	height: 20px;
	width: 20px;
	background-position: center;
	background-size: cover;
	vertical-align: -5px;
}
.advantage .roll-button:hover {
	background-image: url('../../../assets/_img/logo/logo-icon-no-shield-green.svg');
}
.disadvantage .roll-button:hover {
	background-image: url('../../../assets/_img/logo/logo-icon-no-shield-red.svg');
}
.smallWidth {
	.abilities {
		grid-template-columns: 	repeat(3, auto);
		grid-template-rows: auto auto;
		grid-row-gap: 15px;
	}

	.skills {
		column-count: 2;
	}
}


</style>
