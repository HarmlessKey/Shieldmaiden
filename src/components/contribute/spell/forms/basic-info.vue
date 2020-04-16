<template>
	<div class="card">
		<div class="card-header d-flex justify-content-between">
			<span>Basic Info</span>
			<a @click="setSlide({ show: true, type: 'ViewSpell', data: spell })">
				<i class="fas fa-eye"></i>
			</a>
		</div>
		<div class="card-body">
			<b-row>
				<!-- NAME -->
				<b-col md="6">
					<label class="required" for="name">Name</label>
					<b-form-input v-model="spell.name"
						id="name"
						name="name"
						title="Name"
						type="text"
						class="form-control mb-2"
						:class="{'input': true, 'error': errors.has('name') }"
						v-validate="'required|max:100'"
						maxlength="101"
						autocomplete="off"
						data-vv-as="Name"
						placeholde="Name">
					</b-form-input>
					<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
				</b-col>

				<!-- LEVEL -->
				<b-col md="3">
					<label class="required" for="spell_level">Level</label>
					<b-form-select v-model="spell.level"
						id="spell_level"
						name="spell_level"
						title="Spell Level"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="Spell Level">
						<option :value="undefined" disabled>- Spell Level -</option>
						<option v-for="(l,i) in levels" 
							:key="i" :value="i" 
							:seleced="spell.level==i">{{l}}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('spell_level')">{{ errors.first('pper') }}</p>
				</b-col>

				<!-- SCHOOL -->
				<b-col md="3">
					<label class="required" for="spell_school">School</label>
					<b-form-select v-model="spell.school"
						id="spell_school"
						name="spell_school"
						title="Spell School"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="Spell School">
						<option :value="undefined" disabled>- Select School -</option>
						<option v-for="(s) in schools"
							:key="s.value" :value="s.value">{{ s.label }}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('spell_school')">{{ errors.first('spell_school') }}</p>
				</b-col>
			</b-row>

			<b-row>
				<!-- CAST TIME -->
				<b-col md="2">
					<label class="required" for="cast_time_nr">Cast Time</label>
					<b-form-input v-model="spell.cast_time_nr"
						autocomplete="off"
						id="cast_time_nr"
						name="cast_time_nr"
						class="form-control mb-2"
						title="Casting Time"
						v-validate="'required|numeric|max:999'"
						type="number"
						data-vv-as="Cast Time"
						></b-form-input>
						<p class="validate red" v-if="errors.has('cast_time_nr')">{{ errors.first('cast_time_nr') }}</p>
				</b-col>

				<!-- CAST TIME TYPE -->
				<b-col md="3">
					<label class="required" for="cast_time_nr">Cast Type</label>
					<b-form-select v-model="spell.cast_time_type"
						id="cast_time_type"
						name="cast_time_type"
						title="Casting Type"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="Casting Type">
						<option :value="undefined" disabled>- Casting Type -</option>
						<option v-for="(t) in cast_time"
							:key="t.value" :value="t.value">{{t.label}}</option>
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
					<label for="components">Components</label>
					<div class="components d-flex justify-content-start" name="components">
						<a class="component_box mr-2" @click="setComponent('verbal')"
							 :class="{'selected': spell.components['verbal']}">
							<span>V</span>
						</a>
						<a class="component_box mr-2" @click="setComponent('somatic')"
							 :class="{'selected': spell.components['somatic']}">
							<span>S</span>
						</a>
						<a class="component_box" @click="setComponent('material')"
							 :class="{'selected': spell.components['material']}">
							<span>M</span>
						</a>
					</div>
				</b-col>
				<!-- MATERIAL COMPONENT DESCRIPTION -->
				<b-col md='9' v-if="spell.components">
					<label for="material_description" :class="{ required: spell.components['material'] }">
						Material components description
					</label>
					<b-form-input v-model="spell.material_description"
						:disabled="!spell.components['material']"
						autocomplete="off"
						id="material_description"
						name="material_description"
						class="form-control mb-2"
						title="Material Component Description"
						type="text"
						v-validate="'required'"
						data-vv-as="Material Component Description"
						placeholder="Enter the material component description"
						></b-form-input>
						<p class="validate red" v-if="errors.has('material_description')">{{ errors.first('material_description') }}</p>
				</b-col>
			</b-row>
			<b-row>
				<!-- RANGE TYPE -->
				<b-col md="4">
					<label class="required" for="range_type">Range Type</label>
					<b-form-select v-model="spell.range_type"
						id="range_type"
						name="range_type"
						title="Range Type"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="Range Type">
						<option :value="undefined" disabled>- Range Type -</option>
						<option v-for="(val,i) in range_type"
							:key="i" :value="val">{{val}}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('range_type')">{{ errors.first('range_type') }}</p>
				</b-col>

				<!-- RANGE -->
				<b-col md="4">
					<label class="required" for="range">Range ft.</label>
					<b-form-input v-model="spell.range"
						:disabled="spell.range_type!='Ranged'"
						autocomplete="off"
						id="range"
						name="range"
						v-validate="'required|numeric|max:999'"
						class="form-control mb-2"
						title="Range"
						type="number"
						data-vv-as="Range"
						/>
						<p class="validate red" v-if="errors.has('range')">{{ errors.first('range') }}</p>
				</b-col>

				<!-- CLASSES -->
				<b-col md="4" v-if="spell.classes">
					<label for="classes">Classes</label>
					<div>
						<el-select
							v-model="spell.classes"
							multiple
							collapse-tags
							filterable
    					allow-create
							placeholder="Classes">
							<el-option
								v-for="item in classes"
								:key="item"
								:label="item"
								:value="item">
							</el-option>
						</el-select>
					</div>
				</b-col>
			</b-row>		
			<b-row>
				<!-- DURATION -->
				<b-col md="4">
					<label class="required" for="duration_type">Duration Type</label>
					<b-form-select v-model="spell.duration_type"
						id="duration_type"
						name="duration_type"
						title="Duration Type"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="Duration Type">
						<option :value="undefined" disabled>- Duration Type -</option>
						<option v-for="(val,i) in dur_type"
							:key="i" :value="val">{{val}}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('duration_type')">{{ errors.first('duration_type') }}</p>
				</b-col>

				<!-- DURATION N -->
				<b-col md="4">
					<label for="duration_n" :class="{ required: dur_type_time.includes(spell.duration_type) }">Duration #</label>
					<b-form-input v-model="spell.duration_n"
						:disabled="!dur_type_time.includes(spell.duration_type)"
						autocomplete="off"
						id="duration_n"
						name="duration_n"
						v-validate="'required|numeric|max:999'"
						class="form-control mb-2"
						title="Duration #"
						type="text"
						data-vv-as="Duriation #"
						></b-form-input>
						<p class="validate red" v-if="errors.has('duration_n')">{{ errors.first('duration_n') }}</p>
				</b-col>

				<!-- DURATION SCALE -->
				<b-col md="4">
					<label for="duration_scale" :class="{ required: dur_type_time.includes(spell.duration_type) }">Time Scale</label>
					<b-form-select v-model="spell.duration_scale"
						:disabled="!dur_type_time.includes(spell.duration_type)"
						id="duration_scale"
						name="duration_scale"
						title="Time Scale"
						v-validate="'required'"
						class="form-control mb-2"
						data-vv-as="Duriation scale">
						<option :value="undefined" disabled>- Time Scale -</option>
						<option v-for="(val,i) in dur_time"
							:key="`dur_time-${i}`" :value="val.value">{{ val.label }}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('duration_scale')">{{ errors.first('duration_scale') }}</p>
				</b-col>
			</b-row>
			<b-row>
				<b-col md="6">
					<!-- AOE TYPE -->
					<label class="required" for="aoe_type">AOE Type</label>
					<b-form-select v-model="spell.aoe_type"
						id="aoe_type"
						name="aoe_type"
						title="AOE Type"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="AOE Type">
						<option :value="undefined" disabled>- AOE Type -</option>
						<option v-for="(val,i) in aoe_type"
							:key="i" :value="val">{{val}}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('aoe_type')">{{ errors.first('aoe_type') }}</p>
				</b-col>
				<b-col md="6">
					<label for="aoe_size" :class="{ required: spell.aoe_type !== 'None' }">AOE Size ft.</label>
					<b-form-input v-model="spell.aoe_size"
						:disabled="spell.aoe_type === 'None'"
						autocomplete="off"
						id="aoe_size"
						name="aoe_size"
						class="form-control mb-2"
						title="AOE Size"
						type="number"
						v-validate="'required'"
						data-vv-as="AOE Size"
						></b-form-input>
						<p class="validate red" v-if="errors.has('aoe_size')">{{ errors.first('aoe_size') }}</p>
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
					<label class="required" for="level_scaling">
						Level Scaling
						<a 
							class="ml-2"
							v-b-popover.hover.top="'Set in what way the spell changes at higher levels.'" 
							title="At higer levels"
						>
							<i class="fas fa-info-circle"></i>
						</a>
					</label>
					<b-form-select v-model="spell.level_scaling"
						id="level_scaling"
						name="level_scaling"
						title="Level Scaling"
						v-validate="'required'"
						class="form-control mb-2"
						@change="$forceUpdate()">
						<option :value="undefined" disabled>- Level Scaling -</option>
						<option v-for="(val,i) in lvl_scaling"
							:key="i" :value="val">{{val}}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has('level_scaling')">{{ errors.first('level_scaling') }}</p>
				</b-col>
				<!-- SOURCE BOOK -->
				<b-col md="5">
					<label for="source">Source</label>
					<b-form-input v-model="spell.source"
						autocomplete="off"
						id="source"
						name="source"
						class="form-control mb-2"
						title="Source"
						v-validate="'max:100'"
						maxlength="101"
						data-vv-as="Source"
						></b-form-input>
					<p class="validate red" v-if="errors.has('source')">{{ errors.first('source') }}</p>
				</b-col>
			</b-row>
			<b-row>
				<!-- DESCRIPTION -->
				<b-col md="6">
					<label class="required" for="description">
						Description
						<a 
							class="ml-2"
							v-b-popover.hover.top="'*Italic*, **Bold**, - list and tables'" 
							title="Accepts markdown"
						>
							<i class="fas fa-info-circle"></i>
						</a>
					</label>
					<b-form-textarea v-model="spell.description"
						id="description"
						name="description"
						title="Description"
						class="form-control mb-2"
						v-validate="'required|max:5000'"
						maxlength="5001"
						data-vv-as="Description"
						rows="6"></b-form-textarea>
					<p class="validate red" v-if="errors.has('description')">{{ errors.first('description') }}</p>

					<label for="higher_level">At higher levels</label>
					<b-form-textarea v-model="spell.higher_level"
						id="higher_level"
						name="higher_level"
						title="higher_level"
						class="form-control mb-2"
						v-validate="'max:1000'"
						maxlength="1001"
						data-vv-as="At Higher Levels"
						rows="3"></b-form-textarea>
					<p class="validate red" v-if="errors.has('higher_level')">{{ errors.first('higher_level') }}</p>
				</b-col>
				<b-col md="6">
					<label for="description_preview">Preview</label>
					<vue-markdown name="description_preview" :source="spell.description"></vue-markdown>
				</b-col>
			</b-row>
		</div>
	</div>
</template>

<script>

import VueMarkdown from 'vue-markdown';
import { mapActions } from 'vuex';

export default {

	name: 'basic-info',
	props: {
		value: Object,
		levels: Array,
	},
	components: {
		VueMarkdown
	},
	data() {
		return {
			schools: [
				{ label: "Abjuration", value: "abjuration" },
				{ label: "Conjuration", value: "conjuration" },
				{ label: "Divination", value: "divination" },
				{ label: "Enchantment", value: "enchantment" },
				{ label: "Evocation", value: "evocation" },
				{ label: "Illusion", value: "illusion" },
				{ label: "Necromancy", value: "necromancy" },
				{ label: "Transmutation", value: "transmutation" }
			],
			cast_time: [
				{ label: "Action", value: "action" },
				{ label: "Bonus Action", value: "bonus action" }, 
				{ label: "Reaction", value: "reaction" }, 
				{ label: "Minute", value: "minute" }, 
				{ label: "Hour", value: "hour" }, 
				{ label: "No Action", value: "no action" }, 
				{ label: "Special", value: "special" }
			],
			range_type: ["Self", "Touch", "Ranged", "Sight", "Unlimited"],
			dur_type: [
				"Concentration", 
				"Instantaneous", 
				"Special",
				"Time", 
				"Until Dispelled", 
				"Until Dispelled or Triggered"
			],
			dur_type_time: ["Concentration", "Time"],
			dur_time: [
				{ label: "Round", value: "round" },
				{ label: "Minute", value: "minute" },
				{ label: "Hour", value: "hour" },
				{ label: "Day", value: "day" }
			],
			aoe_type: ["None", "Cone", "Cube", "Cylinder", "Line", "Sphere", "Square", "Square Feet"],
			lvl_scaling: ["None", "Character Level", "Spell Scale", "Spell Level"],
			classes: ["Bard", "Barbarian", "Cleric", "Druid", "Fighter", "Monk", 
				"Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"],
			classes_selected: null,

		};
	},
	methods: {
		...mapActions([
			'setSlide'
		]),
		setComponent(comp) {
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
	},
	computed: {
		spell: {
			get(){
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			}
		},
		validator() {
			// Validator object to propagate to parent
			return {'basic-info': this.$validator};
		}
	},
	watch: {
		spell: {
			handler() {
				// Emits validation on every change
				this.$emit('validation', this.validator);
			},
			immediate: true,
			deep: true,
		}
	},
};
</script>

<style lang="scss" scoped>

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
.row {
	margin-bottom: 20px;
}

pre {
    white-space: pre-wrap;       /* Since CSS 2.1 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
    font-family: inherit;
    text-align: justify;
}

label {
	display: flex;
	justify-content: flex-start;
}

</style>
