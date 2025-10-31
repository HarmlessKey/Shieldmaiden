<template>
	<span v-if="action.options && action.options.length">
		<slot />
		<q-popup-proxy :dark="$store.getters.theme === 'dark'">
			<div class="bg-neutral-8">
				<q-item>
					<q-item-section>
						<strong>{{ action.name }}</strong>
					</q-item-section>
				</q-item>
				<q-list :dark="$store.getters.theme === 'dark'">
					<hk-roll
						v-for="(option, i) in action.options"
						:key="`${option}-roll`"
						@roll="roll($event, action, option)"
						:disabled="disabled"
					>
						<q-item clickable v-close-popup>
							<q-item-section avatar>{{ i + 1 }}</q-item-section>
							<q-item-section>
								{{ option }}
							</q-item-section>
						</q-item>
					</hk-roll>
				</q-list>
			</div>
		</q-popup-proxy>
	</span>
	<span v-else-if="action.versatile" @click.stop>
		<slot />
		<q-popup-proxy :dark="$store.getters.theme === 'dark'">
			<div class="bg-neutral-8">
				<q-item>
					<q-item-section>
						<strong>{{ action.name }}</strong>
					</q-item-section>
				</q-item>
				<q-list :dark="$store.getters.theme === 'dark'">
					<hk-roll v-for="i in [0, 1]" :key="`${i}-versatile-roll`" @roll="roll($event, action, i)">
						<q-item clickable v-close-popup>
							<q-item-section avatar>{{ i + 1 }}</q-item-section>
							<q-item-section>
								{{ getVersatile(action, i) }}
							</q-item-section>
						</q-item>
					</hk-roll>
				</q-list>
			</div>
		</q-popup-proxy>
	</span>
	<hk-roll v-else :tooltip="tooltip" @roll="roll($event, action)" :disabled="disabled">
		<slot />
	</hk-roll>
</template>

<script>
import { dice } from "src/mixins/dice.js";
import { mapActions } from "vuex";

export default {
	name: "hk-roll-action",
	mixins: [dice],
	props: {
		action: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			default: "monster_action",
		},
		attackBonus: {
			type: Number,
		},
		castLevel: {
			type: Number,
		},
		casterLevel: {
			type: Number,
		},
		tooltip: {
			type: String,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		...mapActions(["setActionRoll"]),
		getVersatile(action, i) {
			return action[`versatile_${i ? "two" : "one"}`] || `Option ${i + 1}`;
		},
		roll(e, action, option) {
			const config = {
				type: this.type,
				option,
			};

			if (this.type === "spell") {
				config.attack_bonus = this.attackBonus;
				config.cast_level = this.castLevel;
				config.caster_level = this.casterLevel;

				action.action_list = action.actions;
			}
			const projectiles = this.projectileScaling(config);

			// In Vue 3, event listeners are in $attrs with "on" prefix (e.g., onRoll)
			if (this.$attrs.onRoll) {
				this.$emit("roll", e, projectiles, option);
			} else {
				[...Array(projectiles).keys()].forEach(() => {
					this.setActionRoll(this.rollAction(e, action, config));
				});
			}
		},
		projectileScaling(config) {
			let projectiles = this.action.projectiles || 1;
			const tiers = this.action.projectile_scaling;

			if (tiers && tiers.length) {
				// SPELL SCALE
				if (this.action.scaling === "spell_scale") {
					const scale = tiers[0].level;

					// Calculate the increase based on spell level, on what level the spell is cast and the scale
					const increase = parseInt(Math.floor((config.cast_level - this.action.level) / scale));

					// If there is an increase,
					if (increase) {
						projectiles += increase * tiers[0].projectile_count;
					}
				}
				// CHARACTER LEVEL
				else if (this.action.scaling === "character_level") {
					tiers.sort((a, b) => (parseInt(a.level) > parseInt(b.level) ? 1 : -1));

					for (let tier of tiers) {
						if (parseInt(config.caster_level) >= parseInt(tier.level)) {
							projectiles = tier.projectile_count;
						}
					}
				}
			}
			return projectiles;
		},
	},
};
</script>

<style lang="scss" scoped>
.q-item {
	user-select: none;
}
.advantage .q-item__section {
	color: $green;
}
.disadvantage .q-item__section {
	color: $red;
}
</style>
