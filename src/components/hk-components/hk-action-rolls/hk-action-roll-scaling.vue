<template>
	<div>
		<h2 class="d-flex justify-content-between mb-1">
			<span> <i aria-hidden="true" class="fas fa-chart-line neutral-2 ml-1" /> {{ scaling }}</span>
			<a v-if="levelTierAddable()" class="btn btn-sm bg-neutral-5" @click="addLevelTier()">
				<i aria-hidden="true" class="fas fa-plus green" />
				<q-tooltip anchor="center right" self="center left"> Add level tier </q-tooltip>
			</a>
		</h2>
		<p class="bg-neutral-7 p-2">
			<small class="neutral-2">At higher levels description</small><br />
			{{ spell.higher_level }}
		</p>
		<template v-for="(level_tier, tier_index) in roll.scaling">
			<div
				class="d-flex justify-content-between"
				v-if="tier_index < shown_level_tiers"
				:key="`level-tier-${tier_index}`"
			>
				<!-- HL LEVEL SCALE -->
				<div>
					<ValidationProvider
						rules="required"
						:name="`${scaling} ${tier_index}`"
						v-slot="{ errors, invalid, validated }"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							:label="scaling"
							v-model="level_tier.level"
							autocomplete="off"
							class="mb-2"
							type="number"
							:error="invalid && validated"
							:error-message="errors[0]"
							@keyup="$forceUpdate()"
						/>
					</ValidationProvider>

					<div class="row q-col-gutter-sm mb-0">
						<!-- HL DICE COUNT -->
						<div class="col">
							<ValidationProvider
								rules="between:1,99"
								:name="`Dice count ${tier_index}`"
								v-slot="{ errors, invalid, validated }"
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
									:error="invalid && validated"
									:error-message="errors[0]"
									@keyup="$forceUpdate()"
								/>
							</ValidationProvider>
						</div>
						<div class="col">
							<!-- HL MODIFIER DICE TYPE -->
							<ValidationProvider
								:rules="{ required: level_tier.dice_count }"
								:name="`Dice count ${tier_index}`"
								v-slot="{ errors, invalid, validated }"
							>
								<q-select
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									map-options
									emit-value
									:label="`Dice type ${level_tier.dice_count ? '*' : ''}`"
									:options="dice_type"
									v-model="level_tier.dice_type"
									class="mb-2"
									:error="invalid && validated"
									:error-message="errors[0]"
									@input="$forceUpdate()"
								/>
							</ValidationProvider>
						</div>
						<div class="col">
							<ValidationProvider
								rules="between:-99,99"
								:name="`Fixed value ${tier_index}`"
								v-slot="{ errors, invalid, validated }"
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
									:error="invalid && validated"
									:error-message="errors[0]"
									@keyup="$forceUpdate()"
								/>
							</ValidationProvider>
						</div>
					</div>

					<!-- HL PROJECTILE COUNT -->
					<ValidationProvider
						rules="between:1,10"
						:name="`Projectile count ${tier_index}`"
						v-slot="{ errors, invalid, validated }"
					>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							label="Projectile count"
							v-model="level_tier.projectile_count"
							autocomplete="off"
							type="number"
							:error="invalid && validated"
							:error-message="errors[0]"
							@keyup="$forceUpdate()"
						/>
					</ValidationProvider>
				</div>
				<div>
					<a @click="removeLevelTier(tier_index)" class="btn btn-sm bg-neutral-5">
						<i aria-hidden="true" class="fas fa-trash-alt red" />
					</a>
				</div>
			</div>
		</template>
		<p v-if="roll.scaling && roll.scaling.length > 0" class="bg-neutral-7 p-2 mt-3 desc">
			<small class="neutral-2">Generated description</small>
			{{ scalingDesc(roll.scaling, spell.scaling, spell.level) }}
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
			type: Object,
			default: undefined,
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
		roll: {
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
		scaling() {
			return this.spell.scaling.replace(/_/, " ").capitalize();
		},
	},
	methods: {
		levelTierAddable() {
			return !(
				this.spell.scaling === "spell_scale" &&
				this.roll.scaling &&
				this.roll.scaling.length >= 1
			);
		},
		addLevelTier() {
			if (!this.roll.scaling) {
				this.$set(this.roll, "scaling", []);
			}
			this.roll.scaling.push({});
			this.$forceUpdate();
		},
		removeLevelTier(tier_index) {
			this.$delete(this.roll.scaling, tier_index);
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
