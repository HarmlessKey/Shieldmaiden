<template>
	<div class="container">
		<h1><i class="fas fa-cogs"></i> Settings</h1>
		<hk-card header="General Settings" id="general">
			<General />
		</hk-card>
		<hk-card header="Run Encounter Settings" id="run">
			<Encounter />
		</hk-card>
		<hk-card header="Track Encounter Settings" id="track">
			<p class="mb-5">Track encounter is what we call the link you can share with your party, 
				or put up on a second screen for your party to see. 
				In here players can follow the encounter, 
				see who's turn it is and what the status of the entities within the encounter is. 
				Below you can determine what should be visible on the track encounter screen.
			</p>
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