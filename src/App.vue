<template>
	
	<div id="app" class="container-fluid">
		<nav-main/>
		<router-view/>
		<vue-snotify></vue-snotify>
	</div>

</template>

<script>
	import Header from './components/Header.vue';
	import { mapActions } from 'vuex';

	export default {
	components: {
		navMain: Header
	},
	created() {
		this.setUser();
		this.fetchCampaigns();
		this.fetchPlayers();
	},
	methods: {
		...mapActions([
			'fetchCampaigns',
			'fetchPlayers',
			'setUser',
		])
	}
};
</script>

<style lang="scss" src="./css/styles.scss">

</style>