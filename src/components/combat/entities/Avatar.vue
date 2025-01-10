<template>
	<div
		class="target-avatar"
		:style="{
			'background-image':
				(entity.img && !icons) ||
				(entity.img &&
					icons &&
					!entity.hidden &&
					!entity.transformed &&
					!entity.reminder?.surprised)
					? 'url(' + entity.img + ')'
					: '',
			color: entity.color_label ? entity.color_label : ``,
			borderColor: entity.color_label ? entity.color_label : ``,
		}"
	>
		<template v-if="icons && entity.hidden">
			<hk-icon icon="fas fa-eye-slash" class="red" :class="{ 'neutral-1': entity.color_label }" />
			<q-tooltip anchor="top middle" self="center middle">Hidden</q-tooltip>
		</template>
		<template v-else-if="icons && entity.transformed">
			<hk-icon icon="fas fa-paw-claws" :class="{ 'neutral-1': entity.color_label }" />
			<q-tooltip anchor="top middle" self="center middle">Transformed</q-tooltip>
		</template>
		<template v-else-if="icons && entity.reminders?.surprised">
			<hk-icon icon="hki hki-surprised" class="orange" />
			<q-tooltip anchor="top middle" self="center middle">Surprised</q-tooltip>
		</template>
		<hk-compendium-image v-else-if="!entity.img && entity.url" :value="entity.url" />
		<hk-icon
			v-else-if="!entity.img"
			:icon="`hki-${entity.entityType === 'npc' ? 'monster' : entity.entityType}`"
		/>
		<slot />
	</div>
</template>

<script>
export default {
	name: "Avatar",
	props: {
		entity: {
			type: Object,
			required: true,
		},
		icons: {
			type: Boolean,
			default: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.target-avatar {
	background-position: center top;
	background-repeat: no-repeat;
	background-size: cover;
	aspect-ratio: 1/1;
	border-radius: $border-radius-small;
	border-left: solid 2px $neutral-7;
	background-color: $neutral-8;
}
</style>
