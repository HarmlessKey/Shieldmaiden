<template>
<div class="grid">
	<div class="container">
		<div class="die">
			<img src="../assets/_img/logo/logo-icon-no-shield-red.svg" alt="Harmless Key logo icon" />
			<span>404</span>
		</div>
		<div class="content">
			<h1 class="red">Natural 404</h1>
			<h2>Page not found</h2>
			<p class="mb-5">
				Ouch, that was a terrible perception check.<br/>
				Maybe we can help you find what you're looking for.
			</p>

			<div class="row q-col-gutter-md">
				<div class="col-6" v-if="user">
					<h3>Your content</h3>
					<ul>
						<li><router-link to="/settings">Settings</router-link></li>
					</ul>
					<h3>DM</h3>
					<ul>
						<li><router-link to="/campaigns">Campaigns</router-link></li>
						<li><router-link to="/players">Players</router-link></li>
						<li><router-link to="/npcs">NPC's</router-link></li>
						<li><router-link to="/reminders">Reminders</router-link></li>
						<li><router-link to="/items">Items</router-link></li>
					</ul>
					<h3>Player</h3>
					<ul>
						<li><router-link to="/characters">Characters</router-link></li>
						<li><router-link to="/followed">Following</router-link></li>
					</ul>
				</div>
				<div class="col">
					<h3>Quick Links</h3>
					<ul>
						<li><router-link to="/compendium">Compendium</router-link></li>
						<li><router-link to="/feedback">Feedback</router-link></li>
						<li><router-link to="/planned">Planned</router-link></li>
						<li><router-link to="/updates">Updates</router-link></li>
						<li><router-link to="/documentation">Documentation</router-link></li>
						<li><router-link to="/about-us">About us</router-link></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<Footer />
</div>
</template>

<script>
	import Footer from '@/components/Footer.vue';
	import { auth } from '@/firebase.js';

	export default {
		name: 'Error',
		components: {
			Footer,
		},
		data() {
			return {
				user: auth.currentUser,
			}
		},
	}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=Baloo+Bhaina');
	.grid {
		.container {
			padding: 100px 0;
			display: flex;
			justify-content: center;

			h1 {
				font-size: 40px !important;
			}
			h2 {
				margin-bottom: 10px !important;
				font-style: italic;
			}
			h3 {
				margin-bottom:5px;
				color: $neutral-3 !important;
				font-weight: bold;
			}
			.die {
				position: relative;
				padding-right: 50px;
				user-select: none;

				img {
					width: 250px;
					height: 250px;
					filter: drop-shadow(5px 5px 3px $black);
				}

				span {
					font-family: 'Baloo Bhaina', cursive;
					text-shadow: 1px 1px #FFCFE3, -1px -1px #D42758;
					text-align: center;
					position: absolute;
					color: #FF517B;
					font-size: 30px;
					width: 250px;
					top: 105px;
					left: 0;
				}
			}
			.content {
				padding-top: 35px;
			}

			ul {
				list-style: none;
				padding: 0;
				margin: 0 0 20px 0;

				li {
					margin-bottom: 3px;
					a {
						color: $neutral-3;

						&:hover {
							color: $neutral-1;
						}
					}
				}
			}
		}
	}
	@media only screen and (max-width: 980px) {
		.grid {
			.container {
				padding-top: 50px;
				.die {
					display: none;
				}
			}
		}
	}
</style>