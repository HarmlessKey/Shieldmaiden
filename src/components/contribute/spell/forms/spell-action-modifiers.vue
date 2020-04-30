<template>
	<!-- MODIFIERS -->
	<div>
		<h2 class="d-flex justify-content-between">
			<span><i class="fas fa-dice-d20"/> Modifiers <template v-if="modifiers">( {{ modifiers.length }} )</template></span>
			<a 
				class="gray-light text-capitalize" 
				v-b-tooltip.hover title="Add Modifier" 
				@click="add_modifier()"
			>
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</h2>
		<template v-for="(modifier, mod_index) in modifiers">
			<div class="card" v-if="modifiers && modifiers.length > 0" :key="`modifier-${mod_index}`">
				<div v-b-toggle="'accordion-'+mod_index" class="card-header collapse-header d-flex justify-content-between">
					<div class="gray-light" >
						<div class="caret blue"><i class="fas fa-caret-down" /></div>
						{{parseInt(mod_index) + 1}}.
						{{modifier.projectile_count ? `${modifier.projectile_count}x`: ""}}
						{{modifier.dice_count}}{{modifier.dice_type ? "D" : ""}}{{modifier.dice_type}}{{modifier.fixed_val ? "+" : ""}}{{modifier.fixed_val}} 
						{{modifier.subtype}} {{modifier.type}}
					</div>
					<a @click="remove_modifier(mod_index)"
						class="gray-hover text-capitalize"
						v-b-tooltip.hover title="Remove">
						<i class="fas fa-trash-alt red"></i>
					</a>
				</div>
					
				<b-collapse visible :id="'accordion-'+mod_index" accordion="my-accordion">
					<div class="card-body">
						<b-row>
							<b-col md="4">
								<label class="required" :for="`modifier_subtype-${mod_index}`">
									Subtype
									<a 
										class="ml-1"
										v-b-popover.hover.top="'Select the damage type for this modifier.'" 
										title="Damage type"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="modifier.subtype"
									:disabled="action_type == 'healing spell'"
									:id="`modifier_subtype-${mod_index}`"
									:name="`modifier_subtype-${mod_index}`"
									title="Modifier Subtype"
									class="form-control mb-2"
									v-validate="'required'"
									data-vv-as="Modifier Subtype"
									@change="$forceUpdate()">
									<option :value="undefined" disabled>- Subtype -</option>
									<option v-for="({ label, value }) in modifier_subtype"
										:key="value" :value="value">{{label}}</option>
								</b-form-select>
								<p class="validate red" v-if="errors.has(`modifier_subtype-${mod_index}`)">{{ errors.first(`modifier_subtype-${mod_index}`) }}</p>
							</b-col>
					
							<b-col md="3">
								<!-- SPELL FAIL MODIFIER -->
								<template v-if="action_type === 'spell save'">
									<label for="dice_type" class="required">
										<span>Save Fail Modifier</span>
										<a 
											class="ml-1"
											v-b-popover.hover.top="'Select the effect of this modifier if the target makes a succesful saving throw.'" 
											title="Succesful Save"
										>
											<i class="fas fa-info-circle"></i>
										</a>
									</label>
									<b-form-select v-model="modifier.save_fail_mod"
										:disabled="action_type !== 'spell save'"
										id="save_fail_mod"
										name="save_fail_mod"
										title="Save Fail Modifier"
										class="form-control mb-2"
										data-vv-as="Save Fail Modifier"
										@change="$forceUpdate()">
										<!-- <option value="undefined" disabled>- Subtype -</option> -->
										<option v-for="({ label, value }) in save_fail_mod"
											:key="value" :value="value">{{ label }}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has(`save_fail_mod-${mod_index}`)">{{ errors.first(`save_fail_mod-${mod_index}`) }}</p>
								</template>
								<template v-if="action_type === 'Spell Attack' || action_type === 'Melee Weapon' || action_type === 'Ranged Weapon'">
									<label for="dice_type" class="required">
										<span>Miss Modifier</span>
										<a 
											class="ml-1"
											v-b-popover.hover.top="'Select the effect of this modifier if the attack was a miss.'" 
											title="Missed attack"
										>
											<i class="fas fa-info-circle"></i>
										</a>
									</label>
									<b-form-select v-model="modifier.miss_mod"
										id="miss_mod"
										:name="`miss_mod-${mod_index}`"
										title="Miss Modifier"
										class="form-control mb-2"
										v-validate="'required'"
										data-vv-as="Miss Modifier"
										@change="$forceUpdate()">
										<option v-for="(val,i) in save_fail_mod"
											:key="i" :value="val.value">{{ val.label }}</option>
									</b-form-select>
									<p class="validate red" v-if="errors.has(`miss_mod-${mod_index}`)">{{ errors.first(`miss_mod-${mod_index}`) }}</p>
								</template>
							</b-col>

							<!-- SPECIAL ACTIONS -->
							<b-col md="3">
								<label :for="`modifier_subtype-${mod_index}`">
									Special
									<a 
										v-if="modifier.special"
										class="ml-1"
										v-b-popover.hover.top="specials[modifier.special].info" 
										:title="specials[modifier.special].label"
									>
										<i class="fas fa-info-circle"></i>
									</a>
								</label>
								<b-form-select v-model="modifier.special"
									:id="`modifier_special-${mod_index}`"
									:name="`modifier_special-${mod_index}`"
									title="Modifier special"
									class="form-control mb-2"
									@change="$forceUpdate()">
									<option :value="undefined">No special action</option>
									<option v-for="(special, key) in specials"
										:key="key" :value="key">{{ special.label }}</option>
								</b-form-select>
							</b-col>
							<!-- PROJECTILE COUNT -->
							<b-col md="2">
								<label for="projectile_count">
									<span>Count</span>
									<a 
										class="ml-1"
										v-b-popover.hover.top="'Number of projectiles that are cast'" 
										title="Number of Projectiles"
									><i class="fas fa-info-circle"></i></a>
								</label>
								<b-form-input v-model="modifier.projectile_count"
									autocomplete="off"
									id="projectile_count"
									name="projectile_count"
									class="form-control mb-2"
									title="Count"
									type="number"
									data-vv-as="Count"
									@keyup="$forceUpdate()"
									></b-form-input>
							</b-col>
						</b-row>
						<b-row>
							<!-- DICE COUNT -->
							<b-col md="3">
								<label for="dice_count">Dice Count</label>
								<b-form-input v-model="modifier.dice_count"
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
								<!-- MODIFIER SUBTYPE -->
								<label for="dice_type">Dice Type</label>
								<b-form-select v-model="modifier.dice_type"
									id="dice_type"
									name="dice_type"
									title="Dice Type"
									class="form-control mb-2"
									data-vv-as="Dice Type"
									@change="$forceUpdate()">
									<!-- <option value="undefined" disabled>- Subtype -</option> -->
									<option v-for="(val,i) in dice_type"
										:key="i" :value="val.value">{{ val.label }}</option>
								</b-form-select>
							</b-col>
							<b-col md="3">
								<!-- MODIFIER FIXED VALUE -->
								<label for="fixed_val">
									Fixed Value
									<a 
											class="ml-1"
											v-b-popover.hover.top="'Set the fixed value that is added on top of the rolled value.'" 
											title="Fixed"
										>
											<i class="fas fa-info-circle"></i>
										</a>
								</label>
								<b-form-input v-model="modifier.fixed_val"
									autocomplete="off"
									id="fixed_val"
									name="fixed_val"
									class="form-control mb-2"
									title="Fixed Value"
									type="number"
									data-vv-as="Fixed Value"
									@keyup="$forceUpdate()"
									></b-form-input>
							</b-col>
							<b-col md="3">
							<label for="primary">
								<span>Primary Stat</span>
								<a 
									class="ml-1"
									v-b-popover.hover.top="'Select this if the primary ability modifier is added as a fixed value to the damage/healing of the modifier.'" 
									title="Primary Stat"
								>
									<i class="fas fa-info-circle"></i>
								</a>
							</label>
							<div class="primary d-flex justify-content-between" name="primary">
								<a class="component_box" @click="setPrimary(modifier)"
									:class="{'selected': modifier.primary === true}">
									<span>P</span>
								</a>
							</div>
						</b-col>
						</b-row>
						<template v-if="level_scaling != undefined && level_scaling != 'none'">
							<!-- HIGHER LEVEL MODIFIER -->
							<h2 class="d-flex justify-content-between mt-3">
									Scaling
									<a 
									v-if="level_tier_addable(mod_index)"
									class="gray-hover text-capitalize" 
									v-b-tooltip.hover title="Add Level Tier" 
									@click="add_level_tier(mod_index)">
										<i class="fas fa-plus green"></i>
										<!-- <span class="d-none d-md-inline ml-1">Add</span> -->
									</a>
							</h2>
							<template v-for="(level_tier, tier_index) in modifier.level_tiers">
								<b-row v-if="tier_index < shown_level_tiers" :key="`level-tier-${tier_index}`">
									<!-- HL LEVEL SCALE -->
									<b-col md="2">
										<label class="required" :for="`level-${mod_index}`">{{level_scaling.capitalizeEach()}}</label>
										<b-form-input v-model="level_tier.level"
											autocomplete="off"
											:id="`level-${mod_index}`"
											:name="`level-${mod_index}`"
											class="form-control mb-2"
											:title="level_scaling"
											v-validate="'required'"
											type="number"
											:data-vv-as="level_scaling"
											@keyup="$forceUpdate()"
											></b-form-input>
											<p class="validate red" v-if="errors.has(`level-${mod_index}`)">{{ errors.first(`level-${mod_index}`) }}</p>
									</b-col>
									<!-- HL PROJECTILE COUNT -->
									<b-col md="2">
										<label for="projectile_count">Count</label>
										<b-form-input v-model="level_tier.projectile_count"
											autocomplete="off"
											id="projectile_count"
											name="projectile_count"
											class="form-control mb-2"
											title="Count"
											type="number"
											data-vv-as="Count"
											@keyup="$forceUpdate()"
											></b-form-input>
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
									<b-col md="3">
										<!-- HL MODIFIER DICETYPE -->
										<label for="dice_type">Dice Type</label>
										<b-form-select v-model="level_tier.dice_type"
											id="dice_type"
											name="dice_type"
											title="Dice Type"
											class="form-control mb-2"
											data-vv-as="Dice Type"
											@change="$forceUpdate()">
											<option :value="undefined">- Dice type -</option>
											<option v-for="(val,i) in dice_type"
												:key="i" :value="val.value">{{ val.label }}</option>
										</b-form-select>
									</b-col>
									<b-col md="3">
										<!-- HL MODIFIER FIXED VALUE -->
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

												<a @click="remove_level_tier(mod_index, tier_index)"
													class="remove"
													v-b-tooltip.hover title="Remove">
													<i class="fas fa-trash-alt red"></i>
												</a>
										</div>
									</b-col>
								</b-row>
							</template>
							<p v-if="modifier.level_tiers && modifier.level_tiers.length > 0">
								<span v-for="(line, i) in create_spell_level_tier_description(modifier.level_tiers)" :key="`tier-${i}`">
									{{line}}<br>
								</span>
							</p>
						</template>
					</div>  <!-- END MODIFIER CARD BODY -->
				</b-collapse>
			</div>
		</template>
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
				this.$emit("input", this.value);
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
				siphon: { label: "Heal caster", info: "On a hit, the caster is healed for half of the damage done." },
				drain: { label: "Reduce max HP", info: "On a failed save the targets hit point maximum is reduced by an amount equal to the damage done." }
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
					let damage_txt = `this spell modifier does ${tier.dice_count || "..."}d${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`
					
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
				damage_txt += `${tier.dice_count || "..."}d${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""}`
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
				let vm = this;
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
