<template>
	<div class="container">
		<h1><i class="fas fa-cogs"></i> Settings</h1>
		<General />
		<Encounter />
		<Track />
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
		ul.settings {
			border-top: solid 1px #302f2f;;
			padding: 0;
			list-style: none;
			margin-bottom: 60px;

			li {
				font-size: 13px;
				padding: 15px 5px;
				border-bottom: solid 1px #302f2f;

				.btn {
					color: #b2b2b2 !important;
				}
			}
		}
	}
</style>