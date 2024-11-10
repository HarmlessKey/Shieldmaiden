<template>
	<div class="actor">
		<SelectActor :actor="actor" :_active="_active" :out-of-turn="outOfTurn" />
		<Manual :actor="actor" />
		Actions
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import SelectActor from "./SelectActor.vue";
import Manual from "../actions/Manual";

export default {
	name: "Actor",
	components: {
		SelectActor,
		Manual,
	},
	mixins: [],
	props: {
		actor: {
			type: Object,
		},
		_active: {
			type: Array,
			required: true,
		},
		outOfTurn: {
			type: Boolean,
			default: false,
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
	},
	watch: {},
};
</script>

<style lang="scss" scoped>
.actor {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 15px;
	border-radius: $border-radius;
}
</style>
