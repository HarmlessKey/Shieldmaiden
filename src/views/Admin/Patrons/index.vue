<template>
	<div class="container-fluid">
		<template v-if="!$route.params.id">
		<Crumble />
		<h1 class="mb-3 d-flex justify-content-between">
			<span>
				<i class="fab fa-patreon"></i> Patrons ( {{ Object.keys(patrons).length }} )
			</span>
			<router-link to="/admin/patrons/new" class="btn" ><i class="fas fa-plus"></i> New</router-link>
		</h1>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-8">

				<div class="table-responsive">
					<hk-table
						:items="patrons"
						:columns="fields"
						:perPage="15"
						:loading="isBusy"
						:search="['full_name', 'email']"
					>
						<!-- EMAIL -->
						<router-link :to="'/admin/patrons/' + data.row['.key']" slot="email" slot-scope="data">{{ data.item }}</router-link>

						<!-- TIER -->
						<span slot="tiers" slot-scope="data">
							<i 
								v-for="(tier, key) in data.item"
								v-if="tiers[key]"
								:key="tier"
								class="fab fa-patreon"
								:class="{
									'blue': tiers[key].name == 'Folk Hero',
									'purple': tiers[key].name == 'Noble',
									'orange': tiers[key].name == 'Deity'
								}"></i>
						</span>

						<!-- END DATE -->"
						<span slot="pledge_end" slot-scope="data">
							<span :class="{'red': new Date(data.item) < new Date() }">
								{{ makeDate(data.item, false, true) }}
							</span>
						</span>

						<!-- STATUS -->
						<span slot="last_charge_status" slot-scope="data">
							<i :class="{'green fas fa-check': data.item == 'Paid', 'red fas fa-times': data.item == 'Declined' }">
							</i>
						</span>

						<!-- LIFETIME SUPPORT -->
						<span slot="lifetime_support" slot-scope="data">
								{{ data.item / 100 | numeral('$0,0') }}
						</span>

						<!-- LOADER -->
						<div slot="table-loading" class="loader">
							<span>Loading patrons....</span>
						</div>
					</hk-table>
				</div>
	
			</div>
			<div class="col-12 col-md-4">
				<Notifications />
			</div>
		</div>
		</template>

		<!-- SHOW Patron -->
		<template v-else>
			<Patron :id="$route.params.id" />
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Patron from '@/components/Admin/Patrons/Patron.vue';
	import Notifications from '@/components/Admin/Patrons/Notifications.vue';
	import { general } from '@/mixins/general.js';

	export default {
		name: 'Patrons',
		components: {
			Crumble,
			Patron,
			Notifications
		},
		mixins: [general],
		metaInfo: {
			title: 'Admin | Patrons'
		},
		data() {
			return {
				id: this.$route.params.id,
				fields: {
					full_name: {
						label: 'Name',
						sortable: true,
						hide: 'md'
					},
					email: {
						label: 'Email',
						truncate: true,
						sortable: true
					},
					pledge_end: {
						label: 'End Date',
						sortable: true
					},
					tiers: {
						label: '<i class="fab fa-patreon"></i>',
						maxContent: true
					},
					last_charge_status: {
						label: '<i class="fas fa-file-invoice-dollar"></i>',
						maxContent: true,
						sortable: true
					},
					lifetime_support: {
						maxContent: true,
						sortable: true
					}
				},
				isBusy: true,
			}
		},
		firebase() {
			return {
				patrons: {
					source: db.ref('new_patrons').orderByChild('email'),
					readyCallback: () => this.isBusy = false
				},
				tiers: {
					source: db.ref('tiers'),
					asObject: true
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
.container-fluid {
	padding: 20px;

	.tiers {
		&::after {
			content: ', ';
			color: $gray-light;
		}
		&:last-child::after {
			content: '';
		}
	}
	.hk-table {
		margin-bottom: 30px;
	}
}

</style>