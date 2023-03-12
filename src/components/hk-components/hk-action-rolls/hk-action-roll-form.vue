<template>
	<div>
		<div v-show="!set_scaling">
			<p>{{ spell.description }}</p>
			<q-tabs v-if="options.length > 1" v-model="tab" dark no-caps>
				<q-tab
					v-for="(option, index) in options"
					:key="`versatile-tab-${index}`"
					:name="option.name"
					:label="option.label"
				/>
			</q-tabs>

			<q-tab-panels v-model="tab" class="bg-transparent" keep-alive>
				<q-tab-panel
					v-for="(option, index) in options"
					:key="`versatile-panel-${index}`"
					:name="option.name"
				>
					<template v-if="action_type !== 'healing'">
						<hk-dmg-type-select
							class="mb-2"
							:label="`Damage type ${index == 1 ? option.label : '*'}`"
							v-model="roll[`${index === 1 ? 'versatile_' : ''}damage_type`]"
							:validation-rules="index === 0 ? 'required' : ''"
							@input="reset_magical($event, index)"
						/>
						<div class="d-flex items-center mb-2">
							<q-checkbox
								:dark="$store.getters.theme === 'dark'"
								v-model="roll[`${index === 1 ? 'versatile_' : ''}magical`]"
								:label="`${index == 1 ? option.label : ''} Magical`"
								:disable="
									!['bludgeoning', 'piercing', 'slashing'].includes(
										roll[`${index === 1 ? 'versatile_' : ''}damage_type`]
									)
								"
								:false-value="null"
								indeterminate-value="something-else"
							/>
							<hk-popover header="Magical damage">
								<i class="fas fa-info-circle ml-2 neutral-2" aria-hidden="true" />
								<template #content>
									The damage counts as <strong>magical</strong> to overcome resistances to non
									magical bludgeoning, piercing or slashing damage.
								</template>
							</hk-popover>
						</div>
					</template>

					<!-- ROLLS -->
					<div class="row q-col-gutter-md mb-3">
						<!-- DICE COUNT -->
						<div class="col">
							<ValidationProvider
								:rules="{
									between: [1, 99],
									required: !!roll[`${index === 1 ? 'versatile_' : ''}dice_type`],
								}"
								:name="`Dice count ${index == 1 ? option.label : ''}`"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									:label="`Dice count ${index == 1 ? option.label : '*'}`"
									v-model.number="roll[`${index === 1 ? 'versatile_' : ''}dice_count`]"
									@input="parseToInt($event, roll, `${index === 1 ? 'versatile_' : ''}dice_count`)"
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
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								map-options
								emit-value
								clearable
								:label="`Dice type ${index == 1 ? option.label : ''}`"
								:options="dice_type"
								v-model="roll[`${index === 1 ? 'versatile_' : ''}dice_type`]"
								class="mb-2"
							/>
						</div>
						<div class="col">
							<!-- MODIFIER FIXED VALUE -->
							<ValidationProvider
								rules="between:-99,99"
								name="Fixed value"
								v-slot="{ errors, invalid, validated }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									:label="`Fixed value ${index == 1 ? option.label : ''}`"
									v-model="roll[`${index === 1 ? 'versatile_' : ''}fixed_val`]"
									@input="parseToInt($event, roll, `${index === 1 ? 'versatile_' : ''}fixed_val`)"
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
								size="lg"
								dark
								v-model="roll[`${index === 1 ? 'versatile_' : ''}primary`]"
								:label="`Primary ${index == 1 ? option.label : ''}`"
								:false-value="null"
								indeterminate-value="something-else"
								class="mb-2"
							>
								<q-tooltip anchor="top middle" self="center middle">
									Add primary stat modifier
								</q-tooltip>
							</q-checkbox>
						</div>
					</div>
				</q-tab-panel>
			</q-tab-panels>

			<!-- SPELL SCALING -->
			<template v-if="spell && spell.scaling && spell.scaling !== 'none'">
				<q-input
					:dark="$store.getters.theme === 'dark'"
					label="Scaling"
					class="mb-4"
					filled
					square
					readonly
					autogrow
					:value="
						roll.level_tiers && roll.level_tiers.length
							? scalingDesc(roll.level_tiers, spell.scaling, spell.level)
							: 'No scaling set'
					"
				>
					<i slot="prepend" class="fas fa-chart-line" aria-hidden="true" />
					<button
						slot="append"
						class="btn btn-sm bg-neutral-5"
						@click.prevent="set_scaling = !set_scaling"
					>
						<i
							class="fas"
							:class="roll.level_tiers && roll.level_tiers.length ? 'fa-pencil' : 'fa-plus'"
							aria-hidden="true"
						/>
					</button>
				</q-input>
			</template>

			<!-- PROJECTILE COUNT -->
			<q-input
				v-if="action_type !== 'healing'"
				:dark="$store.getters.theme === 'dark'"
				filled
				square
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
							Number of projectiles that are cast. <br />
							Think of spells like <b>Magic Missile</b> (phb 257), where multiple projectiles are
							created for a single cast.
						</template>
					</hk-popover>
				</template>
			</q-input>

			<!-- FAIL MODIFIER -->
			<ValidationProvider
				v-if="action_type === 'save'"
				rules="required"
				name="Fixed value"
				v-slot="{ invalid, validated }"
			>
				<q-select
					:dark="$store.getters.theme === 'dark'"
					filled
					square
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
			<ValidationProvider
				v-if="['spell_attack', 'melee_weapon', 'ranged_weapon'].includes(action_type)"
				rules="required"
				name="Fixed value"
				v-slot="{ invalid, validated }"
			>
				<q-select
					:dark="$store.getters.theme === 'dark'"
					filled
					square
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

			<!-- SPECIAL ACTIONS -->
			<template v-if="action_type !== 'healing'">
				<hr />
				<div class="col-12 col-md-3">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						multiple
						map-options
						emit-value
						label="Special events"
						:options="Object.values(specials)"
						v-model="special"
						class="mb-3"
						clearable
						hint="Select the special events that happens on a hit"
						:option-disable="(opt) => (Object(opt) === opt ? opt.disable === true : true)"
					/>
				</div>
			</template>
		</div>
		<ValidationObserver v-if="set_scaling" v-slot="{ valid }">
			<hk-action-roll-scaling v-model="roll" :spell="spell" @input="$forceUpdate()" />
			<q-btn no-caps label="Back to form" @click.prevent="set_scaling = false" :disable="!valid" />
		</ValidationObserver>
	</div>
</template>

<script>
import { damage_types, dice_types } from "src/utils/generalConstants";
import { spellScalingDescription } from "src/utils/spellFunctions";

export default {
	name: "HkActionRollForm",
	props: {
		value: Object,
		action_type: String,
		versatile_options: {
			type: Object,
			default: () => {
				return {};
			},
		},
		spell: {
			type: Object,
			default: undefined,
		},
	},
	data() {
		return {
			damage_types: damage_types,
			set_scaling: false,
			tab: 0,
			modifier_type: [
				{ label: "Damage", value: "damage" },
				{ label: "Healing", value: "healing" },
			],
			dice_type: dice_types,
			save_fail_mod: [
				{ label: "No effect", value: 0 },
				{ label: "Half damage", value: 0.5 },
				{ label: "Full damage", value: 1 },
			],
		};
	},
	computed: {
		roll: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
			},
		},
		specials() {
			let specials = {
				siphon_full: {
					label: "Heal caster full",
					value: "siphon_full",
					info: "On a hit, the caster is healed for all of the damage done.",
				},
				siphon_half: {
					label: "Heal caster half",
					value: "siphon_half",
					info: "On a hit, the caster is healed for half of the damage done.",
				},
				drain: {
					label: "Reduce max HP",
					value: "drain",
					info: "On a failed save the targets hit point maximum is reduced by an amount equal to the damage done.",
				},
			};
			if (this.special) {
				if (this.special.includes("siphon_full")) specials.siphon_half.disable = true;
				if (this.special.includes("siphon_half")) specials.siphon_full.disable = true;
			}
			return specials;
		},
		special: {
			get() {
				if (this.roll.special && typeof this.roll.special === "string") {
					return [this.roll.special];
				}
				return this.roll.special;
			},
			set(newVal) {
				this.$set(this.roll, "special", newVal);
			},
		},
		options() {
			let options = [
				{
					name: 0,
				},
			];
			if (this.versatile_options.versatile) {
				options[0].label = this.versatile_options.versatile_one || "Option 1";
				options[1] = {
					name: 1,
					label: this.versatile_options.versatile_two || "Option 2",
				};
			}
			return options;
		},
	},
	methods: {
		parseToInt(value, object, property) {
			if (value === undefined || value === "") {
				this.$delete(object, property);
			} else {
				this.$set(object, property, parseInt(value));
			}
		},
		reset_magical(value, versatile) {
			const prop = versatile === 1 ? "versatile_magical" : "magical";

			if (!["bludgeoning", "piercing", "slashing"].includes(value)) {
				this.$set(this.roll, prop, null);
			}
		},
		scalingDesc(tiers, scaling, level) {
			return spellScalingDescription(tiers, scaling, level);
		},
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
.q-tab-panel {
	padding: 15px 0 0 0 !important;
	border-bottom: solid 1px $neutral-4;
	margin-bottom: 15px;
}
</style>
