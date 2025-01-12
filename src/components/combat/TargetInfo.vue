<template>
	<div>
		<DeathSaves
			v-if="target.entityType === 'player' || target.entityType === 'companion'"
			:target="target"
		/>
		<Effects :entity="target" />
		<ViewEntity class="mt-1 hide" :data="target" />
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import ViewEntity from "./ViewEntity.vue";
import Effects from "./entities/effects";
import DeathSaves from "src/components/combat/DeathSaves.vue";

export default {
	name: "TargetInfo",
	props: ["data"],
	components: {
		ViewEntity,
		Effects,
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
