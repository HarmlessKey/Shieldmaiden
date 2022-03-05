<template>
	<div>
		<h2>Public initiative list settings</h2>
		<Track />
	</div>
</template>

<script>
	import TrackEncounter from '@/components/settings/TrackEncounter.vue';

	export default {
		name: 'TrackSettings',
		components: {
			Track: TrackEncounter,
		},
	}
</script>