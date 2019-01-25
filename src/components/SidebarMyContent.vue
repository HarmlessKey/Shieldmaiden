<template>
	<div id="sidebar">
		<b-list-group>
			<b-list-group-item>
				<router-link to="/campaigns"><i class="fas fa-dungeon blue"></i><span>Campaigns</span></router-link>
			</b-list-group-item>
			<b-list-group-item>
				<router-link to="/players"><i class="fas fa-users blue"></i><span>Players</span></router-link>
			</b-list-group-item>
			<b-list-group-item>
				<router-link to="/npcs"><i class="fas fa-dragon"></i><span>NPC's</span></router-link>
			</b-list-group-item>
		</b-list-group>
	</div>
</template>

<script>
	export default {
		name: 'Sidebar'
	}
</script>

<style lang="css" scoped>


</style>