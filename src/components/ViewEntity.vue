<template>
	<div class="pb-5">
		<h2>{{ data.name }}</h2>
		<i>
			<template v-if="data.size">{{ data.size }}</template>
			<template v-if="data.type"> {{ data.type }}</template>
			<span v-if="data.subtype">({{ data.subtype }})</span>
			<template v-if="data.alignment">, {{ data.alignment }}</template>
		</i>
		<hr>
		<p>
			<template v-if="data.armor_class">
				<b><i class="fas fa-shield gray-hover"></i>Armor Class</b>: 
				<span class="blue"> {{ data.armor_class }}</span><br/>
			</template>
			<template v-else>
				<b><i class="fas fa-shield gray-hover"></i> Armor Class</b>: 
				<span class="blue"> {{ data.ac }}</span><br/>
			</template>
			<template v-if="data.hit_points">
				<b><i class="fas fa-heart gray-hover"></i> Hit Points</b>: 
				<span class="blue"> {{ data.hit_points }}</span>
			</template>
			<template v-else>
				<b><i class="fas fa-heart gray-hover"></i> Hit Points</b>: 
				<span class="blue"> {{ data.maxHp }}</span>
			</template>
			<template v-if="data.hit_dice"> ({{ data.hit_dice }})</template>
			<template v-if="data.speed">
				<br/><b><i class="fas fa-angle-double-right gray-hover"></i> Speed</b>: 
				<span class="blue"> {{ data.speed }}</span>
			</template>
		</p>
		<hr>
		<b-row class="abilities">
			<template v-for="(ability, index) in abilities">
				<b-col :sm="sm" :md="md" :lg="lg"
					v-b-tooltip.hover title="Roll"
					:key="index" 
					class="mb-5 col-4" 
					@click="rollAbility(ability.ability, data[ability.ability])"
					v-if="data[ability.ability]">
						<div class="ability bg-gray">
							<span class="abilityName">{{ ability.ability.substring(0,3).toUpperCase() }}</span>
							{{ modifier(data[ability.ability]) }}
							<span class="score bg-gray">{{ data[ability.ability] }}</span>
						</div>
				</b-col>
			</template>
		</b-row>
		<hr>

		<!-- SKILLS -->
		<p>
			<template v-if="savingThrows.length > 0">
				<b>Saving Throws </b>
				<span class="saves">
					<span 
						class="save" 
						@click="rollAbility(save.save, save.score, 'save')"
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
			<template v-if="data.challenge_rating"><b>Challenge Rating</b> {{ data.challenge_rating }}</template>
		</p>

		<template v-if="data.special_abilities">
			<hr>
			<div v-for="(ability, index) in data.special_abilities" :key="`ability-${index}`">
				<a class="d-flex justify-content-between" data-toggle="collapse" :href="'#ability-'+index" role="button" aria-expanded="false">
					<span>{{ index + 1 }}. {{ ability.name }}</span>
					<i class="fas fa-caret-down"></i>
				</a>
				<p class="collapse" :id="'ability-'+index">{{ ability.desc }}</p>
			</div>
		</template>

		<template v-if="data.actions">
			<hr>
			<h2>Actions</h2>
			<div v-for="(action, index) in data.actions" :key="`action-${index}`">
				<a class="d-flex justify-content-between" data-toggle="collapse" :href="'#action-'+index" role="button" aria-expanded="false">
					<span>{{ index + 1 }}. {{ action.name }}</span>
					<i class="fas fa-caret-down"></i>
				</a>
				<p class="collapse" :id="'action-'+index">{{ action.desc }}</p>
			</div>
		</template>

		<template v-if="data.legendary_actions">
			<hr>
			<h2>Legendary Actions</h2>
			<div v-for="(legendary_action, index) in data.legendary_actions" :key="`legendary-${index}`">
				<a class="d-flex justify-content-between" data-toggle="collapse" :href="'#legendary-action-'+index" role="button" aria-expanded="false">
					<span>{{ index + 1}}. {{ legendary_action.name }}</span>
					<i class="fas fa-caret-down"></i>
				</a>
				<p class="collapse" :id="'legendary-action-'+index">{{ legendary_action.desc }}</p>
			</div>
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase'

	export default {
		name: 'NPC',
		props: [
		'data'
		],
		data() {
			return {
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
			//Depending on where this is shown
			//they layout needs be adjusted slightly
			sm: function() {
				if(this.$route.meta.basePath == '/compendium') {
					return 4
				} else {
					return 6
				}
			},
			md: function() {
				if(this.$route.meta.basePath == '/compendium') {
					return 4
				} else {
					return 6
				}
			},
			lg: function() {
				if(this.$route.meta.basePath == '/compendium') {
					return 2
				} else {
					return 4
				}
			},
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
		}
	};
</script>

<style lang="scss" scoped>
h2 {
	margin-bottom:5px !important;
}
a {
	color: #b2b2b2 !important;
}
.abilities {
	margin-top: 30px;
	white-space: nowrap;
	user-select: none;

	.ability {
		height: 60px;
		line-height: 45px;
		border:solid 1px #494747;
		text-align: center;
		font-size: 20px;
		font-size: calc( 20px + (21 - 20) * ( (100vw - 360px) / ( 800 - 360) ));
		position: relative;
		cursor: pointer;

		&:last-child {
			margin: 0;
		}
		.score {
			position: absolute;
			bottom: -10px;
			left: 50%;
			transform: translateX(-50%);
			font-size: calc( 11px + (12 - 11) * ( (100vw - 360px) / ( 800 - 360) ));
			border: solid 1px #494747;
			text-align: center;
			border-radius: 15px / 10px;
			line-height: 25px;
			height: 25px;
			width: 35px;
		}
		.abilityName {
			position: absolute;
			top: -34px;
			left: 50%;
			transform: translateX(-50%);
	
			font-size: calc( 11px + (12 - 11) * ( (100vw - 360px) / ( 800 - 360) ));
			text-align: center;
		}
	}
}
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

</style>
