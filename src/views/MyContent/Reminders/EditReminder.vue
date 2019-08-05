<template>
	<div id="hasSide">
		<Sidebar/>
		<div v-if="overencumbered" class='container'>
			<OverEncumbered/>
		</div>
	</div>
</template>

<script>
	import Sidebar from '@/components/SidebarMyContent.vue'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		metaInfo: {
			title: 'Players'
		},
		components: {
			Sidebar,
			OverEncumbered,
		},
		data() {
			return {
			}
		},
		firebase() {
			return {
				
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'players',
				'overencumbered',
			]),
		},

		methods: {
		
		}
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	label {
		line-height: 37px;
		margin-bottom: 0;

	}
}



</style>