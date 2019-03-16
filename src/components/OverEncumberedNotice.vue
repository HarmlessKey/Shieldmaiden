<template>
	<div class="red" v-else>
		It seems you are currently overencumbered
		<br>
		<router-link to="/manage-content">Manage your content</router-link>
		<br>
		<router-link to="/patreon">Need more content slots?</router-link>
	</div>
</template>

<script>

	export default {
		
		computed: {
			
		},
		methods: {
			
		}
	};
</script>

<style lang="scss" scoped>

</style>