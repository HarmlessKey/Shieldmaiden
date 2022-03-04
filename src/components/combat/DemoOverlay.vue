<template>
	<div class="demo">
		<transition 
			enter-active-class="animated animate__slideInBottom" 
			leave-active-class="animated animate__slideOutBottom"
		>
			<div class="grid bg-neutral-8" :class="{ hide: !showInfo }">
				<div class="">
					<h3>
						<a class="btn btn-sm bg-neutral-5" @click="reload">
							<i aria-hidden="true" class="far fa-sync-alt"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Reset
							</q-tooltip>
						</a>
						Demo Encounter 
					</h3>
					This demo encounter has all the functionality our encounter tracker has. If you create an account you can make your own encounters and run them just like this, but with your custom content.<br/>
					Create your personal account now and run your D&D encounters smoother than ever.
				</div>
				<div class="create">
					<router-link to="/sign-up" class="btn btn-lg bg-green">Create Account</router-link>
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
	export default {
		name: 'DemoOverlay',
		data () {
			return {
				showInfo: true
			}
		},
		methods: {
			reload() {
				this.$router.go();
			}
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
	

	.grid {
		display: grid;
		grid-template-columns: 1fr max-content;
		grid-template-rows: max-content;
		padding: 20px;
		box-shadow: 0px 0px 15px$black;
		transition: bottom .5s linear;
		grid-gap: 20px;

		&.hide {
			display:none;
		}
		.create {
			align-self: center;
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