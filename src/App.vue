<template>
	<div id="app" class="container-fluid">
		<div @click="">
			<nav-main/>
			<router-view/>
		</div>
		<transition enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">	
			<div v-if="slide.show == true" class="slide">
				<div>
					<a @click="hideSlide()" 
						v-shortkey="['esc']" @shortkey="hideSlide()"
						class="hide" 
						v-b-tooltip:hover title="Hide [esc]">
						<i class="fas fa-chevron-right"></i> <span class="gray-hover ml-2">[esc]</span>
					</a>
					<Slide />
				</div>
			</div>
		</transition>
		
		<vue-snotify></vue-snotify>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import Header from './components/Header.vue';
	import Slide from './components/Slide.vue';
	import { mapActions, mapGetters } from 'vuex';

	export default {
	components: {
		navMain: Header,
		Slide: Slide,
	},
	data() {
		return {
			auth: firebase.auth(),
		}
	},
	computed: {
		...mapGetters({
				slide: 'getSlide'
			}),
	},
	created() {
		if(this.auth.currentUser !== null){
			this.setUser();
			// players need prio!
			this.fetchPlayers();
			this.fetchNpcs();
			this.fetchCampaigns();
			this.fetchAllEncounters();
		}
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