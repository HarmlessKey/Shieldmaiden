<template>
	<div class="top">
		<div class="container-fluid">
			<div class="container">
				<!-- <img  v-if="!userInfo" class="logo" src="@/assets/_img/logo/logo-cyan.svg" /> -->
				<div v-if="play_animation"
					@click="replay()"
					@mouseover="video_hover = true" 
					@mouseleave="video_hover = false"
				>
					<div class="video-controls" v-if="video_hover">
						<span>
							<i @click.stop="muted = !muted" class="fas" :class="muted ? 'fa-volume-slash' : 'fa-volume-up'"></i>
							<q-tooltip anchor="bottom middle" self="center middle">
								Mute
							</q-tooltip>
						</span>
						<span>
							<i @click="replay()" class="fas fa-redo-alt"></i>
							<q-tooltip anchor="bottom middle" self="center middle">
								Replay
							</q-tooltip>
						</span>
					</div>
					<video ref="video" class="animated-video" src="@/assets/_vid/harmless-key-animation-transparent-compressed.webm" 
						:muted="muted" autoplay playsinline
					></video>
				</div>
				<img v-else class="logo" src="@/assets/_img/logo/logo-cyan.svg" />
				<div class="content-box">
					<div class="text">
						<template v-if="!userInfo">
							<div class="text-center gray-light mb-4">Built by 2 guys with a passion for the game.</div>
							<h1>COMBAT TRACKER FOR D&D 5e.</h1>
							<h3>We track everything in encounters, so you have the time to give your players the attention they deserve.</h3>
						</template>
						<div v-else class="mt-3">
							<q-tabs
								dark
								no-caps
							>
								<q-route-tab 
									v-for="({name, icon, label}, index) in tabs"
									:key="`tab-${index}`" 
									:to="`/${name}`" 
									:icon="icon"
									:label="label"
								/>
							</q-tabs>
							<div class="share">
								<h2>Share your encounters</h2>
								<q-input
									dark filled square
									:value="copy"
									autocomplete="off"
									type="text"
									hint="With this link your players can track the initiative list of you active encounter"
								>
									<span slot="prepend" class="blue pointer" @click="setSlide({show: true, type: 'PlayerLink'})">
										<q-icon  size="xs"  name="fas fa-qrcode" />
										<q-tooltip anchor="top middle" self="center middle">
											Show QR-code
										</q-tooltip>
									</span>
									<q-icon slot="append" size="xs" class="blue pointer" @click="copyLink()" name="fas fa-copy">
										<q-tooltip anchor="top middle" self="center middle">
											Click to copy
										</q-tooltip>
									</q-icon>
								</q-input>
								<input :value="copy" id="copy" type="hidden" />
							</div>
						</div>

						<div class="button-container">
							<router-link v-if="!userInfo" to="/demo" class="btn btn-lg">Try Demo Encounter</router-link>
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
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'Top',
		components: {
			PlayerLink
		},
		data() {
			return {
				play_animation: true,
				muted: true,
				video_hover: false,
				copy: window.origin + '/user/' + this.$store.getters.user.uid,
				tabs: [
					{
						name: "campaigns",
						label: "Campaigns",
						icon: "fas fa-dungeon"
					},
					{
						name: "players",
						label: "players",
						icon: "fas fa-users"
					},
					{
						name: "npcs",
						label: "NPC's",
						icon: "fas fa-dragon"
					}
				]
			}
		},
		computed: {
			...mapGetters([
				'user',
				'tier',
				'voucher',
				'userInfo',
			]),
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			replay() {
				const player = this.$refs.video;
				player.currentTime = 0;
				player.play();
			},
			copyLink() {

				let toCopy = document.querySelector('#copy')
				toCopy.setAttribute('type', 'text') //hidden
				toCopy.select()

				try {
					var successful = document.execCommand('copy');
					var msg = successful ? 'Successful' : 'Unsuccessful';

					this.$snotify.success(msg, 'Link Copied!', {
						position: "rightTop"
					});
				} catch (err) {
					alert('Something went wrong, unable to copy');
				}

				/* unselect the range */
				toCopy.setAttribute('type', 'hidden')
				window.getSelection().removeAllRanges()
			},
		},
		mounted() {
			const navigator = window.navigator;
			const ua = navigator.userAgent.toLowerCase()
			const hasMediaCapabilities = !!(navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo)
			const isSafari = ((ua.indexOf('safari') != -1) && (!(ua.indexOf('chrome')!= -1) && (ua.indexOf('version/')!= -1)))
			this.play_animation = !(isSafari && hasMediaCapabilities);
		}
	}
</script>

<style lang="scss" scoped>
	.top {
		background-image: url('../../assets/_img/styles/paper-bg.png');
		color: #fff;
		background-position: top center;
		padding: 0 0 170px 0;
		min-height: calc(100vh - 50px - 55px);
		background-color: #000;
		overflow: hidden;

		.animated-video {
			width: 100%;
			margin: -8% 0 -15%;
			pointer-events: none;
		}
		.video-controls {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			margin-top: 20px;
			z-index: 10;
			opacity: .3;
			
			i {
				padding: 5px;
				cursor: pointer;
			}
		}

		.logo {
			display: block;
			margin-left: auto;
			margin-right: auto;
			padding-top: 50px;
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
					h4 {
						font-size: 15px; 
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
						h2 {
							font-family: 'Fredericka the Great', cursive;
							text-align: center;
							font-size: 25px;
						}
						text-align: left;
						font-size: 15px;
						margin: 40px 0;
					}
					.button-container {
						display: flex;
						justify-content: center;
						margin-bottom: 30px;

						.btn {
							text-shadow: none;

							&.btn-lg {
								padding: 0.5rem 1rem;
								font-size: 1.50rem;
								line-height: 2;
							}
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
	@media only screen and (max-width: 767px) {
		.top {
			.animated-video {
					width: 150%;
					margin: -14% 0 -20% -25%;
					pointer-events: none;
				}
		}
	}
	@media only screen and (max-width: 567px) {
		.top {
			.button-container {
				display: block !important;

				.btn {
					margin-bottom: 20px;
				}
				.large-link {
					margin: auto !important;
				}
			}
			.video-controls {
				width: 100%;
				padding: 0 10px;
				font-size: 20px;
				display: flex;
				justify-content: space-between;
			}
			.animated-video {
				width: 170%;
				margin: -14% 0 -20% -35%;
				pointer-events: none;
			}
			.container-fluid {
				.container {
					.content-box {
						h1 {
							font-size: 30px;
						}
						h3 {
							font-size: 20px !important;
						}
					}
				}
			}
		}
	}
</style>