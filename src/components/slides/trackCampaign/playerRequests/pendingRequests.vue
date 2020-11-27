<template>
	<div>
		<h2>Pending Requests</h2>
		
		
	</div>
</template>

<script>	
	export default {
		name: 'pendingRequests',
		props: [
		'data',
		],
		data() {
			return {
				userId: this.$store.getters.user.uid,
			}
		},
		methods: {
		}
	};
</script>

<style lang="scss" scoped>

</style>
