<template>
	<div class="grid">
		<div id="home">
			<section>
				<div class="container">
					<h1><i class="fas fa-swords"></i> Harmless Key Encounter Tracker <span class="gray-hover">BETA</span></h1>
					<h3>The encounter tracker for D&D 5e.</h3>
					<hr class="mt-5">
					<b-row class=my-5>
						<b-col md="7">
							<iframe src="https://www.youtube.com/embed/B9FzVhw8_bY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
						</b-col>
						<b-col md="5">
							<h2>Our app in action</h2>
							<p class="mb-5">Like what you see?<br/> Create an account now.</p>
							<div>
								<router-link v-if="!user" to="/sign-up" class="btn btn-lg btn-block">Create Account</router-link>
								<router-link else to="/campaigns" class="btn btn-lg btn-block">My Content</router-link>
							</div>
						</b-col>
					</b-row>
					<hr>
				</div>
			</section>
			<section>
				<div class="container">
					<h2>Run encounters like never before.</h2>
					<p>
						Our app keeps track of everything you need to know and displays it in a structured overview.
						This way we make running encounters alot simpler, making sure that you can give your players the attention they deserve.
					</p>
				</div>
			</section>
			<section>
				<div class="container info">
					<b-row class="mt-5">
						<b-col md="4" class="mb-5">
							<span class="icon"><i class="fas fa-calculator-alt"></i></span>
							<h2>Easy to use</h2>
							<p>Our app is intuitive and very easy to use.</p>
						</b-col>
						<b-col md="4" class="mb-5">
							<span class="icon"><i class="fas fa-gamepad"></i></span>
							<h2>Full control</h2>
							<p>The DM has full control over everything in the encounter. Just like in D&D you make up the rules.</p>
						</b-col>
						<b-col md="4" class="mb-5">
							<span class="icon"><i class="fas fa-desktop"></i></span>
							<h2>For DM and Party</h2>
							<p>Through a unique link players can follow the encounter. Of course the DM has control over what is shown on the second screen.</p>
						</b-col>
					</b-row>
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
	import firebase from 'firebase'
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
				return firebase.auth().currentUser
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

}
#home {
	font-size: 18px; 
	line-height: 30px; 
	font-weight: lighter;
	padding-bottom: 50px;

	section {
		padding-top: 40px;

		h1, h2 {
			font-size: 35px !important;
			text-transform: none;
		}
		h1, h3 {
			text-align: center;
		}
		h3 {
			font-size: 20px !important;
		}
		.info {
			text-align: center;

			.icon {
				width: 200px;
				height: 200px;
				border-radius: 50%;
				padding: 50px 38px;
				background: #262626;
				display: block;
				font-size: 100px;
				margin-bottom: 50px;
				color: #2c97de;
				left: 50%;
				position: relative;
				transform: translateX(-50%);
				i {
					width: 126px;
					text-align: center;
				}
			}
		}
	}
}
.container {
	
}
iframe {
	width: 100%;
	height: 350px;
	margin-bottom: 40px;
}

</style>