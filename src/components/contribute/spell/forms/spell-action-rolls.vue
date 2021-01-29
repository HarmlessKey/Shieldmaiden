<template>
	<!-- Rolls -->
	<div>
		<div class="hk-card mt-3 rolls">
			<div class="card-header d-flex justify-content-between">
				<span><i class="fas fa-dice-d20"/> Rolls</span>
				<a 
					class="gray-light text-capitalize" 
					@click="newRoll()"
				>
					<i class="fas fa-plus green"></i>
					<span class="d-none d-md-inline ml-1">Add</span>
					<q-tooltip anchor="top middle" self="center middle">
						Add roll
					</q-tooltip>
				</a>
			</div>
		</div>

		<!-- ROLLS TABLE -->
		<hk-table 
			v-if="rolls"
			:items="rolls"
			:columns="rollColumns"
			:showHeader="false"
		>
			<template slot="roll" slot-scope="data">
				{{data.row.projectile_count ? `${data.row.projectile_count}x`: ""}}
				{{data.row.dice_count}}{{data.row.dice_type ? "d" : ""}}{{data.row.dice_type}}{{data.row.fixed_val ? "+" : ""}}{{data.row.fixed_val}} 
			</template>

			<span slot="type" slot-scope="data">
				<span v-if="action_type === 'healing'" class="healing">
					<i class="fas fa-heart" /> Healing
				</span>
				<template v-else>
					<span :class="data.row.damage_type">
						<i :class="damage_type_icons[data.row.damage_type]" /> 
						{{ data.row.damage_type.capitalize() }} 
					</span> damage
				</template>
			</span>

			<template slot="fail" slot-scope="data" v-if="action_type !== 'healing'">
				{{ 
					action_type === "save" 
					? `Save: ${application[data.row.save_fail_mod]}` 
					: `Miss: ${application[data.row.miss_mod]}`
				}}
			</template>

			<!-- ACTIONS -->
			<div slot="actions" slot-scope="data" class="actions">
				<a class="ml-2" @click="editRoll(data.index)">
					<i class="fas fa-pencil-alt"></i>
					<q-tooltip anchor="top middle" self="center middle">
						Edit
					</q-tooltip>
				</a>
				<a class="ml-2" @click="removeRoll(data.index)">
					<i class="fas fa-trash-alt"></i>
					<q-tooltip anchor="top middle" self="center middle">
						Delete
					</q-tooltip>
				</a>
			</div>
		</hk-table>

		<q-dialog square v-model="roll_dialog">
			<div v-if="roll">
				<q-form @submit="saveRoll()">
					<hk-card :header="(edit_index !== undefined) ? 'Edit roll' : 'New roll'" class="mb-0">
						<div>
							<q-select 
								v-if="action_type !== 'healing'"
								dark filled square
								map-options
								emit-value
								label="Damage type"
								:options="damage_types"
								v-model="roll.damage_type"
								class="mb-2"
								:rules="[val => !!val || 'Select a damage type']"
							>
								<template v-slot:selected v-if="roll.damage_type">
									<span>
										<i :class="[damage_type_icons[roll.damage_type], roll.damage_type]"/>
										{{ roll.damage_type.capitalize() }}
									</span>
								</template>
								<template v-slot:option="scope">
									<q-item
										clickable
										v-ripple
										v-close-popup
										:active="roll.damage_type === scope.opt"
										@click="$set(roll, 'damage_type', scope.opt)"
									>
										<q-item-section avatar>
											<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt"/>
										</q-item-section>
										<q-item-section>
											<q-item-label v-html="scope.opt.capitalize()"/>
										</q-item-section>
									</q-item>
								</template>
							</q-select>

							<!-- ROLLS -->
							<div class="row q-col-gutter-md mb-3">
								<!-- DICE COUNT -->
								<div class="col">
									<q-input 
										dark filled square
										label="Dice count"
										v-model="roll.dice_count"
										autocomplete="off"
										type="number"
										class="mb-2"
										@keyup="$forceUpdate()"
									/>
								</div>
								<div class="col">

									<!-- MODIFIER SUBTYPE -->
									<q-select 
										dark filled square
										map-options
										emit-value
										:options="dice_type"
										label="Dice type"
										class="mb-2"
										v-model="roll.dice_type"
										@change="$forceUpdate()"
									/>
								</div>
								<div class="col">
									<!-- MODIFIER FIXED VALUE -->
									<q-input 
										dark filled square
										label="Fixed value"
										v-model="roll.fixed_val"
										autocomplete="off"
										class="mb-2"
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
								<div class="col">
									<q-checkbox 
										size="lg" dark 
										v-model="roll.primary" 
										label="Primary" 
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

							<!-- PROJECTILE COUNT -->
							<q-input 
								dark filled square
								label="Projectile count"
								v-model="roll.projectile_count"
								autocomplete="off"
								class="mb-4"
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


							<!-- SPELL FAIL MODIFIER -->
							<q-select 
								v-if="action_type === 'spell_save'"
								dark filled square
								map-options
								emit-value
								label="Succesful save"
								class="mb-3"
								:options="save_fail_mod"
								v-model="roll.save_fail_mod"
								hint="The effect if the target makes a successful saving throw."
								:rules="[val => val !== undefined || 'What happens on a succesful save?']"
							/>
							<q-select 
								v-if="['spell_attack', 'melee_weapon', 'ranged_weapon'].includes(action_type)"
								dark filled square
								map-options
								emit-value
								label="Miss effect"
								class="mb-3"
								:options="save_fail_mod"
								v-model="roll.miss_mod"
								hint="The effect if the attack is a miss."
								:rules="[val => val !== undefined || 'What happens on a miss?']"
							/>

							<hr>
							<!-- SPECIAL ACTIONS -->
							<q-select 
								dark filled square
								map-options
								emit-value
								label="Special"
								:options="Object.values(specials)"
								v-model="roll.special"
								class="mb-2"
								@change="$forceUpdate()"
								clearable
							>
								<template v-slot:append>
									<q-icon name="info" v-if="roll.special" @click.stop>
										<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
											<q-card dark square>
												<q-card-section class="bg-gray-active">
													<b>{{ specials[roll.special].label }}</b>
												</q-card-section>
												<q-card-section>
													{{ specials[roll.special].info }}
												</q-card-section>
											</q-card>
										</q-menu>
									</q-icon>
								</template>
							</q-select>

							<template v-if="level_scaling !== undefined && level_scaling !== 'none'">
								<!-- HIGHER LEVEL MODIFIER -->
								<h2 class="d-flex justify-content-between mt-3">
									<span>
										<i class="fas fa-chart-line"></i> Scaling
									</span>
									<a 
										v-if="level_tier_addable()"
										class="gray-hover text-capitalize" 
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
												dark filled square
												label="Scale size"
												v-model="level_tier.level"
												autocomplete="off"
												:name="`level-${edit_index}`"
												class="mb-2"
												v-validate="'required'"
												type="number"
												:data-vv-as="level_scaling"
												@keyup="$forceUpdate()"
											/>

											<!-- HL PROJECTILE COUNT -->
											<div class="row q-col-gutter-sm mb-0">
												<!-- HL DICE COUNT -->
												<div class="col">
													<q-input 
														dark filled square
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
														dark filled square
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
															dark filled square
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
												dark filled square
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
						<div slot="footer" class="card-footer d-flex justify-content-end">
							<q-btn class="mr-1" type="cancel" @click="cancelRoll()">Cancel</q-btn>
							<q-btn color="primary" type="submit" :label="(edit_index !== undefined) ? 'Save' : 'Add'" />
						</div>
					</hk-card>
				</q-form>
			</div>
		</q-dialog>
	</div>
</template>

<script>
import numeral from 'numeral';
import { damage_types } from '@/mixins/damageTypes.js';

export default {
	name: 'spell-action-rolls',
	mixins: [damage_types],
	props: {
		value: Array,
		level_scaling: String,
		level: Number,
		action_type: String,
	},
	computed: {
		rolls: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
				this.$forceUpdate();
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
			edit_index: undefined,
			roll_dialog: false,
			roll: undefined,
			rollColumns: {
				roll: {
					maxContent: true
				},
				type: {
					truncate: true
				},
				fail: {
					truncate: true
				},
				actions: {
					noPadding: true,
					maxContent: true
				}
			},
			dice_type: [
				{ label: "d4", value: 4 }, 
				{ label: "d6", value: 6 },
				{ label: "d8", value: 8 }, 
				{ label: "d10", value: 10 },
				{ label: "d12", value: 12 },
				{ label: "d20", value: 20 }
			],
			application: {
				0: "No effect",
				0.5: "Half damage",
				1: "Full damage"
			},
			save_fail_mod: [
				{ label: "No effect", value: 0},
				// { label: "¼", value: 0.25},
				{ label: "Half damage", value: 0.5},
				{ label: "Full damage", value: 1},
			],
			specials: {
				siphon_full: { label: "Heal caster full", value: "siphon_full", info: "On a hit, the caster is healed for all of the damage done." },
				siphon_half: { label: "Heal caster half", value: "siphon_half", info: "On a hit, the caster is healed for half of the damage done." },
				drain: { label: "Reduce max HP", value: "drain", info: "On a failed save the targets hit point maximum is reduced by an amount equal to the damage done." }
			}
		};
	},
	methods: {
		newRoll() {
			this.edit_index = undefined; // It's new, so no edit index
			this.roll = {
			}; // Create an empty new roll
			this.roll_dialog = true;
		},
		editRoll(index) {
			this.edit_index = index;
			this.roll_dialog = true;
		},
		saveRoll() {
			if(this.edit_index === undefined) {
				let rolls = (!this.rolls) ? [] : this.rolls;
				rolls.push(this.roll);
				this.rolls = rolls;
			} else {
				this.$set(this.rolls, this.edit_index, this.roll);
			}
			this.roll = {};
			this.roll_dialog = false;
			this.$forceUpdate();
		},
		cancelRoll() {
			this.roll_dialog = false;
			this.edit_index = undefined;
			this.roll = undefined;
		},
		removeRoll(index) {
			this.$delete(this.rolls, index);
			this.$forceUpdate();
		},
		setPrimary(roll) {
			if (roll.primary == undefined) {
				roll.primary = false
			}
			roll.primary = !roll.primary
			this.$forceUpdate(); //IMPORTANT
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
		level_tier_addable() {
			if (this.level_scaling == "spell_scale" && 
					this.roll.level_tiers &&
					this.roll.level_tiers.length >= 1) {
				return false
			}
			return true
		},
		create_spell_level_tier_description(level_tiers) {
			// Generates description for each level tier for spell level scaling
			let description = []
			if (this.level_scaling === "character_level") {
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
			else if (this.level_scaling == "spell_scale") {
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
			else if (this.level_scaling == "spell_level") {
				for (let index in level_tiers) {
					let tier = level_tiers[index]
					let new_line = "When you cast this spell using a "
					new_line += `${numeral(tier.level).format('0o')}-level spell slot, this spell roll does `
					new_line += `${tier.dice_count || "..."}d${tier.dice_type || "..."}${tier.fixed_val ? "+" : ""}${tier.fixed_val || ""} damage.`

					description.push(new_line)
				}
			}
			return description
		},
	}
};
</script>

<style lang="scss" scoped>
h2 {
	font-size: 18px !important;
	text-transform: none !important;
	border-bottom: solid 1px$gray-hover;
	padding-bottom: 5px;
}
.hk-card {
		&.rolls {
			margin-bottom: 0;

			.card-header {
				padding: 12px 10px;
				margin-bottom: 1px;
			}
		}
	}
</style>
