<template>
	<div>
		<div class="row q-col-gutter-md mb-3">
			<div class="col-12 col-md-3">
				<q-select
					dark filled square dense
					emit-value
					map-options
					label="Effect type"
					v-model="effect.type"
					v-validate="'required'"
					:options="Object.values(effect_types)"
				>
					<template v-slot:append v-if="effect.type">
						<q-icon name="info" @click.stop>
							<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
								<q-card dark square>
									<q-card-section class="bg-gray-active">
										<b>{{ effect.type.capitalize() }}</b>
									</q-card-section>

									<q-card-section>
										{{ effect_types[effect.type].info }}
									</q-card-section>
								</q-card>
							</q-menu>
						</q-icon>
					</template>
				</q-select>
				<p class="validate red" v-if="errors.has('type')">{{ errors.first('type') }}</p>
				<p v-if="effect.type" class="mt-2 px-2 d-block">
				</p>
			</div>
			<template v-if="effect.type">
				<div class="col-12 col-md-3">
					<q-select
						dark filled square dense
						emit-value
						map-options
						label="Effect subtype"
						v-model="effect.subtype"
						v-validate="'required'"
						:options="Object.values(effect_subtypes[effect.type])"
					/>
				</div>

				<!-- DURATION -->
				<div class="col-12 col-md-3">
					<q-input 
						dark filled square dense
						v-model="effect.duration"
						label="Duration"
						type="number"
						autocomplete="off"
						name="duration"
						v-validate="'max:999'"
						class="mb-2"
						title="Duration"
						data-vv-as="Duriation"
					/>
					<p class="validate red" v-if="errors.has('duration')">{{ errors.first('duration') }}</p>
				</div>

				<!-- DURATION SCALE -->
				<div class="col-12 col-md-3">
					<q-select
						dark filled square dense
						emit-value
						map-options
						label="Time scale"
						v-model="effect.duration_scale"
						:options="dur_time"
					/>
				</div>
			</template>
		</div>
		<div class="row q-col-gutter-md">
			<!-- FORM WITH VALUES -->
			<template v-if="hasField('values')">
				<!-- DICE COUNT -->
				<div class="col-12 col-md-3">
					<q-input 
						dark filled square dense
						v-model="effect.dice_count"
						label="Dice count"
						autocomplete="off"
						name="dice_count"
						class="mb-2"
						title="Dice Count"
						type="number"
						data-vv-as="Dice Count"
						@keyup="$forceUpdate()"
					/>
				</div>
				<div class="col-12 col-md-3">
					<!-- EFFECT DICE TYPE -->
					<q-select
						dark filled square dense
						emit-value
						map-options
						label="Dice type"
						v-model="effect.dice_type"
						:options="dice_type"
						@change="$forceUpdate()"
					/>
				</div>
				<div class="col-12 col-md-3">
					<!-- EFFECT FIXED VALUE -->
					<q-input 
						dark filled square dense
						label="Fixed value"
						v-model="effect.fixed_val"
						autocomplete="off"
						id="fixed_val"
						name="fixed_val"
						class="mb-2"
						type="number"
						data-vv-as="Fixed Value"
						@keyup="$forceUpdate()"
					>
						<template v-slot:append>
							<q-icon name="info" @click.stop>
								<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
									<q-card dark square>
										<q-card-section class="bg-gray-active">
											<b>Fixed value</b>
										</q-card-section>
										<q-card-section>
											If the effect has a fixed number, set it here.
										</q-card-section>
									</q-card>
								</q-menu>
							</q-icon>
						</template>
					</q-input>
				</div>
				<div class="col-12 col-md-3">
					<q-checkbox size="lg" dark v-model="effect.primary" label="Add primary stat" :false-value="null" indeterminate-value="something-else" />
				</div>
			</template>
			<!-- DAMAGE TYPES -->
			<template v-if="hasField('damage_types')">
				<div class="col-12 col-md-4">
					<q-select
						dark filled square dense
						label="Damage type"
						name="damage_type"
						v-model="effect.damage_type"
						:options="damage_types"
						v-validate="'required'"
						data-vv-as="effect Subtype"
					/>
					<p class="validate red" v-if="errors.has(`damage_type`)">{{ errors.first(`damage_type`) }}</p>
				</div>
			</template>
			<!-- DESCRIPTION -->
			<div class="col-12" v-if="hasField('description')">
				<q-input
					dark filled square dense
					v-model="effect.description"
					label="Description"
					name="description"
					autogrow
					data-vv-as="Desciption"
					v-validate="'required|max:100'"
					maxlength="101"
					@change="$forceUpdate()"
				/>
				<p class="validate red" v-if="errors.has('description')">{{ errors.first('description') }}</p>
			</div>
			<!-- ABILITIES -->
			<div class="col-12 col-md-4" v-if="hasField('abilities')">
				<q-select
					dark filled square dense
					label="Ability"
					name="ability"
					v-model="effect.ability"
					:options="abilities"
					v-validate="'required'"
					data-vv-as="Ability"
					class="mb-2"
					@change="$forceUpdate()"
				/>
				<p class="validate red" v-if="errors.has(`ability`)">{{ errors.first(`ability`) }}</p>
			</div>
			<!-- SKILLS -->
			<div class="col-12 col-md-4" v-if="hasField('skills')">
				<q-select
					dark filled square dense
					map-options
					emit-value
					option-label="skill"
					label="Skill"
					name="skill"
					v-model="effect.skill"
					:options="Object.values(skillList)"
					v-validate="'required'"
					data-vv-as="Skill"
					class="mb-2"
					@change="$forceUpdate()"
				/>
				<p class="validate red" v-if="errors.has(`skills`)">{{ errors.first(`skills`) }}</p>
			</div>

			<!-- ATTACK -->
			<div class="col-12 col-md-4" v-if="hasField('attack')">
				<q-select
					dark filled square dense
					map-options
					emit-value
					label="Made by/against"
					name="attack"
					v-model="effect.attack"
					:options="byAgainst"
					v-validate="'required'"
					data-vv-as="Made by/against"
					class="mb-2"
					@change="$forceUpdate()"
				/>
				<p class="validate red" v-if="errors.has(`attack`)">{{ errors.first(`attack`) }}</p>
			</div>

			<!-- MINIMUM -->
			<div class="col-12 col-md-3" v-if="hasField('minimum')">
				<q-checkbox size="lg" dark v-model="effect.minimum" label="Fixed value is minimum" :false-value="null" indeterminate-value="something-else" />
			</div>
		</div>
	</div>
</template>

<script>
import { effects } from '../mixins/effects';
import { abilities } from '../mixins/abilities';
import { skills } from '../mixins/skills';

export default {
	name: "EffectsForm",
	mixins: [effects, abilities, skills],
	props: {
		value: Object,
		variables: {
			type: Boolean,
			default: true
		},
		selectOptions: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			damage_types: ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning",
				"Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"],
			dice_type: [
				{ label: "d4", value: 4 }, 
				{ label: "d6", value: 6 },
				{ label: "d8", value: 8 }, 
				{ label: "d10", value: 10 },
				{ label: "d12", value: 12 },
				{ label: "d20", value: 20 }
			],
			dur_time: [
				{ label: "Round", value: "round" },
				{ label: "Minute", value: "minute" },
				{ label: "Hour", value: "hour" },
				{ label: "Day", value: "day" },
			],
			byAgainst: [
				{ value: "by", label: "Attacks made by" },
				{ value: "against", label: "Attacks made against" }
			]
		}
	},
	computed: {
		effect: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit('input', newValue);
			}
		},
		type() {
			return this.effect.type;
		},
	},
	watch: {
		effect: {
			handler() {
				//Emits validation on every change
				this.$emit('validation', this.$validator);
			},
			deep: true
		},
		type(newValue, oldValue) {
			//Clear effect on type change
			if(newValue !== oldValue) {
				this.effect = { type: newValue };
			}
		}
	},
	mounted() {
		
	},
	methods: {
		setPrimary(effect) {
			if (effect.primary == undefined) {
				effect.primary = false
			}
			effect.primary = !effect.primary
			this.$forceUpdate(); //IMPORTANT
		},
		setMinimum(effect) {
			if (effect.minimum == undefined) {
				effect.minimum = false
			}
			effect.minimum = !effect.minimum
			this.$forceUpdate(); //IMPORTANT
		},
		hasField(field_name) {
			let type = this.effect.type;
			let subtype = this.effect.subtype;
			let ret = false;
			if (type) {
				if (this.effect_types[type].form_fields && this.effect_types[type].form_fields[field_name]) {
					ret = this.effect_types[type].form_fields[field_name];
				}
				if (subtype) {
					if (this.effect_subtypes[type][subtype].form_fields && this.effect_subtypes[type][subtype].form_fields[field_name]) {
						ret = this.effect_subtypes[type][subtype].form_fields[field_name];
					}
				}
			}
			return ret;
		}

	}
}
</script>

<style scoped lang="scss">
.component_box {
	background:$black;
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
</style>