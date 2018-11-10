<template>
	
	<div id="app" class="container-fluid">
		<nav-main/>
		<router-view/>
		<vue-snotify></vue-snotify>
	</div>

</template>

<script>
	import Header from './components/Header.vue';

	export default {
		components: {
			navMain: Header
		},
		methods: {
			setUser: function() {
				this.$store.dispatch('setUser');
			}
		},
		created() {
		// when the app is created run the set user method
		// this uses Vuex to check if a user is signed in
		// check out mutations in the store.js file
		this.setUser();
	}
};
</script>

<style lang="scss" src="./css/styles.scss">

</style>