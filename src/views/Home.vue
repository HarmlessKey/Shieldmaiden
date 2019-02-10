<template>
	<div class="grid">
		<div id="home">
			<section>
				<div class="container">
					<h1><i class="fas fa-swords"></i> Harmless Key <strong>Encounter </strong> <strong>Tracker</strong>. <span class="gray-hover">BETA</span></h1>
					<h3>The <strong>combat </strong> <strong>tracker</strong> for <strong>D&D </strong> <strong>5e.</strong></h3>

					<div v-if="user" class="d-flex justify-content-center mt-5">
						<router-link class="btn" to="/campaigns"><i class="fas fa-dungeon"></i> Campaigns</router-link>
						<router-link class="btn mx-2" to="/players"><i class="fas fa-users"></i> Players</router-link>
						<router-link class="btn" to="/npcs"><i class="fas fa-dragon"></i> NPC's</router-link>
					</div>

					<hr class="mt-5">
					<b-row class=my-5>
						<b-col md="7">
							<p class="img-header bg-gray-darker">Your new DM screen</p>
							<img src="@/assets/_img/screenshot.png" />
						</b-col>
						<b-col md="5">
							<h2>A sneak peek</h2>
							<p class="mb-5">Like what you see?<br/> Create an account now and get full access to all our features.</p>
							<div>
								<router-link v-if="!user" to="/sign-up" class="btn btn-lg btn-block"><i class="fas fa-user-plus"></i> Create Account</router-link>
								<router-link v-if="user" to="/campaigns" class="btn btn-lg btn-block"><i class="fas fa-treasure-chest"></i> My Content</router-link>
							</div>
						</b-col>
					</b-row>
					<hr>
				</div>
			</section>
			<section>
				<div class="container">
					<b-row>
					 <b-col>
						<h2>Run encounters like never before.</h2>
						<p>
							Our app keeps track of everything you need to know and displays it in a structured overview.
							This way we make running encounters a lot simpler, making sure that you can give your players the attention they deserve.
						</p>
					 </b-col>
					 <b-col md="7">
						 <p class="img-header bg-gray-darker">Info for your players</p>
						 <img src="@/assets/_img/screenshot-track.png" />
					 </b-col>
					</b-row>
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
							<p>The <strong>DM</strong> has full control over everything in the <strong>encounter</strong>. Just like in <strong>DnD</strong> you make up the rules.</p>
						</b-col>
						<b-col md="4" class="mb-5">
							<span class="icon"><i class="fas fa-desktop"></i></span>
							<h2>For DM and Party</h2>
							<p>Through a unique link players can follow the <strong>encounter</strong>. Of course the DM has control over what is shown on the second screen.</p>
						</b-col>
					</b-row>
				</div>
			</section>
			<section v-if="!user">
				<div class="container">
					<hr class="mb-5">
					<h2 class="text-center my-5">Start giving your players the attention they deserve!</h2>
					<div class="btn-group d-flex" role="group">
						<router-link to="/sign-up" class="btn btn-lg btn-block mb-5"><i class="fas fa-user-plus"></i> Sign Up</router-link>
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

		p.img-header {
			margin-bottom: 0;
			font-size: 12px;
			padding-left: 10px;
		}

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
iframe, img {
	background-size: cover;
	background-position: center top;
	display: block;
	width: 100%;
	margin-bottom: 40px;
}
strong {
	font-weight: normal;
}

</style>