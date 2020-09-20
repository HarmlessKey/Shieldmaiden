<template>
	<div>
		<Crumble :name="patron.email" />

		<div v-if="loading" class="loader"> <span>Loading patron....</span></div>

		<h1 class="d-flex justify-content-between">
			{{ patron.full_name }}
			<span>
				<a v-if="!edit" @click="setEdit(true)" class="mx-2">
					<i class="fas fa-pencil-alt"></i>
					<q-tooltip anchor="top middle" self="center middle">
						Edit
					</q-tooltip>
				</a>
				<a v-else @click="setEdit(false)" class="mx-2">
					<i class="fas fa-times"></i>
					<q-tooltip anchor="top middle" self="center middle">
						Cancel
					</q-tooltip>
				</a>
			</span>
		</h1>
		<p><i class="gray-hover">{{ patron['.key'] }}</i></p>

		<template v-if="!edit">
			<b-row class="mb-2">
				<b-col class="col-2">
					Email
				</b-col>
					<b-col>
						{{ patron.email }}
					</b-col>
			</b-row>
		
			<b-row class="mb-2">
				<b-col class="col-2">
					Tiers
				</b-col>
					<b-col>
						<span 
							v-for="(tier, key) in patron.tiers" 
							:key="key"
							class="tiers"
							:class="{
								'blue': tiers[key].name == 'Folk Hero',
								'purple': tiers[key].name == 'Noble',
								'orange': tiers[key].name == 'Deity'
							}">{{ tiers[key].name }}</span>
					</b-col>
			</b-row>

			<b-row class="mb-2">
				<b-col class="col-2">
					Last charge
				</b-col>
				<b-col>
					<span :class="{ 'red': patron.last_charge_status == 'Declined', 'green': patron.last_charge_status == 'Paid' }">{{ patron.last_charge_status }}</span>
					<span class="gray-hover"> ({{ makeDate(patron.last_charge_date) }})</span>
				</b-col>
			</b-row>

			<b-row class="mb-2">
				<b-col class="col-2">
					Lifetime support
				</b-col>
					<b-col>
						{{ patron.lifetime_support  / 100 | numeral('$0,0') }}
					</b-col>
			</b-row>

			<b-row class="mb-2">
				<b-col class="col-2">
					Pledge start
				</b-col>
					<b-col>
						{{ makeDate(patron.pledge_start) }}
					</b-col>
			</b-row>

			<b-row class="mb-2">
				<b-col class="col-2">
					Pledge end
				</b-col>
					<b-col>
						{{ makeDate(patron.pledge_end) }}
					</b-col>
			</b-row>

			

			<a target="_blank" :href="'https://www.patreon.com/user/creators?u='+patron['.key']">Show on Patreon</a>
		</template>
		<EditPatron v-else :editPatron="patron" />
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import Crumble from '@/components/crumble/Compendium.vue'
	import { general } from '@/mixins/general.js'
	import EditPatron from '@/views/Admin/Patrons/New.vue'

	export default {
		name: 'Patron',
		components: {
			Crumble,
			EditPatron
		},
		mixins: [general],
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
					source: db.ref(`new_patrons/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				tiers: {
					source: db.ref(`tiers`),
					asObject: true
				}
			}
		},
		methods: {
			setEdit(value) {
				this.edit = value
			}
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
	.tiers {
		&::after {
			content: ', ';
			color: #b2b2b2;
		}
		&:last-child::after {
			content: '';
		}
	}
</style>