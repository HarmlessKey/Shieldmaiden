<template>
	<div class="overview">
		<div class="container">
			<b-card-group deck>
					<b-card 
						header="Combat Tracker"
						img-src="img/multitargeting.d0e1afea.gif"
					>
						<b-card-text>

						</b-card-text>
						<template slot="footer">
							<a href="#general" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
					<b-card 
						header="Encounter Builder"
						img-src="/img/encounter-builder.c4ea98e6.gif"
					>
						<b-card-body>

						</b-card-body>
						<template slot="footer">
							<a href="#builder" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
					<b-card header="Share Initiative">
						<b-card-body>

						</b-card-body>
						<template slot="footer">
							<a href="#share" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
					<b-card header="Campaign Manager">
						<b-card-body>

						</b-card-body>
						<template slot="footer">
							<a href="#campaign" class="btn btn-block">Learn More</a>
						</template>
					</b-card>
			</b-card-group>
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

		.card {
			.card-image {
				border-radius: 0;
			}
			.card-footer {
				padding: 0;
			}
		}
	}
</style>