<template>
	<div class="top">
		<div class="container-fluid">
			<div class="container">
				<img  v-if="!user" class="logo" src="@/assets/_img/logo/logo-cyan.svg" />
				<img v-else class="logo" src="@/assets/_img/logo/logo-main-icon-left.svg" />
				<div class="content-box">
					<div class="text">
						<template v-if="!user">
							<div class="text-center gray-hover mb-4">Built by 2 guys with a passion for the game.</div>
							<h1>ENCOUNTER TRACKER FOR D&D 5e.</h1>
							<h3>We track everything in combat, so you have the time to give your players the attention they deserve.</h3>
						</template>
						<div v-else>
							<div class="menu">
								<router-link v-b-tooltip.hover.bottom="'Campaigns'"  to="campaigns"><i class="fas fa-dungeon"></i></router-link>
								<router-link v-b-tooltip.hover.bottom="'Players'" to="players"><i class="fas fa-users"></i></router-link>
								<router-link v-b-tooltip.hover.bottom="'NPC\'s'" to="npcs"><i class="fas fa-dragon"></i></router-link>
								<router-link v-b-tooltip.hover.bottom="'Reminders'" to="reminders"><i class="fas fa-stopwatch"></i></router-link>
								<router-link v-b-tooltip.hover.bottom="'Items'" to="items"><i class="far fa-staff"></i></router-link>
							</div>
							<div class="share">
								<PlayerLink />
							</div>
						</div>

						<div class="button-container">
							<router-link v-if="!user" to="/demo" class="btn btn-lg">Try Demo Encounter</router-link>
							<a href="https://discord.gg/fhmKBM7" target="_blank" class="large-link" :class="{'not-logged': !user}">
								<div class="icon bg-discord-purple"><i class="fab fa-discord white"></i></div>
								<div class="text">Join our Discord</div>
							</a>

						</div>
						
						<!-- PATREON -->
						<div>
							<!-- <pre>{{ tier }}</pre> -->
							<template v-if="tier && userInfo && userInfo.patron">
									<h4 class="text-center patreon-red"><i class="patreon-red fas fa-heart"></i> Thanks for your '{{ userInfo.patron.tier}}' support.</h4>
							</template>
							<a v-else href="https://www.patreon.com/join/harmlesskey" target="_blank" class="patreon-red"><i class="fab fa-patreon"></i> Support us on Patreon</a>
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
	import PlayerLink from '../PlayerLink';
	import { auth } from '@/firebase.js';
	import { mapGetters } from 'vuex';

	export default {
		name: 'Top',
		components: {
			PlayerLink
		},
		computed: {
			...mapGetters([
				'tier',
				'voucher',
				'userInfo',
			]),
			...mapGetters({
				user: 'getUser'
			})
		}
	}
</script>

<style lang="scss" scoped>
	.top {
		background-image: url('../../assets/_img/styles/paper-bg.png');
		color: #fff;
		background-position: top center;
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
						margin-bottom: 50px !important;
					}
					.menu {
						display: grid;
						justify-content: center;
						grid-template-columns: repeat(5, max-content);
						grid-gap: 20px;
						font-size: 25px;
						margin-top: 20px;

						a {
							color: #fff !important;
						}
					}
					.share {
						text-align: left;
						font-size: 15px;
						margin: 40px 0;
						padding: 20px 0;
						border-top: solid 1px #5c5757;
						border-bottom: solid 1px #5c5757;
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