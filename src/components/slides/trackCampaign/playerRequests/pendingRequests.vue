<template>
	<div>
		<h2>Pending Requests</h2>
		
		
	</div>
</template>

<script>
	import _ from 'lodash';
	
	export default {
		name: 'pendingRequests',
		props: [
		'data',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
			}
		},
		methods: {
		}
	};
</script>

<style lang="scss" scoped>

</style>
