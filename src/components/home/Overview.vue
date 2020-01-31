<template>
	<div class="overview">
		<div class="container">
			<div class="deck">
					<b-card>
						<img class="card-img" src="@/assets/_img/home/general.png"/>
						<div class="card-header">Combat Tracker</div>
						<b-card-text>
							We track everything in combat you can think of.
						</b-card-text>
						<template slot="footer">
							<a href="#general" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
					<b-card>
						<img class="card-img" src="@/assets/_img/home/builder.png"/>
						<div class="card-header">Encounter Builder</div>
						<b-card-text>
							Quickly create your encounters with ease.
						</b-card-text>
						<template slot="footer">
							<a href="#builder" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
					<b-card>	
						<img class="card-img" src="@/assets/_img/home/share.png"/>
						<div class="card-header">Share Initiative</div>
						<b-card-text>
							Live. On a second screen, or with anyone in the world.
						</b-card-text>
						<template slot="footer">
							<a href="#share" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
					<b-card>
						<img class="card-img" src="@/assets/_img/home/campaign.png"/>
						<div class="card-header">Campaign Manager</div>
						<b-card-text>
							Manage more than just your encounters.
						</b-card-text>
						<template slot="footer">
							<a href="#campaign" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Overview'
	}
</script>

<style lang="scss" scoped>
	.overview {
		padding: 100px 0;
		background-color: #111111;

		.deck {
			display: flex;
			justify-content: space-between;
			margin: -10px;

			.card {
				margin: 10px;
				display: flex;
				flex: 1 1 25%;
				
				.card-body {
					padding: 0;
				}
				.card-text {
					padding: 20px;
				}
				.card-header {
					font-family: 'Fredericka the Great', cursive;
					color: #fff;
				}
				.card-img {
					box-shadow: inset 0 0 10px #000000;
					border-radius: 0;
					border: solid 1px #302f2f;
				}
				.card-footer {
					padding: 0;
				}
			}
		}
		@media only screen and (max-width: 992px) {
			.deck {
				flex-wrap: wrap;

				.card {
					flex-direction: column;
					flex: 1 1 calc(50% - 20px);
				}
			}
		} 
		@media only screen and (max-width: 525px) {
			.deck {
				margin: 0;

				.card {
					margin: 0;
					flex: 1 1 100%;
				}
			}
		} 
	}
</style>