<template>
	<div class="demo">
		<transition 
			enter-active-class="animated animate__slideInBottom" 
			leave-active-class="animated animate__slideOutBottom"
		>
			<div class="banner bg-neutral-8" :class="{ hide: !showInfo }">
				<h3>
					<a class="btn btn-sm bg-neutral-5" @click="reset_demo()">
						<i aria-hidden="true" class="far fa-sync-alt"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Reset
						</q-tooltip>
					</a>
					Demo Encounter 
				</h3>
				<div class="d-flex justify-content-between items-center">
					<template v-if="!user">
						This demo encounter has all the functionality our encounter tracker has. 
						If you create an account you can make your own encounters and run them just like this, but with your custom content.<br/>
						Create your personal account now and run your D&D encounters smoother than ever.
					</template>
					<span v-else class="orange">
						Now that you've created an account you can start a campaign and run your custom encounters from there.
					</span>
					<div class="button">
						<router-link v-if="!user" to="/sign-up" class="btn btn-lg bg-green">Create Account</router-link>
						<router-link v-else to="/content" class="btn btn-lg bg-green">Create custom content</router-link>
					</div>
				</div>
			</div>
		</transition>
		<div class="toggle bg-blue" @click="showInfo = !showInfo">
			<i aria-hidden="true" class="fas fa-times" v-if="showInfo"></i>
			<i aria-hidden="true" class="fas fa-chevron-up" v-else></i>
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
	position: fixed;
	margin: 0 15px;
	bottom: 0;
	width: calc(100% - 30px);
	z-index: 999;
	

	.banner {
		padding: 20px;
		box-shadow: 0px 0px 15px $black;
		transition: bottom .5s linear;

		&.hide {
			display:none;
		}
		.d-flex {
			gap: 15px;

			.button {
				min-width: 250px;
			}
		}
	}
	.toggle {
		position: absolute;
		top: -50px;
		right: 5px;
		height: 50px;
		width: 50px;
		z-index: 97;
		text-align: center;
		transition: right .5s linear;
		display: block;
		cursor: pointer;
		line-height: 50px;
		color:$neutral-1 !important;

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
</style>