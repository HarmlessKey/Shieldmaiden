<template>
	<div class="footer">
		<div class="top">
			<div class="d-flex justify-content-between content">
				<b-col md="3" class="logo-container">
					<img class="logo" src="../assets/_img/logo/logo-cyan.svg" />
				</b-col>

				<b-col class="links">
					<div>
						<h2 class="gray-light">Quick Links</h2>
						<ul>
							<li><router-link to="/compendium">Compendium</router-link></li>
							<li><router-link to="/feedback">Feedback</router-link></li>
							<li><router-link to="/planned">Planned</router-link></li>
							<li><router-link to="/updates">Updates</router-link></li>
							<li><router-link to="/documentation">Documentation</router-link></li>
							<li><router-link to="/about-us">About us</router-link></li>
						</ul>
					</div>
					<div>
						<h2 class="gray-light">Follow us</h2>
						<ul>
							<li>
								<a href="https://www.patreon.com/harmlesskey" target="_blank">Patreon</a>
							</li>
							<li>
								<a href="https://discord.gg/fhmKBM7" target="_blank">Discord</a>
							</li>
							<li>
								<a href="https://www.facebook.com/harmlesskey" target="_blank">Facebook</a>
							</li>
							<li>
								<a href="https://www.reddit.com/r/HarmlessKey" target="_blank">Reddit</a>
							</li>
						</ul>
						<!-- <a href="https://www.patreon.com/join/harmlesskey" target="_blank" class="btn bg-patreon-red mb-4"><i class="fab fa-patreon black"></i> Support us</a> -->
					</div>
					<div v-if="user">
						<h2 class="gray-light">Your content</h2>
						<ul>
							<li><router-link to="/settings">Settings</router-link></li>
							<li><router-link to="/campaigns">Campaigns</router-link></li>
							<li><router-link to="/players">Players</router-link></li>
							<li><router-link to="/npcs">NPC's</router-link></li>
						</ul>
					</div>
				</b-col>
			</div>
		</div>

		<div class="bottom">
			<div class="content">
				<small class="d-flex justify-content-between mb-3">
					<span>Icons made by Delapouite, Lorc and Skoll. Available on <a target="_blank" href="https://game-icons.net">https://game-icons.net</a>.</span>
					<router-link to="/privacy-policy">Privacy Policy</router-link>
				</small>
				<small>
					©{{ year }} Harmless Key | All Rights Reserved<br/>
					Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are property of Wizards of the Coast LLC in the U.S.A. and other countries. ©{{ year }} Wizards.<br/>
					All content is provided under terms of the <a href="./SRD-OGL_V5.1.pdf" target="_blank">Open Gaming License version 1.0a.</a>
				</small>
			</div>
		</div>

	</div>
</template>

<script>
	import { auth } from '@/firebase.js'

	export default {
		data() {
			return {
				user: auth.currentUser,
				year: (new Date()).getFullYear(),
			}
		},
		methods: {

		}
	};
</script>

<style lang="scss" scoped>
	.footer {
		background-color: #232323;

		.top {
			padding: 10px 0;

			.logo-container {
				display: flex;
				justify-content: flex-start;
				height: 200px;
				// background: #000;

				.logo {
					width: 250px;
				}
			}
			.links {
				display: flex;
				justify-content: flex-end;

				div {
					margin-left: 50px;

					ul {
						padding: 0;
						list-style: none;

						a {
							font-size: 12px;
							color: #b2b2b2 !important;
							text-transform: uppercase;
						}
					}
				}
			}
			@media (max-width: 766px) {
				.logo-container {
					justify-content: center;
				}
				.links {
					justify-content: space-between;

					div {
						margin: 0;
					}
				}
			}

			h2 {
				font-weight: bold !important;
				font-size: 13px !important;
				color: #494747 !important;
				margin-bottom: 10px;
			}

			
		}
		.bottom {
			background-color: #191919;
		}
	}
</style>