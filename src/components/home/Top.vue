<template>
	<div class="top">
		<div class="container">
			<img class="shieldmaiden" src="../../assets/_img/shieldmaiden.webp" alt="Shieldmaiden" />
			<div class="content">
				<img class="logo" src="../../assets/_img/logo/logo-main-icon-left.svg" alt="Shieldmaiden logo" />
				<div>
					<h1>COMBAT TRACKER FOR D&amp;D 5e.</h1>
					<h2>The perfect companion in your D&D campaign</h2>

					<div class="button-container">
						<template v-if="!$store.getters.user">
							<q-btn to="/demo" color="primary" size="lg" no-caps push>Try demo encounter</q-btn>
							<div><small>
								<em class="neutral-4">No download required</em>
							</small></div>
						</template>
						<router-link v-else to="/content" class="btn btn-lg bg-green">My content</router-link>
					</div>
				</div>
			</div>
		</div>
		<div class="bar">
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Top',
		props: {
			maintenance: [Boolean, String]
		},
	}
</script>

<style lang="scss" scoped>
	.top {
		background-image: url('../../assets/_img/styles/paper-bg.png');
		background-position: top center;
		padding-bottom: 25px;
		background-color: $neutral-11;
		overflow: hidden;
		position: relative;
		
		.bar {
			width: 100%;
			height: 150px;
			position: absolute;
			bottom: 0;
			background-color: $neutral-9;
		}
		.container {
			padding: 50px 20px 0 20px;
			max-width: 1280px;
			display: flex;
			justify-content: start;
			gap: 50px;
			position: relative;
			z-index: 10;
			
			.shieldmaiden {
				width: 450px;
			}
			
			.content {
				padding: 0 0 100px 0;
				
				.logo {
					margin: 0 0 25px -35px;
					width: 400px;
				}
				h1 {
					font-family: $text-written;
					font-size: 40px;
					text-transform: none;
					line-height: normal;
				}
				h2 {
					font-size: 20px;
					font-style: italic;
					font-weight: light;
					text-transform: none;
					line-height: normal;
					margin-bottom: 50px;
				}
				.button-container {
					margin-bottom: 30px;

					.btn {
						text-shadow: none;
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

	@media only screen and (max-width: 1024px) {
		.top {
			.container {
				.shieldmaiden {
					width: 400px;
					margin-left: -35px;
				}
				.content {
					.logo {
						margin-left: -25px;
						width: 300px;
					}
					h1 {
						font-size: 30px;
					}
					h2 {
						font-size: 18px;
					}
				}
			}
		}
	}

	@media only screen and (max-width: 768px) {
		.top {
			.container {
				padding-top: 25px;
				gap: 30px;

				.shieldmaiden {
					width: 350px;
					margin-left: -75px;
				}
				.content {
					.logo {
						width: 300px;
					}
					h1 {
						font-size: 28px;
					}
					h2 {
						font-size: 16px;
					}
				}
			}
		}
	}

	@media only screen and (max-width: 640px) {
		.top {
			.bar {
				top: 180px;
				height: 100%;
			}
			.container {
				padding-top: 30px;
				gap: 20px;
				padding-bottom: 80px;

				.shieldmaiden {
					width: 250px;
					height: 180px;
					position: absolute;
					top: 0;
					left: 0;
					object-fit: cover;
					object-position: top -5px left -30px;
				}
				.content {
					padding-left: 120px;
					position: relative;
					z-index: 50;
					
					.logo {
						width: 200px;
						margin-left: -18px;
						margin-bottom: 10px;
					}
					h1 {
						font-size: 20px;
					}
					h2 {
						display: none;
					}
					.button-container {
						position: absolute;
						left: 0;
						top: 180px;
						width: 100%;
						text-align: center;

						.q-btn {
							width: 100%;
							
							&__content {
								font-size: 12px;
							}
						}
					}
				}
			}
		}
	}
</style>