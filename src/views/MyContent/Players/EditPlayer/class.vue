<template>
	<div>
		
		<!-- MAIN CLASS -->
		<div>
			<h3>Level {{ main.level }} {{ main.name }}</h3>
			<div class="level">
				<div class="form-item mb-3">
					<label for="class">Class</label>
					<b-form-input 
						@change="saveClassName('main')"
						autocomplete="off"  
						id="class" 
						type="text" 
						v-model="main.name" 
						placeholder="Main Class"/>
				</div>
				<div class="form-item mb-3">
					<label for="level">Level</label>
					<select class="form-control" v-model="main.level" name="skills" @change="saveClassLevel('main')">
					<option v-for="level in 20" :key="`${level}`" :value="level">
						{{ level }}
					</option>
				</select>
				</div>
			</div>

			<h3><i class="fas fa-heart"></i> Hit Points</h3>
			<div class="hit_points">
				<div class="form-item mb-3">
					<label for="class">Starting HP</label>
					<b-form-input 
						@change="saveBaseHiPoints('main')"
						autocomplete="off"  
						id="class" 
						type="number" 
						v-model="main.base_hit_points" 
						placeholder="Starting hit points"/>
				</div>
				<div class="form-item mb-3">
					<label for="hit_dice">Hit dice</label>
					<b-form-select v-model="main.hit_dice" :options="dice" @change="saveHitDice('main')" />
				</div>
				<div class="rolled" v-if="hit_point_type === 'rolled' && main.level > 1">
					<label>Rolled HP</label>
				</div>
			</div>

			<h3><i class="fas fa-shield"></i> Armor Class</h3>
			<div class="form-item mb-3">
				<label for="class">Base AC</label>
				<b-form-input 
					@change="saveBaseArmorClass('main')"
					autocomplete="off"  
					id="class" 
					type="number" 
					v-model="main.base_armor_class" 
					placeholder="Base Armor Class"/>
			</div>
			<div class="form-item mb-3">
				<label for="class">Ability modifiers</label>
				<div>
					<el-select
						v-model="main.armor_class_modifiers"
						multiple
						collapse-tags
						placeholder="Ability Modifiers">
						<el-option
							v-for="ability in abilities"
							:key="ability"
							:label="ability.capitalize()"
							:value="ability">
						</el-option>
					</el-select>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { db } from '@/firebase';
	import { abilities } from '@/mixins/abilities.js';

	export default {
		name: 'CharacterRace',
		mixins: [abilities],
		props: [
			"base_class",
			"hit_point_type",
			"computed",
			"playerId", 
			"userId"
		],
		components: {
			GiveCharacterControl
		},
		data() {
			return {
				dice: [
					{ value: "4", text: "d4" },
					{ value: "6", text: "d6" },
					{ value: "8", text: "d8" },
					{ value: "10", text: "d10" },
					{ value: "12", text: "d12" },
				]
			}
		},
		computed: {
			Class() {
				return (this.base_class) ? this.base_class : {};
			},
			main() {
				return (this.base_class) ? this.base_class.classes.main : {};
			},
			subclasses() {
				return (this.base_class) ? this.base_class.classes : {};
			}
		},
		methods: {
			saveClassName(key) {
				const value = (key === 'main') ? this.main.name : this.subclasses[key].name;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/name`).set(value);
			},
			saveClassLevel(key) {
				const value = (key === 'main') ? this.main.level : this.subclasses[key].level;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/level`).set(value);
			},
			saveBaseHiPoints(key) {
				const value = (key === 'main') ? this.main.base_hit_points : this.subclasses[key].base_hit_points;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/base_hit_points`).set(value);
			},
			saveHitDice(key) {
				const value = (key === 'main') ? this.main.hit_dice : this.subclasses[key].hit_dice;
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/hit_dice`).set(value);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.form-control {
		width: 100%;
	}
	.level {
		display: grid;
		grid-template-columns: 1fr 100px;
		grid-gap: 15px;
	}
	.hit_points {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 15px;
	}
</style>