<template>
	<div class="actor">
		<div class="actor__actions">
			<SelectActor :actor="actor" :_active="_active" :out-of-turn="outOfTurn" />
			<DeathSaves
				v-if="actor.entityType === 'player' && actor.curHp === 0"
				:target="actor"
				show-actions
			/>
			<Manual v-else :actor="actor" />
			<template v-if="actor.entityType !== 'player'">
				<Actions :actor="actor" :key="`actions-${actor.key}`" />
				<Spells :actor="actor" :key="`spells-${actor.key}`" />
			</template>
			<Target v-if="targeted?.length" :actor="actor" />
		</div>
		<Details :actor="actor" />
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import SelectActor from "./SelectActor.vue";
import DeathSaves from "../DeathSaves.vue";
import Manual from "../actions/Manual.vue";
import Details from "./Details.vue";
import Actions from "./Actions.vue";
import Spells from "./Spells.vue";
import Target from "../top/Target.vue";

export default {
	name: "Actor",
	components: {
		SelectActor,
		DeathSaves,
		Manual,
		Details,
		Actions,
		Spells,
		Target,
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
		...mapGetters(["encounter", "targeted"]),
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
	&__targeted-self {
		background-color: $orange;
		border-radius: $border-radius;
		padding: 3px 5px;
		font-weight: bold;
	}
}
</style>
