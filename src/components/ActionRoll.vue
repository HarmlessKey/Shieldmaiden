<template>
	<div>
		<q-tabs
			v-if="options.length > 1"
			v-model="tab"
			dark
			no-caps
		>
			<q-tab 
				v-for="(option, index) in options"
				:key="`verstatile-tab-${index}`"
				:name="option.name" 
				:label="option.label"
			/>
		</q-tabs>

		<q-tab-panels v-model="tab" class="bg-transparent" keep-alive>
			<q-tab-panel
				v-for="(option, index) in options"
				:key="`verstatile-panel-${index}`"
				:name="option.name"
			>
				<hk-dmg-type-select 
					v-if="action_type !== 'healing'"
					class="mb-3"
					:label="`Damage type ${index == 1 ? option.label : '*'}`"
					v-model="roll[`${index === 1 ? 'versatile_' : '' }damage_type`]"
					:validation-rules="index === 0 ? 'required' : ''"
				/>

				<!-- ROLLS -->
				<div class="row q-col-gutter-md mb-3">
					<!-- DICE COUNT -->
					<div class="col">
						<ValidationProvider 
							:rules="{
								between: [1, 99],
								required: !!roll[`${index === 1 ? 'versatile_' : '' }dice_type`]
							}" 
							:name="`Dice count ${index == 1 ? option.label : ''}`" 
							v-slot="{ errors, invalid, validated }"
						>
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								:label="`Dice count ${index == 1 ? option.label : '*'}`"
								v-model.number="roll[`${index === 1 ? 'versatile_' : '' }dice_count`]"
								@input="parseToInt($event, roll, `${index === 1 ? 'versatile_' : '' }dice_count`)"
								min="1"
								max="99"
								autocomplete="off"
								name="dice_count"
								class="mb-2"
								type="number"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col">
						<!-- DICE TYPE -->
						<q-select 
							:dark="$store.getters.theme === 'dark'" filled square
							map-options emit-value
							clearable
							:label="`Dice type ${index == 1 ? option.label : ''}`"
							:options="dice_type"
							v-model="roll[`${index === 1 ? 'versatile_' : '' }dice_type`]"
							class="mb-2"
						/>
					</div>
					<div class="col">
						<!-- MODIFIER FIXED VALUE -->
						<ValidationProvider rules="between:-99,99" name="Fixed value" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								:label="`Fixed value ${index == 1 ? option.label : ''}`"
								v-model="roll[`${index === 1 ? 'versatile_' : '' }fixed_val`]"
								@input="parseToInt($event, roll, `${index === 1 ? 'versatile_' : '' }fixed_val`)"
								autocomplete="off"
								class="mb-2"
								type="number"
								:error="invalid && validated"
								:error-message="errors[0]"
							>
								<template v-slot:append>
									<hk-popover 
										header="Fixed value"
										content="Set the fixed value that is added on top of the rolled value."
									>
										<q-icon name="info" />
									</hk-popover>
								</template>
							</q-input>
						</ValidationProvider>
					</div>

					<!-- PRIMARY STAT -->
					<div class="col" v-if="spell">
						<q-checkbox 
							size="lg" dark 
							v-model="roll[`${index === 1 ? 'versatile_' : '' }primary`]" 
							:label="`Primary ${index == 1 ? option.label : ''}`"
							:false-value="null" 
							indeterminate-value="something-else"
							class="mb-2"
						>
							<q-tooltip anchor="top middle" self="center middle">
								Add primay stat modifier
							</q-tooltip>
						</q-checkbox>
					</div>
				</div>
			</q-tab-panel>
		</q-tab-panels>

		<!-- PROJECTILE COUNT -->
		<q-input 
			v-if="action_type !== 'healing'"
			:dark="$store.getters.theme === 'dark'" filled square
			label="Projectile count"
			v-model="roll.projectile_count"
			@input="parseToInt($event, roll, 'projectile_count')"
			autocomplete="off"
			class="mb-4"
			type="number"
			@keyup="$forceUpdate()"
		>
			<template v-slot:append>
				<hk-popover header="Projectile count">
					<q-icon name="info" />
					<template slot="content">
						Number of projectiles that are cast. <br/>
						Think of spells like <b>Magic Missile</b> (phb 257), 
						where multiple projectiles are created for a single cast.
					</template>
				</hk-popover>
			</template>
		</q-input>

		<!-- FAIL MODIFIER -->
		<ValidationProvider v-if="action_type === 'save'" rules="required" name="Fixed value" v-slot="{ invalid, validated }">
			<q-select 		
				:dark="$store.getters.theme === 'dark'" filled square
				map-options
				emit-value
				label="Succesful save *"
				:options="save_fail_mod"
				v-model="roll.save_fail_mod"
				class="mb-3"
				hint="The effect if the target makes a successful saving throw."
				:error="invalid && validated"
				error-message="What happens on a succesful save?"
			/>
		</ValidationProvider>
		<ValidationProvider v-if="['spell_attack', 'melee_weapon', 'ranged_weapon'].includes(action_type)" rules="required" name="Fixed value" v-slot="{ invalid, validated }">
			<q-select 	
				:dark="$store.getters.theme === 'dark'" filled square
				map-options
				emit-value
				label="Miss modifier *"
				:options="save_fail_mod"
				v-model="roll.miss_mod"
				class="mb-3"
				hint="The effect if the attack is a miss."
				:error="invalid && validated"
				error-message="What happens on a miss?"
			/>
		</ValidationProvider>

		<template v-if="action_type !== 'healing'">
			<hr>
			<!-- SPECIAL ACTIONS -->
			<div class="col-12 col-md-3">
				<q-select 
					:dark="$store.getters.theme === 'dark'" filled square multiple
					map-options
					emit-value
					label="Special events"
					:options="Object.values(specials)"
					v-model="special"
					class="mb-3"
					clearable
					hint="Select the special events that happens on a hit"
					:option-disable="opt => Object(opt) === opt ? opt.disable === true : true"
				/>
			</div>
		</template>

		<!-- SPELL SCALING -->
		<template v-if="spell && spell.scaling !== undefined && spell.scaling !== 'none'">
			<!-- HIGHER LEVEL MODIFIER -->
			<h2 class="d-flex justify-content-between mt-3">
				<span>
					<i class="fas fa-chart-line"></i> Scaling
				</span>
				<a 
					v-if="level_tier_addable()"
					class="neutral-2 text-capitalize" 
					@click="add_level_tier()"
				>
					<i class="fas fa-plus green"></i>
					<q-tooltip anchor="center right" self="center left">
						Add level tier
					</q-tooltip>
				</a>
			</h2>
			<template v-for="(level_tier, tier_index) in roll.level_tiers">
				<div class="d-flex justify-content-between" v-if="tier_index < shown_level_tiers" :key="`level-tier-${tier_index}`">
					<!-- HL LEVEL SCALE -->
					<div>
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							label="Scale size"
							v-model="level_tier.level"
							autocomplete="off"
							class="mb-2"
							v-validate="'required'"
							type="number"
							@keyup="$forceUpdate()"
						/>

						<!-- HL PROJECTILE COUNT -->
						<div class="row q-col-gutter-sm mb-0">
							<!-- HL DICE COUNT -->
							<div class="col">
								<q-input 
									:dark="$store.getters.theme === 'dark'" filled square
									label="Dice count"
									v-model="level_tier.dice_count"
									autocomplete="off"
									class="mb-2"
									type="number"
									@keyup="$forceUpdate()"
								/>
							</div>
							<div class="col">
								<!-- HL MODIFIER DICETYPE -->
								<q-select 
									:dark="$store.getters.theme === 'dark'" filled square
									map-options
									emit-value
									label="Dice type"
									:options="dice_type"
									v-model="level_tier.dice_type"
									class="mb-2"
									@input="$forceUpdate()"
								/>
							</div>
							<div class="col">
								<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										label="Fixed value"
										v-model="level_tier.fixed_val"
										autocomplete="off"
										class="mb-2"
										type="number"
										@keyup="$forceUpdate()"
									/>
							</div>
						</div>

						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							label="Projectile count"
							v-model="level_tier.projectile_count"
							autocomplete="off"
							type="number"
							@keyup="$forceUpdate()"
						/>
						
					</div>
					<div>
						<a @click="remove_level_tier(tier_index)" class="remove">
							<i class="fas fa-trash-alt red"></i>
						</a>
					</div>
				</div>
			</template>
			<p v-if="roll.level_tiers && roll.level_tiers.length > 0">
				<span v-for="(line, i) in create_spell_level_tier_description(roll.level_tiers)" :key="`tier-${i}`">
					{{line}}<br/>
				</span>
			</p>
		</template>
	</div>
</template>

<script>
import numeral from 'numeral';
import { damage_types } from '@/mixins/damageTypes.js';

export default {
	name: 'monster-action-modifier',
	props: {
		value: Object,
		action_type: String,
		versatile_options: {
			type: Object,
			default: () => { return {}; }
		},
		spell: {
			type: Object,
			default: undefined
		},
	},
	mixins: [damage_types],
	computed: {
		roll: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit('input', newValue);
			}
		},
		shown_level_tiers() {
			if (this.spell && this.spell.scaling == "spell_scale") {
				return 1;
			} return 100;
		},
		specials() {
			let specials = {
				siphon_full: { label: "Heal caster full", value: "siphon_full", info: "On a hit, the caster is healed for all of the damage done." },
				siphon_half: { label: "Heal caster half", value: "siphon_half", info: "On a hit, the caster is healed for half of the damage done." },
				drain: { label: "Reduce max HP", value: "drain", info: "On a failed save the targets hit point maximum is reduced by an amount equal to the damage done." }
			};
			if(this.special) {
				if(this.special.includes("siphon_full")) specials.siphon_half.disable = true;
				if(this.special.includes("siphon_half")) specials.siphon_full.disable = true;
			}
			return specials;
		},
		special: {
			get() {
				if(this.roll.special && typeof this.roll.special === "string") {
					return [this.roll.special];
				} return this.roll.special;
			},
			set(newVal) {
				this.$set(this.roll, "special", newVal);
			}
		},
		options() {
			let options = [
				{
					name: 0,
				}
			];
			if(this.versatile_options.versatile) {
				options[0].label = this.versatile_options.versatile_one || "Option 1";
				options[1] = {
					name: 1,
					label: this.versatile_options.versatile_two || "Option 2"
				}
			}
			return options;
		},
	},
	data() {
		return {
			tab: 0,
			modifier_type: [
				{label: "Damage", value: "damage"},
				{label: "Healing", value: "healing"}
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
				{ label: "Half damage", value: 0.5},
				{ label: "Full damage", value: 1},
			],
		};
	},
	methods: {
		parseToInt(value, object, property) {
			if(value === undefined || value === "") {
				this.$delete(object, property);
			} else {
				this.$set(object, property, parseInt(value));
			}
		},
		level_tier_addable() {
			if (this.spell &&
					this.spell.scaling === "spell_scale" && 
					this.roll.level_tiers &&
					this.roll.level_tiers.length >= 1) {
				return false;
			} return true;
		},
		add_level_tier() {
			if(!this.roll.level_tiers) {
				this.roll.level_tiers = [];
			}
			this.roll.level_tiers.push({});
			this.$forceUpdate();
		},
		remove_level_tier(tier_index) {
			this.$delete(this.roll.level_tiers, tier_index);
			this.$forceUpdate();
		},
		create_spell_level_tier_description(level_tiers) {
			// Generates description for each level tier for spell level scaling
			let description = [];
			if (this.spell.scaling === "character_level") {
				description = ["This spell's damage/projectiles increases when your character reaches a higher level."]
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let count_txt = `${tier.projectile_count} projectile${tier.projectile_count > 1 ? 's' : ''}`
					let level_txt = `at ${numeral(tier.level).format('0o')} level`
					let damage_txt = 'this spell roll does ';
					damage_txt += (tier.dice_count || tier.dice_type) ? `${tier.dice_count || "..."}d${tier.dice_type || "..."}` : '';
					damage_txt += (tier.fixed_val) ? `${(tier.dice_count || tier.dice_type) ? "+" : ""}${tier.fixed_val || ""}` : '';

					let new_line = `${tier.projectile_count ? count_txt : ''} `
					new_line += `${!tier.projectile_count && tier.dice_count ? level_txt.capitalize()+'s,' : level_txt}`
					new_line += `${tier.projectile_count && tier.dice_count ? ', and ' : '.'}`
					new_line += `${tier.dice_count ? damage_txt : ''}`
					description.push(new_line)
				}
			} 
			else if (this.spell.scaling == "spell_scale") {
				let tier = level_tiers[0]
				// Opening line
				let level_txt = "When you cast this spell using a spell slot of "
				level_txt += `${numeral(parseInt(this.level) + 1).format('0o')} level or higher,`
				// Damage modifier text
				let damage_txt = 'the damage of this roll increases by '
				damage_txt += tier.dice_count || tier.dice_type ? `${tier.dice_count || "..."}d${tier.dice_type || "..."}` : '';
				damage_txt += tier.fixed_val ? `${(tier.dice_count || tier.dice_type) ? "+" : ""}${tier.fixed_val || ""}` : '';
				// Projectile count text
				let count_txt = `the spell creates ${tier.projectile_count} more projectile${tier.projectile_count > 1 ? "s" : ""}`
				// Spell slot text
				let slot_txt = `for ${tier.level < 2 ? "each slot level" : "every " + tier.level + " slot levels"} above ${numeral(this.level).format('0o')}.`
				
				let text = `${level_txt} ${tier.projectile_count ? count_txt : ''} ${tier.projectile_count && tier.dice_count ? "and " : ''}${tier.dice_count ? damage_txt : ''} ${slot_txt}`
				description = [text]
			} 
			else if (this.spell.scaling == "spell_level") {
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = "When you cast this spell using a "
					new_line += `${numeral(tier.level).format('0o')}-level spell slot, this spell roll does `
					new_line += `${tier.dice_count || "..."}d${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`

					description.push(new_line)
				}
			}
			return description;
		}
	}
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 18px !important;
	text-transform: none !important;
	border-bottom: solid 1px $neutral-4;
	padding-bottom: 5px;
}
.q-tab-panel {
	padding: 15px 0 0 0 !important;
	border-bottom: solid 1px $neutral-4;
	margin-bottom: 15px;
}
</style>
