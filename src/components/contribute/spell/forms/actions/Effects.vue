<template>
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i aria-hidden="true" class="fas fa-hand-holding-magic"/> Effects <template v-if="effects">( {{ effects.length }} )</template></span>
			<a 
				class="neutral-2 text-capitalize" 
				@click="add_effect()"
			>
				<i aria-hidden="true" class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
				<q-tooltip anchor="center right" self="center left">
					Add effect
				</q-tooltip>
			</a>
		</h2>

		<q-list :dark="$store.getters.theme === 'dark'" square :class="`accordion`">
			<q-expansion-item
				v-for="(effect, eff_index) in effects"
				:key="`effect-${eff_index}`"
				:dark="$store.getters.theme === 'dark'" switch-toggle-side
				group="effects"
			>
				<template v-slot:header>
					<q-item-section>
						{{parseInt(eff_index) + 1}}. 
						{{ effect.effect.type }} 
						{{ effect.effect.subtype }}
					</q-item-section>
					<q-item-section avatar>
						<a @click="remove_effect(eff_index)" class="neutral-2 text-capitalize">
							<i aria-hidden="true" class="fas fa-trash-alt red"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Remove effect
							</q-tooltip>
						</a>
					</q-item-section>
				</template>

				<div class="accordion-body">
					<EffectsForm v-model="effect.effect" />
					<div class="row q-col-gutter-md mt-3">
						<div class="col-12 col-md-6">
							<q-select 
								:dark="$store.getters.theme === 'dark'" filled square dense
								emit-value
								map-options
								label="Application"
								v-model="effect.application"
								:options="application"
								:name="`application-${eff_index}`"
								class="mb-2"
								v-validate="'required'"
								data-vv-as="application"
								@change="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu :dark="$store.getters.theme === 'dark'" anchor="top middle" self="bottom middle" max-width="250px">
											<q-card :dark="$store.getters.theme === 'dark'">
												<q-card-section class="bg-neutral-8">
													<b>Apply effect</b>
												</q-card-section>

												<q-card-section>
													Select when this effect should be applied.
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>
							<p class="validate red" v-if="errors.has(`application-${eff_index}`)">{{ errors.first(`application-${eff_index}`) }}</p>
						</div>
						<!-- TARGETS -->
						<div class="col-12 col-md-6">
							<q-select
								:dark="$store.getters.theme === 'dark'" filled square dense
								label="Target"
								v-model="effect.target"
								:options="targets"
								:name="`target-${eff_index}`"
								class="mb-4"
								v-validate="'required'"
								data-vv-as="target"
								@change="$forceUpdate()"
							>							
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu :dark="$store.getters.theme === 'dark'" anchor="top middle" self="bottom middle" max-width="250px">
											<q-card :dark="$store.getters.theme === 'dark'">
												<q-card-section class="bg-neutral-8">
													<b>Target</b>
												</q-card-section>
												<q-card-section>
													Select to whom the effect should be applied.
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>
							<p class="validate red" v-if="errors.has(`target-${eff_index}`)">{{ errors.first(`target-${eff_index}`) }}</p>
						</div>
					</div>

					<!-- SCALING -->
					<template v-if="level_scaling != undefined && level_scaling != 'none'">
						<h2 class="d-flex justify-content-between mt-3">
								Scaling
								<a 
									v-if="level_tier_addable(eff_index)"
									class="neutral-2 text-capitalize" 
									@click="add_level_tier(eff_index)"
								>
									<i aria-hidden="true" class="fas fa-plus green"></i>
									<q-tooltip anchor="center right" self="center left">
										Add level tier
									</q-tooltip>
								</a>
						</h2>
						<template v-for="(level_tier, tier_index) in effect.level_tiers">
							<div class="row q-col-gutter-md" v-if="tier_index < shown_level_tiers" :key="`level-tier-${tier_index}`">
								<!-- HL LEVEL SCALE -->
								<div class="col-12 col-md-2">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square dense
										:label="level_scaling.capitalizeEach()"
										v-model="level_tier.level"
										autocomplete="off"
										:name="`level-${eff_index}`"
										class="mb-2"
										v-validate="'required'"
										type="number"
										:data-vv-as="level_scaling"
										@keyup="$forceUpdate()"
									/>
									<p class="validate red" v-if="errors.has(`level-${eff_index}`)">{{ errors.first(`level-${eff_index}`) }}</p>
								</div>
								<!-- HL DICE COUNT -->
								<div class="col-12 col-md-2">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square dense
										label="Dice count"
										v-model="level_tier.dice_count"
										autocomplete="off"
										class="mb-2"
										type="number"
										@keyup="$forceUpdate()"
									/>								
								</div>
								<!-- HL MODIFIER DICETYPE -->
								<div class="col-12 col-md-3">
									<label for="dice_type">Dice Type</label>
									<q-select 
										:dark="$store.getters.theme === 'dark'" filled square dense
										emit-value
										map-options
										label="Dice type"
										:options="dice_type"
										v-model="level_tier.dice_type"
										class="mb-2"
										data-vv-as="Dice Type"
										@change="$forceUpdate()"
									/>
								</div>
								<!-- HL MODIFIER FIXED VALUE -->
								<div class="col-12 col-md-3">
									<div class="d-flex justify-content-between">
										<q-input 
											:dark="$store.getters.theme === 'dark'" filled square dense
											emit-value
											map-options
											label="Fixed value"
											v-model="level_tier.fixed_val"
											autocomplete="off"
											class="mb-2"
											type="number"
											@keyup="$forceUpdate()"
										/>

										<a @click="remove_level_tier(eff_index, tier_index)" class="remove">
											<i aria-hidden="true" class="fas fa-trash-alt red"></i>
											<q-tooltip anchor="center right" self="center left">
												Remove
											</q-tooltip>
										</a>
									</div>
								</div>
							</div>
						</template>
						<p v-if="effect.level_tiers && effect.level_tiers.length > 0">
							<span v-for="(line, i) in create_spell_level_tier_description(effect.level_tiers)" :key="`tier-${i}`">
								{{line}}<br>
							</span>
						</p>
					</template>
				</div>
			</q-expansion-item>
		</q-list>
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
				
				let text = `${level_txt} ${tier.projectile_count ? tier.projectile_count : ''} ${tier.projectile_count && tier.dice_count ? "and " : ''}${(tier.dice_count || tier.fixed_val) ? effect_txt : ''} ${slot_txt}`;
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
	border-bottom: solid 1px $neutral-4;
	padding-bottom: 5px;
}
label {
	display: flex;
	justify-content: flex-start;
	&.var {
		border-bottom: solid 1px $neutral-4;
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
		background-color: $neutral-8;

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
		background-color: $neutral-6;
	}
}
</style>
