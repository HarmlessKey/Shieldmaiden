<template>
	<div>
		<h2>Out of turn damage / healing</h2>

		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<BasicEntity :entity="entities[target]" />
			</li>
		</ul>
		<hr />

		<Actions v-if="targeted.length > 0" class="mt-3" :select-entity="true" />

		<p v-else class="mt-4">Select one or multiple targets to deal damage or heal.</p>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import Actions from "src/components/combat/legacy/actions/Actions.vue";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";

export default {
	name: "damageHealing",
	components: {
		Actions: Actions,
		BasicEntity,
	},
	props: ["data"],
	data() {
		return {
			target: this.data,
		};
	},
	computed: {
		...mapGetters(["targeted", "entities"]),
	},
};
</script>

<style lang="scss" scoped>
ul.targets {
	list-style: none;
	padding: 0;

	li {
		margin-bottom: 2px !important;
		border: solid 1px transparent;
	}
}
</style>
