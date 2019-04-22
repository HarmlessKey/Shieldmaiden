<template>
	<div id="sidebar">
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
		<!-- <el-menu default-active="2" 
			class="el-menu-vertical-demo" 
			background-color="#262626"
      text-color="#b2b2b2"
			@open="handleOpen" 
			@close="handleClose" 
			:collapse="isCollapse">
			<el-menu-item index="3">
				<i class="fas fa-dungeon mr-3"></i>
				<span><router-link to="/campaigns">Campaigns</router-link></span>
			</el-menu-item>
			<el-menu-item index="3">
				<i class="fas fa-users mr-3"></i>
				<span><router-link to="/players">Players</router-link></span>
			</el-menu-item>
			<el-menu-item index="3">
				<i class="fas fa-dragon mr-3"></i>
				<span><router-link to="/npcs">NPC's</router-link></span>
			</el-menu-item>
		</el-menu> -->
	</div>
</template>

<script>
	export default {
		name: 'Sidebar'
	}
</script>

<style lang="css" scoped>


</style>