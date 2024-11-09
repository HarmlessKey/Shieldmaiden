<template>
	<div class="top">
		<div>
			<Menu />
			live
		</div>
		Actor
		<div class="encounter-status">
			<Round :active-entities="activeEntities" :current="current" :next="next" :timer="timer" />
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Menu from "./Menu.vue";
import Round from "./Round.vue";

export default {
	name: "CombatTop",
	components: {
		Menu,
		Round,
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
		...mapGetters(["encounter"]),
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
	justify-content: space-between;
	align-items: center;

	.encounter-status {
	}
}
</style>
