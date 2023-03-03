<template>
	<hk-card>
		<div slot="header" class="card-header d-flex justify-content-between">
			<span>Basic Info</span>
			<a @click="setSlide({ show: true, type: 'ViewSpell', data: spell })">
				<i aria-hidden="true" class="fas fa-eye"></i>
			</a>
		</div>

		<div class="card-body">
			<div class="row q-col-gutter-md">
				<!-- NAME -->
				<div class="col-12 col-md-6">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Name"
						v-model="spell.name"
						class="mb-2"
						:rules="[
							(val) => (!val ? 'Required' : val.length > 100 ? 'Max char. length: 100' : true),
						]"
						maxlength="101"
						autocomplete="off"
					/>
				</div>

				<!-- LEVEL -->
				<div class="col-12 col-md-3">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						label="Level"
						:options="spell_levels"
						v-model="spell.level"
						class="mb-2"
						:rules="[(val) => !!val || 'Required']"
					/>
				</div>

				<!-- SCHOOL -->
				<div class="col-12 col-md-3">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						:options="spell_schools"
						label="School"
						v-model="spell.school"
						class="mb-2"
						:rules="[(val) => !!val || 'Required']"
					/>
				</div>
			</div>

			<div class="row q-col-gutter-md">
				<!-- CAST TIME -->
				<div class="col-12 col-md-2">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Cast time"
						v-model="spell.cast_time_nr"
						autocomplete="off"
						class="mb-2"
						:rules="[(val) => (!val ? 'Required' : val > 999 ? 'Max: 999' : true)]"
						type="number"
					></q-input>
				</div>

				<!-- CAST TIME TYPE -->
				<div class="col-12 col-md-3">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						label="Cast type"
						:options="spell_cast_time_types"
						v-model="spell.cast_time_type"
						class="mb-2"
						:rules="[(val) => !!val || 'Required']"
					/>
				</div>
				<!-- REACTION TIME DESCRIPTION -->
				<div class="col-12 col-md-7" v-if="spell.cast_time_type === 'reaction'">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Reaction time description"
						v-model="spell.cast_time_react_desc"
						:disable="spell.cast_time_type !== 'reaction'"
						autocomplete="off"
						class="mb-2"
					/>
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
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Material components description"
						v-model="spell.material_description"
						:disable="!spell.components || !spell.components.includes('material')"
						autocomplete="off"
						class="mb-2"
						type="text"
						:rules="[(val) => !!val || 'Required']"
					/>
				</div>
			</div>
			<div class="row q-col-gutter-md">
				<!-- RANGE TYPE -->
				<div class="col-12 col-md-4">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						label="Range type"
						:options="spell_range_types"
						v-model="spell.range_type"
						name="range_type"
						class="mb-2"
						:rules="[(val) => !!val || 'Required']"
					/>
				</div>

				<!-- RANGE -->
				<div class="col-12 col-md-4">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Range ft."
						v-model="spell.range"
						:disable="spell.range_type !== 'ranged'"
						autocomplete="off"
						class="mb-2"
						type="number"
						:rules="[(val) => (!val ? 'Required' : val > 999 ? 'Max: 999' : true)]"
					/>
				</div>

				<!-- CLASSES -->
				<div class="col-12 col-md-4">
					<div>
						<q-select
							:dark="$store.getters.theme === 'dark'"
							filled
							square
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
			<div class="row q-col-gutter-md">
				<!-- DURATION -->
				<div class="col-12 col-md-4">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						label="Duration type"
						:options="spell_duration_types"
						v-model="spell.duration_type"
						class="mb-2"
						:rules="[(val) => (!val ? 'Required' : val > 999 ? 'Max: 999' : true)]"
					/>
				</div>

				<!-- DURATION N -->
				<div class="col-12 col-md-4">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Duration #"
						v-model="spell.duration_n"
						:disable="!spell_duration_types_time.includes(spell.duration_type)"
						autocomplete="off"
						class="mb-2"
						type="number"
						:rules="[(val) => (!val ? 'Required' : val > 999 ? 'Max: 999' : true)]"
					/>
				</div>

				<!-- DURATION SCALE -->
				<div class="col-12 col-md-4">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						label="Time scale"
						:options="spell_duration_times"
						v-model="spell.duration_scale"
						:disable="!spell_duration_types_time.includes(spell.duration_type)"
						class="mb-2"
						:rules="[(val) => !!val || 'Required']"
					/>
				</div>
			</div>
			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-6">
					<!-- AOE TYPE -->
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						label="AOE type"
						:options="aoe_types"
						v-model="spell.aoe_type"
						class="mb-2"
						:rules="[(val) => !!val || 'Required']"
					/>
				</div>
				<div class="col-12 col-md-6">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="AOE Size ft."
						v-model="spell.aoe_size"
						:disable="spell.aoe_type === 'none'"
						autocomplete="off"
						class="mb-2"
						type="number"
						:rules="[(val) => !!val || 'Required']"
					/>
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
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						emit-value
						map-options
						:options="level_scaling"
						label="Spell scaling"
						v-model="spell.level_scaling"
						class="mb-2"
						:rules="[(val) => !!val || 'Required']"
						@change="$forceUpdate()"
					>
						<template v-slot:append>
							<q-icon name="info" @click.stop>
								<q-menu
									:dark="$store.getters.theme === 'dark'"
									anchor="top middle"
									self="bottom middle"
									max-width="250px"
								>
									<q-card :dark="$store.getters.theme === 'dark'">
										<q-card-section class="bg-neutral-8">
											<strong>At higher levels</strong>
										</q-card-section>
										<q-card-section>
											Set in what way the spell changes at higher levels.
										</q-card-section>
									</q-card>
								</q-menu>
							</q-icon>
						</template>
					</q-select>
				</div>
				<!-- SOURCE BOOK -->
				<div class="col-12 col-md-5">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Source"
						v-model="spell.source"
						autocomplete="off"
						maxlength="31"
						class="mb-2"
						:rules="[(val) => val.length <= 30 || 'Max char length: 30']"
					/>
				</div>
			</div>
			<div class="row q-col-gutter-md">
				<!-- DESCRIPTION -->
				<div class="col-12 col-md-6">
					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="Description"
						v-model="spell.description"
						class="mb-2"
						maxlength="5001"
						:rules="[(val) => val.length <= 5000 || 'Max char length: 5000']"
						autogrow
					>
						<template v-slot:append>
							<q-icon name="info" @click.stop>
								<q-menu
									:dark="$store.getters.theme === 'dark'"
									anchor="top middle"
									self="bottom middle"
									max-width="250px"
								>
									<q-card :dark="$store.getters.theme === 'dark'">
										<q-card-section class="bg-neutral-8">
											<strong>Markdown</strong>
										</q-card-section>

										<q-card-section>
											<p>The description field accepts markdown.</p>
											*Italic*<br />
											**Bold**<br />
											__Underline__<br />
											- list item<br />
											| table column |
										</q-card-section>
									</q-card>
								</q-menu>
							</q-icon>
						</template>
					</q-input>

					<q-input
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						label="At higher levels"
						v-model="spell.higher_level"
						class="mb-2"
						maxlength="1001"
						:rules="[(val) => val.length <= 5000 || 'Max char length: 5000']"
						autogrow
					/>
				</div>
				<div class="col-12 col-md-6">
					<label for="description_preview">Preview</label>
					<!-- <vue-markdown name="description_preview" :source="spell.description"></vue-markdown> -->
					<div v-if="spell.higher_level">
						<strong class="pl-2"><em>At Higher Levels.</em></strong> {{ spell.higher_level }}
					</div>
				</div>
			</div>
		</div>
	</hk-card>
</template>

<script>
// import VueMarkdown from 'vue-markdown';
import { mapActions } from "vuex";
import { spells } from "src/mixins/spells";

export default {
	name: "spells-BasicInfo",
	props: {
		value: Object,
	},
	mixins: [spells],
	components: {
		// VueMarkdown
	},
	data() {
		return {
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
		...mapActions(["setSlide"]),
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
	// watch: {
	// },
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

pre {
	white-space: pre-wrap; /* Since CSS 2.1 */
	white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
	white-space: -pre-wrap; /* Opera 4-6 */
	white-space: -o-pre-wrap; /* Opera 7 */
	word-wrap: break-word; /* Internet Explorer 5.5+ */
	font-family: inherit;
	text-align: justify;
}

label {
	display: flex;
	justify-content: flex-start;
}
</style>
