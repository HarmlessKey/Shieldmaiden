<template>
	<div class="grid">
		<div class="container">
			<h1>About us</h1>
			<p>
				Harmless Key is created by two experienced Dungeons & Dragons players from Amsterdam. 
				We were missing a good encounter tracker so we decided to build it ourselves.<br/> 
				After some positive feedback from our fellow D&D players, we decided to share it with the public. 
				Now it's out there for everyone to use and we hope you get as much use out of it as we do.
			</p>

			<h2>The Harmless Key Team</h2>
			<b-card-group deck>
				<b-card header="Harm Manders">
				</b-card>
				<b-card header="Key Roos">
				</b-card>
			</b-card-group>
		</div>
		<Footer />
	</div>
</template>

<script>
	import { auth } from '@/firebase.js'
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'home',
		components: {
			Footer,
		},
		metaInfo: {
			title: 'Harmless Key',
			meta: [
				{ vmid: 'description', name: 'description', content: 'Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.' }
			]
		},
		computed: {
			user() {
				return auth.currentUser
			}
		}
	}
</script>

<style lang="scss" scoped>
	.grid {
		background-size: cover;
		height: calc(100vh - 50px) !important;
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: 3fr 1fr;
		grid-gap: 0;
		grid-template-areas: 
		"container"
		"footer";

		.container {
			padding-top: 35px;

			p {
				font-size: 17px;
				line-height: 30px;
				margin-bottom: 40px;
			}
		}
	}
</style>