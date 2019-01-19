<template>
	<div class="container">
		<h1><i class="fas fa-cogs"></i> Settings</h1>
		<Track />
	</div>
</template>

<script>
	import TrackEncounter from '@/components/settings/TrackEncounter.vue';

	export default {
		name: 'Settings',
		components: {
			Track: TrackEncounter,
		},
		metaInfo: {
			title: 'Settings'
		},
	}
</script>

<style lang="scss">
	.container {
		padding-top:20px;

		h1 {
			margin-bottom: 20px;
			font-size: 40px;
		}
	}
</style>