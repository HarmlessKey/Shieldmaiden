<template>
	<div class="campaign">
		<div class="container">
			<div class="head">
				<h2>Dungeons & Dragons Campaign Manager</h2>
				<span>
					Our tool started out as a combat tracker, but it has been and still is growing. Over time we became more, but if you just want to run your encounters, we are still perfect for that.
				</span>
			</div>

			<b-row>
				<b-col sm="6">
					<img class="image" src="@/assets/_img/campaign-manager-harmless-key.png"/>
				</b-col>
				<b-col>
					<h3>More than an encounter tool,<br/> if you want it to be.</h3>
					
					<ul>
						<li>Keep track of player status outside combat</li>
						<li>Track party loot</li>
						<li>Track party currency</li>
						<li>Track player experience points</li>
					</ul>

					<router-link to="sign-up" class="btn btn-lg">Start a campaign</router-link>
				</b-col>
			</b-row>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'General'
	}
</script>

<style lang="scss" scoped>
	.campaign {
		padding-bottom: 50px;
		min-height: calc(100vh - 50px - 55px);
		background-color: #191919;

		ul {
			margin-bottom: 30px;
		}
		img {
			width: 100%;
			margin-bottom: 30px;
		}
	}
</style>