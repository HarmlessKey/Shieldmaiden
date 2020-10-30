<template>
	<div>
		<h2 class='orange'><i class="fas fa-sad-tear"></i> It seems that you are over encumbered!</h2>
		<p>If you want to add more content consider one of these options</p>
		<hk-card-deck>
			<hk-card header="Manage your content">
				<p>You can remove some content to make space for new content</p>
				<div slot='footer'>
					<router-link class="btn btn-block bg-patreon-red" to="/manage-content">Manage content</router-link>
				</div>
			</hk-card>
			<hk-card header="Need more content slots?">
				<p>If you want more slots consider joining our patreon</p>
				<div slot='footer'>
					<router-link class="btn btn-block bg-patreon-red" to="/patreon"><i class="fab fas-patreon"></i>Support us!</router-link>
				</div>
			</hk-card>
		</hk-card-deck>
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