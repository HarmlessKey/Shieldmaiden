<template>
	<div class="pb-5" ref="entity" :class="{ smallWidth: is_small }">
		<h2>{{ data.name }}</h2>
		<i>
			<template v-if="data.size">{{ data.size }}</template>
			<template v-if="data.type"> {{ data.type }}</template>
			<span v-if="data.subtype">({{ data.subtype }})</span>
			<template v-if="data.alignment">, {{ data.alignment }}</template>
		</i>
		<hr>
		<p>
			<template v-if="data.entityType === 'player'">
				<b>Level</b>: 
				<span> {{ data.level || calculatedLevel(data.experience) }}</span><br/>
			</template>
			<template v-if="data.armor_class">
				<b>Armor Class</b>: 
				<span> {{ data.armor_class }}</span><br/>
			</template>
			<template v-else>
				<b>Armor Class</b>: 
				<span> {{ data.ac }}</span><br/>
			</template>
			<template v-if="data.hit_points">
				<b>Hit Points</b>: 
				<span> {{ data.hit_points }}</span>
			</template>
			<template v-else>
				<b>Hit Points</b>: 
				<span> {{ data.maxHp }}</span>
			</template>
			<template v-if="data.hit_dice"> {{ data.hit_dice ? `(${hitDiceStr(data)})` : '' }}</template>
			<template v-if="data.speed">
				<br/><b>Speed</b>: 
				<span> {{ data.speed }}</span>
			</template>
		</p>
		<hr>
		<div class="abilities">
			<template v-for="(ability, index) in abilities">
				<div
					class="ability"
					v-b-tooltip.hover title="Roll"
					:key="index" 
					@click="rollD(20, 1, modifier(data[ability.ability]), `${ability.ability} check`)"
					v-if="data[ability.ability]">
						<div class="abilityName">{{ ability.ability.substring(0,3).toUpperCase() }}</div>
						{{ data[ability.ability] }}
						({{ modifier(data[ability.ability]) }})
				</div>
			</template>
		</div>
		<hr>

		<!-- SKILLS -->
		<template v-if="data.entityType === 'player'">
			<h3>Skills</h3>
			<div class="playerSkills">
				<div :value="key" v-for="(skill, key) in skillList" :key="key">
					<span class="playerSkill" @click="rollD(20, 1, skillModifier(skill, key), `${skill.skill} check`)">
						<span class="truncate">
							<i v-if="data.skills && data.skills.includes(key)" class="far fa-dot-circle"></i>
							<i v-else class="far fa-circle"></i>
							{{ skill.skill }}
						</span>
						<span>{{ skillModifier(skill, key) }}</span>
					</span>
				</div>
			</div>
			<hr>
		</template>
		<p>
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
		</p>

		<template v-if="data.special_abilities">
			<hr>
			<p v-for="(ability, index) in data.special_abilities" :key="`ability-${index}`">
				<b>{{ ability.name }}</b> {{ ability.desc }}
			</p>
		</template>

		<template v-if="data.actions">
			<h3>Actions</h3>
			<p v-for="(action, index) in data.actions" :key="`action-${index}`">
				<b>{{ action.name }}</b> {{ action.desc }}
			</p>
		</template>

		<template v-if="data.legendary_actions">
			<h3>Legendary Actions</h3>
			<p v-for="(legendary_action, index) in data.legendary_actions" :key="`legendary-${index}`">
				<b>{{ legendary_action.name }}</b> {{ legendary_action.desc }}
			</p>
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';
	import { skills } from '@/mixins/skills.js';
	import { experience } from '@/mixins/experience.js';

	export default {
		name: 'NPC',
		mixins: [general, dice, experience, skills],
		props: [
		'data'
		],
		data() {
			return {
				is_small: false,
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
				for(let key in this.skillList) {
					let skill = this.skillList[key].skill;

					if(this.data[key]) {
						skills.push({
							skill,
							score: this.data[key]
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
					return '+' + mod;
				}
				else {
					return mod;
				}
			},
			skillModifier(skill, key) {
				return this.calculateSkillModifier(
					this.calcMod(this.data[skill.ability]),
					this.data.skills ? (
					this.data.skills.includes(key) ? 
					this.returnProficiency(this.data.level ? this.data.level : this.calculatedLevel(this.data.experience)): 0) 
					: 0,
					this.data.skills_expertise ? this.data.skills_expertise.includes(key) : false
				) 
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
h2 {
	margin-bottom:5px !important;
}
h3 {
	text-transform: none;
	font-weight: bold !important;
	border-bottom: solid 1px #5c5757;
	padding-bottom: 3px;
}
a {
	color: #b2b2b2 !important;
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
}
.playerSkills {
	user-select: none;
	column-count: 3;
	column-gap: 20px;
	column-rule: 1px solid #5c5757;

	.playerSkill {
		display: flex;
		justify-content: space-between;
		cursor: pointer;

		&:hover {
			color: #fff;
		}
		i {
			font-size: 10px;
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
