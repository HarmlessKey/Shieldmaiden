<template>
	<div>
		<DeathSaves
			v-if="target.entityType === 'player' || target.entityType === 'companion'"
			:target="target"
		/>
		<Card class="mt-1 hide" :entity="target" :avatar="false" />
	</div>
</template>

<script>
import { mapGetters } from "vuex";

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
};
</script>
