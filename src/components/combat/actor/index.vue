<template>
	<div class="actor">
		<div class="actor__actions">
			<SelectActor
				:actor="active_actor"
				:_active="_active"
				:out-of-turn="out_of_turn"
				:small="small"
			/>
			<DeathSaves
				v-if="active_actor.entityType === 'player' && active_actor.curHp === 0"
				:target="active_actor"
				show-actions
			/>
			<Manual v-else :actor="active_actor" />
			<template v-if="active_actor.entityType !== 'player'">
				<Actions :actor="active_actor" :key="`actions-${active_actor.key}`" />
				<Spells :actor="active_actor" :key="`spells-${active_actor.key}`" />
			</template>
			<Target v-if="!small && targeted?.length" :actor="active_actor" :small="medium" />
		</div>
		<Details :actor="active_actor">
			<div v-if="medium && targeted.includes(active_actor.key)" class="actor__targeted-self">
				Targeted self
			</div>
		</Details>
		<q-resize-observer @resize="setSize" />
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
		current: {
			type: Object,
		},
		_active: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			width: 0,
			breakpoint_sm: 680,
			breakpoint_md: 890,
		};
	},
	computed: {
		...mapGetters(["encounter", "actor", "targeted"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		active_actor() {
			return this.actor || this.current;
		},
		out_of_turn() {
			return this.actor && this.actor.key !== this.current.key;
		},
		small() {
			return this.width <= this.breakpoint_sm;
		},
		medium() {
			return this.width > this.breakpoint_sm && this.width <= this.breakpoint_md;
		},
	},
	methods: {
		...mapActions(["set_turn", "set_targeted", "update_round", "demo"]),
		setSize(size) {
			this.width = size.width;
		},
	},
};
</script>

<style lang="scss" scoped>
.actor {
	grid-area: actor;
	display: flex;
	flex-direction: column;
	gap: 5px;

	&__actions {
		background-color: $neutral-6-transparent;
		border-radius: $border-radius-small;
		padding: 10px;
		display: flex;
		align-items: center;
		gap: 10px;
		height: 80px;

		.manual {
			margin: -100px 0;
		}
	}
	&__targeted-self {
		color: $orange;
		border-top-right-radius: $border-radius;
		border-bottom-right-radius: $border-radius;
		padding: 3px 5px;
		font-weight: bold;
	}
}
</style>
