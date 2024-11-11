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
			</div>
		</div>
		<div class="top__actor">
			<Actor :actor="active_actor" :_active="_active" :out-of-turn="out_of_turn" />
		</div>
		<div class="top__bottom">
			<strong>{{ active_actor.name?.capitalizeEach() }}</strong>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Menu from "./Menu.vue";
import Actor from "../actor";
import EncounterProgress from "./EncounterProgress.vue";

export default {
	name: "CombatTop",
	components: {
		Menu,
		Actor,
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
	mixins: [],
	data() {
		return {
			campid: this.$route.params.campid,
			encid: this.$route.params.encid,
		};
	},
	computed: {
		...mapGetters(["encounter", "actor", "broadcast", "test", "demo"]),
		active_actor() {
			return this.actor || this.current;
		},
		out_of_turn() {
			return this.actor && this.actor.key !== this.current.key;
		},
		timer() {
			return this.settings ? this.settings.timer : 0;
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
	},
	watch: {},
};
</script>

<style lang="scss" scoped>
.top {
	grid-area: top;
	display: flex;
	flex-direction: column;
	gap: 5px;

	&__encounter {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: -5px 0;
		gap: 5px;

		&-title {
			font-size: 18px;
			width: 165px;
			font-weight: bold;
			display: flex;
			align-items: center;
			gap: 5px;

			span {
				min-width: 0;
			}
		}
		&-end {
			width: 165px;
			display: flex;
			justify-content: flex-end;
		}
	}
	&__actor,
	&__bottom {
		background-color: $neutral-6-transparent;
		border-radius: $border-radius-small;
		padding: 10px;
	}
	&__actor {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 20px;

		.actor {
			flex-grow: 1;
		}
	}
}
</style>
