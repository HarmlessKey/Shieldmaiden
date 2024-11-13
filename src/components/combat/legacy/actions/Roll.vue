<!-- eslint-disable vue/no-parsing-error -->
<template>
	<div v-if="current" tabindex="-1">
		<h3 v-if="targeted.length === 0" class="red text-center">Select one or more targets</h3>
		<template v-else-if="current.entityType !== 'player'">
			<template v-if="['npc', 'environment'].includes(current.entityType)">
				<!-- ACTIONS -->
				<q-tabs
					v-model="tab"
					:dark="$store.getters.theme === 'dark'"
					inline-label
					outside-arrows
					mobile-arrows
					dense
					no-caps
				>
					<template v-for="({ name, label, type }, index) in action_types">
						<q-tab
							v-if="current[type] && current[type].length"
							:key="`tab-${index}`"
							:name="name"
							:label="label"
						/>
					</template>
				</q-tabs>

				<q-tab-panels v-model="tab" class="bg-transparent">
					<q-tab-panel
						:name="name"
						v-for="({ name, type }, type_index) in action_types"
						:key="`panel-${type_index}`"
					>
						<div v-if="type === 'legendary_actions' && current.legendary_count" class="limited">
							Actions used
							<div class="slots">
								<span
									v-for="i in current.legendary_count"
									:key="`legendary-${i}`"
									class="mr-1"
									@click="
										current.limited_uses['legendary_actions'] &&
										current.limited_uses['legendary_actions'].legendaries_used >= i
											? spendLimited('legendary_actions', 'legendaries_used', true)
											: spendLimited('legendary_actions', 'legendaries_used')
									"
								>
									<i
										aria-hidden="true"
										class="far"
										:class="
											current.limited_uses['legendary_actions'] &&
											current.limited_uses['legendary_actions'].legendaries_used >= i
												? 'fa-dot-circle'
												: 'fa-circle'
										"
									/>
									<q-tooltip anchor="top middle" self="center middle">
										{{
											current.limited_uses["legendary_actions"] &&
											current.limited_uses["legendary_actions"].legendaries_used >= i
												? "Regain action"
												: "Spend action"
										}}
									</q-tooltip>
								</span>
							</div>
						</div>

						<RollActions :actor="current" :type="type" />
					</q-tab-panel>
				</q-tab-panels>
			</template>
		</template>
		<p v-else>
			Most players want to roll their own attacks, you probably shouldn't take that away from them.
			;)
		</p>

		<q-dialog v-model="projectile_dialog">
			<Projectiles :projectile-count="rollObject.projectiles" @cancel="cancelRoll" @roll="roll" />
		</q-dialog>
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { setHP } from "src/mixins/HpManipulations.js";
import { damage_type_icons } from "src/utils/generalConstants";
import { runEncounter } from "src/mixins/runEncounter.js";
import Projectiles from "../../actions/Projectiles";
import { isNil } from "lodash";
import RollActions from "../../actions/RollActions.vue";

export default {
	name: "Roll",
	mixins: [setHP, runEncounter],
	components: {
		Projectiles,
		RollActions,
	},
	props: ["current"],
	data() {
		return {
			damage_type_icons: damage_type_icons,
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			tabSetter: undefined,
			action_types: [
				{ label: "Special", name: "special", type: "special_abilities" },
				{ label: "Actions", name: "actions", type: "actions" },
				{ label: "Legendary", name: "legendary", type: "legendary_actions" },
				{ label: "Reactions", name: "reactions", type: "reactions" },
			],
			rollObject: {},
			projectile_dialog: false,
			isNil: isNil,
		};
	},
	computed: {
		...mapGetters(["encounter", "targeted", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		tab: {
			get() {
				let tab = "actions";
				if (!this.current.actions) {
					tab = "special";
					if (!this.current.special_abilities) {
						tab = "legendary";
						if (!this.current.legendary_actions) {
							tab = "reactions";
						}
					}
				}
				return this.tabSetter ? this.tabSetter : tab;
			},
			set(newVal) {
				this.tabSetter = newVal;
			},
		},
	},
	methods: {
		...mapActions(["setActionRoll", "set_limitedUses"]),
		...mapActions("campaigns", ["set_share"]),
		...mapActions("tutorial", ["completeStep"]),
		focusButton(i) {
			const button = this.$refs[i]?.[0]?.$el;
			button?.focus();
		},
		startRoll(e, projectiles, option, action_index, action, category) {
			if (this.targeted && this.targeted.length) {
				this.rollObject = {
					e,
					projectiles,
					option,
					action_index,
					action,
					category,
				};
				if (projectiles && projectiles > 1) {
					this.projectile_dialog = true;
				} else {
					this.roll();
				}
			}
		},
		roll(assigned_projectiles) {
			this.roll_action({
				e: this.rollObject.e,
				action_index: this.rollObject.action_index,
				action: this.rollObject.action,
				category: this.rollObject.category,
				entity: this.current,
				targets: assigned_projectiles || this.targeted,
				option: this.rollObject.option,
			});
			this.cancelRoll();

			if (this.get_step("run", "roll", "monster")) {
				this.completeStep({ tutorial: "run" });
			}
		},
		cancelRoll() {
			this.projectile_dialog = false;
			this.rollObject = {};
		},
		spendLimited(category, index, regain = false, cost = 1) {
			this.set_limitedUses({ key: this.current.key, index, category, regain, cost });
		},
		checkAvailable(category, index, action) {
			// If there are not limits to the use, the ability is always available
			if (!action.limit && !action.recharge && !action.legendary_cost) return true;

			// Otherwise, check if the ability is available and can be used
			if (action.legendary_cost) {
				return (
					!this.current.limited_uses[category] ||
					!this.current.limited_uses[category].legendaries_used ||
					action.legendary_cost <=
						this.current.legendary_count -
							this.current.limited_uses["legendary_actions"].legendaries_used
				);
			}
			if (action.limit) {
				return (
					!this.current.limited_uses[category] ||
					this.current.limited_uses[category][index] < action.limit
				);
			}
			if (action.recharge) {
				return !this.current.limited_uses[category] || !this.current.limited_uses[category][index];
			}
		},
		getVersatile(ability, i) {
			return ability[`versatile_${i ? "two" : "one"}`] || `Option ${i + 1}`;
		},
	},
};
</script>

<style lang="scss" scoped>
h3 {
	font-size: 15px;
	line-height: 25px;
	margin-bottom: 5px;
}
.q-tab-panel {
	padding: 15px 0;
}
.limited {
	font-size: 15px;
	margin-bottom: 5px;
	display: flex;
	justify-content: space-between;

	.slots {
		span {
			cursor: pointer;
			&:hover {
				color: $blue;
			}
		}
	}
}
.is-disabled {
	opacity: 0.3;
}
.roll-wrapper {
	border-radius: 50%;
	padding: 5px;
	margin: -10px;

	&::v-deep {
		.hk-roll {
			padding: 10px;
			margin: -10px;
			border-radius: 50%;

			&:focus {
				background: $neutral-5;
			}
		}
	}
}
.roll-button {
	display: inline-block;
	cursor: pointer;
	background-image: url("../../../../assets/_img/logo/logo-icon-no-shield-cyan.svg");
	height: 20px;
	width: 20px;
	background-position: center;
	background-size: cover;
	vertical-align: -5px;
	user-select: none;
}
.advantage .roll-button:hover,
.advantage.hk-roll:focus .roll-button {
	background-image: url("../../../../assets/_img/logo/logo-icon-no-shield-green.svg");
}
.disadvantage .roll-button:hover,
.disadvantage.hk-roll:focus .roll-button {
	background-image: url("../../../../assets/_img/logo/logo-icon-no-shield-red.svg");
}
</style>
