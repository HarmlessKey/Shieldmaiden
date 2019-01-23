<template>
	<div class="grid">
		<div id="home">
			<section>
				<div class="container">
					<h1>Run encounters like never before.</h1>
					<p>
						When running encounters in Dungeons & Dragons, there is alot to keep track of. 
						Our app keeps track of everything you need to know and displays it in a structured overview.
						This way we make running encounters alot simpler, making sure that you can give your players the attention they deserve.
					</p>
				</div>
			</section>

			<section v-if="!user" class="bg-gray">
				<div class="container">
					<h2 class="text-center">Start giving your players the attention they deserve!</h2>
					<div class="d-flex justify-content-center">
						<router-link to="/sign-up" class="btn mr-2">Sign Up</router-link>
						<router-link to="/sign-in" class="btn">Sign In</router-link>
					</div>
				</div>
			</section>
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
		metaInfo: {
			title: 'Home'
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
	/* background-image: url('../assets/_img/styles/game_table.png'); */
	background-size: cover;
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
	padding:20px 0;
}

</style>