<template>
	<div class="pb-5">
		<h2>{{ npc.name }}</h2>
		<i>
			<template v-if="npc.size">{{ npc.size }}</template>
			<template v-if="npc.type"> {{ npc.type }}</template>
			<span v-if="npc.subtype">({{ npc.subtype }})</span>
			<template v-if="npc.alignment">, {{ npc.alignment }}</template>
		</i>
		<hr>
		<p>
			<template v-if="npc.armor_class"><b>Armor Class</b> {{ npc.armor_class }}<br/></template>
			<template v-else><b>Armor Class</b> {{ npc.ac }}<br/></template>
			<template v-if="npc.hit_points"><b>Hit Points</b> {{ npc.hit_points }}</template>
			<template v-else><b>Hit Points</b> {{ npc.maxHp }}</template>
			<template v-if="npc.hit_dice"> ({{ npc.hit_dice }})</template>
			<template v-if="npc.speed"><br/><b>Speed</b> {{ npc.speed }}</template>
		</p>
		<hr>
		<div class="abilities d-flex justify-content-between">
			<div sm="2" v-for="ability, index in abilities"
				v-b-tooltip.hover title="Roll"
				:key="index" 
				class="ability" 
				@click="rollAbility(ability.ability, npc[ability.ability])"
				v-if="npc[ability.ability]">
				<span class="abilityName">{{ ability.ability.substring(0,3).toUpperCase() }}</span>
				{{ modifier(npc[ability.ability]) }}
				<span class="score bg-gray">{{ npc[ability.ability] }}</span>
			</div>
		</div>
		<hr>

		<!-- SKILLS -->
		<p>
			<template v-if="npc.skills">
				<b>Skills</b>
				<span v-for="skill, index in skills" :key="index" v-if="npc[skill]">
					{{ skill }} {{ npc[skill] }},
				</span>
				<br/>
			</template>
			<template v-if="npc.damage_vulnerabilities"><b>Damage vulnerabilities</b> {{ npc.damage_vulnerabilities }}<br/></template>
			<template v-if="npc.damage_resistances"><b>Damage resistances</b> {{ npc.damage_resistances }}<br/></template>
			<template v-if="npc.damage_immunities"><b>Damage immunities</b> {{ npc.damage_immunities }}<br/></template>
			<template v-if="npc.condition_immunities"><b>Condition immunities</b> {{ npc.condition_immunities }}<br/></template>
			<template v-if="npc.senses"><b>Senses</b> {{ npc.senses }}<br/></template>
			<template v-if="npc.languages"><b>Languages</b> {{ npc.languages }}<br/></template>
			<template v-if="npc.challenge_rating"><b>Challenge Rating</b> {{ npc.challenge_rating }}</template>
		</p>

		<template v-if="npc.special_abilities">
			<hr>
			<div v-for="ability, index in npc.special_abilities">
				<a class="d-flex justify-content-between" data-toggle="collapse" :href="'#ability-'+index" role="button" aria-expanded="false">
					<span>{{ index + 1 }}. {{ ability.name }}</span>
					<i class="fas fa-caret-down"></i>
				</a>
				<p class="collapse" :id="'ability-'+index">{{ ability.desc }}</p>
			</div>
		</template>

		<template v-if="npc.actions">
			<hr>
			<h2>Actions</h2>
			<div v-for="action, index in npc.actions">
				<a class="d-flex justify-content-between" data-toggle="collapse" :href="'#action-'+index" role="button" aria-expanded="false">
					<span>{{ index + 1 }}. {{ action.name }}</span>
					<i class="fas fa-caret-down"></i>
				</a>
				<p class="collapse" :id="'action-'+index">{{ action.desc }}</p>
			</div>
		</template>

		<template v-if="npc.legendary_actions">
			<hr>
			<h2>Legendary Actions</h2>
			<div v-for="(legendary_action, index) in npc.legendary_actions">
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
		'npc'
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
					var mod = modifier
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
	margin: 30px 0;
	white-space: nowrap;

	.ability {
		height: 60px;
		line-height: 45px;
		border:solid 1px #000;
		text-align:center;
		font-size:20px;
		font-size: calc( 20px + (21 - 20) * ( (100vw - 360px) / ( 800 - 360) ));
		position:relative;
		cursor: pointer;
		margin-right: 10px;
		width: 16.6%;

		&:last-child {
			margin: 0;
		}

		.score {
			position: absolute;
			bottom: -10px;
			left: 50%;
			transform: translateX(-50%);
			font-size: calc( 11px + (12 - 11) * ( (100vw - 360px) / ( 800 - 360) ));
			border: solid 1px #000;
			text-align: center;
			border-radius: 15px / 10px;
			line-height: 25px;
			height:25px;
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
