<template>
	<div class="top">
		<div class="container-fluid">
			<div class="container">
				<img  v-if="!user" class="logo" src="@/assets/_img/logo/logo-cyan.svg" />
				<div v-else class="welcome">
					<b-navbar toggleable="lg" type="dark">
						<b-navbar-brand>
							Welcome
						</b-navbar-brand>
						<b-collapse id="nav-collapse" is-nav>
							<b-navbar-nav class="ml-auto">
								<b-navbar-nav>
									<b-nav-item v-b-tooltip.hover.bottom="'Campaigns'"  to="campaigns"><i class="fas fa-dungeon"></i></b-nav-item>
									<b-nav-item v-b-tooltip.hover.bottom="'Players'" to="players"><i class="fas fa-users"></i></b-nav-item>
									<b-nav-item v-b-tooltip.hover.bottom="'NPC\'s'" to="npcs"><i class="fas fa-dragon"></i></b-nav-item>
									<b-nav-item v-b-tooltip.hover.bottom="'Items'" to="items"><i class="far fa-staff"></i></b-nav-item>
								</b-navbar-nav>	
							</b-navbar-nav>
						</b-collapse>
					</b-navbar>
					<img class="logo" src="@/assets/_img/logo/logo-main-icon-left.svg" />
				</div>
				<div class="content-box">
					<div class="text">
						<div class="text-center gray-hover mb-4">Build by 2 guys with a passion for the game.</div>
						<h1>ENCOUNTER TRACKER FOR D&D 5e.</h1>
						<h3>We track everything in combat, so you have the time to give your players the attention they deserve.</h3>
						
						<div class="button-container">
							<router-link v-if="!user" to="sign-up" class="btn btn-lg">Demo Encounter</router-link>
							<a href="https://discord.gg/fhmKBM7" target="_blank" class="large-link" :class="{'not-logged': !user}">
								<div class="icon bg-discord-purple"><i class="fab fa-discord white"></i></div>
								<div class="text">Join our Discord</div>
							</a>

						</div>
						<!-- PATREON -->
						<div v-if="user">
							<template v-if="tier && tier.name !== 'Free' && !voucher">
									<h2 class="text-center"><i class="patreon-red fas fa-heart"></i> Thanks for your support.</h2>
							</template>
							<a v-else href="https://www.patreon.com/join/harmlesskey" class="patreon-red"><i class="fab fa-patreon"></i> Support us on Patreon</a>
						</div>

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
				'voucher'
			]),
			user() {
				return auth.currentUser
			}
		},
	}
</script>

<style lang="scss" scoped>
	.top {
		background-image: url('../../assets/_img/styles/paper-bg.png');
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
			.navbar {
				margin-bottom: 30px;
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
					}
					.button-container {
						display: flex;
						justify-content: center;
						margin-bottom: 30px;

						.btn {
							text-shadow: none;
						}
						.large-link {
							text-shadow: none;
							box-shadow: 2px 2px 1px #000;
							font-size: 20px;
	
							&.not-logged {
								margin-left: 10px;
								border-radius: 0;
								box-shadow: none;
	
								.icon {
									padding: 1px 16px;
									border-radius: 0;
									font-size: 25px;
								}
								.text {
									padding: 3px 16px;
								}
							}
						}
					}
				}
			}
		}
	}
	@media only screen and (max-width: 550px) { 
	.button-container {
		display: block !important;

		.btn {
			margin-bottom: 20px;
		}
		.large-link {
			margin: auto !important;
		}
	}
}
</style>