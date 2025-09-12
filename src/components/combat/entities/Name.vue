<template>
	<div class="entity-name truncate">
		<span class="truncate">
			{{ name?.[1]?.capitalizeEach() }}
		</span>
		<span v-if="name[2]">{{ name[2] }}</span>
		<slot />
	</div>
</template>

<script>
export default {
	name: "EntityName",
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	computed: {
		name() {
			const name = this.entity.name;
			return name.match(/^(.*?)(\(\d+\))?$/);
		},
	},
};
</script>

<style lang="scss" scoped>
.entity-name {
	display: flex;
	gap: 2px;

	.truncate {
		min-width: 20px;
	}
}
</style>
