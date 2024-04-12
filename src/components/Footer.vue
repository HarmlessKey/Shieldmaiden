<template>
	<div class="footer">
		<div class="top">
			<div class="content">
				<div class="logo-container">
					<img class="logo" src="../assets/_img/logo/logo-cyan.svg" alt="Shieldmaiden logo" />
				</div>

				<div class="links">
					<div>
						<h2 class="neutral-2">Quick Links</h2>
						<ul>
							<li><router-link to="/compendium">Compendium</router-link></li>
							<li><router-link to="/support">Support</router-link></li>
							<li><router-link to="/feedback">Feedback</router-link></li>
							<li><router-link to="/changelog">Changelog</router-link></li>
							<li><router-link to="/documentation">Documentation</router-link></li>
							<li><router-link to="/about-us">About us</router-link></li>
						</ul>
					</div>
					<div>
						<h2 class="neutral-2">Follow us</h2>
						<ul>
							<li>
								<a href="https://www.patreon.com/shieldmaidenapp" target="_blank" rel="noopener"
									>Patreon</a
								>
							</li>
							<li>
								<a href="https://discord.gg/fhmKBM7" target="_blank" rel="noopener">Discord</a>
							</li>
							<li>
								<a href="https://www.instagram.com/shieldmaidenapp" target="_blank" rel="noopener"
									>Instagram</a
								>
							</li>
							<li>
								<a href="https://twitter.com/shieldmaidenapp" target="_blank" rel="noopener">Twitter</a>
							</li>
							<li>
								<a href="https://www.facebook.com/shieldmaidenapp" target="_blank" rel="noopener"
									>Facebook</a
								>
							</li>
						</ul>
					</div>
					<template v-if="user">
						<div>
							<h2 class="neutral-2">DM Content</h2>
							<ul>
								<li><router-link to="/content/campaigns">Campaigns</router-link></li>
								<li><router-link to="/content/players">Players</router-link></li>
								<li><router-link to="/content/npcs">NPC's</router-link></li>
								<li><router-link to="/content/spells">Spells</router-link></li>
								<li><router-link to="/content/reminders">Reminders</router-link></li>
								<li><router-link to="/content/items">Items</router-link></li>
							</ul>
						</div>
						<div>
							<h2 class="neutral-2">Player Content</h2>
							<ul>
								<li><router-link to="/content/characters">Characters</router-link></li>
								<li><router-link to="/content/followed">Following</router-link></li>
							</ul>
							<h2 class="neutral-2">Account</h2>
							<ul>
								<li><router-link to="/profile">Profile</router-link></li>
								<li><router-link to="/settings">Settings</router-link></li>
							</ul>
						</div>
					</template>
					<div>
						<h2 class="neutral-2">Tools</h2>
						<ul>
							<li><router-link to="/tools/combat-tracker">Combat tracker</router-link></li>
							<li><router-link to="/tools/encounter-builder">Encounter builder</router-link></li>
							<li><router-link to="/tools/monster-creator">Monster creator</router-link></li>
							<li><router-link to="/tools/spell-creator">Spell creator</router-link></li>
							<li><router-link to="/tools/character-sync">Character sync</router-link></li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<div class="bottom">
			<div class="content">
				<small class="d-flex justify-content-between mb-3">
					<span
						>Icons made by Delapouite, Lorc and Skoll. Available on
						<a target="_blank" rel="noopener" href="https://game-icons.net"
							>https://game-icons.net</a
						>.</span
					>
					<router-link to="/privacy-policy">Privacy Policy</router-link>
				</small>
				<small>
					©{{ year }} Shieldmaiden | All Rights Reserved<br />
					Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are
					property of Wizards of the Coast LLC in the U.S.A. and other countries. ©{{
						year
					}}
					Wizards.<br />
					All content is provided under terms of the
					<a
						href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf"
						target="_blank"
						rel="noopener"
						>Open Gaming License version 1.0a.</a
					>
				</small>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			user: this.$store.getters.user,
			year: new Date().getFullYear(),
		};
	},
	methods: {},
};
</script>

<style lang="scss" scoped>
.footer {
	background-color: $neutral-9;

	.top {
		.content {
			padding-top: 30px;
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;

			.logo-container {
				display: flex;
				justify-content: flex-start;
				height: 200px;

				.logo {
					margin-top: -40px;
					width: 250px;
				}
			}
		}
		.links {
			display: flex;
			justify-content: flex-start;
			flex-wrap: wrap;
			column-gap: 25px;
			max-width: 450px;

			> div {
				width: max-content;

				&:last-child {
					padding: 0;
				}

				ul {
					padding: 0;
					list-style: none;

					a {
						font-size: 12px;
						color: $neutral-3;
						text-transform: uppercase;

						&:hover {
							color: $neutral-1;
						}
						&.active {
							font-weight: bold;
							color: $neutral-1;
						}
					}
				}
			}
		}

		h2 {
			font-weight: bold !important;
			font-size: 13px !important;
			line-height: 25px;
			margin-bottom: 10px;
		}
	}
	.bottom {
		background-color: $neutral-10;
	}
}
@media (max-width: 772px) {
	.footer .top .content {
		justify-content: center;

		.links {
			justify-content: center;
			text-align: center;

			> div {
				padding: 0 10px;
			}
		}
	}
}
</style>
