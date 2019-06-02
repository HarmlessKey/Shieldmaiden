<template>
	<div>
		<Crumble :name="patron.email" />

		<div v-if="loading" class="loader"> <span>Loading patron....</span></div>

		<h1 class="d-flex justify-content-between">
			{{ patron.email }}
			<span>
				<a v-if="!edit" @click="setEdit(true)" v-b-tooltip.hover title="Edit" class="mx-2"><i class="fas fa-pencil-alt"></i></a>
				<a v-else @click="setEdit(false)" v-b-tooltip.hover title="Cancel" class="mx-2"><i class="fas fa-times"></i></a>
			</span>
		</h1>
		<p><i class="gray-hover">{{ patron['.key'] }}</i></p>

		<template v-if="!edit">
			<h2>Tier</h2>
			<p>{{ patron.tier_title }}</p>

			<h2>Status</h2>
			<p>
				<span :class="{ 'red': patron.status != 'active_patron', 'green': patron.status == 'active_patron' }">{{ patron.status }}</span>
			</p>

			<a target="_blank" :href="'https://www.patreon.com/user/creators?u='+patron['.key']">Show on Patreon</a>
		</template>
		<EditPatron v-else :editPatron="patron" />
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import EditPatron from '@/views/Admin/Patrons/New.vue'

	export default {
		name: 'Patron',
		components: {
			Crumble,
			EditPatron
		},
		props: ['id'],
		metaInfo() {
			return {
				title: 'Patron | ' + this.patron.email,
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
				edit: false
			}
		},
		firebase() {
			return {
				patron: {
					source: db.ref(`patrons/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
			}
		},
		methods: {
			setEdit(value) {
				this.edit = value
			},
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