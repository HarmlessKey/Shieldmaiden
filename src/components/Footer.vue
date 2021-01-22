<template>
	<div class="footer">
		<div class="top">
			<div class="content">
				<div class="row q-col-gutter-md">
					<div class="col-12 col-md-3 logo-container">
						<img class="logo" src="../assets/_img/logo/logo-cyan.svg" alt="Harmless Key logo" />
					</div>

					<div class="col-12 col-md-9 links">
						<div v-if="user">
							<h2 class="gray-light">Your content</h2>
							<ul>
								<li><router-link to="/settings">Settings</router-link></li>
							</ul>
							<h2 class="gray-light">DM</h2>
							<ul>
								<li><router-link to="/campaigns">Campaigns</router-link></li>
								<li><router-link to="/players">Players</router-link></li>
								<li><router-link to="/npcs">NPC's</router-link></li>
								<li><router-link to="/reminders">Reminders</router-link></li>
								<li><router-link to="/items">Items</router-link></li>
							</ul>
							<h2 class="gray-light">Player</h2>
							<ul>
								<li><router-link to="/characters">Characters</router-link></li>
								<li><router-link to="/followed">Following</router-link></li>
							</ul>
						</div>
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
									<a href="https://www.patreon.com/harmlesskey" target="_blank" rel="noopener">Patreon</a>
								</li>
								<li>
									<a href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener">Discord</a>
								</li>
								<li>
									<a href="https://www.instagram.com/harmlesskey" target="_blank" rel="noopener">Instagram</a>
								</li>
								<li>
									<a href="https://twitter.com/KeyHarmless" target="_blank" rel="noopener">Twitter</a>
								</li>
								<li>
									<a href="https://www.facebook.com/harmlesskey" target="_blank" rel="noopener">Facebook</a>
								</li>
								<li>
									<a href="https://www.reddit.com/r/HarmlessKey" target="_blank" rel="noopener">Reddit</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="bottom">
			<div class="content">
				<small class="d-flex justify-content-between mb-3">
					<span>Icons made by Delapouite, Lorc and Skoll. Available on <a target="_blank" rel="noopener" href="https://game-icons.net">https://game-icons.net</a>.</span>
					<router-link to="/privacy-policy">Privacy Policy</router-link>
				</small>
				<small>
					©{{ year }} Harmless Key | All Rights Reserved<br/>
					Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are property of Wizards of the Coast LLC in the U.S.A. and other countries. ©{{ year }} Wizards.<br/>
					All content is provided under terms of the <a href="./SRD-OGL_V5.1.pdf" target="_blank" rel="noopener">Open Gaming License version 1.0a.</a>
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
					justify-content: center;

					div {
						margin: 15px;
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