<template>
	<div id="hasSide">
		<Sidebar/>
		
		<div id="npcs" class="container" v-if="npc || $route.name == 'AddNpc'">
			
			<h1>Basic info</h1>
			<input type="text" class="form-control" :class="{'input': true, 'error': errors.has('name') }" v-model="npc.name" v-validate="'alpha_spaces|required'" name="name" placeholder="Name*" />
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

			<div class="row">
				<div class="col-lg">
					<input type="text" class="form-control" v-model="npc.size" name="size" placeholder="Size" />
				</div>
				<div class="col-lg">
					<input type="text" class="form-control" v-model="npc.type" name="type" placeholder="Type" />

					<input type="text" class="form-control" v-model="npc.subtype" name="subtype" placeholder="Subtype" />
				</div>
			</div>

			<input type="number" class="form-control" :class="{'input': true, 'error': errors.has('ac') }" v-model="npc.ac" v-validate="'required'" name="ac" placeholder="Armor Class" />
					<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>

			<div class="row">
				<div class="col-lg">
					<input type="number" class="form-control" :class="{'input': true, 'error': errors.has('Hit Points') }" v-model="npc.maxHp" v-validate="'required'" name="Hit Points" placeholder="Hit Points" />
					<p class="validate red" v-if="errors.has('Hit Points')">{{ errors.first('Hit Points') }}</p>
				</div>
				<div class="col-lg">
					<input type="text" class="form-control" v-model="npc.hit_dice"  name="Hit Dice" placeholder="Hit Dice" />
				</div>
			</div>

			<input type="text" class="form-control" v-model="npc.speed" name="speed" placeholder="Speed" />

			<input type="text" class="form-control" :class="{'input': true, 'error': errors.has('avatar') }" v-model="npc.avatar" v-validate="'url'" name="avatar" placeholder="Image URL" />
			<p class="validate red" v-if="errors.has('avatar')">{{ errors.first('avatar') }}</p>

			<hr>
			<h2 class="my-4">Ability Scores</h2>
			<div class="abilities">
				<span class="ability str">
					<span class="abilityName">STR</span>
					<input type="number" class="form-control" v-model="npc.strength" name="strength" placeholder="STR" />
				</span>
				<span class="ability dex">
					<span class="abilityName">DEX</span>
					<input type="number" class="form-control" v-model="npc.dexterity" name="dexterity" placeholder="DEX" />
				</span>
				<span class="ability con">
					<span class="abilityName">CON</span>
					<input type="number" class="form-control" v-model="npc.constitution" name="constitution" placeholder="CON" />
				</span>
				<span class="ability int">
					<span class="abilityName">INT</span>
					<input type="number" class="form-control" v-model="npc.intelligence" name="intelligence" placeholder="INT" />
				</span>
				<span class="ability wis">
					<span class="abilityName">WIS</span>
					<input type="number" class="form-control" v-model="npc.wisdom" name="wisdom" placeholder="WIS" />
				</span>
				<span class="ability cha">
					<span class="abilityName">CHA</span>
					<input type="number" class="form-control" v-model="npc.charisma" name="charisma" placeholder="CHA" />
				</span>
			</div>

			<hr>

			<h2 class="my-4">Skills <a class="green" v-b-tooltip.hover title="Add Skill" @click="addSkill()"><i class="fas fa-plus-circle"></i></a></h2>
			
			<div class="row skills" v-for="npcSkill, index in npcSkills" :key="index">
				<div class="col-3 d-flex justify-content-left">
					<span class="mr-2">{{ index + 1 }}. </span>
					<select class="form-control">
						<option v-for="skill in skills">
							{{ skill }}
						</option>
					</select>
				</div>
				<div class="col-3 d-flex justify-content-left">
					<input type="number" class="form-control mr-2" name="skill" placeholder="modifier" />
					<a class="red" @click="removeSkill(index)" v-b-tooltip.hover title="Remove Skill"><i class="fas fa-minus-circle"></i></a>
				</div>
			</div>
			<hr>

			<input type="text" class="form-control" v-model="npc.damage_vulnerabilities" name="damage_vulnerabilities" placeholder="Damage Vulnerabilities" />
			<input type="text" class="form-control" v-model="npc.damage_resistances" name="damage_resistances" placeholder="Damage Resistances" />
			<input type="text" class="form-control" v-model="npc.damage_immunities" name="damage_immunities" placeholder="Damage Immunities" />
			<input type="text" class="form-control" v-model="npc.condition_immunities" name="condition_immunities" placeholder="Condition Immunities" />
			<input type="text" class="form-control" v-model="npc.senses" name="senses" placeholder="Senses" />
			<input type="text" class="form-control" v-model="npc.languages" name="senses" placeholder="Languages" />
			<input type="text" class="form-control" v-model="npc.challenge_rating" name="senses" placeholder="Challenge Rating" />
			
			<hr>
			<router-link to="/npcs" class="btn bg-gray mr-2">Cancel</router-link>
			<button v-if="$route.name == 'AddNpcs'" class="btn" @click="addNpc()"><i class="fas fa-plus"></i> Add NPC</button>
			<button v-else class="btn" @click="editNpc()"><i class="fas fa-check"></i> Save</button>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import { db } from '@/firebase'

	export default {
		name: 'Npcs',
		components: {
			Sidebar,
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				npcId: this.$route.params.id,
				npcSkills: [],
				skills: [
					'Acrobatics',
					'Animal Handling',
					'Arcana',
					'Athletics',
					'Deception',
					'History',
					'Insight',
					'Intimidation',
					'Investigation',
					'Medicine',
					'Nature',
					'Perception',
					'Performance',
					'Persuasion',
					'Religion',
					'Sleight of Hand',
					'Stealth',
					'Survival',
				]
			}
		},
		firebase() {
			return {
				npc: {
					source: db.ref(`npcs/${this.userId}/${this.npcId}`),
					asObject: true
				}
			}
		},
		methods: {
			addNpc() {
				console.log('npc: ', this.npc)
				// this.$validator.validateAll().then((result) => {
				// 	if (result) {
				// 		db.ref('npcs/' + this.userId).push(this.npc);
				// 		this.$router.replace('/npcs')
				// 	} else {
				// 		//console.log('Not valid');
				// 	}
				// })
			},
			editNpc() {
				console.log('npc: ', this.npc)
				// this.$validator.validateAll().then((result) => {
				// 	if (result) {
				// 		db.ref(`npcs/${this.userId}/${this.npcId}`).set(this.npc);
				// 		this.$router.replace('/npcs')
				// 	} else {
				// 		//console.log('Not valid');
				// 	}
				// })
			},
			addSkill() {
				this.npcSkills.push({
					skill: '',
					mod: ''
				});
			},
			removeSkill(index) {
				this.$delete(this.npcSkills, index);
			},
		}
	}
</script>

<style lang="scss" scoped>
.container {
	padding-top:20px;

	.btn {
	margin-top:20px;
	}
	input {
		margin-top: 15px;
	}
	.skills {
		line-height: 40px;
		input {
			margin-top: 0;
		}
	}

	.abilities {
		margin-top: 30px;
		display: grid;
		grid-template-columns: 70px 70px 70px 70px 70px 70px;
		grid-template-rows: auto;
		grid-gap: 10px;
		grid-template-areas: 
		"str dex con int wis cha";

		input {
			margin-top: 0;
			padding-right: 0;
			width: 70px;
		}

		.ability {
			width: 70px;
			height: 44px;
			text-align:center;
			font-size:20px;
			position:relative;
			cursor:pointer;
		
		}
		.ability .abilityName {
			position: absolute;
			top: -20px;
			left: 50%;
			transform: translateX(-50%);
			font-size:12px;
			text-align: center;
		}
	}
}



</style>