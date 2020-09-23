<template>
	<hk-card class="card">
		<div slot="header" class="card-header d-flex justify-content-between">
			<span>Basic Info</span>
			<a @click="setSlide({ show: true, type: 'ViewSpell', data: spell })">
				<i class="fas fa-eye"></i>
			</a>
		</div>
		
		<div class="row">
			<!-- NAME -->
			<div class="col-12 col-md-6">
				<q-input
					dark filled square dense
					label="Name" 
					v-model="spell.name"
					name="name"
					title="Name"
					type="text"
					class="mb-2"
					:class="{'input': true, 'error': errors.has('name') }"
					v-validate="'required|max:100'"
					maxlength="101"
					autocomplete="off"
					data-vv-as="Name"
					placeholde="Name"
				/>
				<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
			</div>

			<!-- LEVEL -->
			<div class="col-12 col-md-3">
				<q-select 
					dark filled square dense
					emit-value map-options
					label="Level"
					:options="levels"
					v-model="spell.level"
					id="spell_level"
					name="spell_level"
					title="Spell Level"
					class="mb-2"
					v-validate="'required'"
					data-vv-as="Spell Level"
				/>
				<p class="validate red" v-if="errors.has('spell_level')">{{ errors.first('pper') }}</p>
			</div>

			<!-- SCHOOL -->
			<div class="col-12 col-md-3">
				<q-select
					dark filled square dense
					emit-value map-options
					label="School"
				 	v-model="spell.school"
					id="spell_school"
					name="spell_school"
					title="Spell School"
					class="mb-2"
					v-validate="'required'"
					data-vv-as="Spell School"
				/>
				<p class="validate red" v-if="errors.has('spell_school')">{{ errors.first('spell_school') }}</p>
			</div>
		</div>

		<div class="row">
			<!-- CAST TIME -->
			<div class="col-12 col-md-2">
				<q-input 
					dark filled square dense
					label="Cast time"
					v-model="spell.cast_time_nr"
					autocomplete="off"
					name="cast_time_nr"
					class="mb-2"
					v-validate="'required|numeric|max:999'"
					type="number"
					data-vv-as="Cast Time"
					></q-input>
					<p class="validate red" v-if="errors.has('cast_time_nr')">{{ errors.first('cast_time_nr') }}</p>
			</div>

			<!-- CAST TIME TYPE -->
			<div class="col-12 col-md-3">
				<q-select 
					dark filled square dense
					emit-value map-options
					label="Cast type"
					:options="cast_time_type"
					v-model="spell.cast_time_type"
					id="cast_time_type"
					name="cast_time_type"
					class="mb-2"
					v-validate="'required'"
					data-vv-as="Casting Type"
					@change="clearErrors()"
				/>
				<p class="validate red" v-if="errors.has('cast_time_type')">{{ errors.first('cast_time_type') }}</p>	
			</div>
			<!-- REACTION TIME DESCRIPTION -->
			<div>
				<q-input 
					dark filled square dense
					emit-value
					map-options
					label="Reaction time description"
					v-model="spell.cast_time_react_desc"
					:disable="spell.cast_time_type !== 'reaction'"
					autocomplete="off"
					class="mb-2"
					type="text"
				/>
			</div>
		</div>
		<div class="row">
			<!-- COMPONENTS -->
			<div class="col-12 col-md-3" v-if="spell.components">
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
			</div>
			<!-- MATERIAL COMPONENT DESCRIPTION -->
			<div class="col-12 col-md-9" v-if="spell.components">
				<q-input 
					dark filled square dense
					emit-value
					map-options
					label="Material components description"
					v-model="spell.material_description"
					:disable="!spell.components['material']"
					autocomplete="off"
					name="material_description"
					class="mb-2"
					type="text"
					v-validate="'required'"
					data-vv-as="Material Component Description"
				/>
				<p class="validate red" v-if="errors.has('material_description')">{{ errors.first('material_description') }}</p>
			</div>
		</div>
		<div class="row">
			<!-- RANGE TYPE -->
			<div class="col-12 col-md-4">
				<q-select 
					dark filled square dense
					emit-value
					map-options
					label="Range type"
					:options="range_type"
					v-model="spell.range_type"
					name="range_type"
					class="mb-2"
					v-validate="'required'"
					data-vv-as="Range Type"
					@change="clearErrors()"
				/>
				<p class="validate red" v-if="errors.has('range_type')">{{ errors.first('range_type') }}</p>
			</div>

			<!-- RANGE -->
			<div class="col-12 col-md-4">
				<q-input 
					dark filled square dense
					label="Rangee ft."
					v-model="spell.range"
					:disable="spell.range_type !== 'ranged'"
					autocomplete="off"
					name="range"
					v-validate="'required|numeric|max:999'"
					class="mb-2"
					type="number"
					data-vv-as="Range"
					/>
					<p class="validate red" v-if="errors.has('range')">{{ errors.first('range') }}</p>
			</div>

			<!-- CLASSES -->
			<div class="col-12 col-md-4" v-if="spell.classes">
				<div>
					<q-select
						dark filled square dense
						emit-value
						map-options
						v-model="spell.classes"
						multiple
						:options="classes"
						label="Classes"
					/>
				</div>
			</div>
		</div>		
		<div class="row">
			<!-- DURATION -->
			<div class="col-12 col-md-4">
				<q-select 
					dark filled square dense
					emit-value
					map-options
					label="Duration type"
					:options="dur_type"
					v-model="spell.duration_type"
					name="duration_type"
					class="mb-2"
					v-validate="'required'"
					data-vv-as="Duration Type"
					@change="clearErrors()"
				/>
				<p class="validate red" v-if="errors.has('duration_type')">{{ errors.first('duration_type') }}</p>
			</div>

			<!-- DURATION N -->
			<div class="col-12 col-md-4">
				<q-input 
					dark filled square dense
					label="Duration #"
					v-model="spell.duration_n"
					:disable="!dur_type_time.includes(spell.duration_type)"
					autocomplete="off"
					name="duration_n"
					v-validate="'required|numeric|max:999'"
					class="mb-2"
					type="number"
					data-vv-as="Duriation #"
				/>
				<p class="validate red" v-if="errors.has('duration_n')">{{ errors.first('duration_n') }}</p>
			</div>

			<!-- DURATION SCALE -->
			<div class="col-12 col-md-4">
				<q-select 
					dark filled square dense
					emit-value
					map-options
					label="Time scale"
					:options="dur_time"
					v-model="spell.duration_scale"
					:disable="!dur_type_time.includes(spell.duration_type)"
					name="duration_scale"
					v-validate="'required'"
					class="mb-2"
					data-vv-as="Duriation scale"
				/>
				<p class="validate red" v-if="errors.has('duration_scale')">{{ errors.first('duration_scale') }}</p>
			</div>
		</div>
		<div class="row">
			<div class="col-12 col-md-6">
				<!-- AOE TYPE -->
				<q-select 
					dark filled square dense
					emit-value
					map-options
					label="AOE type"
					:options="aoe_type"
					v-model="spell.aoe_type"
					name="aoe_type"
					class="mb-2"
					v-validate="'required'"
					data-vv-as="AOE Type"
					@change="clearErrors()"
				/>
				<p class="validate red" v-if="errors.has('aoe_type')">{{ errors.first('aoe_type') }}</p>
			</div>
			<div class="col-12 col-md-6">
				<q-input 
					dark filled square dense
					label="AOE Size ft."
					v-model="spell.aoe_size"
					:disable="spell.aoe_type === 'none'"
					autocomplete="off"
					name="aoe_size"
					class="mb-2"
					type="number"
					v-validate="'required'"
					data-vv-as="AOE Size"
				/>
				<p class="validate red" v-if="errors.has('aoe_size')">{{ errors.first('aoe_size') }}</p>
			</div>
		</div>
		<div class="row spell_row">
			<!-- RITUAL -->
			<div class="col-12 col-md-2">
				<q-checkbox size="lg" dark v-model="spell.ritual" val="lg" label="Ritual" />
			</div>
			<!-- LEVEL SCALING -->
			<div class="col-12 col-md-5">
				<q-select 
					dark filled square dense
					emit-value
					map-options
					:options="lvl_scaling"
					label="Duration type"
					v-model="spell.level_scaling"
					name="level_scaling"
					v-validate="'required'"
					class="mb-2"
					@change="$forceUpdate()"
				>
					<template v-slot:append>
						<q-icon name="info" @click.stop>
							<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
								<q-card dark square>
									<q-card-section class="bg-gray-active">
										<b>At higer levels</b>
									</q-card-section>
									<q-card-section>
										Set in what way the spell changes at higher levels.
									</q-card-section>
								</q-card>
							</q-menu>
						</q-icon>
					</template>
				</q-select>
				<p class="validate red" v-if="errors.has('level_scaling')">{{ errors.first('level_scaling') }}</p>
			</div>
			<!-- SOURCE BOOK -->
			<div class="col-12 col-md-5">
				<q-input 
					dark filled square dense
					label="Source"
					v-model="spell.source"
					autocomplete="off"
					name="source"
					class="mb-2"
					v-validate="'max:30'"
					maxlength="31"
					data-vv-as="Source"
				/>
				<p class="validate red" v-if="errors.has('source')">{{ errors.first('source') }}</p>
			</div>
		</div>
		<div class="row">
			<!-- DESCRIPTION -->
			<div class="col-12 col-md-6">
				<q-input 
					dark filled square dense
					label="Description"
					v-model="spell.description"
					name="description"
					class="mb-2"
					v-validate="'required|max:5000'"
					maxlength="5001"
					data-vv-as="Description"
					autogrow
				>
					<template v-slot:append>
						<q-icon name="info" @click.stop>
							<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
								<q-card dark square>
									<q-card-section class="bg-gray-active">
										<b>Markdown</b>
									</q-card-section>

									<q-card-section>
										<p>The description field accepts markdown.</p>
										*Italic*<br/>
										**Bold**<br/>
										__Underline__<br/>
										- list item<br/>
										| table column |
									</q-card-section>
								</q-card>
							</q-menu>
						</q-icon>
					</template>
				</q-input>
				<p class="validate red" v-if="errors.has('description')">{{ errors.first('description') }}</p>

				<q-input 
					dark filled square dense
					label="At higher levels"
					v-model="spell.higher_level"
					name="higher_level"
					class="mb-2"
					v-validate="'max:1000'"
					maxlength="1001"
					data-vv-as="At Higher Levels"
					autogrow
				/>
				<p class="validate red" v-if="errors.has('higher_level')">{{ errors.first('higher_level') }}</p>
			</div>
			<div class="col-12 col-md-6">
				<label for="description_preview">Preview</label>
				<vue-markdown name="description_preview" :source="spell.description"></vue-markdown>
				<div v-if="spell.higher_level">
					<b class="pl-2"><i>At Higher Levels.</i></b> {{ spell.higher_level }}
				</div>
			</div>
		</div>
		
	</hk-card>
</template>

<script>

import VueMarkdown from 'vue-markdown';
import { mapActions } from 'vuex';

export default {

	name: 'basic-info',
	props: {
		value: Object
	},
	components: {
		VueMarkdown
	},
	data() {
		return {
			levels: [
				{
					value: 0,
					label: "Cantrip"
				},
				{
					value: 1,
					label: "1st"
				},
				{
					value: 2,
					label: "2nd"
				},
				{
					value: 3,
					label: "3rd"
				},
				{
					value: 4,
					label: "4th"
				},
				{
					value: 5,
					label: "5th"
				},
				{
					value: 5,
					label: "6th"
				},
				{
					value: 7,
					label: "7th"
				},
				{
					value: 8,
					label: "8th"
				},
				{
					value: 9,
					label: "9th"
				},
			],
			schools: [
				{ label: "Abjuration", value: "abjuration" },
				{ label: "Conjuration", value: "conjuration" },
				{ label: "Divination", value: "divination" },
				{ label: "Enchantment", value: "enchantment" },
				{ label: "Evocation", value: "evocation" },
				{ label: "Illusion", value: "illusion" },
				{ label: "Necromancy", value: "necromancy" },
				{ label: "Transmutation", value: "transmutation" },
			],
			cast_time_type: [
				{ label: "Action", value: "action" },
				{ label: "Bonus Action", value: "bonus action" }, 
				{ label: "Reaction", value: "reaction" }, 
				{ label: "Minute", value: "minute" }, 
				{ label: "Hour", value: "hour" }, 
				{ label: "No Action", value: "no action" }, 
				{ label: "Special", value: "special" },
			],
			range_type: [
				{ label: "Self", value: "self" },
				{ label: "Touch", value: "touch" },
				{ label: "Ranged", value: "ranged" },
				{ label: "Sight", value: "sight" },
				{ label: "Unlimited", value: "unlimited" },
			],
			dur_type: [
				{ label: "Concentration", value: "concentration" },
				{ label: "Instantaneous", value: "instantaneous" },
				{ label: "Special", value: "special" },
				{ label: "Time", value: "time" },
				{ label: "Until Dispelled", value: "until dispelled" },
				{ label: "Until Dispelled or Triggered", value: "until dispelled or triggered" },
			],
			dur_type_time: [ "concentration", "time" ],
			dur_time: [
				{ label: "Round", value: "round" },
				{ label: "Minute", value: "minute" },
				{ label: "Hour", value: "hour" },
				{ label: "Day", value: "day" },
			],
			aoe_type: [
				{ label: "None", value: "none" },
				{ label: "Cone", value: "cone" },
				{ label: "Cube", value: "cube" },
				{ label: "Cylinder", value: "cylinder" },
				{ label: "Line", value: "line" },
				{ label: "Sphere", value: "sphere" },
				{ label: "Square", value: "square" },
				{ label: "Square Feet", value: "square feet" },
			],
			lvl_scaling: [
				{ label: "None", value: "none" },
				{ label: "Character Level", value: "character level" },
				{ label: "Spell Scale", value: "spell scale" },
				{ label: "Spell Level", value: "spell level" },
			],
			classes: [
				{ label: "Bard", value: "bard" },
				{ label: "Barbarian", value: "barbarian" },
				{ label: "Cleric", value: "cleric" },
				{ label: "Druid", value: "druid" },
				{ label: "Fighter", value: "fighter" },
				{ label: "Monk", value: "monk" },
				{ label: "Paladin", value: "paladin" },
				{ label: "Ranger", value: "ranger" },
				{ label: "Rogue", value: "rogue" },
				{ label: "Sorcerer", value: "sorcerer" },
				{ label: "Warlock", value: "warlock" },
				{ label: "Wizard", value: "wizard" },
			],
			classes_selected: null,
		};
	},
	methods: {
		...mapActions([
			'setSlide'
		]),
		setComponent(comp) {
			if (Object.keys(this.spell.components)[0]=="0") {
				this.spell.components = {'verbal':0,'somatic':0,'material':0};
			}
			this.spell.components[comp] = !this.spell.components[comp];

			this.$nextTick(() => {
				this.clearErrors();
			});
		},
		setRitual() {
			let yn = ["yes", "no"]
			if (yn.includes(this.spell.ritual)) {
				this.spell.ritual = false
			}
			this.spell.ritual = !this.spell.ritual
		},
		clearErrors() {
			this.$validator.errors.clear();
			this.$validator.validateAll();
		}
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
