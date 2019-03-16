<template>
	<div class="red" v-else>
		It seems you don't have any slots left to add more {{type}}
		<br>
		<router-link to="/patreon">Need more slots?</router-link>
	</div>
</template>

<script>
	export default {
		name: "OutOfSlots",
		props: ['type']
		
	};
</script>

<style lang="scss" scoped>
</style>