<template>
	<div class="pb-5">
		<h2>{{ npc.name }}</h2>
		<i>
			{{ npc.size }} {{ npc.type }}
			<span v-if="npc.subtype != ''">({{ npc.subtype }})</span>,
			{{ npc.alignment }}
		</i>
		<hr>
		<p>
			<b>Armor Class</b> {{ npc.armor_class }}<br/>
			<b>Hit Points</b> {{ npc.hit_points }} ({{ npc.hit_dice }})<br/>
			<b>Speed</b> {{ npc.speed }}
		</p>
		<hr class="mb-4">
		<div class="abilities">
			<span v-for="ability, index in abilities" :key="index" class="ability" @click="rollAbility(ability, npc[ability])">
				<span class="abilityName">{{ ability.substring(0,3).toUpperCase() }}</span>
				{{ modifier(npc[ability]) }}
				<span class="score bg-gray">{{ npc[ability] }}</span>
			</span>
		</div>
		<hr>

		<!-- SKILLS -->
		<p>
			<b>Skills</b>
			<span v-for="skill, index in skills" :key="index" v-if="npc[skill]">
				{{ skill }} {{ npc[skill] }},
			</span>
			<br/>
			<b>Senses</b> {{ npc.senses }}<br/>
			<b>Languages</b> {{ npc.languages }}<br/>
			<b>Challenge Rating</b> {{ npc.challenge_rating }}<br/>
		</p>
		<hr>
		<div class="mb-3" v-for="(ability, index) in npc.special_abilities" :key="index">
			<a data-toggle="collapse" v-bind:href="'#ability-'+index" role="button" aria-expanded="false">{{ ability.name }} <i class="fas fa-caret-down"></i></a>
			<p class="collapse" v-bind:id="'ability-'+index">{{ ability.desc }}</p>
		</div>
		<hr>
		<h2>Actions</h2>
		<div v-for="(action, index) in npc.actions" :key="index">
			<a data-toggle="collapse" v-bind:href="'#action-'+index" role="button" aria-expanded="false">{{ action.name }} <i class="fas fa-caret-down"></i></a>
			<p class="collapse" v-bind:id="'action-'+index">{{ action.desc }}</p>
		</div>

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
	display: grid;
	grid-template-columns: 42px 42px 42px 42px 42px 42px;
	grid-template-rows: auto;
	grid-gap: 10px;
	grid-template-areas: 
	"str dex con int wis cha";
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
