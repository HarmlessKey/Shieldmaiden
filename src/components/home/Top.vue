<template>
	<div class="top" :style="{'background-image': 'url(' + require('@/assets/_img/styles/paper-bg.png') + ')'}">
		<img  v-if="!user" class="logo" src="@/assets/_img/logo/logo-cyan.svg" />
		<div v-else class="welcome">
			<img class="logo" src="@/assets/_img/logo/logo-icon-cyan.svg" />
			<div class="user">
				Welcome<br/>
				{{ userInfo.username }}
			</div>
		</div>
		<div class="container-fluid">
			<div class="container">
				<div class="content-box">
					<div class="text">
						<template v-if="!user">
							<div class="text-center gray-hover mb-4">Build by 2 guys with a passion for the game.</div>
							<h1>ENCOUNTER TRACKER FOR D&D 5e.</h1>

							<h3>We track everything in combat, so you have the time to give your players the attention they deserve.</h3>

							<router-link to="sign-up" class="btn btn-lg">Create Account</router-link>
						</template>
						<template v-else>
							<a href="https://discord.gg/fhmKBM7" target="_blank" class="large-link">
								<div class="icon bg-discord-purple"><i class="fab fa-discord white"></i></div>
								<div class="text">Join our Discord</div>
							</a>
							
							<div class="your-content">
								<h2>Your Content</h2>
								<b-row>
									<b-col>
										Campaigns
									</b-col>
									<b-col>
										Players
									</b-col>
									<b-col>
										NPC's
									</b-col>
									<b-col>
										Items
									</b-col>
								</b-row>
							</div>
						</template>

						<a class="next" href="#general">
							<div>Learn more</div>
							<i class="fas fa-chevron-down"></i>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { auth } from '@/firebase.js';
	import { mapGetters } from 'vuex';

	export default {
		name: 'Top',
		computed: {
			...mapGetters([
				'userInfo',
				'tier',
			]),
			user() {
				return auth.currentUser
			}
		},
	}
</script>

<style lang="scss" scoped>
	.top {
		color: #fff;
 		background-position: center;
		padding: 50px 0 170px 0;
		min-height: calc(100vh - 50px - 55px);
		background-color: #000;

		.logo {
			display: block;
			margin-left: auto;
			margin-right: auto;
			width: 70%;
			max-width: 400px;
			filter: drop-shadow(2px 2px 1px  #000);
		}
		.welcome {
			display: flex;
			justify-content: center;
			user-select: none;
			margin-bottom: 30px;
			font-size: 25px;

			.logo {
				margin: 0 10px 0 0;
				width: 80px;
			}
			.user {
				padding-top: 7px;
			}
		}
		.container-fluid {

			.container {
				padding: 0;

				.content-box {
					text-align: center;
					margin: auto;
					max-width: 800px;
					padding: 25px 20px 20px 20px;
					text-shadow: 2px 2px 1px #000;

					h1 {
						font-family: 'Fredericka the Great', cursive;
						font-size: 40px;
						text-transform: none;
					}
					h3 {
						font-size: 25px;
						line-height: 35px;
						font-style: italic;
						text-transform: none;
						max-width: 700px;
					}
					.btn {
						text-shadow: none;
					}
					.large-link {
						margin: auto;
						text-shadow: none;
						box-shadow: 2px 2px 1px #000;
					}
					.your-content {
						margin-top: 50px;
					}
				}
			}
		}
	}
</style>