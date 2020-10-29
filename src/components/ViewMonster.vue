<template>
	<div class="monster" ref="entity" :class="{ smallWidth: is_small }">
		<div class="monster-stats">
			<h2>{{ data.name }}</h2>
			<span class="size">
				<template v-if="data.size">{{ data.size }}</template>
				<template v-if="data.type"> {{ data.type }}</template>
				<span v-if="data.subtype">({{ data.subtype }})</span>
				<template v-if="data.alignment">, {{ data.alignment }}</template>
			</span>
			<hr>
			<span class="attributes">
				<template v-if="data.armor_class">
					<b>Armor Class: </b> {{ data.armor_class }}<br/>
				</template>
				<template v-else>
					<b>Armor Class</b>: {{ data.ac }}<br/>
				</template>
				<template v-if="data.hit_points">
					<b>Hit Points</b>: {{ data.hit_points }}
				</template>
				<template v-else>
					<b>Hit Points</b>: {{ data.maxHp }}
				</template>
				<template v-if="data.hit_dice"> ({{ data.hit_dice ? hitDiceStr(data) : '' }})</template>
				<template v-if="data.speed">
					<br/><b>Speed</b>: {{ data.speed }}
				</template>
			</span>
			<hr>
			<div class="abilities">
				<template v-for="(ability, index) in abilities">
					<div
						class="ability"
						:key="index" 
						@click="rollD(20, 1, modifier(data[ability.ability]), `${ability.ability} check`)"
						v-if="data[ability.ability]">
							<div class="abilityName">{{ ability.ability.substring(0,3).toUpperCase() }}</div>
							{{ data[ability.ability] }}
							({{ modifier(data[ability.ability]) }})
							<q-tooltip anchor="top middle" self="center middle">
								Roll
							</q-tooltip>
					</div>
				</template>
			</div>
			<hr>

			<!-- SKILLS -->
			<span class="stats">
				<template v-if="savingThrows.length > 0">
					<b>Saving Throws </b>
					<span class="saves">
						<span 
							class="save" 
							@click="rollD(20, 1, save.score, `${save.save} save`)"
							v-for="save in savingThrows" 
							:key="save.save">
							{{ save.save.substring(0,3).toUpperCase() }} +{{ save.score }}
						</span>
					</span>
					<br/>
				</template>
				<template v-if="monsterSkills.length > 0">
					<b>Skills </b>
					<span class="skills">
						<span class="skill" v-for="skill in monsterSkills" :key="skill.skill">
							{{ skill.skill }} +{{ skill.score }}
						</span>
					</span>
					<br/>
				</template>
				<template v-if="data.damage_vulnerabilities"><b>Damage vulnerabilities</b> {{ data.damage_vulnerabilities }}<br/></template>
				<template v-if="data.damage_resistances"><b>Damage resistances</b> {{ data.damage_resistances }}<br/></template>
				<template v-if="data.damage_immunities"><b>Damage immunities</b> {{ data.damage_immunities }}<br/></template>
				<template v-if="data.condition_immunities"><b>Condition immunities</b> {{ data.condition_immunities }}<br/></template>
				<template v-if="data.senses"><b>Senses</b> {{ data.senses }}<br/></template>
				<template v-if="data.languages"><b>Languages</b> {{ data.languages }}<br/></template>
				<template v-if="data.challenge_rating"><b>Challenge Rating</b> {{ data.challenge_rating }} ({{ challengeToXp[data.challenge_rating] }}XP)</template>
			</span>
			<hr>
		
			<template v-if="data.special_abilities">
				<p v-for="(ability, index) in data.special_abilities" :key="`ability-${index}`">
					<b><i>{{ ability.name }}</i></b> {{ ability.desc }}
				</p>
			</template>
		</div>

		<div class="monster-actions">
			<template v-if="data.actions">
				<h3>Actions</h3>
				<p v-for="(action, index) in data.actions" :key="`action-${index}`">
						<b><i>{{ action.name }}</i></b> {{ action.desc }}
				</p>
			</template>

			<template v-if="data.legendary_actions">
				<h3>Legendary Actions</h3>
				<p>
					{{ data.name }} can take 3 legendary actions, choosing from the options below. 
					Only one legendary action option can be used at a time and only at the end of another creature’s turn. {{ data.name }} regains spent legendary actions at the start of their turn.
				</p>
				<p v-for="(legendary_action, index) in data.legendary_actions" :key="`legendary-${index}`">
						<b><i>{{ legendary_action.name }}</i></b> {{ legendary_action.desc }}
				</p>
			</template>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';

	export default {
		name: 'NPC',
		mixins: [general, dice],
		props: [
		'data'
		],
		data() {
			return {
				is_small: false,
				skills: [
					'acrobatics',
					'animal Handling',
					'arcana',
					'athletics',
					'deception',
					'history',
					'insight',
					'intimidation',
					'investigation',
					'medicine',
					'nature',
					'perception',
					'performance',
					'persuasion',
					'religion',
					'sleight of Hand',
					'stealth',
					'survival',
				],
				challengeToXp: {
					0: 10,
					'0.125': 25,
					'0.25': 50,
					'0.5': 100,
					1: 200,
					2: 450,
					3: 700,
					4: 1100,
					5: 1800,
					6: 2300,
					7: 2900,
					8: 3900,
					9: 5000,
					10: 5900,
					11: 7200,
					12: 8400,
					13: 10000,
					14: 11500,
					15: 13000,
					16: 15000,
					17: 18000,
					19: 22000,
					20: 25000,
					21: 33000,
					22: 41000,
					23: 50000,
					24: 62000,
					30: 155000,
				}
			}
		},
		computed: {
			monsterSkills() {
				let skills = [];
				for(let i in this.skills) {
					let skill = this.skills[i];

					if(this.data[skill]) {
						skills.push({
							skill,
							score: this.data[skill]
						})
					}
				}
				return skills;
			},
			savingThrows() {
				let saves = [];
				for(let i in this.abilities) {
					let save = this.abilities[i].ability;

					if(this.data[`${save}_save`]) {
						saves.push({
							save,
							score: this.data[`${save}_save`]
						})
					}
				}
				return saves;
			}
		},
		firebase() {
			return {
				abilities: db.ref('abilities')
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
					return '+' + mod
				}
				else {
					return mod
				}
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
	color: #000;
	font-family: 'Times New Roman', Times, serif;

	h2 {
		color: #58170D;
		text-transform: none;
		font-size: 32px;
		margin-bottom: 0;
		font-family: 'Playfair Display SC', serif;
		font-weight: normal;
	}
	h3 {
		font-family: sans-serif;
		color: #58170D;
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
		color: #58170D;
		
		.skills .skill, .saves .save {
			&::after {
				content: ', ';
			}
			&:last-child::after {
				content: '';
			}
		}
		.saves .save {
			cursor: pointer;
		}
	}
	hr {
		border-top: 2px solid rgb(165,42,42);
		margin: 10px 0;
	}
	.abilities {
		color: #58170D;
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
	}
}
.smallWidth {
	.abilities {
		grid-template-columns: 	repeat(3, auto);
		grid-template-rows: auto auto;
		grid-row-gap: 15px;
	}
}


</style>
