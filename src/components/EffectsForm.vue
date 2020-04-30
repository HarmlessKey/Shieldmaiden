<template>
	<div>
		<b-row class="mb-3">
			<b-col sm="3">
				<label class="required" for="type">
					Effect Type
					<a 
						v-if="effect.type"
						class="ml-1"
						v-b-popover.hover.top="effect_types[effect.type].info" 
						:title="effect.type"
					>
						<i class="fas fa-info-circle"></i>
					</a>
				</label>
				<b-form-select 
					v-model="effect.type"
					v-validate="'required'"
					id="type"
					name="type"
				>
					<option :value="undefined" disabled>- Effect type -</option>
					<option v-for="({label}, key) in effect_types" :value="key" :key="`type-${key}`">
						{{ label }}
					</option>
				</b-form-select>
				<p class="validate red" v-if="errors.has('type')">{{ errors.first('type') }}</p>
				<p v-if="effect.type" class="mt-2 px-2 d-block">
				</p>
			</b-col>
			<template v-if="effect.type">
				<b-col sm="3">
					<label class="required" for="subtype">
						Effect Subtype
					</label>
					<b-form-select 
						v-model="effect.subtype"
						v-validate="'required'"
						id="subtype"
						name="subtype"
					>
						<option :value="undefined" disabled>- Effect subtype -</option>
						<option v-for="({label, value}, i) in effect_subtypes[effect.type]" :value="value" :key="`type-${i}`">
							{{ label }}
						</option>
					</b-form-select>
				</b-col>

				<!-- DURATION -->
				<b-col sm="3">
					<label for="duration_n">Duration</label>
					<b-form-input 
						v-model="effect.duration"
						autocomplete="off"
						id="duration"
						name="duration"
						v-validate="'max:999'"
						class="form-control mb-2"
						title="Duration"
						type="text"
						data-vv-as="Duriation"
					/>
						<p class="validate red" v-if="errors.has('duration')">{{ errors.first('duration') }}</p>
				</b-col>

				<!-- DURATION SCALE -->
				<b-col md="3">
					<label for="duration_scale">Time Scale</label>
					<b-form-select 
						v-model="effect.duration_scale"
						id="duration_scale"
						name="duration_scale"
						title="Time Scale"
						class="form-control mb-2"
						data-vv-as="Duriation scale">
						<option :value="undefined" disabled>- Time Scale -</option>
						<option v-for="{ label, value } in dur_time"
							:key="value" :value="value">{{ label }}</option>
					</b-form-select>
				</b-col>
			</template>
		</b-row>
		<b-row>
			<!-- DEFENSES -->
			<template v-if="effect.type === 'defenses'">
				<b-col md="4">
					<label class="required" for="damage_type">
						Damage Type
					</label>
					<b-form-select v-model="effect.damage_type"
						id="damage_type"
						name="damage_type"
						title="effect Subtype"
						class="form-control mb-2"
						v-validate="'required'"
						data-vv-as="effect Subtype"
						@change="$forceUpdate()">
						<option :value="undefined" disabled>- Damage type -</option>
						<option v-for="(type ,i) in damage_types"
							:key="i" :value="type">{{ type }}</option>
					</b-form-select>
					<p class="validate red" v-if="errors.has(`damage_type`)">{{ errors.first(`damage_type`) }}</p>
				</b-col>
			</template>

			<!-- ALL OTHER -->
			<template v-else>
				<!-- DICE COUNT -->
				<b-col md="3">
					<label for="dice_count">Dice Count</label>
					<b-form-input v-model="effect.dice_count"
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
					<!-- EFFECT SUBTYPE -->
					<label for="dice_type">Dice Type</label>
					<b-form-select v-model="effect.dice_type"
						id="dice_type"
						name="dice_type"
						title="Dice Type"
						class="form-control mb-2"
						data-vv-as="Dice Type"
						@change="$forceUpdate()">
						<option :value="undefined">-</option>
						<option v-for="(val,i) in dice_type"
							:key="i" :value="val.value">{{ val.label }}</option>
					</b-form-select>
				</b-col>
				<b-col md="3">
					<!-- EFFECT FIXED VALUE -->
					<label for="fixed_val">
						Fixed Value
						<a 
							class="ml-1"
							v-b-popover.hover.top="'If the effect has a fixed number, set it here.'" 
							title="Fixed value"
						>
							<i class="fas fa-info-circle"></i>
						</a>
					</label>
					<b-form-input v-model="effect.fixed_val"
						autocomplete="off"
						id="fixed_val"
						name="fixed_val"
						class="form-control mb-2"
						title="Fixed Value"
						type="number"
						data-vv-as="Fixed Value"
						@keyup="$forceUpdate()"
					/>
				</b-col>
				<b-col md="3">
					<label for="primary">
						<span>Primary Stat</span>
						<a 
							class="ml-1"
							v-b-popover.hover.top="'Select this if the primary ability modifier is added as a fixed for the effect.'" 
							title="Primary Stat"
						>
							<i class="fas fa-info-circle"></i>
						</a>
					</label>
					<div class="primary d-flex justify-content-between" name="primary">
						<a class="component_box" @click="setPrimary(effect)"
							:class="{'selected': effect.primary === true}"
						>
							<span>P</span>
						</a>
					</div>
				</b-col>
			</template>
		</b-row>
	</div>
</template>

<script>
import { effects } from '../mixins/effects';

export default {
	name: "EffectsForm",
	mixins: [effects],
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
		}
	},
	watch: {
		effect: {
			handler(newValue, oldValue) {
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
	}
}
</script>

<style scoped lang="scss">
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
</style>