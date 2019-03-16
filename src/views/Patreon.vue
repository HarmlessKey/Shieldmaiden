<template>
	<div>
		<div class="grid">
			<div class="container">
				<h1><i class="fab fa-patreon patreon-red"></i> Support us on Patreon <i class="fas fa-heart"></i></h1>
				<Tiers class="my-4" />
				<h2>Why do I have to pay?</h2>
				<p>
					We wish we could offer the app for free. This is why we do have a free tier 
					that should be sufficient for most users. If you manage your data well, 
					you can get complete use out of our app without having to pay anything. 
					All the features we develop will always be accessible for all users, without cost. You only pay for more storage.<br/>
					Unfortunately creating an app brings some costs with it. 
					We need to invest a lot of time in maintaining and expanding the app. 
					And there are the costs of hosting Harmless Key, as our user base expands, the costs increase.
				</p>

				<h2>Building together</h2>
				<p>
					Our goal is not to earn money, our goal is to create an app that is useful for the entire community. <br/>
					To reach this goal, we will need support. This is why have set up a Patreon. 
					This way you can help us in achieving this goal.
				</p>

				<a class="btn bg-patreon-red" href="https://www.patreon.com/harmlesskey" target="_blank"><i class="fab fa-patreon black"></i> Support us</a>
			</div>
		<Footer class="mt-5" />
		</div>
	</div>
</template>

<script>
	import { auth } from '@/firebase.js'
	import Tiers from '@/components/Tiers.vue'
	import Footer from '@/components/Footer.vue'

	export default {
		name: 'home',
		components: {
			Tiers,
			Footer,
		},
		metaInfo: {
			title: 'Patreon',
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
	padding-top: 30px;
	background-size: cover;
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer";

	h1 {
		margin-bottom: 40px;
	}
	h2 {
		margin-bottom: 10px !important;
	}
	p {
		font-size: 17px;
		line-height: 30px;
		margin-bottom: 40px;
	}
}
</style>