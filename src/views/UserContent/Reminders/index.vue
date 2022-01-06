<template>
	<hk-card v-if="tier">
		<div class="card-header">
			<span>
				Reminders ( 
				<span :class="{ 'green': true, 'red': reminder_count.reminders >= tier.benefits.reminders }">{{ Object.keys(reminders).length }}</span> 
					/ 
					<i v-if="tier.benefits.reminders == 'infinite'" class="far fa-infinity"></i> 
					<template v-else>{{ tier.benefits.reminders }}</template>	
					)
			</span>
			<router-link v-if="!overencumbered" class="btn btn-sm bg-neutral-5" :to="`${$route.path}/add-reminder`">
				<i class="fas fa-plus green"></i> New Reminder
			</router-link>
		</div>
		<div class="card-body">
			<p class="neutral-2">Reminders create useful notifications during encounters, so you don't forget someone was concentrating for instance.</p>
			<!-- <template v-if="reminders"> -->
				<OutOfSlots 
					v-if="reminder_count.reminders >= tier.benefits.reminders"
					type = 'reminders'
				/>

				<q-table
						:data="reminders"
						:columns="columns"
						row-key="key"
						card-class="bg-none"
						flat
						:dark="$store.getters.theme !== 'light'"
						:loading="loading_reminders"
						separator="none"
						:pagination="{ rowsPerPage: 15 }"
						:filter="search"
						wrap-cells
					>
						<template v-slot:body-cell="props">

							<q-td v-if="props.col.name !== 'actions'">
								<div class="truncate-cell">
									<div class="truncate"> 
										<router-link v-if="props.col.name === 'name'" :to="`${$route.path}/${props.key}`">
											{{ props.value }}
										</router-link>
										<template v-else>
											{{ props.value }}
										</template>
									</div>
								</div>
							</q-td>

							<q-td v-else class="text-right d-flex justify-content-between">
								<router-link class="btn btn-sm bg-neutral-5" :to="`${$route.path}/${props.key}`">
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a class="btn btn-sm bg-neutral-5 mx-2" @click="confirmDelete($event, props.key, props.row, props.rowIndex)">
									<i class="fas fa-trash-alt"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Delete
									</q-tooltip>
								</a>
							</q-td>
						</template>
					
					
					</q-table>


				<!-- <hk-table
					:columns="columns"
					:items="reminders"
					:search="['title']"
				>
					<template slot="title" slot-scope="data">
						<router-link class="mx-2" :to="`${$route.path}/${data.row['.key']}`">
							{{ data.item }}
							<q-tooltip anchor="top middle" self="center middle">
								Edit
							</q-tooltip>
						</router-link>
					</template>

					<div slot="actions" slot-scope="data" class="actions">
						<router-link class="btn btn-sm bg-neutral-5 mx-1" :to="`${$route.path}/${data.row['.key']}`">
							<i class="fas fa-pencil"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Edit
							</q-tooltip>
						</router-link>
						<a class="btn btn-sm bg-neutral-5" @click="confirmDelete($event, data.row['.key'], data.row.title)">
							<i class="fas fa-trash-alt"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Delete
							</q-tooltip>
						</a>
					</div>
				</hk-table> -->

				<!-- <template v-if="slotsLeft > 0 && tier.benefits.reminders !== 'infinite'">
					<div 
						class="openSlot"
						v-for="index in slotsLeft"
						:key="'open-slot-' + index"
					>
						<span>Open reminder slot</span>
						<router-link v-if="!overencumbered" :to="`${$route.path}/add-reminder`">
							<i class="fas fa-plus green"></i>
						</router-link>
					</div>
				</template>
				<template v-if="!tier || tier.name === 'Free'">
					<router-link class="openSlot none" to="/patreon">
						Support us on Patreon for more slots.
					</router-link>
				</template>
			</template>
			<router-link v-if="reminders === null && !overencumbered" :to="`${$route.path}/add-reminder`">
				<i class="fas fa-plus green"></i> Create your first reminder
			</router-link> -->
		</div>
	</hk-card>
</template>

<script>
	// import OverEncumbered from '@/components/OverEncumbered.vue';
	import OutOfSlots from '@/components/OutOfSlots.vue';
	import { mapActions, mapGetters } from 'vuex';

	export default {
		name: 'Reminders',
		metaInfo: {
			title: 'Reminders'
		},
		components: {
			// OverEncumbered,
			OutOfSlots
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				loading_reminders: true,
				reminders: [],
				search: "",

				columns: [
					{
						name: "title",
						label: "Title",
						field: "title",
						sortable: true,
						align: "left",
					},
					{
						name: "actions",
						label: "",
						align: "right"
					}
				]
				// columns: {
				// 	title: {
				// 		label: 'Title',
				// 		truncate: true,
				// 		sortable: true,
				// 	},
				// 	actions: {
				// 		label: '<i class="far fa-ellipsis-h"></i>',
				// 		noPadding: true,
				// 		right: true,
				// 		maxContent: true
				// 	}
				// }
			}
		},
		// firebase() {
		// 	return {
		// 		reminders: db.ref(`reminders/${this.userId}`)
		// 	}
		// },
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters('reminders', ['reminder_count']),
			// _reminders: function() {
			// 	return _.chain(this.reminders)
			// 	.filter(function(reminder, key) {
			// 		reminder.key = key
			// 		return reminder
			// 	})
			// 	.orderBy("title", 'asc')
			// 	.value()
			// },
			slotsLeft() {
				return this.tier.benefits.reminders - Object.keys(this.reminders).length
			}
		},
		async mounted() {
			this.reminders = await this.get_reminders();
			this.loading_reminders = false;
		},
		methods: {
			...mapActions("reminders", ["get_reminders", "delete_reminder"]),
			confirmDelete(e, key, reminder, index) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deleteReminder(key, index);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + reminder + '?', 'Delete reminder', {
						timeout: false,
						buttons: [
							{
								text: 'Yes', action: (toast) => { 
								this.deleteReminder(key, index)
								this.$snotify.remove(toast.id); 
								}, 
								bold: false
							},
							{
								text: 'No', action: (toast) => { 
									this.$snotify.remove(toast.id); 
								}, 
								bold: true
							},
						]
					});
				}
			},
			deleteReminder(key, index) {
				//Remove player
				this.reminders.splice(index, 1);
				this.delete_reminder;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		h2 {
			border-bottom: solid 1px $neutral-4;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: $neutral-2 !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
	}
</style>