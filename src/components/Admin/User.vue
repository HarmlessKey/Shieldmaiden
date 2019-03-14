<template>
	<div>
		<Crumble :name="user.username" />

		<div v-if="loading" class="loader"> <span>Loading user....</span></div>

		<h1>{{ user.username }}</h1>
		<p class="mb-5"><i class="gray-hover">{{ user['.key'] }}</i></p>

		<h2>Data</h2>
		<p class="data">
			<span class="type gray-hover">Campaigns: </span> 
			<template v-if="campaigns">{{ Object.keys(campaigns).length }}</template>
			<template v-else>0</template></br>
			
			<span class="type gray-hover">Encounters: </span>
			<template v-if="encounters">{{ encounter_count }}</template>
			<template v-else>0</template></br>

			<span class="type gray-hover">Players: </span> 
			<template v-if="players">{{ Object.keys(players).length }}</template>
			<template v-else>0</template></br>

			<span class="type gray-hover">NPC's: </span> 
			<template v-if="npcs">{{ Object.keys(npcs).length }}</template>
			<template v-else>0</template></br>
		</p>


	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Condition',
		components: {
			Crumble
		},
		props: ['id'],
		metaInfo() {
			return {
				title: 'Admin | ' + this.user.username,
			}
		},
		beforeMount() {
			//Because the component is loaded in another view, 
			//the scroll needs to be reset to 0
			window.scrollTo(0,0);
		},
		data() {
			return {
				loading: true,
			}
		},
		firebase() {
			return {
				user: {
					source: db.ref(`users/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				campaigns: db.ref(`campaigns/${this.id}`),
				encounters: db.ref(`encounters/${this.id}`),
				players: db.ref(`players/${this.id}`),
				npcs: db.ref(`npcs/${this.id}`),
			}
		},
		computed: {
			encounter_count() {
				var count = 0;
				
				for(let cKey in this.campaigns) {
					for(let eKey in this.encounters[cKey]) {
						if(eKey != '.key') { count++ }
					}
				}
				return count
			}
		},
		methods: {
		}
	}
</script>

<style lang="scss" scoped>
	h1, h2 {
		margin-bottom: 5px !important;
	}
	.data {
		line-height: 25px;

		.type {
			display: inline-block;
			width: 150px;
		}
	}
</style>