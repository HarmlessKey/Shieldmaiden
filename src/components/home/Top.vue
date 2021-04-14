<template>
	<div class="top">
		<div class="container-fluid">
			<div class="container">
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
					<video 
						ref="video" class="animated-video" src="@/assets/_vid/harmless-key-animation-transparent-compressed.webm" 
						:muted="muted" autoplay playsinline alt="Harmless Key logo animation"
					/>
				</div>
				<img v-else class="logo" src="@/assets/_img/logo/logo-cyan.svg" alt="Harmless Key logo" />
				<div class="content-box">
					<div class="text">
						<template>
							<div class="text-center gray-light mb-4">Built by 2 guys with a passion for Dungeons and Dragons.</div>
							<h1>COMBAT TRACKER FOR D&amp;D 5e.</h1>
							<h3>We track everything in encounters, so you have the time to give your players the attention they deserve.</h3>
						</template>

						<div class="button-container">
							<router-link to="/demo" class="btn btn-lg">Try Demo Encounter</router-link>
						</div>
						
						<!-- PATREON -->
						<div>
							<a href="https://www.patreon.com/join/harmlesskey" target="_blank" rel="noopener" class="patreon-red"><i class="fab fa-patreon"></i> Support us on Patreon</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Top',
		data() {
			return {
				play_animation: true,
				muted: true,
				video_hover: false
			}
		},
		methods: {
			replay() {
				const player = this.$refs.video;
				player.currentTime = 0;
				player.play();
			}
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
		color:$white;
		background-position: top center;
		padding: 0 0 75px 0;
		min-height: calc(100vh - 50px - 55px);
		background-color:$black;
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
			filter: drop-shadow(2px 2px 1px $black);
		}
		.container-fluid {

			.container {
				padding: 0;

				.content-box {
					text-align: center;
					margin: auto;
					max-width: 800px;
					padding: 25px 20px 20px 20px;
					text-shadow: 2px 2px 1px$black;

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
							color:$white !important;
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
							box-shadow: 2px 2px 1px$black;
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