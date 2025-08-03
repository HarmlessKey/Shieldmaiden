<template>
	<div>
		<template v-if="target.entityType === 'player' || target.entityType === 'companion'">
			<span>Death Saving Throws</span>
			<button
				class="btn btn-sm btn-clear"
				@click="setDrawer({ show: true, type: 'drawers/DeathSaves' })"
			>
				<i aria-hidden="true" class="fas fa-question" />
				<q-tooltip anchor="top middle" self="center middle">Learn more</q-tooltip>
			</button>
			<DeathSaves :target="target" />
		</template>
		<Card class="mt-1 hide" :entity="target" :avatar="false" />
	</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import Card from "./entities/Card";
import DeathSaves from "src/components/combat/DeathSaves.vue";

export default {
	name: "TargetInfo",
	props: ["data"],
	components: {
		Card,
		DeathSaves,
	},
	computed: {
		...mapGetters(["entities"]),
		target: function () {
			return this.entities[this.data.key];
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
	},
};
</script>
