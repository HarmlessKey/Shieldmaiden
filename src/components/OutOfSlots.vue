<template>
	<p class="red">
		It seems you don't have any slots left to add more {{type}} 
		<router-link to="/patreon">Need more slots?</router-link>
	</p>
</template>

<script>
	export default {
		name: "OutOfSlots",
		props: ['type']
		
	};
</script>

<style lang="scss" scoped>
</style>