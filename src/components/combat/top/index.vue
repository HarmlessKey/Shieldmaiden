<template>
	<div class="top">
		<div>
			<Menu />
			live
		</div>
		<Actor :actor="active_actor" />
		<div class="encounter-status">
			<EncounterProgress
				:active-entities="activeEntities"
				:current="current"
				:next="next"
				:timer="timer"
			/>
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
		settings: {
			type: Object,
		},
	},
	mixins: [],
	data() {
		return {};
	},
	computed: {
		...mapGetters(["encounter", "actor"]),
		active_actor() {
			return this.actor || this.current;
		},
		timer() {
			return this.settings ? this.settings.timer : 0;
		},
	},
	methods: {
		...mapActions([]),
	},
	watch: {},
};
</script>

<style lang="scss" scoped>
.top {
	grid-area: top;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	background-color: $neutral-6-transparent;
	border-radius: $border-radius;
	margin: 30px 0;
	padding: 0 10px;
	gap: 20px;

	.actor {
		flex-grow: 1;
	}
	.encounter-status {
	}
}
</style>
