<template>
	<div id="app" class="container-fluid">
		<div>
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
						<i class="fas fa-chevron-right"></i> <span class="gray-hover ml-2 d-none d-sm-inline">[esc]</span>
					</a>
					<Slide />
				</div>
			</div>
		</transition>
		
		<vue-snotify></vue-snotify>
	</div>
</template>

<script>
	import { auth } from './firebase'
	import Header from './components/Header.vue';
	import Slide from './components/Slide.vue';
	import { mapActions, mapGetters } from 'vuex';

	export default {
	components: {
		navMain: Header,
		Slide: Slide,
	},
	metaInfo: {
		meta: [
			{ charset: 'utf-8' }
		]
	},
	computed: {
		...mapGetters({
				slide: 'getSlide'
			}),
	},
	created() {
		if(auth.currentUser !== null){
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