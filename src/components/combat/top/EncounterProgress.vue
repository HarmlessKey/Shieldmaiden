<template>
	<div class="encounter-progress">
		<div class="encounter-progress__round">
			<div>Round</div>
			<div class="round">
				<hk-animated-integer :value="encounter.round" />
			</div>
		</div>
		<q-linear-progress
			:value="(encounter.turn + 1) / activeEntities"
			size="32px"
			color="neutral-6"
			track-color="neutral-5"
			rounded
		>
			<template v-if="encounter.round > 0">
				<div class="turn">
					<template v-if="encounter.round > 1 && encounter.turn === 0"> Top of the Round </template>
					<hk-animated-integer v-else :value="encounter.turn + 1" />
				</div>
				<hk-timer class="timer" :value="timer || 0" :key="encounter.turn" />
			</template>
			<div v-else class="turn set-initiative">Set initiative</div>
		</q-linear-progress>
		<template v-if="encounter.round > 0">
			<button
				class="btn btn-sm bg-neutral-6"
				v-shortkey="['shift', 'arrowleft']"
				@click="prevTurn()"
				@shortkey="prevTurn()"
			>
				<i aria-hidden="true" class="fas fa-step-backward" />
				<q-tooltip anchor="top middle" self="center middle"
					>Previous turn <hk-show-keybind :binds="['shift', '←']"
				/></q-tooltip>
			</button>
			<button
				class="btn btn-sm bg-neutral-6"
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
					:no_button="true"
					:offset="[0, 10]"
				/>
				<i aria-hidden="true" class="fas fa-step-forward" />
				<q-tooltip anchor="top middle" self="center middle"
					>Next turn <hk-show-keybind :binds="['shift', '→']"
				/></q-tooltip>
				<TutorialPopover v-if="demo" tutorial="initiative" step="next" :offset="[0, 10]" />
			</button>
		</template>
		<button
			v-else
			class="btn btn-sm"
			:class="{ 'step-highlight': demo && follow_tutorial && get_step('initiative', 'start') }"
			v-shortkey="['shift', 'arrowright']"
			@click="startEncounter()"
			@shortkey="startEncounter()"
		>
			Start
			<span class="ml-1 d-none d-xl-inline">
				encounter <i aria-hidden="true" class="fas fa-arrow-right ml-1" />
			</span>
			<q-tooltip anchor="top middle" self="center middle"
				>Start <hk-show-keybind :binds="['shift', '→']"
			/></q-tooltip>

			<TutorialPopover v-if="demo" tutorial="initiative" step="start" :offset="[0, 10]" />
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
	computed: {
		...mapGetters(["encounter"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
	},
	methods: {
		...mapActions([
			"set_turn",
			"set_targeted",
			"update_round",
			"set_actor",
			"demo",
			"setManual",
			"setMultipliers",
		]),
		...mapActions("tutorial", ["setGameState"]),
		startEncounter() {
			this.set_turn({ turn: 0, round: 1 });
			this.checkReminders(this.next, "startTurn");
		},
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
			this.set_actor(null);
			this.checkReminders(this.current, "endTurn");
			this.setManual({ key: "clear" });
			this.setMultipliers({ type: "clear" });
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
			this.set_actor(null);
			this.setManual({ key: "clear" });
			this.setMultipliers({ type: "clear" });
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

	&__round {
		display: flex;
		align-items: center;
		z-index: 10;

		div {
			background-color: $neutral-6;
			border-radius: $border-radius;
			line-height: 32px;
			height: 32px;
			padding: 0 20px 0 10px;

			&.round {
				border-radius: 50%;
				height: 46px;
				line-height: 36px;
				min-width: 46px;
				text-align: center;
				padding: 0;
				margin: -2px -20px -2px -10px;
				font-size: 18px;
				border: solid 5px $neutral-10;
				font-weight: bold;
			}
		}
	}

	.q-linear-progress {
		width: 400px;

		.timer {
			position: absolute;
			color: $neutral-1;
			right: 10px;
			display: flex;
			align-items: center;
			font-size: 15px;
			height: 100%;
		}
		.turn {
			position: absolute;
			color: $neutral-1;
			left: 25px;
			display: flex;
			align-items: center;
			font-weight: bold;
			font-size: 15px;
			height: 100%;
		}
	}
}
</style>
