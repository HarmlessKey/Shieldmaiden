<template>
	<div class="encounter-progress">
		<button
			class="btn btn-sm btn-clear"
			v-shortkey="['shift', 'arrowleft']"
			@click="prevTurn()"
			@shortkey="prevTurn()"
		>
			<i aria-hidden="true" class="fas fa-step-backward" />
			<!-- <q-tooltip anchor="top middle" self="center middle">Previous turn [shift] + [←]</q-tooltip> -->
		</button>
		<div class="progress">
			<div class="round">
				{{ encounter.round }}
				<q-tooltip anchor="bottom middle" self="center middle">Round</q-tooltip>
			</div>
			<q-circular-progress
				show-value
				:value="((encounter.turn + 1) / activeEntities) * 100"
				size="100px"
				color="neutral-4"
				track-color="neutral-8"
			>
				<div class="turn truncate">
					<hk-animated-integer :value="encounter.turn + 1" />
				</div>
			</q-circular-progress>
			<hk-timer class="timer" :value="timer || 0" :key="encounter.turn" />
		</div>
		<button
			class="btn btn-sm btn-clear"
			:class="{
				'step-highlight': demo && follow_tutorial && get_step('run', 'next'),
			}"
			v-shortkey="['shift', 'arrowright']"
			@click="nextTurn()"
			@shortkey="nextTurn()"
		>
			<TutorialPopover
				v-if="demo"
				tutorial="run"
				step="next"
				position="right"
				:no_button="true"
				:offset="[10, 0]"
			/>
			<i aria-hidden="true" class="fas fa-step-forward" />
			<!-- <q-tooltip anchor="top middle" self="center middle">Next turn [shift] + [→]</q-tooltip> -->
			<TutorialPopover v-if="demo" tutorial="initiative" step="next" :offset="[0, 10]" />
		</button>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { remindersMixin } from "src/mixins/reminders";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";

export default {
	name: "EncounterProgress",
	components: {
		TutorialPopover,
	},
	mixins: [remindersMixin],
	props: {
		activeEntities: {
			type: Number,
			required: true,
		},
		current: {
			type: Object,
		},
		next: {
			type: Object,
		},
		timer: {
			type: Number,
		},
	},
	data() {
		return {};
	},
	computed: {
		...mapGetters(["encounter"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
	},
	methods: {
		...mapActions(["set_turn", "set_targeted", "update_round", "demo"]),
		...mapActions("tutorial", ["setGameState"]),
		nextTurn() {
			let turn = this.encounter.turn + 1;
			let round = this.encounter.round;

			if (turn >= this.activeEntities) {
				turn = 0;
				round++;
				this.update_round();
			}
			this.set_turn({ turn, round });
			this.set_targeted({ type: "untarget", key: "all" });
			this.checkReminders(this.current, "endTurn");
		},
		prevTurn() {
			let turn = this.encounter.turn - 1;
			let round = this.encounter.round;

			if (turn < 0) {
				turn = this.activeEntities - 1;
				round--;
			}
			if (round === 0) {
				turn = 0;
			}
			this.set_turn({ turn, round });
			this.set_targeted({ type: "untarget", key: "all" });
		},
	},
	watch: {
		current: {
			handler(newVal) {
				const entity_type = newVal?.entityType === "player" ? "player" : "monster";
				this.setGameState({ game_state_key: "current_entity_type", value: entity_type });
			},
			immediate: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.encounter-progress {
	display: flex;
	align-items: center;
	gap: 5px;

	.progress {
		position: relative;
		background-color: $neutral-6;
		border-radius: 50%;
		border: solid 5px $neutral-9;

		.q-circular-progress {
			margin: -1px;
		}
		.round,
		.timer {
			position: absolute;
			background-color: $neutral-7;
			transform: translateX(-50%);
			left: 50%;
			z-index: 10;
			box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
			cursor: default;
		}
		.round {
			top: -8px;
			border-radius: 9999px;
			height: 25px;
			min-width: 25px;
			line-height: 25px;
			text-align: center;
		}
		.timer {
			bottom: -2px;
			font-size: 12px;
			border-radius: $border-radius-small;
			padding: 1px 5px;
		}
		.turn {
			font-weight: bold;
			font-size: 30px;
			padding: 0 8px;
		}
	}
}
</style>
