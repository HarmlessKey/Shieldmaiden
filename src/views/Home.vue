<template>
	<div class="wrapper">
		<div class="grid">
			<div id="home">
				<section>
					<div class="container">
						<b-row class=mb-5 id="title">
							<b-col md="5">
								<!-- <img id="logo" src="@/assets/_img/logo/logo-cyan.svg"> -->
								<img id="logo" src="@/assets/_img/logo/logo-icon-cyan.svg">
							</b-col>
							<b-col md="7">
								<h1 class="mt-4">Dungeons & Dragons Encounter Tracker.</h1>
								<h2 class="">The initiative tracker for D&D 5e.</h2>								
							</b-col>
						</b-row>

						<div v-if="user" class="user-links d-flex justify-content-center">
							<router-link class="btn" to="/campaigns"><i class="fas fa-dungeon"></i> Campaigns</router-link>
							<router-link class="btn mx-2" to="/players"><i class="fas fa-users"></i> Players</router-link>
							<router-link class="btn" to="/npcs"><i class="fas fa-dragon"></i> NPC's</router-link>
						</div>

						<hr class="mt-5">
						<b-row class=my-5>
							<b-col md="5">
								<h3>A sneak peek of our combat tracker</h3>
								<p class="mb-5">Like what you see?<br/> Create an account now and get full access to all our features.</p>
								<div>
									<router-link v-if="!user" to="/sign-up" class="btn btn-lg btn-block"><i class="fas fa-user-plus"></i> Create Account</router-link>
									<router-link v-if="user" to="/campaigns" class="btn btn-lg btn-block"><i class="fas fa-treasure-chest"></i> My Content</router-link>
								</div>
							</b-col>
							<b-col md="7">
								<p class="img-header bg-gray-darker">Your new DM screen</p>
								<!-- <img src="@/assets/_img/harmless-key-encounter-tracker.png" alt="Your new Dungeon Master screen. An overview of our dungeons and dragons combat runner."/> -->
								<iframe width="560" height="315" src="https://www.youtube.com/embed/2Xzs94mVCww" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
							</b-col>
						</b-row>
						<hr>
					</div>
				</section>
				<section>
					<div class="container">
						<b-row>
							<b-col md="7">
								<p class="img-header bg-gray-darker">Info for your players</p>
								<img src="@/assets/_img/follow-encounters-harmless-key.png" alt="A link your players can follow for our D&D encounter runner."/>
							</b-col>
							<b-col>
							<h3>Run encounters like never before.</h3>
							<p>
								Our app keeps track of everything you need to know in encounters and displays it in a structured overview.
								This way we make tracking initiative in Dungeons and Dragons a lot simpler, making sure that you can give your players the attention they deserve.
							</p>
							</b-col>
						</b-row>
					</div>
				</section>
				<section>
					<div class="container info">
						<b-row class="mt-5">
							<b-col md="4" class="mb-5">
								<span class="icon"><i class="fas fa-calculator-alt"></i></span>
								<h3>Run encounters easy</h3>
								<p>Our app is intuitive and very easy to use. 
									Making sure you can divide your attention among your players.</p>
							</b-col>
							<b-col md="4" class="mb-5">
								<span class="icon"><i class="fas fa-gamepad"></i></span>
								<h3>Full control for the DM</h3>
								<p>The Dungeon Master has full control over everything in the encounter. Just like in DnD you make up the rules.</p>
							</b-col>
							<b-col md="4" class="mb-5">
								<span class="icon"><i class="fas fa-desktop"></i></span>
								<h3>For DM and Party</h3>
								<p>Through a unique link players can follow the encounters. Of course the Dungeon Master has control over what is shown on the second screen.</p>
							</b-col>
						</b-row>
					</div>
				</section>
				<section v-if="!user">
					<div class="container">
						<hr class="mb-5">
						<h3 class="text-center my-5">Start giving your players the attention they deserve!</h3>
						<div class="btn-group d-flex" role="group">
							<router-link to="/sign-up" class="btn btn-lg btn-block mb-5"><i class="fas fa-user-plus"></i> Sign Up</router-link>
						</div>
					</div>
				</section>
			</div>
			<Footer />
			<div class="empty"></div>
		</div>
		<div class="patreon bg-black d-flex justify-content-end">
			Like what we do?
			<a href="https://www.patreon.com/join/harmlesskey" target="_blank" class="ml-2 btn bg-patreon-red"><i class="fab fa-patreon black"></i> Support us on Patreon</a>
		</div>
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
			title: 'Harmless Key | D&D Encounter Tracker',
			meta: [
				{ vmid: 'description', name: 'description', content: 'Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.' }
			]
		},
		computed: {
			user() {
				return auth.currentUser
			}
		},
	}
</script>

<style lang="scss" scoped>
.grid {
	background-size: cover;
	height: calc(100vh - 50px) !important;
	display: grid;
	grid-template-columns: auto;
	grid-template-rows: 3fr 1fr 55px;
	grid-gap: 0;
	grid-template-areas: 
	"container"
	"footer"
	"empty";

}
.empty {
	height: 55px;
	grid-area: empty;
	background: #000;
}
#home {
	font-size: 18px; 
	line-height: 30px; 
	font-weight: lighter;
	padding-bottom: 50px;

	section {
		padding-top: 40px;

		p.img-header {
			margin-bottom: 0;
			font-size: 12px;
			padding-left: 10px;
		}

		h1, h2 {
			font-size: 35px !important;
			text-transform: none;
			text-align: center;
		}
		h2 {
			font-size: 20px !important;
		}
		h3 {
			font-size: 30px !important;
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

		#title {
			img {
				max-width: 200px;
				margin: auto;
				float: right
			}
			h1,h2 {
				text-align: left;
			}
		}
		.user-links {
			margin-top: 5rem !important
		}
		@media (max-width: 767.98px) {
			#title {
				img {
					float: none;
				}
				h1,h2 {
					text-align: center;
				}
			}
		}
	}
}
.patreon {
	position: fixed;
	bottom: 0;
	width: 100%;
	padding: 10px;
	height: 55px;
	line-height: 33px;
}
iframe, img {
	background-size: cover;
	background-position: center top;
	display: block;
	width: 100%;
	margin-bottom: 40px;
}

</style>