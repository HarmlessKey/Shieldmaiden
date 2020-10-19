<template>
	<!-- MODIFIERS -->
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i class="fas fa-dice-d20"/> Modifiers <template v-if="modifiers">( {{ modifiers.length }} )</template></span>
			<a 
				class="gray-light text-capitalize" 
				@click="add_modifier()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
				<q-tooltip anchor="center right" self="center left">
					Add modifier
				</q-tooltip>
			</a>
		</h2>

		<q-list dark square :class="`accordion`">
			<q-expansion-item
				v-for="(modifier, mod_index) in modifiers"
				:key="`modifier-${mod_index}`"
				dark switch-toggle-side
				group="modifiers"
			>
				<template v-slot:header>
					<q-item-section>
						{{parseInt(mod_index) + 1}}.
						{{modifier.projectile_count ? `${modifier.projectile_count}x`: ""}}
						{{modifier.dice_count}}{{modifier.dice_type ? "D" : ""}}{{modifier.dice_type}}{{modifier.fixed_val ? "+" : ""}}{{modifier.fixed_val}} 
						{{modifier.subtype}} {{modifier.type}}
					</q-item-section>
					<q-item-section avatar>
						<a @click="remove_modifier(mod_index)" class="remove">
							<i class="fas fa-trash-alt red" />
							<q-tooltip anchor="top middle" self="center middle">
								Remove modifier
							</q-tooltip>
						</a>
					</q-item-section>
				</template>

				<div class="accordion-body">
					<div class="row q-col-gutter-md">
						<div class="col-12 col-md-4">
							<q-select 
								dark filled square dense
								map-options
								emit-value
								label="Subtype"
								:options="modifier_subtype"
								v-model="modifier.subtype"
								:disable="action_type == 'healing spell'"
								:name="`modifier_subtype-${mod_index}`"
								class="mb-2"
								v-validate="'required'"
								data-vv-as="Modifier Subtype"
								@change="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>Damage type</b>
												</q-card-section>

												<q-card-section>
													Select the damage type for this modifier.
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>
							<p class="validate red" v-if="errors.has(`modifier_subtype-${mod_index}`)">{{ errors.first(`modifier_subtype-${mod_index}`) }}</p>
						</div>
				
						<div class="col-12 col-md-3">
							<!-- SPELL FAIL MODIFIER -->
							<template v-if="action_type === 'spell save'">
								<q-select 
									dark filled square dense
									map-options
									emit-value
									label="Succesful save"
									:options="save_fail_mod"
									v-model="modifier.save_fail_mod"
									:disable="action_type !== 'spell save'"
									name="save_fail_mod"
									class="mb-2"
									data-vv-as="Save Fail Modifier"
									@change="$forceUpdate()"
								>
									<template v-slot:append>
										<q-icon name="info" @click.stop>
											<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
												<q-card dark square>
													<q-card-section class="bg-gray-active">
														<b>Succesful save</b>
													</q-card-section>
													<q-card-section>
														Select the effect of this modifier if the target makes a succesful saving throw.
													</q-card-section>
												</q-card>
											</q-menu>
										</q-icon>
									</template>
								</q-select>
								<p class="validate red" v-if="errors.has(`save_fail_mod-${mod_index}`)">{{ errors.first(`save_fail_mod-${mod_index}`) }}</p>
							</template>
							<template v-if="action_type === 'spell attack' || action_type === 'melee weapon' || action_type === 'ranged weapon'">
								<q-select 
									dark filled square dense
									map-options
									emit-value
									label="Miss modifier"
									:options="save_fail_mod"
									v-model="modifier.miss_mod"
									:name="`miss_mod-${mod_index}`"
									class="mb-2"
									v-validate="'required'"
									data-vv-as="Miss Modifier"
									@change="$forceUpdate()"
								>
									<template v-slot:append>
										<q-icon name="info" @click.stop>
											<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
												<q-card dark square>
													<q-card-section class="bg-gray-active">
														<b>Missed attack</b>
													</q-card-section>
													<q-card-section>
														Select the effect of this modifier if the attack was a miss.
													</q-card-section>
												</q-card>
											</q-menu>
										</q-icon>
									</template>
								</q-select>
								<p class="validate red" v-if="errors.has(`miss_mod-${mod_index}`)">{{ errors.first(`miss_mod-${mod_index}`) }}</p>
							</template>
						</div>

						<!-- SPECIAL ACTIONS -->
						<div class="col-12 col-md-3">
							<q-select 
								dark filled square dense
								map-options
								emit-value
								label="Special"
								:options="Object.values(specials)"
								v-model="modifier.special"
								:name="`modifier_special-${mod_index}`"
								class="mb-2"
								@change="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" v-if="modifier.special" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>{{ specials[modifier.special].label }}</b>
												</q-card-section>
												<q-card-section>
													{{ specials[modifier.special].info }}
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>
						</div>
						<!-- PROJECTILE COUNT -->
						<div class="col-12 col-md-2">
							<q-input 
								dark filled square dense
								label="Count"
								v-model="modifier.projectile_count"
								autocomplete="off"
								class="mb-2"
								type="number"
								@keyup="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>Projectile count</b>
												</q-card-section>
												<q-card-section>
													Number of projectiles that are cast
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-input>
						</div>
					</div>
					<div class="row q-col-gutter-md">
						<!-- DICE COUNT -->
						<div class="col-12 col-md-3">
							<q-input 
								dark filled square dense
								label="Dice count"
								v-model="modifier.dice_count"
								autocomplete="off"
								name="dice_count"
								class="mb-2"
								type="number"
								@keyup="$forceUpdate()"
							/>
						</div>
						<div class="col-12 col-md-3">
							<!-- MODIFIER SUBTYPE -->
							<q-select 
								dark filled square dense
								map-options
								emit-value
								:options="dice_type"
								label="Dice type"
								v-model="modifier.dice_type"
								class="mb-2"
								@change="$forceUpdate()"
							/>
						</div>
						<div class="col-12 col-md-3">
							<!-- MODIFIER FIXED VALUE -->
							<q-input 
								dark filled square dense
								label="Application"
								v-model="modifier.fixed_val"
								autocomplete="off"
								class="mb-2"
								type="number"
								@keyup="$forceUpdate()"
							>
								<template v-slot:append>
									<q-icon name="info" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>Fixed</b>
												</q-card-section>
												<q-card-section>
													Set the fixed value that is added on top of the rolled value.
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-input>
						</div>
						<div class="col-12 col-md-3">
						<q-checkbox size="lg" dark v-model="modifier.primary" label="Primary" :false-value="null" indeterminate-value="something-else">
							<q-tooltip anchor="top middle" self="center middle">
								Add primay stat modifier
							</q-tooltip>
						</q-checkbox>
					</div>
					</div>
					<template v-if="level_scaling != undefined && level_scaling != 'none'">
						<!-- HIGHER LEVEL MODIFIER -->
						<h2 class="d-flex justify-content-between mt-3">
							Scaling
							<a 
								v-if="level_tier_addable(mod_index)"
								class="gray-hover text-capitalize" 
								@click="add_level_tier(mod_index)"
							>
								<i class="fas fa-plus green"></i>
								<q-tooltip anchor="center right" self="center left">
									Add level tier
								</q-tooltip>
							</a>
						</h2>
						<template v-for="(level_tier, tier_index) in modifier.level_tiers">
							<div class="row q-col-gutter-md" v-if="tier_index < shown_level_tiers" :key="`level-tier-${tier_index}`">
								<!-- HL LEVEL SCALE -->
								<div class="col-12 col-md-2">
									<q-input 
										dark filled square dense
										:label="level_scaling.capitalizeEach()"
										v-model="level_tier.level"
										autocomplete="off"
										:name="`level-${mod_index}`"
										class="mb-2"
										v-validate="'required'"
										type="number"
										:data-vv-as="level_scaling"
										@keyup="$forceUpdate()"
									/>
									<p class="validate red" v-if="errors.has(`level-${mod_index}`)">{{ errors.first(`level-${mod_index}`) }}</p>
								</div>
								<!-- HL PROJECTILE COUNT -->
								<div class="col-12 col-md-2">
									<q-input 
										dark filled square dense
										label="Count"
										v-model="level_tier.projectile_count"
										autocomplete="off"
										class="mb-2"
										type="number"
										@keyup="$forceUpdate()"
									/>
								</div>
								<!-- HL DICE COUNT -->
								<div class="col-12 col-md-2">
									<q-input 
										dark filled square dense
										label="Dice count"
										v-model="level_tier.dice_count"
										autocomplete="off"
										class="mb-2"
										type="number"
										@keyup="$forceUpdate()"
									/>
								</div>
								<div class="col-12 col-md-3">
									<!-- HL MODIFIER DICETYPE -->
									<q-select 
										dark filled square dense
										map-options
										emit-value
										label="Dice type"
										:options="dice_type"
										v-model="level_tier.dice_type"
										class="mb-2"
										@change="$forceUpdate()"
									/>
								</div>
								<div class="col-12 col-md-3">
									<!-- HL MODIFIER FIXED VALUE -->
									<div class="d-flex justify-content-between">
										<q-input 
											dark filled square dense
											label="Fixed value"
											v-model="level_tier.fixed_val"
											autocomplete="off"
											class="mb-2"
											type="number"
											@keyup="$forceUpdate()"
										/>
										<a @click="remove_level_tier(mod_index, tier_index)" class="remove">
											<i class="fas fa-trash-alt red"></i>
											<q-tooltip anchor="center right" self="center left">
												Remove
											</q-tooltip>
										</a>
									</div>
								</div>
							</div>
						</template>
						<p v-if="modifier.level_tiers && modifier.level_tiers.length > 0">
							<span v-for="(line, i) in create_spell_level_tier_description(modifier.level_tiers)" :key="`tier-${i}`">
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
import numeral from 'numeral';

export default {
	name: 'spell-action-modifiers',
	props: {
		value: Array,
		level_scaling: String,
		level: Number,
		action_type: String,
	},
	computed: {
		modifiers: {
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
			return { "modifiers": this.$validator };
		}
	},

	data() {
		return {
			modifier_type: [
				{label: "Damage", value: "damage"},
				{label: "Healing", value: "healing"}
			],
			modifier_subtype: [
				{ label: "Acid", value: "acid" },
				{ label: "Bludgeoning", value: "bludgeoning" },
				{ label: "Cold", value: "cold" },
				{ label: "Fire", value: "fire" },
				{ label: "Force", value: "force" },
				{ label: "Lightning", value: "lightning" },
				{ label: "Necrotic", value: "necrotic" },
				{ label: "Piercing", value: "piercing" },
				{ label: "Poison", value: "poison" },
				{ label: "Psychic", value: "psychic" },
				{ label: "Radiant", value: "radiant" },
				{ label: "Slashing", value: "slashing" },
				{ label: "Thunder", value: "thunder" },
			],
			dice_type: [
				{ label: "d4", value: 4 }, 
				{ label: "d6", value: 6 },
				{ label: "d8", value: 8 }, 
				{ label: "d10", value: 10 },
				{ label: "d12", value: 12 },
				{ label: "d20", value: 20 }
			],
			save_fail_mod: [
				{ label: "No effect", value: 0},
				// { label: "¼", value: 0.25},
				{ label: "Half damage", value: 0.5},
				{ label: "Full damage", value: 1},
			],
			specials: {
				siphon: { label: "Heal caster", value: "siphon", info: "On a hit, the caster is healed for half of the damage done." },
				drain: { label: "Reduce max HP", value: "drain", info: "On a failed save the targets hit point maximum is reduced by an amount equal to the damage done." }
			}
		};
	},
	methods: {
		add_modifier() {
			let modifiers = this.modifiers;
			if(modifiers === undefined) {
				modifiers = []
			}
			modifiers.push({
				level_tiers: [],
			});
			this.$emit("input", modifiers)
			this.$forceUpdate(); //IMPORTANT
		},
		remove_modifier(index) {
			this.$delete(this.modifiers, index)
			this.$forceUpdate()
		},
		setPrimary(modifier) {
			if (modifier.primary == undefined) {
				modifier.primary = false
			}
			modifier.primary = !modifier.primary
			this.$forceUpdate(); //IMPORTANT
		},
		add_level_tier(index) {
			if(!this.modifiers[index].level_tiers) {
				this.modifiers[index].level_tiers = [];
			}
			this.modifiers[index].level_tiers.push({});
			this.$forceUpdate();
		},
		remove_level_tier(mod_index, tier_index) {
			this.$delete(this.modifiers[mod_index].level_tiers, tier_index)
			this.$forceUpdate()
		},
		level_tier_addable(index) {
			if (this.level_scaling == "spell scale" && 
					this.modifiers[index].level_tiers &&
					this.modifiers[index].level_tiers.length >= 1) {
				return false
			}
			return true
		},
		create_spell_level_tier_description(level_tiers) {
			// Generates description for each level tier for spell level scaling
			let description = []
			if (this.level_scaling == "character level") {
				description = ["This spell's damage/projectiles increases when your character reaches a higher level."]
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let count_txt = `${tier.projectile_count} projectile${tier.projectile_count > 1 ? 's' : ''}`
					let level_txt = `at ${numeral(tier.level).format('0o')} level`
					let damage_txt = 'this spell modifier does ';
					damage_txt += (tier.dice_count || tier.dice_type) ? `${tier.dice_count || "..."}d${tier.dice_type || "..."}` : '';
					damage_txt += (tier.fixed_val) ? `${(tier.dice_count || tier.dice_type) ? "+" : ""}${tier.fixed_val || ""}` : '';

					let new_line = `${tier.projectile_count ? count_txt : ''} `
					new_line += `${!tier.projectile_count && tier.dice_count ? level_txt.capitalize()+'s,' : level_txt}`
					new_line += `${tier.projectile_count && tier.dice_count ? ', and ' : '.'}`
					new_line += `${tier.dice_count ? damage_txt : ''}`
					description.push(new_line)
				}
			} 
			else if (this.level_scaling == "spell scale") {
				let tier = level_tiers[0]
				// Opening line
				let level_txt = "When you cast this spell using a spell slot of "
				level_txt += `${numeral(parseInt(this.level) + 1).format('0o')} level or higher,`
				// Damage modifier text
				let damage_txt = 'the damage of this modifier increases by '
				damage_txt += tier.dice_count || tier.dice_type ? `${tier.dice_count || "..."}d${tier.dice_type || "..."}` : '';
				damage_txt += tier.fixed_val ? `${(tier.dice_count || tier.dice_type) ? "+" : ""}${tier.fixed_val || ""}` : '';
				// Projectile count text
				let count_txt = `the spell creates ${tier.projectile_count} more projectile${tier.projectile_count > 1 ? "s" : ""}`
				// Spell slot text
				let slot_txt = `for ${tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"} above ${numeral(this.level).format('0o')}.`
				
				let text = `${level_txt} ${tier.projectile_count ? count_txt : ''} ${tier.projectile_count && tier.dice_count ? "and " : ''}${tier.dice_count ? damage_txt : ''} ${slot_txt}`
				description = [text]
			} 
			else if (this.level_scaling == "spell level") {
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = "When you cast this spell using a "
					new_line += `${numeral(tier.level).format('0o')}-level spell slot, this spell modifier does `
					new_line += `${tier.dice_count || "..."}d${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`

					description.push(new_line)
				}
			}
			return description
		},
	},
	watch: {
		modifiers: {
			handler() {
				this.$nextTick(() => {
					this.$emit('validation', this.validator);
				})
			},
			deep: true,
			immediate: true,
		}
	},
	// mounted() {
		
	// },
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 18px !important;
	text-transform: none !important;
	border-bottom: solid 1px #5c5757;
	padding-bottom: 5px;
}
.row {
	margin-bottom: 20px;
}
.card-header {
	cursor: pointer;
}
.add-mod {
	position: absolute;
	top: -25px;
	right: 20px;
	z-index: 1;
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
label {
	display: flex;
	justify-content: flex-start;
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
