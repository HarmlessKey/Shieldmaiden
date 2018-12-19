<template>
	<div id="sidebar">
		<ul>
			<li>
				<router-link to="/campaigns"><i class="fas fa-dungeon blue"></i><span>Campaigns</span></router-link>
			</li>
			<li>
				<router-link to="/players"><i class="fas fa-users blue"></i><span>Players</span></router-link>
			</li>
			<li>
				<router-link to="/npcs"><i class="fas fa-dragon"></i><span>NPC's</span></router-link>
			</li>
		</ul>
	</div>
</template>

<script>
	export default {
		name: 'Sidebar'
	}
</script>

<style lang="css" scoped>


</style>