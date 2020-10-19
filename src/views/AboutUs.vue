<template>
	<div class="grid">
		<div class="container">
			<h1>About us</h1>
			<p>
				Harmless Key is created by two experienced Dungeons & Dragons players from Amsterdam. 
				We were missing an encounter tracker that tended to all our needs, so we decided to build one ourselves.<br/> 
				After some positive feedback from our fellow D&D players, we decided to share it with the public. 
				Now it's out there for everyone to enjoy and we hope you get as much use out of it as we do.
			</p>

			<h2>The Harmless Key Team</h2>
			<hk-card-deck class="mb-3">
				<hk-card header="The Harmless">
					<div class="d-flex justify-content-start">
						<div class="img" :style="{'background-image': 'url(' + require('@/assets/_img/harm.jpg') + ')'}"></div>
						<div>
							Harm Manders<br/>
							<small><i class="gray-hover">Male human developer</i><br/>
							<i>Level {{ getAge('1992-03-29') }}</i></small>
						</div>
					</div>
					<hr>
					<div class="row q-col-gutter-md">
						<div class="col">
							<h3>Abillity Scores</h3>
							<ul class="abillities">
								<li class="d-flex justify-content-between">Assembly <span class="score">10</span></li>
								<li class="d-flex justify-content-between">CSS <span class="score">18</span></li>
								<li class="d-flex justify-content-between">JS <span class="score">15</span></li>
								<li class="d-flex justify-content-between">PHP <span class="score">12</span></li>
								<li class="d-flex justify-content-between">Python <span class="score">19</span></li>
								<li class="d-flex justify-content-between">R <span class="score">11</span></li>
							</ul>
						</div>
						<div class="col">
							<h3>Skills</h3>
							<ul class="skills">
								<li class="d-flex justify-content-between"><span class="skill"><i class="fas fa-circle"></i> Bug Creation</span> <span>+5</span></li>
								<li class="d-flex justify-content-between"><span class="skill"><i class="far fa-circle"></i> Bug Fixing</span> <span>+2</span></li>
							</ul>
						</div>
					</div>
				</hk-card>
				<hk-card header="The Key">
					<div class="d-flex justify-content-start">
						<div class="img" :style="{'background-image': 'url(' + require('@/assets/_img/key.jpg') + ')'}"></div>
						<div>
							Key Roos<br/>
							<small><i class="gray-hover">Male human developer</i><br/>
							<i>Level {{ getAge('1987-06-11') }}</i></small>
						</div>
					</div>
					<hr>
					<div class="row q-col-gutter-md">
						<div class="col">
							<h3>Abillity Scores</h3>
							<ul class="abillities">
								<li class="d-flex justify-content-between">Assembly <span class="score">9</span></li>
								<li class="d-flex justify-content-between">CSS <span class="score">18</span></li>
								<li class="d-flex justify-content-between">JS <span class="score">14</span></li>
								<li class="d-flex justify-content-between">PHP <span class="score">16</span></li>
								<li class="d-flex justify-content-between">Python <span class="score">10</span></li>
								<li class="d-flex justify-content-between">R <span class="score">11</span></li>
							</ul>
						</div>
						<div class="col">
							<h3>Skills</h3>
							<ul class="skills">
								<li class="d-flex justify-content-between"><span class="skill"><i class="far fa-circle"></i> Concentrating</span> <span>+2</span></li>
								<li class="d-flex justify-content-between"><span class="skill"><i class="fas fa-circle"></i> Whining</span> <span>+8</span></li>
								<li class="d-flex justify-content-between"><span class="skill"><i class="far fa-circle"></i> Guitar</span> <span>+1</span></li>
								<li class="d-flex justify-content-between"><span class="skill"><i class="fas fa-circle"></i> Drinking</span> <span>+9</span></li>
								<li class="d-flex justify-content-between"><span class="skill"><i class="far fa-circle"></i> Sleeping</span> <span>-2</span></li>
							</ul>
						</div>
					</div>
				</hk-card>
			</hk-card-deck>

			<hk-card header="Special thanks">
				<h2>Patrick Teunissen</h2>
				<h3>For designing our logo!</h3>
				<p class="mb-5">This guy was nice enough to lend us his time and design the awesome logo for us. We couldn't be happier!</p>
				<div class="row q-col-gutter-md">
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../assets/_img/logo/logo-icon-green.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../assets/_img/logo/logo-icon-blue.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../assets/_img/logo/logo-icon-red.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../assets/_img/logo/logo-icon-orange.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../assets/_img/logo/logo-icon-cyan.svg"/>
					</div>
					<div class="col-4 col-sm-2 d-flex justify-content-center" style="height:120px;">
						<img class="icon" src="../assets/_img/logo/logo-icon-yellow.svg"/>
					</div>
				</div>
			</hk-card>

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
			title: 'About Harmless Key',
			meta: [
				{ vmid: 'description', name: 'description', content: 'Harmless Key is the initiative tracker for D&D 5e. We keep track of everything in encounters so even during combat you can give your players the attention they deserve.' }
			]
		},
		computed: {
			user() {
				return auth.currentUser
			}
		},
		beforeMount() {
			//Because the component is loaded in another view, 
			//the scroll needs to be reset to 0
			window.scrollTo(0,0);
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

			.icon {
				width: 100px;
			}

			.hk-card {
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
							line-height: 20px;

							.skill {
								font-size: 13px;
							}
						}
					}
					&.abillities {
						li {
							text-transform: uppercase;
							line-height: 40px;
							margin-bottom: 3px;

							span.score {
								font-size: 25px;
								width: 45px;
								text-align: center;
								display: inline-block;

								border: solid 1px #494747;
							}
						}
					}
				}
			}
		}
	}
</style>