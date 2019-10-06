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
					<div class="card">
						<div class="card-header d-flex justify-content-between">
							<span>Basic Info</span>
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
						</div>
						<div class="card-body">
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
										<option value="undefined" disabled>- Spell Level -</option>
										<option v-for="(l,i) in levels" 
											:key="i" :value="i" 
											:seleced="spell.level==i">{{l}}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has('spell_level')">{{ errors.first('pper') }}</p>
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
										<option value="undefined" disabled>- Select School -</option>
										<option v-for="(s,i) in schools"
											:key="s" :value="s">{{s}}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has('spell_school')">{{ errors.first('spell_school') }}</p>
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
										<p class="validate red" v-if="errors.has('cast_time_nr')">{{ errors.first('cast_time_nr') }}</p>
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
										<option value="undefined" disabled>- Casting Type -</option>
										<option v-for="(t,i) in cast_time"
											:key="t" :value="t">{{t}}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has('cast_time_type')">{{ errors.first('cast_time_type') }}</p>
									
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
										<option value="undefined" disabled>- Range Type -</option>
										<option v-for="(val,i) in range_type"
											:key="i" :value="val">{{val}}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has('range_type')">{{ errors.first('range_type') }}</p>
								</b-col>
								<!-- RANGE -->
								<b-col md="3">
									<label for="range">Range ft.</label>
									<b-form-input v-model="spell.range"
										:disabled="spell.range_type!='Ranged'"
										autocomplete="off"
										id="range"
										name="range"
										class="form-control mb-2"
										title="Range"
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
										<option value="undefined" disabled>- Duration Type -</option>
										<option v-for="(val,i) in dur_type"
											:key="i" :value="val">{{val}}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has('duration_type')">{{ errors.first('duration_type') }}</p>
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
										<option value="undefined" disabled>- AOE Type -</option>
										<option v-for="(val,i) in aoe_type"
											:key="i" :value="val">{{val}}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has('aoe_type')">{{ errors.first('aoe_type') }}</p>
								</b-col>
								<b-col md="6">
									<label for="aoe_size">AOE Size ft.</label>
									<b-form-input v-model="spell.aoe_size"
										autocomplete="off"
										id="aoe_size"
										name="aoe_size"
										class="form-control mb-2"
										title="AOE Size"
										type="number"
										data-vv-as="AOE Size"
										></b-form-input>
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
										<option value="undefined">- Time Scale -</option>
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
										<p class="validate red" v-if="errors.has('description')">{{ errors.first('description') }}</p>
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
										v-validate="'required'"
										class="form-control mb-2">
										<option value="undefined">- Level Scaling -</option>
										<option v-for="(val,i) in lvl_scaling"
											:key="i" :value="val">{{val}}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has('level_scaling')">{{ errors.first('level_scaling') }}</p>
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
										data-vv-as="Source"
										></b-form-input>
								</b-col>
							</b-row>
						</div>
					</div>
					<!-- SPELL ACTIONS -->
					<div class="card">
						<div class="card-header d-flex justify-content-between">
							<span>Spell Actions</span>
							<a 
							class="gray-hover text-capitalize" 
							v-b-tooltip.hover title="Add Action" 
							@click="add_action()">
								<i class="fas fa-plus green"></i>
								<span class="d-none d-md-inline ml-1">Add</span>
							</a>
						</div>
						<div class="card-body">
							<b-row v-for="(spell_action, index) in spell.actions">
								<!-- ATTACK TYPE -->
								<b-col md="4">
									<label for="attack_type">Action Type</label>
									<b-form-select v-model="spell_action.type"
										id="action_type"
										name="action_type"
										title="Action Type"
										class="form-control mb-2"
										v-validate="'required'"
										data-vv-as="Action Type"
										@change="$forceUpdate()">
										<option value="undefined" disabled>- Action Type -</option>
										<option v-for="(val,i) in attack_type"
											:key="i" :value="val" selected="selected">{{val}}</option>
									</b-form-select>
								</b-col>
								<!-- SAVE -->
								<b-col md="4">
									<label for="save">Save</label>
									<b-form-select v-model="spell_action.save"
										:disabled="spell_action.type != 'Spell Save'"
										id="save"
										name="save"
										title="Save"
										class="form-control mb-2"
										data-vv-as="Save"
										@change="$forceUpdate()">
										<option value="undefined" disabled>- Save -</option>
										<option v-for="(val,i) in save"
											:key="i" :value="val">{{val}}</option>
									</b-form-select>
								</b-col>
								<!-- COMPONENT NAME -->
								<b-col md="4">
									<label for="action_name">Name</label>
									<b-form-input v-model="spell_action.name"
										autocomplete="off"
										id="action_name"
										name="action_name"
										class="form-control mb-2"
										title="Name"
										type="text"
										value="undefined"
										@keyup="$forceUpdate()"
										></b-form-input>
								</b-col>
							</b-row>
						</div>
					</div>
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
							<div class="card" v-for="(modifier, index) in spell.modifiers">
								<div class="card-header">
									<!-- {{parseInt(index) + 1}}. {{modifier.dice_count}}{{modifier.dice_type}}{{modifier.fixed_val ? "+" : ""}}{{modifier.fixed_val}} {{modifier.subtype}} {{modifier.type}} -->
									<!-- THIS BREAKS WHEN DELETE SPELL ACTION -->
									<b-form-select v-model="modifier.spell_action"
										id="spell_action"
										name="spell_action"
										title="Spell Action"
										class="form-control mb-2"
										v-validate="'required'"
										data-vv-as="Spell Action"
										@change="$forceUpdate()">
										<option value="undefined" disabled>- Spell Action -</option>
										<option v-for="(val,i) in spell.actions"
											:key="i" :value="i">{{val.name || val.type}}</option>
									</b-form-select>
								</div>
								<div class="card-body">
									<template v-if="modifier.spell_action != undefined">
										<b-row>
											<b-col md="4">
												<!-- MODIFIER SUBTYPE -->
												<label for="modifier_subtype">Subtype</label>
												<b-form-select v-model="modifier.subtype"
													:disabled="spell.actions[modifier.spell_action].type=='Healing Spell'"
													id="modifier_subtype"
													name="modifier_subtype"
													title="Modifier Subtype"
													class="form-control mb-2"
													v-validate="'required'"
													data-vv-as="Modifier Subtype"
													@change="$forceUpdate()">
													<option value="undefined" disabled>- Subtype -</option>
													<option v-for="(val,i) in modifier_subtype"
														:key="i" :value="val">{{val}}</option>
												</b-form-select>
											</b-col>
											<b-col md="4">
												<label for="primary">Primary Stat</label>
												<div class="primary d-flex justify-content-between" name="primary">
													<a class="component_box" @click="setPrimary(modifier)"
														 :class="{'selected': modifier.primary === true}">
														<span>P</span>
													</a>
												</div>
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
													@keyup="$forceUpdate()"
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
													data-vv-as="Modifier Type"
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
													v-validate="'required'"
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
												<b-col class="col-1" v-if="level_tier_addable(index)">
													<a 
													class="gray-hover text-capitalize" 
													v-b-tooltip.hover title="Add Level Tier" 
													@click="add_level_tier(index)">
														<i class="fas fa-plus green"></i>
														<!-- <span class="d-none d-md-inline ml-1">Add</span> -->
													</a>
												</b-col>
											</b-row>
											<b-row v-for="(level_tier, index) in modifier.level_tiers" v-if="index < shown_level_tiers">
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
														v-validate="'required'"
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
														v-validate="'required'"
														data-vv-as="Dice Type"
														@change="$forceUpdate()">
														<option value="undefined" disabled>- Subtype -</option>
														<option v-for="(val,i) in dice_type"
															:key="i" :value="val">{{val}}</option>
													</b-form-select>
												</b-col>
												<b-col md="3">
													<!-- HL MODIFIER FIXED VALUE -->
													<label for="fixed_val">Fixed Value</label>
													<b-form-input v-model="level_tier.fixed_val"
														autocomplete="off"
														id="fixed_val"
														name="fixed_val"
														class="form-control mb-2"
														title="Fixed Value"
														v-validate="'required'"
														type="number"
														data-vv-as="Fixed Value"
														@keyup="$forceUpdate()"
														></b-form-input>
												</b-col>
											</b-row>
											<p v-if="modifier.level_tiers.length >= 1">
												<span v-for="line in create_spell_level_tier_description(spell, modifier.level_tiers)">
													{{line}}<br>
												</span>
											</p>
										</template>
									</template>
								</div>  <!-- END MODIFIER CARD BODY -->
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
	import numeral from 'numeral'

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
					"Minute", "Hour", "No Action", "Special"],
				range_type: ["Self", "Touch", "Ranged", "Sight", "Unlimited"],
				dur_type: ["Concentration", "Instantaneous", "Special",
				 "Time", "Until Dispelled", "Until Dispelled or Triggered"],
				dur_type_time: ["Concentration", "Time"],
				dur_time: ["Round", "Minute", "Hour", "Day"],
				lvl_scaling: ["None", "Character Level", "Spell Scale", "Spell Level"],
				classes: ["Bard", "Barbarian", "Cleric", "Druid", "Fighter", "Monk", 
					"Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"],
				classes_selected: null,
				attack_type: ["Melee Weapon", "Ranged Weapon", "Spell Attack", "Spell Save", "Healing Spell", "Damage"],
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
			setPrimary(modifier) {
				if (modifier.primary == undefined) {
					modifier.primary = false
				}
				modifier.primary = !modifier.primary
				this.$forceUpdate(); //IMPORTANT
			},
			add_action() {
				if (this.spell.actions == undefined) {
					this.spell.actions = [];
				}
				this.spell.actions.push({
					type: "Spell Attack",
				});
				this.$forceUpdate();
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
			add_level_tier(index) {
				this.spell.modifiers[index].level_tiers.push({});
				this.$forceUpdate();
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