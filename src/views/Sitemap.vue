<template>
	<div class="container">
		<h1>Sitemap</h1>
		<ul>
			<li><router-link to="/">Home</router-link></li>
			<li><router-link to="/sign-up">Sign Up</router-link></li>
			<li><router-link to="/sign-in">Sign In</router-link></li>
			<li><router-link to="/documentation">Documentation</router-link></li>
			<li><router-link to="/feedback">Feedback</router-link></li>
			<li><router-link to="/updates">Updates</router-link></li>
			<li><router-link to="/planned">Planned</router-link></li>
			<li><router-link to="/privacy-policy">Privacy Policy</router-link></li>
			<li>
				<router-link to="/compendium">Compendium</router-link>
				<ul>
					<li><router-link to="/compendium/conditions">Conditions</router-link></li>
					<li><router-link to="/compendium/monsters">Monsters</router-link></li>
					<li><router-link to="/compendium/spells">Spells</router-link></li>
				</ul>
			</li>
		</ul>
	</div>
</template>

<script>

	export default {
		name: 'Sitemap',
		metaInfo: {
			title: 'Sitemap'
		},
	}
</script>

<style lang="scss" scoped>

.container {
	padding-top:20px;
	padding-bottom:50px;

	font-size: 15px;
	line-height: 25px;

	h3 {
		font-size: 20px !important;
	}
}

</style>