<template>
	<div class="actor">
		<div class="actor__actions">
			<SelectActor :actor="actor" :_active="_active" :out-of-turn="outOfTurn" />
			<Manual :actor="actor" />
			<template v-if="actor.entityType !== 'player'">
				<Actions :actor="actor" />
				Spells
			</template>
		</div>
		<Details :actor="actor" />
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import SelectActor from "./SelectActor.vue";
import Manual from "../actions/Manual";
import Details from "./Details.vue";
import Actions from "./Actions.vue";

export default {
	name: "Actor",
	components: {
		SelectActor,
		Manual,
		Details,
		Actions,
	},
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
};
</script>

<style lang="scss" scoped>
.actor {
	display: flex;
	flex-direction: column;
	gap: 5px;

	&__actions {
		background-color: $neutral-6-transparent;
		border-radius: $border-radius-small;
		padding: 10px;
		display: flex;
		align-items: center;
		gap: 15px;

		.manual {
			margin: -100px 0;
		}
	}
}
</style>
