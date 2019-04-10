<template>
	<div class="grid">
		<div class="container">
			<h1>About us</h1>
			<p>
				Harmless Key is created by two experienced Dungeons & Dragons players from Amsterdam. 
				We were missing a good encounter tracker so we decided to build it ourselves.<br/> 
				After some positive feedback from our fellow D&D players, we decided to share it with the public. 
				Now it's out there for everyone to enjoy and we hope you get as much use out of it as we do.
			</p>

			<h2>The Harmless Key Team</h2>
			<b-card-group deck>
				<b-card header="The Harmless">
					<div class="d-flex justify-content-start">
						<div class="img" :style="{'background-image': 'url()'}"></div>
						<div>
							Harm Manders<br/>
							<small><i class="gray-hover">Male human drunkard</i><br/>
							<i>Level {{ getAge('1992-03-29') }}</i></small>
						</div>
					</div>
					<hr>
					<b-row>
						<b-col>
							<h3>Abillity Scores</h3>
						</b-col>
						<b-col>
							<h3>Skills</h3>
							<ul class="skills">
								<li class="d-flex justify-content-between"><span></span> <span></span></li>
							</ul>
						</b-col>
					</b-row>
				</b-card>
				<b-card header="The Key">
					<div class="d-flex justify-content-start">
						<div class="img" :style="{'background-image': 'url(' + require('@/assets/_img/key.jpg') + ')'}"></div>
						<div>
							Key Roos<br/>
							<small><i class="gray-hover">Male human developer</i><br/>
							<i>Level {{ getAge('1987-06-11') }}</i></small>
						</div>
					</div>
					<hr>
					<b-row>
						<b-col>
							<h3>Abillity Scores</h3>
						</b-col>
						<b-col>
							<h3>Skills</h3>
							<ul class="skills">
								<li class="d-flex justify-content-between"><span>Concentrating</span> <span>-1</span></li>
								<li class="d-flex justify-content-between"><span>Whining</span> <span>+8</span></li>
								<li class="d-flex justify-content-between"><span>Guitar</span> <span>+1</span></li>
							</ul>
						</b-col>
					</b-row>
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
		},
		methods: {
			getAge(dateString) {
				var today = new Date();
				var birthDate = new Date(dateString);
				var age = today.getFullYear() - birthDate.getFullYear();
				var m = today.getMonth() - birthDate.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
						age--;
				}
				return age;
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

			.card {
				.img {
					border: solid 1px #b2b2b2;
					width: 80px;
					height: 80px;
					background-position: center top;
					background-size: cover;
					margin-right: 20px;
				}

				ul {
					padding: 0;
					list-style: none;

					&.skills {
						li {
							padding: 5px 0;
							border-bottom: solid 1px #494747;
						}
					}
				}
			}
		}
	}
</style>