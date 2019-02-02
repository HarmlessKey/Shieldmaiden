<template>
	<div>
		<h2>Settings</h2>
		<p>Settings for running an encounter.</p>
		<Encounter />
	</div>
</template>

<script>
	import Encounter from '@/components/settings/Encounter.vue';

	export default {
		name: 'Settings',
		components: {
			Encounter: Encounter,
		},
	}
</script>

<style lang="scss" scoped>
	.card-body {
		padding: 0 !important;
	}
</style>