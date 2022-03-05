<template>
	<div class="container-fluid">
		<div class="container">
			<img src="@/assets/_img/logo/logo-main-icon-left.svg"/>
			<hk-card header="Thanks for trying our demo">
				<div class="card-body">
					<h3>We hope you were impressed by the possibilities</h3>
					<p>This is exactly how you can run your custom created encounters in our app. With your own players, and monsters from the SRD or created by you.</p>
					<a @click="reload" class="btn bg-neutral-5">
						<i aria-hidden="true" class="far fa-sync-alt"></i> Reset encounter
						<q-tooltip anchor="top middle" self="center middle">
							Reset
						</q-tooltip>
					</a>
				</div>
		
				<template slot="footer">
					<router-link class="btn btn-square btn-block btn-lg bg-green" to="/sign-up">Create Account Now</router-link>
				</template>
			</hk-card>
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
