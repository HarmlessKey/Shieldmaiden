<template>
	<div class="container-fluid">
		<div class="container">
			<img src="@/assets/_img/logo/logo-main-icon-left.svg"/>
			<b-card header="Thanks for trying our demo">
				<b-card-text>
					<h3>We hope you were impressed by the possibilities</h3>
					<p>This is exactly how you can run your custom created encounters in our app. With your own players, and monsters from the SRD or created by you.</p>

					<a @click="reload" v-b-tooltip.hover title="Reset"><i class="far fa-sync-alt"></i> Reset encounter</a>
				</b-card-text>
				<template slot="footer">
					<router-link class="btn btn-block btn-lg bg-green" to="/sign-up">Create Account Now</router-link>
				</template>
			</b-card>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'DemoFinished',
		data() {
			return {
				
			}
		},
		methods: {
			reload() {
				this.$router.go();
			}
		},
		
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		padding: 20px;

		.container {
			max-width: 600px;

			img {
				width: 80%;
				margin: 40px 10%;
			}
			.card {
				.card-footer {
					padding: 0;
				}
			}
		}
	}
</style>
