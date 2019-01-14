<template>
	<div id="app" class="container-fluid">
		<div @click="hideSlide()">
			<nav-main/>
			<router-view/>
		</div>
		<transition enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">	
			<div v-if="slide.show == true" class="slide bg-gray">
				<a @click="hideSlide()" class="hide"><i class="fas fa-chevron-circle-right"></i></a>
				<Slide />
			</div>
		</transition>
		
		<vue-snotify></vue-snotify>
	</div>
</template>

<script>
	import Header from './components/Header.vue';
	import Slide from './components/Slide.vue';
	import { mapActions, mapGetters } from 'vuex';

	export default {
	components: {
		navMain: Header,
		Slide: Slide,
	},
	computed: {
		...mapGetters({
				slide: 'getSlide'
			}),
	},
	created() {
		this.setUser();
		// players need prio!
		this.fetchPlayers();
		this.fetchNpcs();
		this.fetchCampaigns();
		this.fetchAllEncounters();
	},
	methods: {
		...mapActions([
			'fetchCampaigns',
			'fetchAllEncounters',
			'fetchPlayers',
			'fetchNpcs',
			'setUser',
			'setSlide',
		]),
		hideSlide() {
			this.setSlide(false)
		},
	}
};
</script>

<style lang="scss" src="./css/styles.scss">

</style>