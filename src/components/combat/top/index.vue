<template>
	<div class="top">
		<div class="top__encounter">
			<div class="top__encounter-title">
				<Menu />
				<span class="truncate"> {{ encounter.name }}</span>
			</div>
			<div class="top__encounter-status">
				<EncounterProgress
					:active-entities="_active.length"
					:current="current"
					:next="next"
					:timer="timer"
				/>
			</div>
			<div class="top__encounter-end">
				<transition
					v-if="demo"
					name="slide"
					enter-active-class="animated animate__slideInRight"
					leave-active-class="animated animate__slideOutRight"
				>
					<button
						v-show="!follow_tutorial"
						class="btn btn-sm bg-yellow-light black"
						@click="
							setDrawer({
								show: true,
								type: 'drawers/Tutorial',
								data: { tutorial: encounter.round > 0 ? 'run' : 'initiative' },
							})
						"
					>
						<hk-icon icon="fas fa-exclamation" />
					</button>
				</transition>
				<button
					v-if="test"
					class="btn btn-sm bg-orange"
					@click="
						setDrawer({
							show: true,
							type: 'drawers/encounter/TestMode',
						})
					"
				>
					<i class="fas fa-flask mr-1" aria-hidden="true" />
					Test mode
				</button>
				<span
					v-if="!demo && !test"
					@click="
						setDrawer({
							show: true,
							type: 'drawers/Broadcast',
							data: {
								campaign_id: campid,
								encounter_id: encid,
							},
						})
					"
					class="live"
					:class="{ active: broadcast.live === campid }"
				>
					{{ broadcast.live === campid ? "" : "go" }} live
				</span>
				<button
					class="btn btn-sm bg-neutral-5 ml-2 toggle-side"
					@click="
						setDrawer({
							show: true,
							type: 'combat/side/Side',
							data: {
								log: true,
								drawer: true,
							},
						})
					"
				>
					<hk-icon icon="fas fa-bars" />
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Menu from "./Menu.vue";
import EncounterProgress from "./EncounterProgress.vue";
import { remindersMixin } from "src/mixins/reminders";
import { dice } from "src/mixins/dice";

export default {
	name: "CombatTop",
	components: {
		Menu,
		EncounterProgress,
	},
	props: {
		_active: {
			type: Array,
			required: true,
		},
		current: {
			type: Object,
		},
		next: {
			type: Object,
		},
		settings: {
			type: Object,
		},
	},
	mixins: [remindersMixin, dice],
	data() {
		return {
			campid: this.$route.params.campid,
			encid: this.$route.params.encid,
		};
	},
	computed: {
		...mapGetters(["encounter", "actor", "broadcast", "turn", "test", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial"]),
		timer() {
			return this.settings ? this.settings.timer : 0;
		},
	},
	methods: {
		...mapActions(["setDrawer", "remove_limitedUses"]),
	},
	watch: {
		//Watch turn to trigger reminders when an entity starts their turn
		turn(newVal, oldVal) {
			this.checkReminders(this.current, "startTurn");

			//Check if the turn went up or down	considering round changes
			//Fails with only 2 entities !!
			if (
				(newVal > oldVal && oldVal != 0) ||
				(newVal > oldVal && oldVal === 0 && newVal === 1) ||
				(newVal === 0 && oldVal > newVal && oldVal !== 1)
			) {
				this.timedReminders(this.current, "up");
			} else {
				//Update next in initiative order
				this.timedReminders(this.next, "down");
			}

			// Check limited uses
			if (this.current.limited_uses && Object.keys(this.current.limited_uses).length > 0) {
				// Check all actions for limited uses that can be regained at the start of the turn
				const categories = ["special_abilities", "actions", "legendary_actions", "reactions"];

				for (const category of categories) {
					if (this.current[category] && this.current.limited_uses[category]) {
						this.current[category].forEach((ability, index) => {
							// Remove abilities from limited uses
							if ((ability.limit && ability.limit_type === "turn") || ability.recharge) {
								let remove = true;
								// For recharge, roll to see if the ability is regained
								console.log(
									"ability",
									ability,
									ability.recharge,
									this.current,
									this.current.limited_uses,
									category,
									index
								);
								if (
									ability.recharge &&
									ability.recharge !== "rest" &&
									this.current.limited_uses[category][index]
								) {
									let values = ability.recharge.split("-");
									const dice_type = values.length > 1 ? values[1] : values[0];

									const roll = this.rollD({}, dice_type, 1, 0, `Recharge ${ability.name}`).total;
									if (roll < values[0]) {
										remove = false;
									} // Don't remove if the roll was too low

									const title = remove
										? `Recharged ${ability.name}`
										: `Recharge failed ${ability.name}`;
									const message = `${roll} Was rolled for a recharge of ${ability.recharge}.`;

									//Notify about the recharge
									this.$snotify.warning(message, title, {
										timeout: 0,
									});
								}
								if (remove) this.remove_limitedUses({ key: this.current.key, category, index });
							}
						});
						// Remove legendaries_used
						if (category === "legendary_actions") {
							this.remove_limitedUses({
								key: this.current.key,
								category,
								index: "legendaries_used",
							});
						}
					}
				}
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.top {
	grid-area: top;

	&__encounter {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 5px;

		&-title {
			font-size: 18px;
			width: 165px;
			font-weight: bold;
			display: flex;
			align-items: center;
			gap: 5px;
			color: $neutral-2;

			span {
				min-width: 0;
			}
		}
		&-status {
			.set-initiative {
				font-weight: bold;
				font-size: 18px;
			}
		}
		&-end {
			width: 165px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
		}
	}
	.toggle-side {
		display: none;
	}
}
@media only screen and (max-width: $xl-breakpoint) {
	.top {
		&__encounter-status {
			max-width: 400px;
		}
		.toggle-side {
			display: inline-block;
		}
	}
}
@media only screen and (max-width: $lg-breakpoint) {
	.top__encounter-status {
		max-width: 300px;
	}
}
</style>
