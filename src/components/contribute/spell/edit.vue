<template>
	<div>
		<template v-if="(old_spell && spell)">
			
			<!-- <Crumble :name="old_spell.name"/> -->

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
					<div>
						<a 
						class="gray-hover text-capitalize mx-3" 
						v-b-tooltip.hover title="Parse Old Spell" 
						@click="parse_old_spell()">
							<i class="fad fa-wand-magic blue"></i>
							<span class="d-none d-md-inline ml-1 blue">Parse</span>
						</a>
						<a 
						class="gray-hover text-capitalize mx-3" 
						v-b-tooltip.hover title="Save Spell" 
						@click="store_spell()">
							<i class="fad fa-treasure-chest green"></i>
							<span class="d-none d-md-inline ml-1 green">Save</span>
						</a>
					</div>
					<basic-info v-model='spell' :levels='levels'/>
					<!-- SPELL ACTIONS -->
					<spell-actions v-model='spell' />
					<!-- MODIFIERS -->
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
							<div class="card" v-for="(modifier, mod_index) in spell.modifiers">
								<div class="card-header collapse-header">
									<a v-b-toggle="'accordion-'+mod_index" class="gray-light" >
											{{parseInt(mod_index) + 1}}. 
											{{(modifier.spell_action !== undefined) ? (spell.actions[modifier.spell_action].name || spell.actions[modifier.spell_action].type): ""}}: 
											{{modifier.dice_count}}{{modifier.dice_type}}{{modifier.fixed_val ? "+" : ""}}{{modifier.fixed_val}} 
											{{modifier.subtype}} {{modifier.type}}
										<!-- <div> -->
											<!-- <a class="bg-gray-light" v-b-toggle="'accordion-'+mod_index" >Expand</a> -->
											<!-- <button class="btn bg-red" @click="remove_modifier(mod_index)"><i class="fas fa-trash-alt white"></i></button> -->
									</a>
									<a @click="remove_modifier(mod_index)"
										class="gray-hover text-capitalize"
										v-b-tooltip.hover title="Remove">
										<i class="fas fa-trash-alt red"></i>
										<!-- <span class="d-none d-md-inline ml-1">Remove</span> -->
									</a>
										<!-- </div> -->
								</div>
									
									<!-- THIS BREAKS WHEN DELETE SPELL ACTION -->

								<b-collapse visible :id="'accordion-'+mod_index" accordion="my-accordion">
									<div class="card-body">
										<!-- <template v-if="modifier.spell_action != undefined"> -->
											<b-row>
												<b-col>
													<label for="spell_action">Spell Action</label>
													<b-form-select v-model="modifier.spell_action"
														id="spell_action"
														name="spell_action"
														title="Spell Action"
														class="form-control mb-2 mr-5"
														v-validate="'required'"
														data-vv-as="Spell Action"
														@change="$forceUpdate()">
														<option value="undefined" disabled>- Spell Action -</option>
														<option v-for="(val,i) in spell.actions"
															:key="i" :value="i">{{val.name || val.type}}</option>
													</b-form-select>
													<p class="validate red" v-if="errors.has('spell_action')">{{ errors.first('spell_action') }}</p>
												</b-col>
												<b-col md="4" v-if="modifier.spell_action != undefined">
													<!-- MODIFIER SUBTYPE -->
													<label for="modifier_subtype">Subtype</label>
													<b-form-select v-model="modifier.subtype"
														:disabled="spell.actions[modifier.spell_action].type=='Healing Spell'"
														id="modifier_subtype"
														name="modifier_subtype"
														title="Modifier Subtype"
														class="form-control mb-2"
														data-vv-as="Modifier Subtype"
														@change="$forceUpdate()">
														<option value="undefined" disabled>- Subtype -</option>
														<option v-for="(val,i) in modifier_subtype"
															:key="i" :value="val">{{val}}</option>
													</b-form-select>
												</b-col>
												<b-col md="4" v-if="modifier.spell_action != undefined">
													<label for="primary">Primary Stat</label>
													<div class="primary d-flex justify-content-between" name="primary">
														<a class="component_box" @click="setPrimary(modifier)"
															 :class="{'selected': modifier.primary === true}">
															<span>P</span>
														</a>
													</div>
												</b-col>
											</b-row>
											<b-row v-if="modifier.spell_action != undefined">
												<!-- DICE COUNT -->
												<b-col md="4">
													<label for="dice_count">Dice Count</label>
													<b-form-input v-model="modifier.dice_count"
														autocomplete="off"
														id="dice_count"
														name="dice_count"
														class="form-control mb-2"
														title="Dice Count"
														type="number"
														data-vv-as="Dice Count"
														@keyup="$forceUpdate()"
														></b-form-input>
												</b-col>
												<b-col md="4">
													<!-- MODIFIER SUBTYPE -->
													<label for="dice_type">Dice Type</label>
													<b-form-select v-model="modifier.dice_type"
														id="dice_type"
														name="dice_type"
														title="Dice Type"
														class="form-control mb-2"
														data-vv-as="Dice Type"
														@change="$forceUpdate()">
														<!-- <option value="undefined" disabled>- Subtype -</option> -->
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
														title="Fixed Value"
														type="number"
														data-vv-as="Fixed Value"
														@keyup="$forceUpdate()"
														></b-form-input>
												</b-col>
											</b-row>
											<template v-if="spell.level_scaling != undefined && spell.level_scaling != 'None'">
												<!-- HIGHER LEVEL MODIFIER -->
												<b-row>
													<b-col>
														<hr>
													</b-col>
													<b-col class="col-1" v-if="level_tier_addable(mod_index)">
														<a 
														class="gray-hover text-capitalize" 
														v-b-tooltip.hover title="Add Level Tier" 
														@click="add_level_tier(mod_index)">
															<i class="fas fa-plus green"></i>
															<!-- <span class="d-none d-md-inline ml-1">Add</span> -->
														</a>
													</b-col>
												</b-row>
												<b-row v-for="(level_tier, tier_index) in modifier.level_tiers" v-if="tier_index < shown_level_tiers">
													<!-- HL LEVEL SCALE -->
													<b-col md="3">
														<label for="level">{{spell.level_scaling}}</label>
														<b-form-input v-model="level_tier.level"
															autocomplete="off"
															id="level"
															name="level"
															class="form-control mb-2"
															:title="spell.level_scaling"
															v-validate="'required'"
															type="number"
															:data-vv-as="spell.level_scaling"
															@keyup="$forceUpdate()"
															></b-form-input>
															<p class="validate red" v-if="errors.has('level')">{{ errors.first('level') }}</p>
													</b-col>
													<!-- HL DICE COUNT -->
													<b-col md="3">
														<label for="dice_count">Dice Count</label>
														<b-form-input v-model="level_tier.dice_count"
															autocomplete="off"
															id="dice_count"
															name="dice_count"
															class="form-control mb-2"
															title="Dice Count"
															type="number"
															data-vv-as="Dice Count"
															@keyup="$forceUpdate()"
															></b-form-input>
													</b-col>
													<b-col md="3">
														<!-- HL MODIFIER SUBTYPE -->
														<label for="dice_type">Dice Type</label>
														<b-form-select v-model="level_tier.dice_type"
															id="dice_type"
															name="dice_type"
															title="Dice Type"
															class="form-control mb-2"
															data-vv-as="Dice Type"
															@change="$forceUpdate()">
															<option value="undefined" disabled>- Subtype -</option>
															<option v-for="(val,i) in dice_type"
																:key="i" :value="val">{{val}}</option>
														</b-form-select>
													</b-col>
													<b-col md="2">
														<!-- HL MODIFIER FIXED VALUE -->
														<label for="fixed_val">Fixed Value</label>
														<b-form-input v-model="level_tier.fixed_val"
															autocomplete="off"
															id="fixed_val"
															name="fixed_val"
															class="form-control mb-2"
															title="Fixed Value"
															type="number"
															data-vv-as="Fixed Value"
															@keyup="$forceUpdate()"
															></b-form-input>
													</b-col>
													<b-col md='1' class="remove-link">
														<a @click="remove_level_tier(mod_index, tier_index)"
															class="gray-hover text-capitalize"
															v-b-tooltip.hover title="Remove">
															<i class="fas fa-trash-alt red"></i>
															<!-- <span class="d-none d-md-inline ml-1">Remove</span> -->
														</a>
													</b-col>
												</b-row>
												<p v-if="modifier.level_tiers.length >= 1">
													<span v-for="line in create_spell_level_tier_description(spell, modifier.level_tiers)">
														{{line}}<br>
													</span>
												</p>
											</template>
										<!-- </template> -->
									</div>  <!-- END MODIFIER CARD BODY -->
								</b-collapse>
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
	import basicInfo from '@/components/contribute/spell/forms/basic-info.vue'
	import spellActions from '@/components/contribute/spell/forms/spell-actions.vue'
	import { mapGetters } from 'vuex'
	import numeral from 'numeral'

	export default {
		name: 'SpellEdit',
		components: {
			Crumble,
			basicInfo,
			spellActions,
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
			shown_level_tiers() {
				if (this.spell.level_scaling == "Spell Scale") {
					return 1
				}
				return 100
			},
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
					source: db.ref(`new_spells/${this.id}`),
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
			parse_old_spell() {
				// Parse values from old_spell object to new spell object
				// console.log(this.old_spell)
				// console.log(this.spell)
				
				// Parse simple values
				this.spell.school = this.old_spell.school.name
				this.spell.ritual = (this.old_spell.ritual == 'yes') ? true : false
				this.spell.level = (this.old_spell.level == -1) ? 0 : this.old_spell.level
				this.spell.level_scaling = (this.old_spell.higher_level) ? "undefined" : "None"
				
				// Parse range options
				if (parseInt(this.old_spell.range)) {
					this.spell.range_type = "Ranged"
					let range_list = this.old_spell.range.split(' ')
					let rangeN = parseInt(range_list[0])
					// Parse miles to feet
					if (range_list[1].includes('mile')) {
						rangeN *= 5280
					}
					this.spell.range = rangeN
				} else {
					this.spell.range_type = this.old_spell.range
					delete this.spell.range
				}

				// Parse casting time
				let cast_time = this.old_spell.casting_time.split(' ')
				this.spell.cast_time_nr = parseInt(cast_time[0])
				let cast_type =  cast_time.slice(1)
							 									  .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
							 									  .join(' ')
				if (cast_type[cast_type.length -1] == 's') {
					cast_type = cast_type.substring(0, cast_type.length - 1);
				}
				this.spell.cast_time_type = cast_type
				delete this.spell.casting_time

				// Parse components
				this.spell.components = {'verbal': false,'somatic': false ,'material': false}
				for (let i in this.old_spell.components) {
					if (this.old_spell.components[i] == "V") {this.spell.components.verbal = true}
					if (this.old_spell.components[i] == "S") {this.spell.components.somatic = true}
					if (this.old_spell.components[i] == "M") {this.spell.components.material = true}
				}
				if (this.old_spell.material) {
					this.spell.material_description = this.old_spell.material
					delete this.spell.material
				}

				

				// Parse duration
				// If a number in duration duration = concentration or time
				if (/\d/.test(this.old_spell.duration)) {
					let duration_list = this.old_spell.duration.split(' ')
					if (this.old_spell.concentration == 'yes') {
						this.spell.duration_type = "Concentration"
						duration_list = duration_list.slice(2)
					} else {
						this.spell.duration_type = "Time"
					}
					// Find duration time number and scale
					
					this.spell.duration_n = parseInt(duration_list[0])
					// Calculate time scale
					let scale = duration_list[1]
					scale = scale.charAt(0).toUpperCase() + scale.substring(1)
					if (scale[scale.length -1] == 's') {
						scale = scale.substring(0, scale.length -1)
					}
					this.spell.duration_scale = scale

				} else {
					let duration_list = this.old_spell.duration.split(' ')
					this.spell.duration_type = duration_list.map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
				}

				// Parse classes
				let classes = []
				for (let index in this.old_spell.classes) {
					classes.push(this.old_spell.classes[index].name)
				}
				this.spell.classes = classes

				// Clean up spell object
				delete this.spell.concentration
				delete this.spell.duration
				delete this.spell.higher_level
				
			},
			
			setPrimary(modifier) {
				if (modifier.primary == undefined) {
					modifier.primary = false
				}
				modifier.primary = !modifier.primary
				this.$forceUpdate(); //IMPORTANT
			},
			
			add_modifier() {
				if(this.spell.modifiers == undefined) {
					this.spell.modifiers = [];
				}
				this.spell.modifiers.push({
					level_tiers: [],
				});
				this.$forceUpdate(); //IMPORTANT
			},
			remove_modifier(index) {
				this.$delete(this.spell.modifiers, index)
				this.$forceUpdate()
			},
			add_level_tier(index) {
				this.spell.modifiers[index].level_tiers.push({});
				this.$forceUpdate();
			},
			remove_level_tier(mod_index, tier_index) {
				this.$delete(this.spell.modifiers[mod_index].level_tiers, tier_index)
				this.$forceUpdate()
			},
			level_tier_addable(index) {
				if (this.spell.level_scaling == "Spell Scale" && 
						this.spell.modifiers[index].level_tiers &&
						this.spell.modifiers[index].level_tiers.length >= 1) {
					return false
				}
				return true
			},
			update() {
				this.$forceUpdate();
			},
			store_spell() {

				delete this.spell['.key']
				this.spell.changed = true
				this.spell.checked = false
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`new_spells/${this.id}`).set(this.spell)
						console.log("Validated")
						// this.$router.replace('/players')
					} else {
						console.log("Not validated")
					}
				})
			},
			create_spell_level_tier_description(spell, level_tiers) {
				// Generates description for each level tier for spell level scaling
				let description = []
				if (spell.level_scaling == "Character Level") {
					description = ["This spell's damage increases when your character reaches a higher level."]
					for (let index in level_tiers) {
						let tier = level_tiers[index]
						let new_line = `At ${numeral(tier.level).format('0o')} level, this spell modifier does ${tier.dice_count || "..."}${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`
						
						description.push(new_line)
					}
				} 
				else if (spell.level_scaling == "Spell Scale") {
					let tier = level_tiers[0]
					let new_line = "When you cast this spell using a spell slot of "
					new_line += `${numeral(parseInt(spell.level) + 1).format('0o')} level or higher, the damage of this modifier increases by `
					new_line += `${tier.dice_count || "..."}${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} `
					new_line += `for ${tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"} above ${numeral(spell.level).format('0o')}.`
					
					description = [new_line]
				} 
				else if (spell.level_scaling == "Spell Level") {
					for (let index in level_tiers) {
						let tier = level_tiers[index]
						let new_line = "When you cast this spell using a "
						new_line += `${numeral(tier.level).format('0o')}-level spell slot, this spell modifier does `
						new_line += `${tier.dice_count || "..."}${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`

						description.push(new_line)
					}
				}
				return description
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

.old_spell {
	position: -webkit-sticky;
	position: sticky;
	top: 60px;
}

.collapse-header {
	display: grid;
	grid-template-columns: auto 20px;
}

.remove-link a {
	display: block;
  height: 100%;
  line-height: 60px;
  padding-bottom: 15px;

  i {
  	vertical-align: bottom;
  }
}

</style>