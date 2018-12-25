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
			<template v-if="npc.hit_dice">({{ npc.hit_dice }})</template>
			<template v-if="npc.speed"><br/><b>Speed</b> {{ npc.speed }}</template>
		</p>
		<div class="abilities">
			<span v-for="ability, index in abilities" 
				:key="index" 
				class="ability" 
				@click="rollAbility(ability, npc[ability])"
				v-if="npc[ability]">
				<span class="abilityName">{{ ability.substring(0,3).toUpperCase() }}</span>
				{{ modifier(npc[ability]) }}
				<span class="score bg-gray">{{ npc[ability] }}</span>
			</span>
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
			<template v-if="npc.senses"><b>Senses</b> {{ npc.senses }}<br/></template>
			<template v-if="npc.languages"><b>Languages</b> {{ npc.languages }}<br/></template>
			<template v-if="npc.challenge_rating"><b>Challenge Rating</b> {{ npc.challenge_rating }}</template>
		</p>

		<template v-if="npc.special_abilities">
			<hr>
			<div class="mb-3" v-for="(ability, index) in npc.special_abilities" :key="index">
				<a data-toggle="collapse" v-bind:href="'#ability-'+index" role="button" aria-expanded="false">{{ ability.name }} <i class="fas fa-caret-down"></i></a>
				<p class="collapse" v-bind:id="'ability-'+index">{{ ability.desc }}</p>
			</div>
		</template>

		<template v-if="npc.actions">
			<hr>
			<h2>Actions</h2>
			<div v-for="(action, index) in npc.actions" :key="index">
				<a data-toggle="collapse" v-bind:href="'#action-'+index" role="button" aria-expanded="false">{{ action.name }} <i class="fas fa-caret-down"></i></a>
				<p class="collapse" v-bind:id="'action-'+index">{{ action.desc }}</p>
			</div>
		</template>

		<template v-if="npc.legendary_actions">
			<hr>
			<h2>Legendary Actions</h2>
			<div v-for="(legendary_action, index) in npc.legendary_actions" :key="index">
				<a data-toggle="collapse" v-bind:href="'#legendary-action-'+index" role="button" aria-expanded="false">{{ legendary_action.name }} <i class="fas fa-caret-down"></i></a>
				<p class="collapse" v-bind:id="'legendary-action-'+index">{{ legendary_action.desc }}</p>
			</div>
		</template>
	</div>
</template>

<script>
	export default {
		name: 'NPC',
		props: [
		'npc'
		],
		data() {
			return {
				abilities: [
					'strength',
					'dexterity',
					'constitution',
					'intelligence',
					'wisdom',
					'charisma',
				],
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
				var mod = parseInt(Math.floor((score - 10) / 2));
				var roll = (Math.floor(Math.random() * 20) + 1);
				var total = roll + mod;
				
				this.$snotify.success(ability + ' roll.', roll + ' + ' + mod + ' = ' + total, {
					position: "centerTop"
				});
			}
		}
	};
</script>

<style scoped>
h2 {
	margin-bottom:5px !important;
}
.abilities {
	padding-top: 30px;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
	grid-template-rows: auto;
	grid-gap: 10px;
	grid-template-areas: 
	"str dex con int wis cha";

	border-top: solid 1px #191919;
}
.ability {
	width: 42px;
	height: 44px;
	border:solid 1px #000;
	text-align:center;
	font-size:20px;
	position:relative;
	cursor:pointer;
}
.ability .score {
	position: absolute;
	bottom: -10px;
	left: 50%;
	transform: translateX(-50%);
	font-size:12px;
	border: solid 1px #000;
	text-align: center;
	border-radius: 15px / 10px;
	height:20px;
	width:30px;
}
.ability .abilityName {
	position: absolute;
	top: -20px;
	left: 50%;
	transform: translateX(-50%);
	font-size:12px;
	text-align: center;
}
</style>
