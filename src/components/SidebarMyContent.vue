<template>
	<div id="sidebar" :class="collapsed ? 'side-collapsed' : ''">
		<div>
			<b-list-group>
				<b-list-group-item>
					<router-link to="/campaigns"><i class="fas fa-dungeon"></i><span>Campaigns</span></router-link>
				</b-list-group-item>
				<b-list-group-item>
					<router-link to="/players"><i class="fas fa-users"></i><span>Players</span></router-link>
				</b-list-group-item>
				<b-list-group-item>
					<router-link to="/characters"><i class="fas fa-helmet-battle"></i><span>Characters</span></router-link>
				</b-list-group-item>
				<b-list-group-item>
					<router-link to="/npcs"><i class="fas fa-dragon"></i><span>NPC's</span></router-link>
				</b-list-group-item>
			</b-list-group>
		</div>
		<div id="toggle-width" @click="toggle()">
			<i class="far fa-angle-left"></i>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {
		name: 'Sidebar',
		// computed: {
		// 	...mapActions([
		// 			'setSideCollapsed'
		// 		]),
		// 	...mapGetters([
		// 			'side_collapsed'
		// 		]),
		// },
		data() {
			return {
				collapsed: window.innerWidth < 1200,
				man_col: false,
				man_col_w: 0,
			}
		},
		methods: {
			toggle() {
				this.collapsed = !this.collapsed;
				this.man_col = true;
				this.man_col_w = window.innerWidth;
			}
		},
		mounted() {
			window.onresize = () => {
				let medium = 1200
				if (!this.man_col && window.innerWidth < medium) {
					this.collapsed = true;
				}
				if (!this.man_col && window.innerWidth >= medium){
					this.collapsed = false;
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
	width: 200px;
	height: calc(100vh - 50px);
	position: relative;
	padding-top:10px;
	background: #262626;
	transition: width 0.4s linear;
	
	.list-group-item {
		padding: 0 !important;
		overflow: hidden;

		span { 
			margin-left: 10px;
		}
		a {
			width: 200px;
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
		padding: 0 10px;
		// 8 digit hex code last digits are alpha
		border-top: 1px solid #b2b2b280;
		cursor: pointer;
		color: #b2b2b2;
		line-height: 40px;
		font-size: 20px;
		text-align: right;
	}
	&.side-collapsed {
		width: 30px;

		.list-group-item {
			a {
				padding-left: 6px;
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



</style>