<template>
	<transition enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft">
		<div 
			v-if="!small_screen || $store.getters.side_small_screen"
			id="sidebar" 
			:class="{
				'side-collapsed': $store.getters.side_collapsed && !small_screen
			}">
			<div>
				<h3>DM Content</h3>
				<b-list-group>
					<b-list-group-item>
						<router-link to="/campaigns"><i class="fas fa-dungeon"></i><span>Campaigns</span></router-link>
					</b-list-group-item>
					<b-list-group-item>
						<router-link to="/players"><i class="fas fa-users"></i><span>Players</span></router-link>
					</b-list-group-item>
					<b-list-group-item>
						<router-link to="/npcs"><i class="fas fa-dragon"></i><span>NPC's</span></router-link>
					</b-list-group-item>
				</b-list-group>
				<hr>
				<h3>Player Content</h3>
				<b-list-group>
					<b-list-group-item>
						<router-link to="/characters"><i class="fas fa-helmet-battle"></i><span>Characters</span></router-link>
					</b-list-group-item>
				</b-list-group>
			</div>
			<div id="toggle-width" @click="setSideCollapsed()">
				<i class="far fa-angle-left"></i>
			</div>
		</div>
	</transition>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

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
				'setSideCollapsed'
			]),
		},
		mounted() {
			window.onresize = () => {
				let small = 600
				if (!this.man_col && window.innerWidth < small) {
					this.small_screen = true;
				}
				if (!this.man_col && window.innerWidth >= small){
					this.small_screen = false;
				}
			}
		}
	}
</script>

<style lang="scss">

#hasSide {
	display: grid;
	grid-template-columns: max-content auto;
}

#sidebar {
	width: 250px;
	height: calc(100vh - 50px);
	position: relative;
	padding-top:10px;
	background: #262626;
	transition: width 0.4s linear;
	z-index: 98;
	border-right: 1px solid #302f2f;

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
	
	.list-group-item {
		padding: 0 !important;
		overflow: hidden;

		span { 
			margin-left: 10px;
		}
		a {
			width: 250px;
			transition: padding-left 0.4s linear;
		}
		a.active {
			i::before {
				color: #2c97de !important;
			}
		}
	}
	#toggle-width {
		height: 40px;
		width: calc(100%);
		position: absolute;
		right: 0;
		bottom: 0;
		padding: 0 20px;
		border-top: 1px solid #302f2f;
		cursor: pointer;
		color: #b2b2b2;
		line-height: 40px;
		font-size: 20px;
		text-align: right;
	}
	&.side-collapsed {
		width: 45px;

		h3 {
			display: none;
		}

		.list-group-item {
			a {
				padding-left: 12px;
				margin-left: 0;
			}
		}

		span {
			display: none;
		}
		#toggle-width i {
			transform: rotate(180deg);
		}
	}
}
@media only screen and (max-width: 600px) {
	#hasSide {
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