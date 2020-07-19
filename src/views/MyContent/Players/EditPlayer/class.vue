<template>
	<div>
		
		<!-- MAIN CLASS -->
		<div v-for="(subclass, classKey) in classes" :key="`class-${classKey}`">
			<div>
				<h3>Level {{ subclass.level }} {{ subclass.name }}</h3>
				<div class="level">
					<div class="form-item mb-3">
						<label for="class">Class</label>
						<b-form-input 
							@change="saveClassName(classKey)"
							autocomplete="off"  
							id="class" 
							type="text" 
							v-model="subclass.name" 
							placeholder="Main Class"/>
					</div>
					<div class="form-item mb-3">
						<label for="level">Level</label>
						<select class="form-control" v-model="subclass.level" name="skills" @change="saveClassLevel('main')">
						<option v-for="level in 20" :key="`${level}`" :value="level">
							{{ level }}
						</option>
					</select>
					</div>
				</div>

				<h3><i class="fas fa-heart"></i> Hit Points</h3>
				<div class="hit_points">
					<div class="form-item mb-3" v-if="classKey === 'main'">
						<label for="class">Starting HP</label>
						<b-form-input 
							@change="saveBaseHiPoints(classKey)"
							autocomplete="off"  
							id="class" 
							type="number" 
							v-model="subclass.base_hit_points" 
							placeholder="Starting hit points"/>
					</div>
					<div class="form-item mb-3">
						<label for="hit_dice">Hit dice</label>
						<b-form-select v-model="subclass.hit_dice" :options="dice" @change="saveHitDice('main')" />
					</div>
					<div class="rolled" v-if="hit_point_type === 'rolled' && subclass.level > 1">
						<label>Rolled HP</label>
					</div>
				</div>

				<div class="form-item mb-3" v-if="classKey === 'main'">
					<label for="class">Base armor class</label>
					<b-form-input 
						@change="saveBaseArmorClass(classKey)"
						autocomplete="off"  
						id="class" 
						type="number" 
						v-model="subclass.base_armor_class" 
						placeholder="Base Armor Class"/>
				</div>
				
				<!-- CLASS FEATURES -->
				<h3>{{ subclass.name || "Class" }} features</h3>
				<template v-for="level in 20" >
					<div :key="`features-${level}`" v-if="subclass.level >= level">
						<h4 class="feature-title">
							Level {{ level }}
							<a @click="addFeature(classKey, level)">Add feature</a>
						</h4>
						<div role="tablist" v-if="subclass.features" class="mb-3">
							<b-card no-body v-for="(feature, key, index) in subclass.features[`level_${level}`]" :key="`feature-${index}`">
								<b-card-header role="tab">
									{{ feature.name }}
									<a v-b-toggle="`accordion-${level}-${index}`"><i class="fas fa-pencil-alt"></i></a>
								</b-card-header>
								<b-collapse :id="`accordion-${level}-${index}`" accordion="my-accordion" role="tabpanel">
									<b-card-body>
										<div class="form-item mb-3">
											<label for="class">Feature name</label>
											<b-form-input 
												@change="editFeature(classKey, level, key, 'name')"
												autocomplete="off"  
												:id="`name-${level}-${index}`" 
												type="text" 
												v-model="subclass.features[`level_${level}`][key].name" 
												placeholder="Feature name"/>
										</div>
									</b-card-body>
								</b-collapse>
							</b-card>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { db } from '@/firebase';

	export default {
		name: 'CharacterRace',
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
			classes() {
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
			},
			addFeature(key, level) {
				const feature = { name: `Level ${level} feature` }
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${key}/features/level_${level}`).push(feature);
			},
			editFeature(classKey, level, featureKey, prop) {
				const value = this.classes[classKey].features[`level_${level}`][featureKey][prop];
				db.ref(`characters_base/${this.userId}/${this.playerId}/class/classes/${classKey}/features/level_${level}/${featureKey}/${prop}`).set(value);
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
		grid-template-columns: 100px 100px 1fr;
		grid-gap: 15px;
	}
	h4.feature-title {
		display: flex;
		justify-content: space-between;
		font-size: 16px;
		padding-bottom: 5px;
		margin-bottom: 1px;
		border-bottom: solid 1px #5c5757;
	}
	.card {
		.card-header {
			text-transform: none !important;
		}
		margin-bottom: 1px !important;
	}
</style>