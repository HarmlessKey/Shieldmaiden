<template>
	<div>
		<template v-if="(old_spell && spell)">
			
			<Crumble :name="old_spell.name"/>

			<b-row>
				<b-col md="4" id="old_spell">
					<b-card header="Old Spell Description" v-if="loading">
						<div  class="loader"> <span>Loading old_spell....</span></div>
					</b-card>
					<b-card class="old_spell" header="Old Spell Description" v-else>
						<h1 class="spellTitle">{{ old_spell.name }}</h1>
						<i class="mb-3 d-block" v-if="old_spell.school">
							{{ levels[old_spell.level] }}
							{{ old_spell.school.name }}
						</i>

						<p>
							<b>Casting time:</b> {{ old_spell.casting_time }}<br/>
							<b>Range:</b> {{ old_spell.range }}<br/>
							<b>Components:</b> 
							<template v-for="(component, index) in old_spell.components">
								{{ component }}<template v-if="Object.keys(old_spell.components).length > index + 1">, </template>
							</template>
							<template v-if="old_spell.material"> ({{ old_spell.material }})</template>
							<br/>
							<b>Duration:</b>
								<template v-if="old_spell.concentration == 'yes'"> Concentration, </template>
								{{ old_spell.duration }}<br/>
							<b>Classes:</b> 
							<template v-for="(_class, index) in old_spell.classes">
								{{ _class.name }}<template v-if="Object.keys(old_spell.classes).length > index + 1">, </template>
							</template>
							<br/>
						</p>
						<p v-for="(desc, index) in old_spell.desc" :key="index">
							{{ desc }}
						</p>

						<p v-if="old_spell.higher_level">
							At higher levels. 
							<template v-for="higher in old_spell.higher_level">
								{{ higher }}
							</template>
						</p>
					</b-card>
				</b-col> <!-- Old spell -->
				<b-col md="8" id="new_spell">
					<b-card header="Basic Info">
						<b-row>
							<!-- NAME -->
							<b-col md="6">
								<label for="name">Name</label>
								<b-form-input v-model="spell.name"
									id="name"
									name="name"
									title="Name"
									type="text"
									class="form-control mb-2"
									:class="{'input': true, 'error': errors.has('name') }"
									v-validate="'required'"
									autocomplete="off"
									data-vv-as="Name"
									placeholde="Name">
								</b-form-input>
								<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
							</b-col>
							<!-- LEVEL -->
							<b-col md="3">
								<label for="spell_level">Level</label>
								<b-form-select v-model="spell.level"
									id="spell_level"
									name="spell_level"
									title="Spell Level"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Spell Level">
									<option value="Undefined" disabled>- Spell Level -</option>
									<option v-for="(l,i) in levels" 
										:key="i" :value="i" 
										:seleced="spell.level==i">{{l}}</option>
								</b-form-select>
							</b-col>
							<!-- SCHOOL -->
							<b-col md="3">
								<label for="spell_school">School</label>
								<b-form-select v-model="spell.school"
									id="spell_school"
									name="spell_school"
									title="Spell School"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Spell School">
									<option value="Undefined" disabled>- Select School -</option>
									<option v-for="(s,i) in schools"
										:key="s" :value="s">{{s}}</option>
								</b-form-select>
							</b-col>
						</b-row>
						<b-row>
							<!-- CAST TIME -->
							<b-col md="2">
								<label for="cast_time_nr">Cast Time</label>
								<b-form-input v-model="spell.cast_time_nr"
									autocomplete="off"
									id="cast_time_nr"
									name="cast_time_nr"
									class="form-control mb-2"
									title="Casting Time"
									v-validate="'required'"
									type="number"
									data-vv-as="Cast Time"
									></b-form-input>
							</b-col>
							<!-- CAST TIME TYPE -->
							<b-col md="3">
								<label for="cast_time_nr">Cast Type</label>
								<b-form-select v-model="spell.cast_time_type"
									id="cast_time_type"
									name="cast_time_type"
									title="Casting Type"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Casting Type">
									<option value="Undefined" disabled>- Casting Type -</option>
									<option v-for="(t,i) in cast_time"
										:key="t" :value="t">{{t}}</option>
								</b-form-select>
								
							</b-col>
							<!-- REACTION TIME DESCRIPTION -->
							<b-col>
								<label for="cast_time_nr">Reaction Time Description</label>
								<b-form-input v-model="spell.cast_time_react_desc"
									:disabled="spell.cast_time_type!='Reaction'"
									autocomplete="off"
									id="cast_time_react_desc"
									name="cast_time_react_desc"
									class="form-control mb-2"
									title="Reaction Time Description"
									type="text"
									data-vv-as="Reaction Time Description"
									placeholder="Enter the reaction time description"
									></b-form-input>
							</b-col>
						</b-row>
						<b-row>
							<!-- COMPONENTS -->
							<b-col md="3" v-if="spell.components">
								<label for="components">Componens</label>
								<div class="components d-flex justify-content-between" name="components">
									<a class="component_box" @click="setCompontent('verbal')"
										 :class="{'selected': spell.components['verbal']}">
										<span>V</span>
									</a>
									<a class="component_box" @click="setCompontent('somatic')"
										 :class="{'selected': spell.components['somatic']}">
										<span>S</span>
									</a>
									<a class="component_box" @click="setCompontent('material')"
										 :class="{'selected': spell.components['material']}">
										<span>M</span>
									</a>
								</div>
							</b-col>
							<!-- MATERIAL COMPONENT DESCRIPTION -->
							<b-col md='9' v-if="spell.components">
								<label>Material components description</label>
								<b-form-input v-model="spell.material_description"
									:disabled="!spell.components['material']"
									autocomplete="off"
									id="material_description"
									name="material_description"
									class="form-control mb-2"
									title="Material Component Description"
									type="text"
									data-vv-as="Material Component Description"
									placeholder="Enter the material component description"
									></b-form-input>
							</b-col>
						</b-row>
						<b-row>
							<!-- RANGE TYPE -->
							<b-col md="4">
								<label for="range_type">Range Type</label>
								<b-form-select v-model="spell.range_type"
									id="range_type"
									name="range_type"
									title="Range Type"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Range Type">
									<option value="Undefined" disabled>- Range Type -</option>
									<option v-for="(val,i) in range_type"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
							<!-- RANGE -->
							<b-col md="3">
								<label for="range">Range ft.</label>
								<b-form-input v-model="spell.range"
									autocomplete="off"
									id="range"
									name="range"
									class="form-control mb-2"
									title="Range"
									v-validate="'required'"
									type="number"
									data-vv-as="Range"
									></b-form-input>
							</b-col>
							<!-- DURATION -->
							<b-col md="5">
								<label for="duration_type">Duration Type</label>
								<b-form-select v-model="spell.duration_type"
									id="duration_type"
									name="duration_type"
									title="Duration Type"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Duration Type">
									<option value="Undefined" disabled>- Duration Type -</option>
									<option v-for="(val,i) in dur_type"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
						</b-row>
						<b-row>
							<!-- DURATION N -->
							<b-col md="6">
								<label for="duration_n">Duration #</label>
								<b-form-input v-model="spell.duration_n"
									:disabled="!dur_type_time.includes(spell.duration_type)"
									autocomplete="off"
									id="duration_n"
									name="duration_n"
									class="form-control mb-2"
									title="Duration #"
									type="text"
									></b-form-input>
							</b-col>
							<!-- DURATION SCALE -->
							<b-col md="6">
								<label for="duration_scale">Time Scale</label>
								<b-form-select v-model="spell.duration_scale"
									:disabled="!dur_type_time.includes(spell.duration_type)"
									id="duration_scale"
									name="duration_scale"
									title="Time Scale"
									class="form-control mb-2">
									<option value="Undefined">- Time Scale -</option>
									<option v-for="(val,i) in dur_time"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
						</b-row>
						<b-row>
							<!-- DESCRIPTION -->
							<b-col md="8">
								<label for="description">Description</label>
								<b-form-textarea v-model="spell.description"
									id="description"
									name="description"
									title="Description"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Description"
									rows="6"></b-form-textarea>
							</b-col>
							<!-- CLASS SELECTOR -->
							<b-col md="4" v-if="spell.classes">
								<label for="classes">Classes</label>
								<b-form-select v-model="spell.classes"
									id="classes"
									name="classes"
									title="Classes" 
									multiple size="6"
									class="form-control mb-2">
									<option v-for="(val,i) in classes"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
						</b-row>
						<b-row class="d-flex spell_row">
							<!-- RITUAL -->
							<b-col md="2">
								<label for="ritual">Ritual</label>
								<div class="ritual d-flex justify-content-between" name="ritual">
									<a class="component_box" @click="setRitual()"
										 :class="{'selected': spell.ritual === true}">
										<span>R</span>
									</a>
								</div>
							</b-col>
							<!-- LEVEL SCALING -->
							<b-col md="5">
								<label for="level_scaling">Level Scaling</label>
								<b-form-select v-model="spell.level_scaling"
									id="level_scaling"
									name="level_scaling"
									title="Level Scaling"
									class="form-control mb-2">
									<option value="Undefined">- Level Scaling -</option>
									<option v-for="(val,i) in lvl_scaling"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
							<!-- SOURCE BOOK -->
							<b-col md="5">
								<label for="source">Source</label>
								<b-form-input v-model="spell.page"
									autocomplete="off"
									id="source"
									name="source"
									class="form-control mb-2"
									title="Source"
									v-validate="'required'"
									data-vv-as="Source"
									></b-form-input>
							</b-col>
						</b-row>
					</b-card>
					<b-card header="Attack Info">
						<b-row>
							<!-- ATTACK TYPE -->
							<b-col md="6">
								<label for="attack_type">Attack Type</label>
								<b-form-select v-model="spell.attack_type"
									id="attack_type"
									name="attack_type"
									title="Attack Type"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Attack Type">
									<option value="Undefined" disabled>- Attack Type -</option>
									<option v-for="(val,i) in attack_type"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
							<!-- SAVE -->
							<b-col md="6">
								<label for="save">Save</label>
								<b-form-select v-model="spell.save"
									id="save"
									name="save"
									title="Save"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Save">
									<option value="Undefined" disabled>- Save -</option>
									<option v-for="(val,i) in save"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
						</b-row>
						<b-row>
							<b-col md="6">
								<!-- AOE TYPE -->
								<label for="aoe_type">AOE Type</label>
								<b-form-select v-model="spell.aoe_type"
									id="aoe_type"
									name="aoe_type"
									title="AOE Type"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="AOE Type">
									<option value="Undefined" disabled>- AOE Type -</option>
									<option v-for="(val,i) in aoe_type"
										:key="i" :value="val">{{val}}</option>
								</b-form-select>
							</b-col>
							<b-col md="6">
								<label for="aoe_size">AOE Size ft.</label>
								<b-form-input v-model="spell.aoe_size"
									autocomplete="off"
									id="aoe_size"
									name="aoe_size"
									class="form-control mb-2"
									title="AOE Size"
									v-validate="'required'"
									type="number"
									data-vv-as="AOE Size"
									></b-form-input>
							</b-col>
						</b-row>
					</b-card>
					<div class="card">
						<div class="card-header d-flex justify-content-between">
							<span>Modifiers</span>
							<a 
							class="gray-hover text-capitalize" 
							v-b-tooltip.hover title="Add Modifiers" 
							@click="add_modifier()">
								<i class="fas fa-plus green"></i>
								<span class="d-none d-md-inline ml-1">Add</span>
							</a>
						</div>
						<div class="card-body">
							<div v-for="(modifier, index) in spell.modifiers">
								<b-row class="summary">
								</b-row>
								<b-row>
									<b-col md="4">
										<!-- MODIFIER TYPE -->
										<label for="modifier_type">Modifier Type</label>
										<b-form-select v-model="modifier.type"
											id="modifier_type"
											name="modifier_type"
											title="Modifier Type"
											class="form-control mb-2"
											v-validate="'required'"
											data-vv-as="Modifier Type">
											<option value="Undefined" disabled>- Modifier Type -</option>
											<option v-for="(val,i) in modifier_type"
												:key="i" :value="val">{{val}}</option>
										</b-form-select>
									</b-col>
									<b-col md="4">
										<!-- MODIFIER SUBTYPE -->
										<label for="modifier_subtype">Subtype</label>
										<b-form-select v-model="modifier.subtype"
											id="modifier_subtype"
											name="modifier_subtype"
											title="Modifier Type"
											class="form-control mb-2"
											v-validate="'required'"
											data-vv-as="Modifier Type">
											<option value="Undefined" disabled>- Subtype -</option>
											<option v-for="(val,i) in modifier_subtype"
												:key="i" :value="val">{{val}}</option>
										</b-form-select>
									</b-col>
								</b-row>
								<b-row>
									<!-- DICE COUNT -->
									<b-col md="4">
										<label for="dice_count">Dice Count</label>
										<b-form-input v-model="modifier.dice_count"
											autocomplete="off"
											id="dice_count"
											name="dice_count"
											class="form-control mb-2"
											title="AOE Size"
											v-validate="'required'"
											type="number"
											data-vv-as="AOE Size"
											></b-form-input>
									</b-col>
									<b-col md="4">
										<!-- MODIFIER SUBTYPE -->
										<label for="dice_type">Dice Type</label>
										<b-form-select v-model="modifier.dice_type"
											id="dice_type"
											name="dice_type"
											title="Modifier Type"
											class="form-control mb-2"
											v-validate="'required'"
											data-vv-as="Modifier Type">
											<option value="Undefined" disabled>- Subtype -</option>
											<option v-for="(val,i) in dice_type"
												:key="i" :value="val">{{val}}</option>
										</b-form-select>
									</b-col>
									<b-col md="4">
										<!-- MODIFIER FIXED VALUE -->
										<label for="fixed_val">Fixed Value</label>
										<b-form-input v-model="modifier.fixed_val"
											autocomplete="off"
											id="fixed_val"
											name="fixed_val"
											class="form-control mb-2"
											title="AOE Size"
											v-validate="'required'"
											type="number"
											data-vv-as="AOE Size"
											></b-form-input>
									</b-col>
								</b-row>
							</div>
						</div>
					</div>
					<div class="card">
						<div class="card-header d-flex justify-content-between">
							<span>Conditions</span>
							<a 
							class="gray-hover text-capitalize" 
							v-b-tooltip.hover title="Add Conditions" 
							@click="add_condition()">
								<i class="fas fa-plus green"></i>
								<span class="d-none d-md-inline ml-1">Add</span>
							</a>
						</div>
						<div class="card-body">
							
						</div>
					</div>
					<div class="card">
						<div class="card-header d-flex justify-content-between">
							<span>Reminders</span>
							<a 
							class="gray-hover text-capitalize" 
							v-b-tooltip.hover title="Add Reminders" 
							@click="add_reminder()">
								<i class="fas fa-plus green"></i>
								<span class="d-none d-md-inline ml-1">Add</span>
							</a>
						</div>
						<div class="card-body">
							
						</div>
					</div>
				</b-col>
			</b-row>
		</template>
	<!-- <style src="vue-multiselect/dist/vue-multiselect.min.css"></style> -->
	</div>
</template>

<script>
	import { db, db_dev } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import { mapGetters } from 'vuex'

	export default {
		name: 'SpellEdit',
		components: {
			Crumble,
		},
		props: ['id'],
		metaInfo() {
			return {
				title: this.old_spell.name + ' | D&D 5th Edition',
				meta: [
          { vmid: 'description', name: 'description', content: 'D&D 5th Edition Spell: ' + this.old_spell.name }
        ]
			}
		},
		beforeMount() {
			//Because the component is loaded
			//in another view, the scroll needs to be reset to 0
			window.scrollTo(0,0);
		},
		data() {
			return {
				loading: true,
				levels: ["Cantrip",
					"1st","2nd","3rd",
					"4th","5th","6th",
					"7th","8th","9th"],
				schools: [
					"Abjuration","Conjuration",
					"Divination","Enchantment",
					"Evocation","Illusion",
					"Necromancy","Transmutation"],
				cast_time: [
					"Action", "Bonus Action", "Reaction", 
					"Minute", "Hour", "No Action"],
				range_type: ["Self", "Touch", "Ranged", "Sight", "Unlimited"],
				dur_type: ["Concentration", "Instantanious", "Special",
				 "Time", "Until Dispelled", "Until Dispelled or Triggered"],
				dur_type_time: ["Concentration", "Special", "Time"],
				dur_time: ["Round", "Minute", "Hour", "Day"],
				lvl_scaling: ["None", "Character Level", "Spell Scale", "Spell Level"],
				classes: ["Bard", "Barbarian", "Cleric", "Druid", "Fighter", "Monk", 
					"Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"],
				classes_selected: null,
				attack_type: ["Melee Weapon", "Ranged Weapon", "Melee Spell", "Ranged Spell"],
				save: ["None", "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
				aoe_type: ["None", "Cone", "Cube", "Cylinder", "Line", "Sphere", "Square", "Square Feet"],
				modifier_type: ["Damage", "Healing"],
				modifier_subtype: ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning",
					"Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"],
				dice_type: ["D4", "D6", "D8", "D10", "D12", "D20"],
			}
		},
		computed: {
			...mapGetters([
				'tier',
			]),
		},
		mounted() {
			this.$nextTick(function() {
				if ($('ins').length > 0) {
					(adsbygoogle = window.adsbygoogle || []).push({});
				}
			})
		},
		firebase() {
			return {
				spell: {
					source: db_dev.ref(`spells/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				old_spell: {
					source: db.ref(`spells/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				}
			}
		},
		methods: {
			setCompontent(comp) {
				if (Object.keys(this.spell.components)[0]=="0") {
					this.spell.components = {'verbal':0,'somatic':0,'material':0}
				}
				this.spell.components[comp] = !this.spell.components[comp]
			},
			setRitual() {
				let yn = ["yes", "no"]
				if (yn.includes(this.spell.ritual)) {
					this.spell.ritual = false
				}
				this.spell.ritual = !this.spell.ritual
			},
			add_modifier() {
				if(this.spell.modifiers == undefined) {
					this.spell.modifiers = [];
				}
				this.spell.modifiers.push({
					name: 'New Modifier',
				});
				this.$forceUpdate(); //IMPORTANT
			}
		}
	}
</script>

<!-- <style src="vue-multiselect/dist/vue-multiselect.min.css"></style> -->

<style lang="scss" scoped>
	// @import "vue-multiselect/dist/vue-multiselect.min.css";

 .spellTitle {
		margin-bottom: 5px;
 }
 .url {
	display: block;
	margin-bottom: 15px;
	word-break: break-all;
}
label {
	margin-top: 0.5rem;
	margin-bottom: 0;
}

.component_box {
	background: #000;
	width: 40px;
	text-align: center;
	line-height: 36px;
	height: 36px;
	font-size: 18px;
	span {
		color: white;
	}
}
.component_box.selected {
	background: #2c97de;
}

.class_box {
	padding: 0 6px;
	background: #000;
	width: 40px;
	text-align: center;
	line-height: 36px;
	height: 36px;
	font-size: 18px;
	span {
		color: white;
	}
}

select#classes {
	height: 158px;
}

.old_spell {
	position: -webkit-sticky;
	position: sticky;
	top: 60px;
}

</style>