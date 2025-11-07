<template>
	<div>
		<div v-show="!set_scaling">
			<button
				class="btn btn-sm btn-block bg-neutral-5 mb-2"
				@click.prevent="show_description = !show_description"
			>
				Description
			</button>
			<q-slide-transition>
				<hk-markdown-editor
					v-if="show_description"
					:value="description || spell.description"
					read-only
				/>
			</q-slide-transition>
			<q-tabs v-if="action_options.length > 1" v-model="tab" dark no-caps>
				<q-tab
					v-for="(option, index) in action_options"
					:key="`option-tab-${index}`"
					:name="index"
					:label="option"
				/>
			</q-tabs>

			<q-tab-panels v-model="tab" class="bg-transparent" keep-alive>
				<q-tab-panel
					v-for="(key, index) in action_options"
					:key="`option-panel-${index}`"
					:name="index"
				>
					<!-- Ignore Roll for option -->
					<div v-if="index" class="d-flex items-center mb-2">
						<q-checkbox
							:dark="$store.getters.theme === 'dark'"
							:value="getValue('ignore', { key, index })"
							:label="`Ignore for ${key}`"
							@input="setValue($event, 'ignore', { key, index })"
							:false-value="null"
							indeterminate-value="something-else"
						/>
						<hk-popover header="Ignore roll">
							<i class="fas fa-info-circle ml-2 neutral-2" aria-hidden="true" />
							<template #content>
								Ignore this roll for the <strong>{{ key }}</strong> option.
							</template>
						</hk-popover>
					</div>
					<template
						v-if="!index || !roll.options || !roll.options[key] || !roll.options[key].ignore"
					>
						<template v-if="action_type !== 'healing'">
							<Field
								:rules="{
									required: index === 0,
								}"
								:name="`Dice count ${key}`"
							>
								<hk-dmg-type-select
									class="mb-2"
									:label="`Damage type ${index ? key : `${key} *`}`"
									:value="getValue('damage_type', { key, index })"
									@input="setValue($event, 'damage_type', { key, index })"
								/>
							</Field>
							<div class="d-flex items-center mb-2">
								<q-checkbox
									:dark="$store.getters.theme === 'dark'"
									:value="getValue('magical', { key, index })"
									:label="`${index ? key : ''} Magical`"
									:disable="
										!['bludgeoning', 'piercing', 'slashing'].includes(
											getValue('damage_type', { key, index })
										)
									"
									@input="setValue($event, 'magical', { key, index })"
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
								<Field
									:rules="{
										between: [1, 99],
										required: !!getValue('dice_type', { key, index }),
									}"
									:name="`Dice count ${key}`"
									v-slot="{ errorMessage, meta }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										:label="`Dice count ${key} ${!index ? '*' : ''}`"
										:value="getValue('dice_count', { key, index })"
										@input="setValue($event, 'dice_count', { key, index })"
										min="1"
										max="99"
										autocomplete="off"
										name="dice_count"
										class="mb-2"
										type="number"
										:error="!meta.valid && meta.validated"
										:error-message="errorMessage"
									/>
								</Field>
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
									:label="`Dice type ${key}`"
									:options="dice_type"
									:value="getValue('dice_type', { key, index })"
									@input="setValue($event, 'dice_type', { key, index })"
									class="mb-2"
								/>
							</div>
							<div class="col">
								<!-- MODIFIER FIXED VALUE -->
								<Field
									rules="between:-99,99"
									name="Fixed value"
									v-slot="{ errorMessage, meta }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										:label="`Fixed value ${index > 0 ? key : ''}`"
										:value="getValue('fixed_val', { key, index })"
										@input="setValue($event, 'fixed_val', { key, index })"
										autocomplete="off"
										class="mb-2"
										type="number"
										:error="!meta.valid && meta.validated"
										:error-message="errorMessage"
									>
										<template v-slot:append>
											<hk-popover
												header="Fixed value"
												content="Set the fixed value that is added on top of the rolled value."
											>
												<q-icon name="fas fa-info-circle" />
											</hk-popover>
										</template>
									</q-input>
								</Field>
							</div>

							<!-- PRIMARY STAT -->
							<div class="col" v-if="spell">
								<q-checkbox
									size="lg"
									dark
									v-model="roll.primary"
									label="Primary"
									:false-value="null"
									:disable="index > 0"
									indeterminate-value="something-else"
									class="mb-2"
								>
									<q-tooltip anchor="top middle" self="center middle">
										Add primary stat modifier
									</q-tooltip>
								</q-checkbox>
							</div>
						</div>
					</template>
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
						roll.scaling && roll.scaling.length
							? scalingDesc(roll.scaling, spell.scaling, spell.level)
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
							:class="roll.scaling && roll.scaling.length ? 'fa-pencil' : 'fa-plus'"
							aria-hidden="true"
						/>
					</button>
				</q-input>
			</template>

			<!-- FAIL MODIFIER -->
			<Field
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
					:error="!meta.valid && meta.validated"
					error-message="What happens on a succesful save?"
				/>
			</Field>
			<Field
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
					:error="!meta.valid && meta.validated"
					error-message="What happens on a miss?"
				/>
			</Field>

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
		<Form v-if="set_scaling" v-slot="{ valid }">
			<hk-action-roll-scaling
				v-model="roll.scaling"
				:roll="roll"
				:spell="spell"
			/>
			<q-btn no-caps label="Back to form" @click.prevent="set_scaling = false" :disable="!valid" />
		</Form>
	</div>
</template>

<script>
import { damage_types, dice_types } from "src/utils/generalConstants";
import { spellScalingDescription } from "src/utils/spellFunctions";
import { Field } from "vee-validate";

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
		options: {
			type: Array,
			default: undefined,
		},
		spell: {
			type: Object,
			default: undefined,
		},
		description: {
			type: String,
		},
	},
	data() {
		return {
			show_description: false,
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
				this.roll["special"] = newVal;
			},
		},
		action_options() {
			return this.options || [""];
		},
	},
	methods: {
		parseToInt(value, object, property) {
			if (value === undefined || value === "") {
				delete object[property];
			} else {
				object[property] = parseInt(value);
			}
		},
		reset_magical(value, versatile) {
			const prop = versatile === 1 ? "versatile_magical" : "magical";
			if (!["bludgeoning", "piercing", "slashing"].includes(value)) {
				this.roll[prop] = null;
			}
		},
		scalingDesc(tiers, scaling, level) {
			return spellScalingDescription(tiers, scaling, level);
		},
		getValue(prop, option) {
			if (option.index == 0) {
				return this.roll[prop];
			} else if (this.roll.options) {
				return this.roll.options[option.key] ? this.roll.options[option.key][prop] : null;
			}
		},
		setValue(value, prop, option) {
			value =
				["dice_count", "fixed_val"].includes(prop) && value != undefined ? parseInt(value) : value;
			if (option.index === 0) {
				this.roll[prop] = value;
			} else if (this.roll.options) {
				if (this.roll.options[option.key]) {
					this.roll.options[option.key][prop] = value;
				} else {
					this.roll.options[option.key] = { [prop]: value };
				}
			} else {
				this.roll["options"] = { [option.key]: { [prop]: value } };
			}
			if (prop === "damage_type") {
				this.reset_magical(value, option.key);
			}
		},
	},
	components: { Field },
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
