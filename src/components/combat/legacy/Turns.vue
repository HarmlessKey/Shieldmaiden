<template>
	<div id="turns" class="d-flex justify-content-between">
		<div>
			<Menu />

			<span class="ml-2 d-none d-md-inline truncate">
				<template v-if="!demo">
					{{ encounter.name }}
				</template>
				<template v-else>
					<router-link v-if="!userId" to="/sign-up" class="btn bg-accent"
						>Create Account</router-link
					>
					<router-link v-else to="/content" class="btn">Create custom content</router-link>
				</template>
			</span>
		</div>

		<!-- TURNS & ROUNDS -->
		<div class="round-info d-flex justify-content-center" v-if="encounter.round > 0">
			<a
				class="handler neutral-2 mr-2 px-2"
				v-shortkey="['shift', 'arrowleft']"
				@click="prevTurn()"
				@shortkey="prevTurn()"
			>
				<i aria-hidden="true" class="fas fa-step-backward" />
				<q-tooltip anchor="top middle" self="center middle">Previous turn [shift] + [←]</q-tooltip>
			</a>

			<template v-if="encounter.round">
				<div class="mr-3">
					<div class="header">Round</div>
					<div class="number">{{ encounter.round }}</div>
				</div>
				<div>
					<div class="header">Turn</div>
					<div class="number">
						{{ encounter.turn + 1
						}}<span class="neutral-3"><span class="neutral-4">/</span>{{ active_len }}</span>
					</div>
				</div>
			</template>

			<a
				class="handler neutral-2 ml-2 px-2"
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
				<q-tooltip anchor="top middle" self="center middle">Next turn [shift] + [→]</q-tooltip>
				<TutorialPopover v-if="demo" tutorial="initiative" step="next" :offset="[0, 10]" />
			</a>
		</div>
		<div v-else>Set Initiative</div>

		<div class="d-flex justify-content-end center">
			<span v-if="encounter.round > 0" class="timer">
				<hk-timer :value="timer || 0" :key="encounter.turn" />
				<i aria-hidden="true" class="fas fa-stopwatch" />
			</span>

			<!-- BROADCASTING -->
			<span
				v-if="!demo && !test"
				@click="
					setDrawer({
						show: true,
						type: 'drawers/Broadcast',
						data: {
							campaign_id: $route.params.campid,
							encounter_id: $route.params.encid,
						},
					})
				"
				class="live"
				:class="{ active: broadcast.live === $route.params.campid }"
			>
				{{ broadcast.live === $route.params.campid ? "" : "go" }} live
			</span>
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
			<transition
				v-if="demo"
				name="slide"
				enter-active-class="animated animate__slideInRight"
				leave-active-class="animated animate__slideOutRight"
			>
				<button
					v-show="!follow_tutorial"
					class="btn bg-yellow-light black"
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

			<template v-if="encounter.round > 0">
				<div
					v-if="requests && Object.keys(requests).length"
					class="requests d-none d-md-block"
					@click="setDrawer({ show: true, type: 'combat/side/Requests' })"
				>
					<i aria-hidden="true" class="fas fa-bell" />
					<div class="notifications bg-red white animated zoomIn">
						<div>{{ Object.keys(requests).length }}</div>
					</div>
				</div>

				<div
					class="info ml-2"
					@click="
						setDrawer({
							show: true,
							type: 'combat/side/Side',
						})
					"
				>
					<i aria-hidden="true" class="fas fa-bars" />
				</div>
			</template>

			<template v-else>
				<span class="d-none d-md-block">
					<router-link v-if="!demo" :to="leaveRoute" class="btn bg-neutral-8 ml-2">
						<i aria-hidden="true" class="fas fa-arrow-left" />
						Leave
					</router-link>
				</span>
				<button
					class="btn ml-2"
					:class="{ 'step-highlight': demo && follow_tutorial && get_step('initiative', 'start') }"
					v-shortkey="['shift', 'arrowright']"
					@click="startEncounter()"
					@shortkey="startEncounter()"
				>
					Start
					<span class="ml-1 d-none d-md-inline">
						encounter <i aria-hidden="true" class="fas fa-arrow-right" />
					</span>
					<q-tooltip anchor="top middle" self="center middle">Start [shift] + [->]</q-tooltip>

					<TutorialPopover v-if="demo" tutorial="initiative" step="start" :offset="[0, 10]" />
				</button>
			</template>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { remindersMixin } from "src/mixins/reminders";
import Menu from "../top/Menu.vue";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";

export default {
	name: "Turns",
	components: {
		Menu,
		TutorialPopover,
	},
	mixins: [remindersMixin],
	props: ["active_len", "current", "next", "settings"],
	data() {
		return {
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
		};
	},
	computed: {
		...mapGetters(["encounter", "broadcast", "requests", "test", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		timer() {
			return this.settings ? this.settings.timer : 0;
		},
		leaveRoute() {
			if (this.demo) {
				return "/demo";
			}
			if (this.test) {
				return `/content/campaigns/${this.$route.params.campid}/${this.$route.params.encid}`;
			}
			return `/content/campaigns/${this.$route.params.campid}`;
		},
		tutorial_branch() {
			return this.current.entityType === "player" ? "player" : "monster";
		},
	},
	methods: {
		...mapActions(["set_turn", "update_round", "set_targeted", "setDrawer"]),
		...mapActions("tutorial", ["setGameState"]),

		startEncounter() {
			this.set_turn({ turn: 0, round: 1 });
			this.checkReminders(this.next, "startTurn");
		},
		nextTurn() {
			let turn = this.encounter.turn + 1;
			let round = this.encounter.round;

			if (turn >= this.active_len) {
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
				turn = this.active_len - 1;
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
#turns {
	user-select: none;
	height: 60px;
	padding: 10px;
	line-height: 40px;
	background: $neutral-8-transparent;
	font-size: 20px;
	grid-area: turns;
	align-items: center;
	position: relative;

	.center {
		align-items: center;
	}
	.live {
		cursor: pointer;
	}
	.test {
		font-size: 15px;
		padding: 0 5px;
		line-height: 28px;
		background-color: $orange;
		border-radius: $border-radius;
	}
	.edit {
		font-size: 28px;

		i {
			vertical-align: -2px;
		}
	}
	.timer {
		margin-right: 20px;
	}

	.handler {
		font-size: 25px;
		line-height: 40px;
		border-radius: $border-radius;

		&:hover {
			color: $blue !important;
		}
	}
	.round-info {
		line-height: 12px;
		font-size: 11px;
		text-align: center;

		.number {
			font-weight: bold;
			font-size: 30px;
			line-height: 30px;
		}
	}
	.requests,
	.info {
		padding-top: 3px;
		width: 26px;
		margin: 0 15px;
		position: relative;
		cursor: pointer;

		.notifications {
			user-select: none;
			position: absolute;
			top: -1px;
			right: -3px;
			height: 20px;
			width: 20px;
			border-radius: 50%;

			div {
				position: absolute;
				width: inherit;
				height: inherit;
				line-height: 20px;
				text-align: center;
				font-size: 13px;
			}
		}
	}
	.info {
		margin: 0;
		padding: 0;
		display: none;
		font-size: 28px;
		color: $neutral-3;

		.q-icon {
			vertical-align: -4px;
		}
	}
}

@media only screen and (max-width: 1000px) {
	#turns {
		.live {
			display: none;
		}
		.info {
			display: block;
		}
	}
}

@media only screen and (max-width: 576px) {
	#turns {
		.edit {
			color: $neutral-3;
		}
		.round-info {
			.header {
				margin-top: 17px;
			}

			.number {
				font-weight: bold;
				font-size: 18px !important;
				line-height: 18px !important;
			}
		}
		.timer {
			display: flex;
			flex-direction: row-reverse;
			margin-right: 0;
			font-size: 15px;
			position: absolute;
			line-height: 20px;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			border-bottom: solid 1px $neutral-4;
			padding: 0 10px;

			i {
				margin-right: 5px;
				line-height: 20px;
				font-size: 12px;
			}
		}
	}
}
</style>
