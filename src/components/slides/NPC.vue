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
			<span class="ability str" @click="rollAbility('Strength', npc.strength)">
				<span class="abilityName">STR</span>
				{{ modifier(npc.strength) }}
				<span class="score bg-gray">{{ npc.strength }}</span>
			</span>
			<span class="ability dex" @click="rollAbility('Dexterity', npc.dexterity)">
				<span class="abilityName">DEX</span>
				{{ modifier(npc.dexterity) }}
				<span class="score bg-gray">{{ npc.dexterity }}</span>
			</span>
			<span class="ability con" @click="rollAbility('Constitution', npc.constitution)">
				<span class="abilityName">CON</span>
				{{ modifier(npc.constitution) }}
				<span class="score bg-gray">{{ npc.constitution }}</span>
			</span>
			<span class="ability int" @click="rollAbility('Intelligence', npc.intelligence)">
				<span class="abilityName">INT</span>
				{{ modifier(npc.intelligence) }}
				<span class="score bg-gray">{{ npc.intelligence }}</span>
			</span>
			<span class="ability wis" @click="rollAbility('Wisdom', npc.wisdom)">
				<span class="abilityName">WIS</span>
				{{ modifier(npc.wisdom) }}
				<span class="score bg-gray">{{ npc.wisdom }}</span>
			</span>
			<span class="ability cha" @click="rollAbility('Charisma', npc.charisma)">
				<span class="abilityName">CHA</span>
				{{ modifier(npc.charisma) }}
				<span class="score bg-gray">{{ npc.charisma }}</span>
			</span>
		</div>
		<hr>

		<!-- SKILLS -->
		<p>
			<b>Skills</b>
			<span v-if="npc.perception"> Perception +{{ npc.perception }},</span>
			<span v-if="npc.stealth"> Stealth +{{ npc.stealth }}</span>
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
		<div v-for="(action, key) in npc.actions" :key="key">
			<a data-toggle="collapse" v-bind:href="'#action-'+key" role="button" aria-expanded="false">{{ action.name }} <i class="fas fa-caret-down"></i></a>
			<p class="collapse" v-bind:id="'action-'+key">{{ action.desc }}</p>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'NPC',
		props: [
		'npc'
		],
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
