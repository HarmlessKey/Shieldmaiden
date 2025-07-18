<template>
	<div class="entity-card">
		<CardDetails v-bind="$attrs" :entity="entity" />
		<CardActions v-if="entity.entityType !== 'player'" :entity="entity" />
	</div>
</template>

<script>
import CardDetails from "./CardDetails.vue";
import CardActions from "./CardActions.vue";

export default {
	name: "Card",
	components: {
		CardDetails,
		CardActions,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
};
</script>

<style lang="scss" scoped></style>
