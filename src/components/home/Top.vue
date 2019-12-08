<template>
	<div class="top" :style="{'background-image': 'url(' + require('@/assets/_img/styles/paper-bg.png') + ')'}">
		<img class="logo" src="@/assets/_img/logo/logo-cyan.svg" />
		<div class="container-fluid">
			<div class="container">
				<div class="content-box">
					<div class="text">
						<div class="text-center gray-hover mb-4">Build by 2 guys with a passion for the game.</div>
						<h1>ENCOUNTER TRACKER FOR D&D 5e.</h1>

						<h3>We track everything, so you have the time to give your players the attention they deserve.</h3>

						<p>Harmless Key is an encounter tracker for Dungeons & Dragons 5th Edition.
						We focus on keeping the game on the table by managing everything you need to keep track of during encounters. On top of that we enhance the player experience.</p>

						<a class="btn btn-lg mr-2" href="#general">Learn more</a>
						<router-link to="sign-up" class="btn btn-lg">Create Account</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Top'
	}
</script>

<style lang="scss" scoped>
	.top {
		color: #fff;
 		background-position: center;
		padding: 50px 0;
		min-height: calc(100vh - 100px - 55px);
		background-color: #000;

		.logo {
			display: block;
			margin-left: auto;
			margin-right: auto;
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
					max-width: 750px;
					padding: 25px 20px 50px 20px;
					text-shadow: 2px 2px 1px #000;

					h1 {
						font-family: 'Fredericka the Great', cursive;
						font-size: 35px;
						text-transform: none;
					}
					h3 {
						font-size: 25px;
						line-height: 35px;
						font-style: italic;
						text-transform: none;
					}
					p {
						margin-top: 50px;
					}
					.btn {
						text-shadow: none;
					}
				}
			}
		}
	}
</style>