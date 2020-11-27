<template>
	<transition 
		enter-active-class="animated slideInLeft" 
		leave-active-class="animated slideOutLeft"
	>
		<div 
			@click.stop=""
			v-if="(!small_screen && $route.meta.sidebar !== false) || $store.getters.side_small_screen"
			id="sidebar" 
			:class="{
				'side-collapsed': $store.getters.side_collapsed && !small_screen && $route.meta.sidebar !== false,
				'slideIn': $route.meta.sidebar === false
			}">
			<div>
				<template v-if="$store.getters.user">
					<h3>DM Content</h3>
					<q-list @click="setSideSmallScreen(false)">
						<q-item clickable v-ripple to="/campaigns">
							<q-item-section avatar>
								<i class="fas fa-dungeon"></i>
							</q-item-section>
							<q-item-section class="title">Campaigns</q-item-section>
							<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
								Campaigns
							</q-tooltip>
						</q-item>
						<q-item clickable v-ripple to="/players">
							<q-item-section avatar>
								<i class="fas fa-users"></i>
							</q-item-section>
							<q-item-section class="title">Players</q-item-section>
							<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
								Players
							</q-tooltip>
						</q-item>
						<q-item clickable v-ripple to="/npcs">
							<q-item-section avatar>
								<i class="fas fa-dragon"></i>
							</q-item-section>
							<q-item-section class="title">NPC's</q-item-section>
							<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
								NPC's
							</q-tooltip>
						</q-item>
						<q-item clickable v-ripple to="/reminders">
							<q-item-section avatar>
								<i class="fas fa-stopwatch"></i>
							</q-item-section>
							<q-item-section class="title">Reminders</q-item-section>
							<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
								Reminders
							</q-tooltip>
						</q-item>
						<q-item clickable v-ripple to="/items">
							<q-item-section avatar>
								<i class="fas fa-staff"></i>
							</q-item-section>
							<q-item-section class="title">Items</q-item-section>
							<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
								Items
							</q-tooltip>
						</q-item>
					</q-list>
					<hr>
					<h3>Player Content</h3>
					<q-list @click="setSideSmallScreen(false)">
						<q-item clickable v-ripple to="/characters">
							<q-item-section avatar>
								<i class="fas fa-helmet-battle"></i>
							</q-item-section>
							<q-item-section class="title">Characters</q-item-section>
							<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
								Characters
							</q-tooltip>
						</q-item>
						<q-item clickable v-ripple to="/followed">
							<q-item-section avatar>
								<i class="fas fa-user-check"></i>
							</q-item-section>
							<q-item-section class="title">Following</q-item-section>
							<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
								Following
							</q-tooltip>
						</q-item>
					</q-list>
					<hr>
				</template>

				<q-list @click="setSideSmallScreen(false)">
					<q-item clickable v-ripple to="/compendium">
						<q-item-section avatar>
							<i class="fas fa-book-spells"></i>
						</q-item-section>
						<q-item-section class="title">Compendium</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							Compendium
						</q-tooltip>
					</q-item>
					<q-item clickable v-ripple to="/feedback">
						<q-item-section avatar>
							<i class="fas fa-comment-alt"></i>
						</q-item-section>
						<q-item-section class="title">Feedback</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							Feedback
						</q-tooltip>
					</q-item>
					<q-item clickable v-ripple to="/documentation">
						<q-item-section avatar>
							<i class="fas fa-file"></i>
						</q-item-section>
						<q-item-section class="title">Documentation</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							Documentation
						</q-tooltip>
					</q-item>
					<q-item clickable v-ripple to="/about-us">
						<q-item-section avatar>
							<i class="fas fa-user-friends"></i>
						</q-item-section>
						<q-item-section class="title">About us</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							About us
						</q-tooltip>
					</q-item>
				</q-list>
				<hr>
				<h3>Follow us</h3>
				<q-list @click="setSideSmallScreen(false)">
					<q-item clickable v-ripple link tag="a" href="https://www.patreon.com/harmlesskey" target="_blank">
						<q-item-section avatar>
							<i class="fab fa-patreon patreon-red"></i>
						</q-item-section>
						<q-item-section class="title">Patreon</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							Patreon
						</q-tooltip>
					</q-item>
					<q-item clickable v-ripple link tag="a" href="https://discord.gg/fhmKBM7" target="_blank">
						<q-item-section avatar>
							<i class="fab fa-discord"></i>
						</q-item-section>
						<q-item-section class="title">Discord</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							Discord
						</q-tooltip>
					</q-item>
					<q-item clickable v-ripple link tag="a" href="https://www.facebook.com/harmlesskey" target="_blank">
						<q-item-section avatar>
							<i class="fab fa-facebook"></i>
						</q-item-section>
						<q-item-section class="title">Facebook</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							Facebook
						</q-tooltip>
					</q-item>
					<q-item clickable v-ripple link tag="a" href="https://www.reddit.com/r/HarmlessKey" target="_blank">
						<q-item-section avatar>
							<i class="fab fa-reddit-alien"></i>
						</q-item-section>
						<q-item-section class="title">Reddit</q-item-section>
						<q-tooltip v-if=" $store.getters.side_collapsed" anchor="center right" self="center left">
							Reddit
						</q-tooltip>
					</q-item>
				</q-list>
			</div>
			<div id="toggle-width" @click="toggleSideCollapsed()">
				<i class="far fa-angle-left"></i>
			</div>
		</div>
	</transition>
</template>

<script>
	import { mapActions } from 'vuex'

	export default {
		name: 'Sidebar',
		data() {
			return {
				small_screen: window.innerWidth < 600,
				man_col: false,
			}
		},
		methods: {
			...mapActions([
				'toggleSideCollapsed',
				'setSideCollapsed',
				'setSideSmallScreen'
			]),
		},
		mounted() {
			window.onresize = () => {
				let small = 600
				if (window.innerWidth < small) {
					this.small_screen = true;
				}
				if (window.innerWidth >= small){
					this.small_screen = false;
				}
			}
			this.setSideCollapsed();
		}, 
	}
</script>

<style lang="scss">

.hasSide {
	display: grid;
	grid-template-columns: max-content auto;
}

#sidebar {
	width: 250px;
	height: calc(100vh - 50px);
	position: relative;
	padding-top:10px;
	background: #262626;
	transition: width 0.5s linear;
	z-index: 98;
	border-right: 1px solid #302f2f;
	overflow-y: scroll;
	overflow-x: hidden;
	padding-bottom: 40px;

	h3 {
		padding-left: 10px;
		text-transform: uppercase;
		font-size: 13px;
		font-weight: bold;
		margin: 10px 0;
		width: 250px;
		color: #5c5757;
	}
	hr {
		background-color: #302f2f;
	}
	
	.q-list {
		.q-item {
			color: #b2b2b2 !important;
			overflow: hidden;
			width: 250px;
			transition: padding-left 0.5s linear;
			min-height: 40px;

			.q-item__section--avatar {
				min-width: 35px;
			}

			&.q-router-link--active {
				i::before {	
					color: #2c97de !important;
				}
			}
		}
	}
	#toggle-width {
		background: #262626;
		height: 40px;
		width: calc(100%);
		position: fixed;
		right: left;
		bottom: 0;
		padding: 0 20px;
		border-top: 1px solid #302f2f;
		cursor: pointer;
		color: #b2b2b2;
		line-height: 40px;
		font-size: 20px;
		text-align: right;
		width: 250px;
		transition: width 0.5s linear;

		i {
			transition: transform 0.5s linear;
		}
	}
	&.side-collapsed {
		width: 45px;

		h3 {
			display: none;
		}

		.q-item {
			width: 44px;
			padding-left: 12px;
			margin: 0;
			transition: width 0.5s linear;

			.title {
				display:none;
			}
		}

		span {
			display: none;
		}
		#toggle-width {
			width: 45px;
			i {
				transform: rotate(180deg);
			}
		}
		
	}
	&::-webkit-scrollbar {
		display: none;
	}

	&.slideIn {
		position: absolute;

		#toggle-width {
			display: none;
		}
	}
}
.slideInLeft {
	animation-duration: 0.5s !important;
}
.slideOutLeft {
	animation-duration: 0.5s !important;
}
@media only screen and (max-width: 600px) {
	.hasSide {
		grid-template-columns: auto;
	}
	#sidebar {
		position: absolute;

		#toggle-width {
			display: none;
		}
	}
}



</style>