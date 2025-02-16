<template>
	<div v-if="actions">
		<q-list :dark="$store.getters.theme === 'dark'" square :class="`accordion`">
			<q-expansion-item
				v-for="(action, action_index) in actions"
				:key="`action-${action_index}`"
				:dark="$store.getters.theme === 'dark'"
				switch-toggle-side
				expand-icon-class="hidden-toggle"
				:group="type"
				:name="type"
				@focus="focusButton(action_index)"
			>
				<template v-slot:header>
					<q-item-section :class="checkAvailable(type, action_index, action) ? '' : 'is-disabled'">
						<q-item-label>
							<strong>{{ action.name }}</strong>
							<span class="neutral-3">
								{{
									action.recharge
										? `(Recharge ${
												action.recharge === "rest" ? "after a Short or Long Rest" : action.recharge
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
							</span>
						</q-item-label>
						<q-item-label v-if="action.action_list?.[0]?.type !== 'other'" caption>
							<!-- Rolls -->
							<span v-if="!isNil(action.action_list?.[0]?.attack_bonus)">
								{{ toHit(action) }} to hit
							</span>
							<span v-if="action.action_list?.[0]?.rolls">
								<span
									v-for="(roll, roll_index) in action.action_list?.[0]?.rolls"
									:key="`roll-${action_index}-${roll_index}`"
								>
									(<i
										aria-hidden="true"
										:class="[
											action.action_list[0]?.type === 'healing'
												? 'fas fa-heart green'
												: damage_type_icons[roll.damage_type],
											roll.damage_type,
										]"
									/>
									{{ roll.dice_count || "" }}{{ roll.dice_type ? `d${roll.dice_type}` : ``
									}}{{ roll.fixed_val && roll.dice_count ? fixed(roll) : roll.fixed_val }})
									{{ showPlus(roll_index, action.action_list?.[0]?.rolls?.length) }}
									<q-tooltip anchor="top middle" self="center middle">
										{{
											action.action_list[0]?.type === "healing"
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
							<span v-if="action.action_list[0]?.type === 'save' && action.action_list[0]?.save_dc">
								<span class="blue">|</span>
								<span v-if="action.action_list[0]?.save_ability">
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
						</q-item-label>
					</q-item-section>
					<q-item-section
						v-if="
							action.action_list?.[0]?.type !== 'other' && action.action_list?.[0]?.rolls?.length
						"
						avatar
					>
						<div
							class="roll-wrapper"
							:class="{
								'step-highlight': demo && follow_tutorial && get_step('run', 'roll'),
							}"
						>
							<TutorialPopover
								v-if="demo && action_index == 0"
								tutorial="run"
								step="roll"
								position="right"
								:offset="[20, 0]"
							/>
							<hk-roll-action
								:ref="action_index"
								:action="action"
								:tooltip="`Roll ${action.name}`"
								@roll="startRoll(...arguments, action_index, action, type)"
								:disabled="!checkAvailable(type, action_index, action)"
							>
								<span class="roll-button" />
							</hk-roll-action>
						</div>
					</q-item-section>
					<!-- Spend limited actions that can't be rolled -->
					<q-item-section
						v-else-if="action.limit || action.recharge || action.legendary_cost"
						avatar
					>
						<template v-if="action.legendary_cost || action.recharge">
							<div
								v-if="checkAvailable(type, action_index, action)"
								class="blue"
								@click.stop="
									spendLimited(
										type,
										action.legendary_cost ? 'legendaries_used' : action_index,
										false,
										action.legendary_cost ? action.legendary_cost : 1
									)
								"
							>
								Use
							</div>
							<i aria-hidden="true" v-else class="fas fa-ban neutral-2" />
						</template>
						<div v-else class="slots">
							<span
								v-for="i in parseInt(action.limit)"
								:key="`legendary-${i}`"
								class="mr-1"
								@click.stop="
									actor.limited_uses[type] && actor.limited_uses[type][action_index] >= i
										? spendLimited(type, action_index, true)
										: spendLimited(type, action_index)
								"
							>
								<i
									aria-hidden="true"
									class="far"
									:class="
										actor.limited_uses[type] && actor.limited_uses[type][action_index] >= i
											? 'fa-dot-circle'
											: 'fa-circle'
									"
								/>
								<q-tooltip anchor="top middle" self="center middle">
									{{
										actor.limited_uses[type] && actor.limited_uses[type][action_index] >= i
											? "Regain"
											: "Spend"
									}}
								</q-tooltip>
							</span>
						</div>
					</q-item-section>
				</template>

				<div class="accordion-body description" v-if="action.desc">
					<hk-dice-text :input_text="action.desc" />
					<div
						class="blue pointer mt-2"
						v-if="!checkAvailable(type, action_index, action) && action.recharge"
						@click="spendLimited(type, action_index, true)"
					>
						Regain use
					</div>
				</div>
			</q-expansion-item>
		</q-list>
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
import { isNil } from "lodash";
import Projectiles from "./Projectiles";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";

export default {
	name: "RollAction",
	mixins: [setHP, runEncounter],
	components: {
		Projectiles,
		TutorialPopover,
	},
	props: {
		actor: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			default: "actions",
		},
		rollsOnly: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			damage_type_icons: damage_type_icons,
			rollObject: {},
			projectile_dialog: false,
			isNil: isNil,
		};
	},
	computed: {
		...mapGetters(["targeted", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		actions() {
			const actions = this.actor[this.type];
			return this.rollsOnly
				? actions.filter(
						(action) =>
							action.action_list?.[0]?.type !== "other" && action.action_list?.[0]?.rolls?.length
					)
				: actions;
		},
	},
	methods: {
		...mapActions(["set_limitedUses"]),
		...mapActions("tutorial", ["completeStep"]),
		focusButton(i) {
			const button = this.$refs[i]?.[0]?.$el;
			button?.focus();
		},
		toHit(action) {
			return action.action_list?.[0].attack_bonus < 0
				? `-${Math.abs(action.action_list[0].attack_bonus)}`
				: `+${action.action_list[0].attack_bonus}`;
		},
		fixed(roll) {
			return roll.fixed_val < 0 ? `- ${Math.abs(roll.fixed_val)}` : `+ ${roll.fixed_val}`;
		},
		showPlus(index, length) {
			return index + 1 < length ? "+" : "";
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
			const action = {
				e: this.rollObject.e,
				action_index: this.rollObject.action_index,
				action: this.rollObject.action,
				category: this.rollObject.category,
				entity: this.actor,
				targets: assigned_projectiles || this.targeted,
				option: this.rollObject.option,
			};
			this.roll_action(action);
			this.$emit("roll", action);
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
			this.set_limitedUses({ key: this.actor.key, index, category, regain, cost });
		},
		checkAvailable(category, index, action) {
			// If there are not limits to the use, the ability is always available
			if (!action.limit && !action.recharge && !action.legendary_cost) return true;

			// Otherwise, check if the ability is available and can be used
			if (action.legendary_cost) {
				return (
					!this.actor.limited_uses[category] ||
					!this.actor.limited_uses[category].legendaries_used ||
					action.legendary_cost <=
						this.actor.legendary_count -
							this.actor.limited_uses["legendary_actions"].legendaries_used
				);
			}
			if (action.limit) {
				return (
					!this.actor.limited_uses[category] ||
					this.actor.limited_uses[category][index] < action.limit
				);
			}
			if (action.recharge) {
				return !this.actor.limited_uses[category] || !this.actor.limited_uses[category][index];
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.roll-button {
	display: inline-block;
	cursor: pointer;
	background-image: url("../../../assets/_img/logo/logo-icon-no-shield-cyan.svg");
	height: 20px;
	width: 20px;
	background-position: center;
	background-size: cover;
	vertical-align: -5px;
	user-select: none;
}
.advantage .roll-button:hover,
.advantage.hk-roll:focus .roll-button {
	background-image: url("../../../assets/_img/logo/logo-icon-no-shield-green.svg");
}
.disadvantage .roll-button:hover,
.disadvantage.hk-roll:focus .roll-button {
	background-image: url("../../../assets/_img/logo/logo-icon-no-shield-red.svg");
}
</style>
