<template>
	<div class="container">
		<h1><i class="fas fa-cogs"></i> Settings</h1>
		<hk-card header="General Settings" id="general">
			<General />
		</hk-card>
		<hk-card header="Run Encounter Settings" id="run">
			<Encounter />
		</hk-card>
		<hk-card header="Public initiative list Settings" id="track">
			<Track />
		</hk-card>
	</div>
</template>

<script>
	import General from '@/components/settings/General.vue';
	import Encounter from '@/components/settings/Encounter.vue';
	import TrackEncounter from '@/components/settings/TrackEncounter.vue';

	export default {
		name: 'Settings',
		components: {
			General: General,
			Encounter: Encounter,
			Track: TrackEncounter,
		}
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