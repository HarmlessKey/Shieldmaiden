<template>
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i class="fas fa-hand-holding-magic"/> Effects <template v-if="effects">( {{ effects.length }} )</template></span>
			<a 
				class="gray-light text-capitalize" 
				v-b-tooltip.hover title="Add Effect" 
				@click="add_effect()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</h2>
		<template v-for="(effect, eff_index) in effects">
			<div class="card" v-if="effects && effects.length > 0" :key="`effect-${eff_index}`">
				<div v-b-toggle="'accordion-'+eff_index" class="card-header collapse-header d-flex justify-content-between">
					<div class="gray-light" >
						<div class="caret blue"><i class="fas fa-caret-down" /></div>
						{{parseInt(eff_index) + 1}}. 
						{{ effect.effect.type }} 
						{{ effect.effect.subtype }}
					</div>
					<a @click="remove_effect(eff_index)" class="gray-hover text-capitalize">
						<i class="fas fa-trash-alt red"></i>
					</a>
				</div>
				<b-collapse visible :id="'accordion-'+eff_index" accordion="my-accordion">
					<div class="card-body">
						<EffectsForm v-model="effect.effect" />
						<b-row class="mt-3">
							<b-col sm="6">
								<label class="required" for="application">
									<span>Application</span>
									<a 
										class="ml-1"
										v-b-popover.hover.top="'When should this effect be applied?'" 
										title="Apply effect"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="effect.application"
									:id="`application-${eff_index}`"
									:name="`application-${eff_index}`"
									title="application"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="application"
									@change="$forceUpdate()">
									<option :value="undefined" disabled>- Application -</option>
									<option 
										v-for="{label, value} in application"
										:key="value" :value="value"
									>
										{{ label }}
									</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`application-${eff_index}`)">{{ errors.first(`application-${eff_index}`) }}</p>
							</b-col>
							<b-col sm="6">
								<label class="required" for="target">
									<span>Target</span>
									<a 
										class="ml-1"
										v-b-popover.hover.top="'To whom should the effect be applied?'" 
										title="Target"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="effect.target"
									:id="`target-${eff_index}`"
									:name="`target-${eff_index}`"
									title="target"
									class="form-control mb-4"
									v-validate="'required'"
									data-vv-as="target"
									@change="$forceUpdate()">
									<option :value="undefined" disabled>- Apply to -</option>
									<option 
										v-for="(target, i) in targets"
										:key="`target-${i}`" :value="target"
									>
										{{ target }}
									</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`target-${eff_index}`)">{{ errors.first(`target-${eff_index}`) }}</p>
							</b-col>
						</b-row>

						<!-- SCALING -->
						<template v-if="level_scaling != undefined && level_scaling != 'none'">
							<h2 class="d-flex justify-content-between mt-3">
									Scaling
									<a 
									v-if="level_tier_addable(eff_index)"
									class="gray-hover text-capitalize" 
									v-b-tooltip.hover title="Add Level Tier" 
									@click="add_level_tier(eff_index)">
										<i class="fas fa-plus green"></i>
									</a>
							</h2>
							<template v-for="(level_tier, tier_index) in effect.level_tiers">
								<b-row v-if="tier_index < shown_level_tiers" :key="`level-tier-${tier_index}`">
									<!-- HL LEVEL SCALE -->
									<b-col md="2">
										<label class="required" :for="`level-${eff_index}`">{{level_scaling.capitalizeEach()}}</label>
										<b-form-input v-model="level_tier.level"
											autocomplete="off"
											:id="`level-${eff_index}`"
											:name="`level-${eff_index}`"
											class="form-control mb-2"
											:title="level_scaling"
											v-validate="'required'"
											type="number"
											:data-vv-as="level_scaling"
											@keyup="$forceUpdate()"
											></b-form-input>
											<p class="validate red" v-if="errors.has(`level-${eff_index}`)">{{ errors.first(`level-${eff_index}`) }}</p>
									</b-col>
									<!-- HL DICE COUNT -->
									<b-col md="2">
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
									<!-- HL MODIFIER DICETYPE -->
									<b-col md="3">
										<label for="dice_type">Dice Type</label>
										<b-form-select v-model="level_tier.dice_type"
											id="dice_type"
											name="dice_type"
											title="Dice Type"
											class="form-control mb-2"
											data-vv-as="Dice Type"
											@change="$forceUpdate()">
											<option value="">- Dice type -</option>
											<option v-for="(val,i) in dice_type"
												:key="i" :value="val.value">{{ val.label }}</option>
										</b-form-select>
									</b-col>
									<!-- HL MODIFIER FIXED VALUE -->
									<b-col md="3">
										<label for="fixed_val">Fixed Value</label>
										<div class="d-flex justify-content-between">
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

												<a @click="remove_level_tier(eff_index, tier_index)"
													class="remove"
													v-b-tooltip.hover title="Remove">
													<i class="fas fa-trash-alt red"></i>
												</a>
										</div>
									</b-col>
								</b-row>
							</template>
							<p v-if="effect.level_tiers && effect.level_tiers.length > 0">
								<span v-for="(line, i) in create_spell_level_tier_description(effect.level_tiers)" :key="`tier-${i}`">
									{{line}}<br>
								</span>
							</p>
						</template>
					</div>
				</b-collapse>
			</div>
		</template>
	</div>
</template>

<script>
import EffectsForm from '@/components/EffectsForm';
import numeral from 'numeral';

export default {
	name: 'spell-action-effects',
	components: {
		EffectsForm
	},
	props: {
		value: Array,
		action_type: String,
		level: Number,
		level_scaling: String,
		spell: Object,
	},
  data() {
    return {
			dice_type: [
				{ label: "d4", value: 4 }, 
				{ label: "d6", value: 6 },
				{ label: "d8", value: 8 }, 
				{ label: "d10", value: 10 },
				{ label: "d12", value: 12 },
				{ label: "d20", value: 20 }
			],
			targets: [
				"Target",
				"Caster"
			]
    };
	},
	computed: {
		application() {
			let hitFail = (this.action_type === 'spell save') ? { label: "Failed save", value: "fail" } : { label: "On a hit", value: "hit" };

			let application = [
				{ label: "Always", value: "always" },
				hitFail
			];

			return application;
		},
		effects: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				return newValue;
			}
		},
		shown_level_tiers() {
			if (this.level_scaling == "spell scale") {
				return 1;
			}
			return 100;
		},
		validator() {
			return { "effects": this.$validator };
		}
	},
  methods: {
  	add_effect() {
  		let effects = this.effects;
			if(effects === undefined) {
				effects = []
			}
			effects.push({
				effect: {},
				level_tiers: []
			});
			this.$emit("input", effects);
			this.$forceUpdate();
			this.$emit("spellUpdate");
		},
		remove_effect(index) {
			this.$delete(this.effects, index)
			this.$forceUpdate()
		},
		setValidation(validate) {
			this.validation = validate;
		},
		add_level_tier(index) {
			if(!this.effects[index].level_tiers) {
				this.effects[index].level_tiers = [];
			}
			this.effects[index].level_tiers.push({});
			this.$forceUpdate();
		},
		remove_level_tier(mod_index, tier_index) {
			this.$delete(this.effects[mod_index].level_tiers, tier_index);
			this.$forceUpdate();
		},
		level_tier_addable(index) {
			if (this.level_scaling == "spell scale" && 
					this.effects[index].level_tiers &&
					this.effects[index].level_tiers.length >= 1) {
				return false;
			}
			return true;
		},
		create_spell_level_tier_description(level_tiers) {
			// Generates description for each level tier for spell level scaling
			let description = []
			if (this.level_scaling == "character level") {
				description = ["This spell's effect increases when your character reaches a higher level."];

				for (let index in level_tiers) {
					let tier = level_tiers[index];
					let level_txt = `At ${numeral(tier.level).format('0o')} level`;
					let effect_txt = 'the value of this effect is ';
					effect_txt += (tier.dice_count || tier.dice_type) ? `${tier.dice_count || "..."}d${tier.dice_type || "..."}` : '';
					effect_txt += (tier.fixed_val) ? `${(tier.dice_count || tier.dice_type) ? "+" : ""}${tier.fixed_val || ""}` : '';
	
					let new_line = `${tier.dice_count ? level_txt.capitalize()+',' : level_txt}`;
					new_line += `${tier.projectile_count && tier.dice_count ? ', and ' : '.'}`;
					new_line += `${(tier.dice_count || tier.fixed_val) ? effect_txt : ''}`;
					description.push(new_line);
				}
			}
			else if (this.level_scaling === "spell scale") {
				let tier = level_tiers[0];
				// Opening line
				let level_txt = "When you cast this spell using a spell slot of ";
				level_txt += `${numeral(parseInt(this.level) + 1).format('0o')} level or higher,`;

				// Effect text
				let effect_txt = 'the value of this effect increases by ';
				effect_txt += tier.dice_count || tier.dice_type ? `${tier.dice_count || "..."}d${tier.dice_type || "..."}` : '';
				effect_txt += tier.fixed_val ? `${(tier.dice_count || tier.dice_type) ? "+" : ""}${tier.fixed_val || ""}` : '';

				// Spell slot text
				let slot_txt = `for ${tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"} above ${numeral(this.level).format('0o')}.`;
				
				let text = `${level_txt} ${tier.projectile_count ? count_txt : ''} ${tier.projectile_count && tier.dice_count ? "and " : ''}${(tier.dice_count || tier.fixed_val) ? effect_txt : ''} ${slot_txt}`;
				description = [text];
			} 
			else if (this.level_scaling == "spell level") {
				for (let index in level_tiers) {
					let tier = level_tiers[index];
					let new_line = "When you cast this spell using a ";
					new_line += `${numeral(tier.level).format('0o')}-level spell slot, this spell modifier does `;
					new_line += `${tier.dice_count || "..."}d${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`;

					description.push(new_line);
				}
			}
			return description;
		},
  },
  watch: {
		effects: {
			handler() {
				let vm = this;
				this.$nextTick(() => {
					this.$emit('validation', this.validator);
				})
			},
			deep: true,
			immediate: true,
		}
	},
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 18px !important;
	text-transform: none !important;
	border-bottom: solid 1px #5c5757;
	padding-bottom: 5px;
}
label {
	display: flex;
	justify-content: flex-start;
	&.var {
		border-bottom: solid 1px #5c5757;
		padding-bottom: 5px;
	}
}
.remove {
	padding-top: 7px;
	margin-left: 10px;
}
.card {
	.card-header {
		cursor: pointer;
		background-color: #191919;

		.caret {
			display: inline-block;
			padding-right: 5px;
		}
		&.collapsed {
			.caret {
				i.fa-caret-down {
					transform: rotate(-90deg);
				}
			}
		}
	}
	.card-body {
		background-color: #232323;
	}
}
</style>
