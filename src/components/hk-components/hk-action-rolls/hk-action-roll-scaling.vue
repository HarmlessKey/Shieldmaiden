<template>
	<div>
		<h2 class="d-flex justify-content-between mb-1">
			<span> <i aria-hidden="true" class="fas fa-chart-line neutral-2 ml-1" /> {{ scaling_name }}</span>
			<a v-if="levelTierAddable()" class="btn btn-sm bg-neutral-5" @click="addLevelTier()">
				<i aria-hidden="true" class="fas fa-plus green" />
				<q-tooltip anchor="center right" self="center left"> Add level tier </q-tooltip>
			</a>
		</h2>
		<p class="bg-neutral-7 p-2">
			<small class="neutral-2">At higher levels description</small><br />
			{{ spell.higher_level }}
		</p>
		<template v-for="(level_tier, tier_index) in scaling">
			<div
				class="d-flex justify-content-between gap-x-1"
				v-if="tier_index < shown_level_tiers"
				:key="`level-tier-${tier_index}`"
			>
				<div class="row q-col-gutter-sm mb-0 full-width">
					<div class="col">
						<Field
							rules="required|between:1,20"
							:name="`${scaling_name} ${tier_index}`"
							v-slot="{ errorMessage, meta }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								:label="scaling_name"
								v-model="level_tier.level"
								autocomplete="off"
								class="mb-2"
								type="number"
								min="1"
								max="20"
								:error="!meta.valid && meta.validated"
								:error-message="errorMessage"
								@keyup="$forceUpdate()"
								@input="
									(value) => $set(level_tier, 'level', value != undefined ? parseInt(value) : value)
								"
							/>
						</Field>
					</div>
					<template v-if="type === 'roll'">
						<div class="col">
							<Field
								rules="between:1,99"
								:name="`Dice count ${tier_index}`"
								v-slot="{ errorMessage, meta }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Dice count"
									v-model="level_tier.dice_count"
									autocomplete="off"
									class="mb-2"
									type="number"
									min="1"
									max="99"
									:error="!meta.valid && meta.validated"
									:error-message="errorMessage"
									@keyup="$forceUpdate()"
									@input="
										(value) =>
											$set(level_tier, 'dice_count', value != undefined ? parseInt(value) : value)
									"
								>
									<small slot="append">d{{ roll.dice_type }}</small>
								</q-input>
							</Field>
						</div>
						<div class="col">
							<Field
								rules="between:-99,99"
								:name="`Fixed value ${tier_index}`"
								v-slot="{ errorMessage, meta }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Fixed value"
									v-model="level_tier.fixed_val"
									autocomplete="off"
									class="mb-2"
									type="number"
									min="-99"
									max="99"
									:error="!meta.valid && meta.validated"
									:error-message="errorMessage"
									@keyup="$forceUpdate()"
									@input="
										(value) =>
											$set(level_tier, 'fixed_val', value != undefined ? parseInt(value) : value)
									"
								/>
							</Field>
						</div>
					</template>
					<template v-if="type === 'projectile'">
						<Field
								rules="between:1,10"
								:name="`Projectile count ${tier_index}`"
								v-slot="{ errorMessage, meta }"
							>
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									label="Projectile count"
									v-model="level_tier.projectile_count"
									autocomplete="off"
									type="number"
									:error="!meta.valid && meta.validated"
									:error-message="errorMessage"
									@keyup="$forceUpdate()"
									@input="
										(value) =>
											$set(level_tier, 'projectile_count', value != undefined ? parseInt(value) : value)
									"
								/>
							</Field>
					</template>
				</div>
				<div>
					<a @click="removeLevelTier(tier_index)" class="btn btn-sm bg-neutral-5">
						<i aria-hidden="true" class="fas fa-trash-alt red" />
					</a>
				</div>
			</div>
		</template>
		<p v-if="scaling && scaling.length" class="bg-neutral-7 p-2 mt-3 desc">
			<small class="neutral-2">Generated description</small>
			{{ scalingDesc(scaling, spell.scaling, spell.level, roll.dice_type) }}
		</p>
	</div>
</template>

<script>
import { spellScalingDescription } from "src/utils/spellFunctions";
import { dice_types } from "src/utils/generalConstants";

export default {
	name: "HkActionRollScaling",
	props: {
		value: {
			type: Array,
			default: undefined,
		},
		roll: {
			type: Object,
			default: () => { return {} }
		},
		type: {
			type: String,
			default: "roll"
		},
		spell: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			dice_type: dice_types,
		};
	},
	computed: {
		scaling: {
			get() {
				return this.value;
			},
			set(newValue) {
				this.$emit("input", newValue);
			},
		},
		shown_level_tiers() {
			if (this.spell.scaling == "spell_scale") {
				return 1;
			}
			return 100;
		},
		scaling_name() {
			return this.spell.scaling.replace(/_/, " ").capitalize();
		},
	},
	methods: {
		levelTierAddable() {
			return !(
				this.spell.scaling === "spell_scale" &&
				this.scaling &&
				this.scaling.length >= 1
			);
		},
		addLevelTier() {
			if (!this.scaling) {
				this.scaling = [{}];
			} else {
				this.scaling.push({});
			}
			this.$forceUpdate();
		},
		removeLevelTier(tier_index) {
			this.$delete(this.scaling, tier_index);
			this.$forceUpdate();
		},
		scalingDesc(tiers, scaling, level) {
			return spellScalingDescription(tiers, scaling, level);
		},
	},
};
</script>

<style lang="scss" scoped>
.desc {
	white-space: pre-line;
}
</style>
