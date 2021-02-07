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
						({{ calcMod(monster[ability]) }})
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
								{{skill }} {{ skillModifier(skillList[skill].ability, skill) }}{{ index+1 &lt; monster.skills.length ? "," : "" }}
							</span>
						</hk-roll>
						<br/>
					</span>
				</template>
				<template v-if="monster.damage_vulnerabilities"><b>Damage vulnerabilities</b> {{ monster.damage_vulnerabilities.join(", ") }}<br/></template>
				<template v-if="monster.damage_resistances"><b>Damage resistances</b> {{ monster.damage_resistances.join(", ") }}<br/></template>
				<template v-if="monster.damage_immunities"><b>Damage immunities</b> {{ monster.damage_immunities.join(", ") }}<br/></template>
				<template v-if="monster.condition_immunities"><b>Condition immunities</b> {{ monster.condition_immunities.join(", ") }}<br/></template>

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
		
			<template v-if="monster.special_abilities">
				<p v-for="(ability, index) in monster.special_abilities" :key="`ability-${index}`">
					<b><i>
						{{ ability.name }}
						{{ ability.limit ? `(${ability.limit}/Day)` : ``}}
					</i></b>
					{{ ability.desc }}
				</p>
			</template>
		</div>

		<div class="monster-actions">
			<template v-if="monster.actions">
				<h3>Actions</h3>
				<p v-for="(action, index) in monster.actions" :key="`action-${index}`">
						<b><i>
							{{ action.name }}
							{{ action.recharge ? `(Recharge ${action.recharge})` : ``}}
							{{ action.limit ? `(${action.limit}/Day)` : ``}}
							</i></b>
							{{ action.desc }}
				</p>
			</template>

			<template v-if="monster.legendary_actions">
				<h3>Legendary Actions</h3>
				<p>
					{{ monster.name.capitalizeEach() }} can take {{ monster.lengendary_count}} legendary actions, choosing from the options below. 
					Only one legendary action option can be used at a time and only at the end of another creature’s turn. {{ monster.name }} regains spent legendary actions at the start of their turn.
				</p>
				<p v-for="(legendary_action, index) in monster.legendary_actions" :key="`legendary-${index}`">
						<b><i>
							{{ legendary_action.name }}
							{{ legendary_action.recharge ? `(Recharge ${legendary_action.recharge})` : ``}}
							{{ legendary_action.limit ? `(${legendary_action.limit}/Day)` : ``}}
						</i></b> 
						{{ legendary_action.desc }}
				</p>
			</template>
		</div>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';
	import { abilities } from '@/mixins/abilities.js';
	import { monsterMixin } from '@/mixins/monster.js';
	import { skills } from '@/mixins/skills.js';

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
			}
		},
		computed: {
			monster() {
				let monster = this.data;
				monster.proficiency = this.monster_challenge_rating[monster.challenge_rating].proficiency;
				return monster;
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
			rollAbility(ability, score, type = 'roll') {
				var modifier = (type === 'roll') ? parseInt(Math.floor((score - 10) / 2)) : score;
				var roll = (Math.floor(Math.random() * 20) + 1);
				var total = roll + modifier;
				if(modifier >= 0) {
					var mod = '+' + modifier
				}
				else {
					mod = modifier
				}
				
				this.$snotify.success(`${ability} ${type}.`, `${roll}${mod} = ${total}`, {
					position: "centerTop"
				});
			},
			passivePerception() {
				return 10 + parseInt(this.skillModifier('wisdom', 'perception'));
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
