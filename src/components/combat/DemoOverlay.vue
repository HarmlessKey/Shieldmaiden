<template>
	<div class="demo">
		<div v-if="showInfo" class="banner bg-neutral-8">
			<div class="d-flex items-center justify-content-between mb-3">
				<h3 class="d-flex items-center mb-0 gap-2">
					<a class="btn btn-sm bg-neutral-5" @click="reset_demo()">
						<i aria-hidden="true" class="far fa-sync-alt"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Reset
						</q-tooltip>
					</a>
					Demo Encounter
				</h3>
				<button class="btn btn-clear" @click="showInfo = false">
					<i aria-hidden="true" class="fas fa-times neutral-4" />
				</button>
			</div>
			<div class="content d-flex justify-content-between items-center gap-2">
				<div v-if="!user">
					<p>
						Thanks for trying out our demo encounter!<br/>
						This demo has all the functionality our combat tracker has.
						If you <strong>create an account</strong> you can make your own encounters and run them just like this, but with your custom content.<br/>
					</p>
					<h3>
						Create your personal account now and run your D&D encounters smoother than ever.
					</h3>
				</div>
				<span v-else>
					Now that you've created an account you can start a campaign and run your custom encounters from there.
				</span>
				<div class="button">
					<router-link v-if="!user" to="/sign-up" class="btn btn-lg">Create Account</router-link>
					<router-link v-else to="/content" class="btn btn-lg">Create custom content</router-link>
				</div>
			</div>
		</div>
		<div v-if="!showInfo" class="toggle bg-orange" @click="showInfo = true">
			<i aria-hidden="true" class="fas fa-info" />
		</div>
	</div>
</template>

<script>
	import  { mapActions, mapGetters } from "vuex";

	export default {
		name: 'DemoOverlay',
		data () {
			return {
				showInfo: true
			}
		},
		computed: {
			...mapGetters(["user"]),
		},
		methods: {
			...mapActions(["reset_demo"])
		}
	}
</script>

<style lang="scss" scoped>
.demo {
  pointer-events: none;
	position: fixed;
	margin: 0 15px;
	bottom: 0;
	width: calc(100% - 30px);
	z-index: 999;
	display: flex;
	justify-content: center;
	align-items: center;

	.banner {
    pointer-events: all;
		padding: 25px;
		box-shadow: 0px 0px 15px $black;
		max-width: 800px;

		.content {
			padding: 0;

			.button {
				flex-grow: 1;
				min-width: fit-content;
			}
		}
	}
	.toggle {
		position: fixed;
		bottom: 20px;
		right: 20px;
		height: 50px;
		width: 50px;
		z-index: 97;
		text-align: center;
		transition: right .5s linear;
		display: block;
		cursor: pointer;
		line-height: 50px;
		color:$neutral-1 !important;
		border-radius: 50%;

		i {
				transition: transform .5s linear;
		}
		&.show {
			i {
					transform: rotate(180deg);
			}
		}
	}
}
@media only screen and (max-width: 576px) {
		.demo {
			.banner {
				.content {
					flex-direction: column;
				}
			}
			.toggle {
				bottom: 70px;
				right: 10px;
			}
		}
	}
</style>
