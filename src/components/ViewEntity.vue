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
			<template v-if="data.skills">
				<b>Skills</b>
				<template v-for="(skill, index) in skills">
					<span :key="index" v-if="npc[skill]">
						{{ skill }} {{ npc[skill] }},
					</span>
				</template>
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
			<!-- eslint-disable-next-line -->
			<div v-for="(ability, index) in data.special_abilities">
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
			<!-- eslint-disable-next-line -->
			<div v-for="(action, index) in data.actions">
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
			<!-- eslint-disable-next-line -->
			<div v-for="(legendary_action, index) in data.legendary_actions">
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
			rollAbility(ability, score) {
				var modifier = parseInt(Math.floor((score - 10) / 2));
				var roll = (Math.floor(Math.random() * 20) + 1);
				var total = roll + modifier;
				if(modifier >= 0) {
					var mod = '+' + modifier
				}
				else {
					mod = modifier
				}
				
				this.$snotify.success(ability + ' roll.', roll + '' + mod + ' = ' + total, {
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

</style>
