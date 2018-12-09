<template>
	<div class="grid">
		<div id="home" class="container">
			<h1>D&D 5e Combat Service</h1>
			<p>Use our app to run your encounters, so you can give your players the attention they deserve.</p>
			
			<router-link v-if="!user" to="/sign-up" class="btn mr-2">Sign Up</router-link>
			<router-link v-if="!user" to="/sign-in" class="btn">Sign In</router-link>
		</div>
		<Footer />
	</div>
</template>

<script>
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'home',
		components: {
			Footer,
		},
		computed: {
			user() {
				return this.$store.getters.getUser;
			}
		}
	}
</script>

<style lang="css">
.grid {
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";
}
.container {
	padding-top:20px;
}

</style>