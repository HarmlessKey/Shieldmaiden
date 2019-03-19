<template>
	<div class="footer">
		<div class="top container">
			<b-row class="d-flex justify-content-between">
				<b-col>
					<h2>Harmless Key <span class="gray-light">BETA</span></h2>
				</b-col>

				<b-col sm="">
					<h2 class="gray-light">Quick Links</h2>
					<ul>
						<li><router-link to="/compendium">Compendium</router-link></li>
						<li><router-link to="/feedback">Feedback</router-link></li>
						<li><router-link to="/planned">Planned</router-link></li>
						<li><router-link to="/updates">Updates</router-link></li>
						<li><router-link to="/documentation">Documentation</router-link></li>
						<!-- <li><router-link to="/about-us">About us</router-link></li> -->
					</ul>
				</b-col>
				<b-col sm="">
					<h2 class="gray-light">Follow us</h2>
					<ul>
						<li>
							<a href="https://www.facebook.com/harmlesskey" target="_blank" v-b-tooltip.hover title="Facebook" class="icon">Facebook</a>
						</li>
						<li>
							<a href="https://www.reddit.com/r/HarmlessKey" target="_blank" v-b-tooltip.hover title="Reddit" class="icon">Reddit</a>
						</li>
					</ul>
				</b-col>
				<b-col sm="" v-if="user">
					<h2 class="gray-light">Your content</h2>
					<ul>
						<li><router-link to="/settings">Settings</router-link></li>
						<li><router-link to="/campaigns">Campaigns</router-link></li>
						<li><router-link to="/players">Players</router-link></li>
						<li><router-link to="/npcs">NPC's</router-link></li>
					</ul>
				</b-col>
			</b-row>
		</div>

		<div class="bottom">
			<div class="container">
				<small class="d-flex justify-content-between mb-3">
					<span>Icons made by Delapouite, Lorc and Skoll. Available on <a target="_blank" href="https://game-icons.net">https://game-icons.net</a>.</span>
					<router-link to="/privacy-policy">Privacy Policy</router-link>
				</small>
				<small>
					©{{ year }} Harmless Key | All Rights Reserved<br/>
					Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are property of Wizards of the Coast LLC in the U.S.A. and other countries. ©{{ year }} Wizards.</small>
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
		background-color: #494747;

		.top {
			padding: 30px 20px;

			h2 {
				font-weight: bold !important;
				font-size: 20px !important;
				color: #fff !important;
			}

			ul {
				padding: 0;
				list-style: none;

				a {
					font-size: 15px;
					color: #191919 !important;
					text-transform: uppercase;
				}
			}
		}
		.bottom {
			padding: 20px;
			background-color: #302f2f;
		}
	}
</style>