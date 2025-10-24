<template>
	<div class="card-actions">
		<div v-for="{ category, name } in actions" :key="category">
			<template v-if="entity[category] && entity[category].length > 0">
				<h3 v-if="category !== 'special_abilities'" class="label d-flex justify-content-between">
					{{ name }}
					<LimitedUseCounter
						v-if="category === 'legendary_actions' && entity.legendary_count"
						:entity="entity"
						:limited_type="category"
						:limited_max="entity.legendary_count"
					/>
				</h3>
				<p v-if="entity.legendary_count && category === 'legendary_actions'">
					{{ entity.name.capitalizeEach() }} can take {{ entity.legendary_count }} legendary
					actions, choosing from the options below. Only one legendary action option can be used at
					a time and only at the end of another creature's turn. {{ entity.name }} regains spent
					legendary actions at the start of their turn.
				</p>

				<!-- Action title -->
				<div
					v-for="(action, action_index) in entity[category]"
					:key="`${category}-${action_index}`"
					class="card-action"
				>
					<div class="card-action-title">
						<template
							v-if="
								action.action_list &&
								action.action_list[0] &&
								action.action_list[0].type !== 'other' &&
								action.action_list[0].rolls &&
								action.action_list[0].rolls.length
							"
						>
							<hk-roll-action
								:action="action"
								:tooltip="`Roll ${action.name}`"
								@roll="startRoll(...arguments, action_index, action, category)"
								:disabled="!checkAvailable(category, action_index, action)"
							>
								<span class="roll-button" />
							</hk-roll-action>
						</template>
						<div class="card-action-title__name">
							<strong
								><em>
									{{ action.name }}
									{{
										action.recharge
											? `(Recharge ${
													action.recharge === "rest"
														? "after a Short or Long Rest"
														: action.recharge
												})`
											: ``
									}}
									{{
										action.limit
											? `(${action.limit}/${
													action.limit_type ? action.limit_type.capitalize() : `Day`
												})`
											: ``
									}}
									{{ action.legendary_cost > 1 ? `(Costs ${action.legendary_cost} Actions)` : `` }}
								</em></strong
							>

							<template v-if="action.limit || action.recharge || action.legendary_cost">
								<template v-if="action.legendary_cost || action.recharge">
									<div
										v-if="checkAvailable(category, action_index, action)"
										class="btn btn-xs btn-clear"
										@click.stop="
											spendLimited(
												category,
												action.legendary_cost ? 'legendaries_used' : action_index,
												false,
												action.legendary_cost ? action.legendary_cost : 1
											)
										"
									>
										Spend
									</div>
									<i aria-hidden="true" v-else class="fas fa-ban neutral-2" />
								</template>
								<LimitedUseCounter
									v-else
									:entity="entity"
									:limited_type="category"
									:limited_index="action_index"
									:limited_max="action.limit"
								/>
							</template>
						</div>
					</div>
					<!-- Roll Summary -->
					<div
						v-if="
							action.action_list && action.action_list[0] && action.action_list[0].type !== 'other'
						"
					>
						<span v-if="action.action_list[0].rolls">
							<span
								v-for="(roll, roll_index) in action.action_list[0].rolls"
								:key="`roll-${action_index}-${roll_index}`"
							>
								(<i
									aria-hidden="true"
									:class="[
										action.action_list[0].type === 'healing'
											? 'fas fa-heart green'
											: damage_type_icons[roll.damage_type],
										roll.damage_type,
									]"
								/>
								{{ roll.dice_count || "" }}{{ roll.dice_type ? `d${roll.dice_type}` : `` }}
								<template v-if="roll.fixed_val && roll.dice_count">
									{{
										// eslint-disable-next-line vue/no-parsing-error
										roll.fixed_val < 0 ? `- ${Math.abs(roll.fixed_val)}` : `+ ${roll.fixed_val}`
									}})
								</template>
								<template v-else>{{ roll.fixed_val }})</template>
								<!-- eslint-disable-next-line vue/no-parsing-error -->
								{{ roll_index + 1 < action.action_list[0].rolls.length ? "+" : "" }}
								<q-tooltip anchor="top middle" self="center middle">
									{{
										action.action_list[0].type === "healing"
											? "Healing"
											: `${roll.damage_type.capitalize()} damage`
									}}
								</q-tooltip>
							</span>
						</span>
						<!-- Reach -->
						<span v-if="action.reach">
							<span class="blue">|</span> {{ action.reach }}<small class="neutral-2">ft.</small>
							<q-tooltip anchor="top middle" self="center middle"> Reach </q-tooltip>
						</span>
						<!-- Range -->
						<span v-if="action.range">
							<span class="blue">|</span> {{ action.range }}<small class="neutral-2">ft.</small>
							<q-tooltip anchor="top middle" self="center middle"> Range </q-tooltip>
						</span>
						<!-- Saving trow -->
						<span v-if="action.action_list[0].type === 'save' && action.action_list[0].save_dc">
							<span class="blue">|</span>
							<span v-if="action.action_list[0].save_ability">
								{{ action.action_list[0].save_ability.substring(0, 3).toUpperCase() }}
							</span>
							{{ action.action_list[0].save_dc }}
						</span>
						<!-- AOE -->
						<span v-if="action.aoe_type">
							<span class="blue">|</span>
							{{ action.aoe_size }}<small class="neutral-2">ft.</small>
							{{ action.aoe_type.capitalize() }}
							<q-tooltip anchor="top middle" self="center middle"> Area of effect </q-tooltip>
						</span>
					</div>
					<hk-dice-text v-if="action.desc" :input_text="action.desc" />
				</div>
			</template>
		</div>
		<q-dialog v-model="projectile_dialog">
			<Projectiles :projectile-count="rollObject.projectiles" @cancel="cancelRoll" @roll="roll" />
		</q-dialog>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { damage_type_icons } from "src/utils/generalConstants";
import { runEncounter } from "src/mixins/runEncounter.js";
import LimitedUseCounter from "../../actions/LimitedUseCounter.vue";

export default {
	name: "CardActions",
	mixins: [runEncounter],
	components: {
		LimitedUseCounter,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			actions: [
				{
					category: "special_abilities",
					name: "Special Abilities",
					name_single: "Special ability",
				},
				{ category: "actions", name: "Actions", name_single: "Action" },
				{
					category: "legendary_actions",
					name: "Legendary Actions",
					name_single: "Legendary action",
				},
				{ category: "reactions", name: "Reactions", name_single: "Reaction" },
			],
			rollObject: {},
			projectile_dialog: false,
			damage_type_icons: damage_type_icons,
		};
	},
	computed: {
		...mapGetters(["targeted"]),
	},
	methods: {
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
			} else {
				this.$q.notify({
					message: "Select a target first.",
					color: "warning",
					position: "top",
					timeout: 1000,
				});
			}
		},
		roll(assigned_projectiles) {
			this.roll_action({
				e: this.rollObject.e,
				action_index: this.rollObject.action_index,
				action: this.rollObject.action,
				category: this.rollObject.category,
				entity: this.current_actor,
				targets: assigned_projectiles || this.targeted,
				option: this.rollObject.option,
			});
			this.cancelRoll();
		},
		cancelRoll() {
			this.projectile_dialog = false;
			this.rollObject = {};
		},
		spendLimited(category, index, regain = false, cost = 1) {
			this.set_limitedUses({ key: this.entity.key, index, category, regain, cost });
		},
		checkAvailable(category, index, action) {
			// If there are not limits to the use, the ability is always available
			if (!action.limit && !action.recharge && !action.legendary_cost) return true;

			// Otherwise, check if the ability is available and can be used
			if (action.legendary_cost) {
				return (
					!this.entity.limited_uses[category] ||
					!this.entity.limited_uses[category].legendaries_used ||
					action.legendary_cost <=
						this.entity.legendary_count -
							this.entity.limited_uses["legendary_actions"].legendaries_used
				);
			}
			if (action.limit) {
				return (
					!this.entity.limited_uses[category] ||
					this.entity.limited_uses[category][index] < action.limit
				);
			}
			if (action.recharge) {
				return !this.entity.limited_uses[category] || !this.entity.limited_uses[category][index];
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.card-action {
	margin-bottom: 20px;

	&-title {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin-bottom: 5px;
		width: 100%;

		&__name {
			width: 100%;
			display: flex;
			justify-content: space-between;

			.slots {
				cursor: pointer;
			}
		}

		.roll-button {
			margin-right: 5px;
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
		.advantage .roll-button:hover {
			background-image: url("../../../../assets/_img/logo/logo-icon-no-shield-green.svg");
		}
		.disadvantage .roll-button:hover {
			background-image: url("../../../../assets/_img/logo/logo-icon-no-shield-red.svg");
		}
	}
}
</style>
