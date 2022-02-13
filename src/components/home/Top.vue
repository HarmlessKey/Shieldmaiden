<template>
	<div class="top">
		<div class="container-fluid">
			<div class="container">
				<hk-video />
				<div class="content-box">
					<div class="text">
						<h1>COMBAT TRACKER FOR D&amp;D 5e.</h1>
						<h3>The online tool for offline play.</h3>

						<div class="button-container">
							<div v-if="!$store.getters.user">
								<q-btn to="/demo" color="primary" size="xl" no-caps push>Try demo encounter</q-btn>
								<div><small>
									<i class="neutral-4">No download required</i>
								</small></div>
							</div>
							<router-link v-else to="/content" class="btn btn-lg bg-green">My content</router-link>
						</div>
						
						<!-- PATREON -->
						<div>
							<a href="https://www.patreon.com/join/harmlesskey" target="_blank" rel="noopener" class="patreon-red btn btn-lg btn-clear">
								<i class="fab fa-patreon"></i> Support us on Patreon
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import HkVideo from "@/components/hk-components/hk-video";

	export default {
		name: 'Top',
		components: {
			HkVideo
		}
	}
</script>

<style lang="scss" scoped>
	.top {
		background-image: url('../../assets/_img/styles/paper-bg.png');
		background-position: top center;
		padding: 0 0 75px 0;
		min-height: calc(100vh - 50px - 55px);
		background-color: $neutral-11;
		overflow: hidden;

		
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
							color: $neutral-1 !important;
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
							box-shadow: 2px 2px 1px $black;
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

	[data-theme="light"] {
		.top {
			background-image: none;
			background-color: $neutral-9;
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