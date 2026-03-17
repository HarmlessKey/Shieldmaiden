<template>
	<hk-card>
		<div slot="header" class="card-header d-flex justify-content-between">
			<span>Basic Info</span>
		</div>

		<div class="card-body">
			<div class="row q-col-gutter-md">
				<!-- NAME -->
				<div class="col-12 col-md-6">
					<ValidationProvider
						rules="max:100|required"
						name="Name"
						v-slot="{ errorMessage }" :modelValue="spell.name" as="div"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Name *"
							v-model="spell.name"
							class="mb-2"
							maxlength="101"
							autocomplete="off"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>

				<!-- LEVEL -->
				<div class="col-12 col-md-3">
					<ValidationProvider rules="required" name="Level" v-slot="{ errorMessage }" :modelValue="spell.level" as="div">
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							label="Level *"
							:options="spell_levels"
							v-model="spell.level"
							class="mb-2"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>

				<!-- SCHOOL -->
				<div class="col-12 col-md-3">
					<ValidationProvider
						rules="required"
						name="School"
						v-slot="{ errorMessage }" :modelValue="spell.school" as="div"
					>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							:options="spell_schools"
							label="School *"
							v-model="spell.school"
							class="mb-2"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>
			</div>

			<div class="row q-col-gutter-md">
				<!-- CAST TIME -->
				<div class="col-12 col-md-2">
					<ValidationProvider
						rules="required|between:1,999"
						name="Cast time"
						v-slot="{ errorMessage }" :modelValue="spell.cast_time" as="div"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Cast time *"
							v-model="spell.cast_time"
							autocomplete="off"
							class="mb-2"
							type="number"
							:error="!!errorMessage"
							:error-message="errorMessage"
							@input="(value) => parseToInt(value, spell, 'cast_time')"
						/>
					</ValidationProvider>
				</div>

				<!-- CAST TIME TYPE -->
				<div class="col-12 col-md-3">
					<ValidationProvider
						rules="required"
						name="Cast type"
						v-slot="{ errorMessage }" :modelValue="spell.cast_time_type" as="div"
					>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							label="Cast type *"
							:options="spell_cast_time_types"
							v-model="spell.cast_time_type"
							class="mb-2"
							@input="
								(value) => {
									if (value !== 'reaction') delete spell['cast_time_react_desc'];
								}
							"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>
				<!-- REACTION TIME DESCRIPTION -->
				<div class="col-12 col-md-7" v-if="spell.cast_time_type === 'reaction'">
					<ValidationProvider
						rules="max:200"
						name="Reaction time description"
						v-slot="{ errorMessage }" :modelValue="spell.cast_time_react_desc" as="div"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Reaction time description"
							v-model="spell.cast_time_react_desc"
							:disable="spell.cast_time_type !== 'reaction'"
							autocomplete="off"
							class="mb-2"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>
			</div>
			<div class="row q-col-gutter-md">
				<!-- COMPONENTS -->
				<div class="col-12 col-md-4">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						multiple
						map-options
						emit-value
						:options="spell_components"
						v-model="spell.components"
						label="Components"
					/>
				</div>
				<!-- MATERIAL COMPONENT DESCRIPTION -->
				<div
					class="col-12 col-md-8"
					v-if="spell.components && spell.components.includes('material')"
				>
					<ValidationProvider
						rules="required|max:500"
						name="Material components description"
						v-slot="{ errorMessage }" :modelValue="spell.material_description" as="div"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Material components description"
							v-model="spell.material_description"
							:disable="!spell.components || !spell.components.includes('material')"
							autocomplete="off"
							maxlength="501"
							class="mb-2"
							type="text"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>
			</div>
			<div class="row q-col-gutter-md">
				<!-- RANGE TYPE -->
				<div class="col-12 col-md-4">
					<ValidationProvider
						rules="required"
						name="Range type"
						v-slot="{ errorMessage }" :modelValue="spell.range_type" as="div"
					>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							label="Range type *"
							:options="spell_range_types"
							v-model="spell.range_type"
							class="mb-2"
							@input="
								(value) => {
									if (value !== 'ranged') delete spell['range'];
								}
							"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>

				<!-- RANGE -->
				<div class="col-12 col-md-4">
					<ValidationProvider
						:rules="{
							required: spell.range_type === 'ranged',
							between: [0, 9999999],
						}"
						name="Range"
						v-slot="{ errorMessage }" :modelValue="spell.range" as="div"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							:label="`Range ${spell.range_type === 'ranged' ? '*' : ''}`"
							v-model="spell.range"
							:disable="spell.range_type !== 'ranged'"
							autocomplete="off"
							class="mb-2"
							type="number"
							:error="!!errorMessage"
							:error-message="errorMessage"
							@input="(value) => parseToInt(value, spell, 'range')"
						>
							<span slot="append" class="neutral-2">ft.</span>
						</q-input>
					</ValidationProvider>
				</div>

				<!-- CLASSES -->
				<div class="col-12 col-md-4">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						label="Classes"
						v-model="spell.classes"
						multiple
						:options="classes"
					/>
				</div>
			</div>
			<div class="row q-col-gutter-md">
				<!-- DURATION TYPE -->
				<div class="col-12 col-md-4">
					<ValidationProvider
						rules="required"
						name="Duration type"
						v-slot="{ errorMessage }" :modelValue="spell.duration_type" as="div"
					>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							label="Duration type *"
							:options="spell_duration_types"
							v-model="spell.duration_type"
							class="mb-2"
							@input="
								(value) => {
									if (!spell_duration_types_time.includes(value)) {
										delete spell['duration'];
										delete spell['duration_scale'];
									}
								}
							"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>

				<!-- DURATION -->
				<div class="col-12 col-md-4">
					<ValidationProvider
						:rules="{
							required: spell_duration_types_time.includes(spell.duration_type),
							between: [1, 999],
						}"
						name="Duration"
						v-slot="{ errorMessage }" :modelValue="spell.duration" as="div"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							:label="`Duration ${
								spell_duration_types_time.includes(spell.duration_type) ? '*' : ''
							}`"
							v-model="spell.duration"
							:disable="!spell_duration_types_time.includes(spell.duration_type)"
							autocomplete="off"
							class="mb-2"
							type="number"
							:error="!!errorMessage"
							:error-message="errorMessage"
							@input="(value) => parseToInt(value, spell, 'duration')"
						/>
					</ValidationProvider>
				</div>

				<!-- DURATION SCALE -->
				<div class="col-12 col-md-4">
					<ValidationProvider
						:rules="{
							required: spell_duration_types_time.includes(spell.duration_type),
						}"
						name="Time scale"
						v-slot="{ errorMessage }" :modelValue="spell.duration_scale" as="div"
					>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							:label="`Time scale ${
								spell_duration_types_time.includes(spell.duration_type) ? '*' : ''
							}`"
							:options="spell_duration_times"
							v-model="spell.duration_scale"
							:disable="!spell_duration_types_time.includes(spell.duration_type)"
							class="mb-2"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>
			</div>
			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-6">
					<!-- AOE TYPE -->
					<ValidationProvider
						rules="required"
						name="AOE type"
						v-slot="{ errorMessage }" :modelValue="spell.aoe_type" as="div"
					>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							label="AOE type *"
							:options="aoe_types"
							v-model="spell.aoe_type"
							class="mb-2"
							@input="
								(value) => {
									if (value === 'none') delete spell['aoe_size'];
								}
							"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>
				<div class="col-12 col-md-6">
					<ValidationProvider
						:rules="{
							required: spell.aoe_type !== 'none',
							between: [1, 99999],
						}"
						name="AOE size"
						v-slot="{ errorMessage }" :modelValue="spell.aoe_size" as="div"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="AOE size"
							v-model="spell.aoe_size"
							:disable="spell.aoe_type === 'none'"
							autocomplete="off"
							class="mb-2"
							type="number"
							@input="(value) => parseToInt(value, spell, 'aoe_size')"
							:error="!!errorMessage"
							:error-message="errorMessage"
						>
							<span slot="append" class="neutral-2">ft.</span>
						</q-input>
					</ValidationProvider>
				</div>
			</div>
			<div class="row q-col-gutter-md spell_row">
				<!-- RITUAL -->
				<div class="col-12 col-md-2">
					<q-checkbox
						size="lg"
						:dark="$store.getters.theme === 'dark'"
						v-model="spell.ritual"
						label="Ritual"
						:false-value="null"
						indeterminate-value="something else"
					/>
				</div>
				<!-- LEVEL SCALING -->
				<div class="col-12 col-md-5">
					<ValidationProvider
						rules="required"
						name="Spell scaling"
						v-slot="{ errorMessage }" :modelValue="spell.scaling" as="div"
					>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							emit-value
							map-options
							:options="level_scaling"
							label="Spell scaling *"
							v-model="spell.scaling"
							class="mb-2"
							:error="!!errorMessage"
							:error-message="errorMessage"
							@change="$forceUpdate()"
						>
							<hk-popover
								slot="append"
								header="At higher levels"
								content="In what way does the spell change at higher levels?"
							>
								<q-icon name="info" />
							</hk-popover>
						</q-select>
					</ValidationProvider>
				</div>
				<!-- SOURCE BOOK -->
				<div class="col-12 col-md-5">
					<ValidationProvider rules="max:30" name="Source" v-slot="{ errorMessage }" :modelValue="spell.source" as="div">
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Source"
							v-model="spell.source"
							autocomplete="off"
							maxlength="31"
							class="mb-2"
							:error="!!errorMessage"
							:error-message="errorMessage"
						/>
					</ValidationProvider>
				</div>
			</div>

			<!-- DESCRIPTION -->
			<ValidationProvider
				rules="max:5000"
				name="Description"
				v-slot="{ errorMessage }" :modelValue="spell.description" as="div"
			>
				<hk-markdown-editor
					v-model="spell.description"
					label="Description"
					class="mb-2"
					maxlength="5001"
					:error="!!errorMessage"
					:error-message="errorMessage"
				>
				</hk-markdown-editor>
			</ValidationProvider>

			<ValidationProvider
				rules="max:1000"
				name="At higher levels"
				v-slot="{ errorMessage }" :modelValue="spell.higher_level" as="div"
			>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					label="At higher levels"
					v-model="spell.higher_level"
					class="mb-2"
					maxlength="1001"
					:error="!!errorMessage"
					:error-message="errorMessage"
					autogrow
				/>
			</ValidationProvider>
		</div>
	</hk-card>
</template>

<script>
import spell_constants from "src/utils/spellConstants";
import { aoe_types } from "src/utils/actionConstants";

export default {
	name: "spells-BasicInfo",
	props: {
		value: Object,
	},
	data() {
		return {
			spell_levels: spell_constants.spell_levels,
			spell_components: spell_constants.spell_components,
			spell_schools: spell_constants.spell_schools,
			spell_cast_time_types: spell_constants.spell_cast_time_types,
			spell_range_types: spell_constants.spell_range_types,
			spell_duration_types: spell_constants.spell_duration_types,
			spell_duration_types_time: spell_constants.spell_duration_types_time,
			spell_duration_times: spell_constants.spell_duration_times,
			aoe_types: aoe_types,
			level_scaling: spell_constants.level_scaling,
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
		parseToInt(value, object, property) {
			if (value === undefined || value === "") {
				delete object[property];
			} else {
				object[property] = parseInt(value);
			}
		},
		setRitual() {
			let yn = ["yes", "no"];
			if (yn.includes(this.spell.ritual)) {
				this.spell.ritual = false;
			}
			this.spell.ritual = !this.spell.ritual;
		},
	},
	computed: {
		spell: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			},
		},
	},
};
</script>

<style lang="scss" scoped>
.component_box {
	background: $black;
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
	background: $blue;
}
.row {
	margin-bottom: 20px;
}

label {
	display: flex;
	justify-content: flex-start;
}
</style>
