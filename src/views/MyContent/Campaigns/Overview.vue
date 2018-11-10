<template>
	<div id="my-content" class="container">
		<EditCampaign v-if="id" />
		<Campaigns v-else />
	</div>
</template>

<script>
	import Campaigns from './Campaigns.vue'
	import EditCampaign from './EditCampaign.vue'
	import firebase from 'firebase'
	import { db } from '@/firebase'

	export default {
		name: 'MyContent',
		components: {
			EditCampaign,
			Campaigns
		},
		computed: {
			id() {
				if (this.$route.query.id) {
					return `${this.$route.query.id}`
				} else {
					return ""
				}
			}
		}
	}
</script>

<style lang="css" scoped>
.container {
	padding-top:20px;
}
</style>