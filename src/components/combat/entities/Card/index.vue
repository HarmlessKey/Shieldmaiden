<template>
	<div class="entity-card">
		<CardActions v-if="entity.entityType !== 'player'" :entity="entity" />
	</div>
</template>

<script>
import CardActions from "./CardActions.vue";

export default {
	name: "Card",
	components: {
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
