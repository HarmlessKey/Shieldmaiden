<template>
	<hk-card v-if="tier">
		<ContentHeader type="reminders" />
		<div class="card-body" v-if="!loading_reminders">
			<p class="neutral-2">
				Reminders create useful notifications during encounters, 
				so you don't forget someone was concentrating for instance.
			</p>

			<template v-if="reminders.length">
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
								<i aria-hidden="true" class="fas fa-pencil"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Edit
								</q-tooltip>
							</router-link>
							<a class="btn btn-sm bg-neutral-5 ml-2" @click="confirmDelete($event, props.key, props.row)">
								<i aria-hidden="true" class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Delete
								</q-tooltip>
							</a>
						</q-td>
					</template>
					<div slot="no-data" />
				</q-table>
			</template>

			<router-link v-if="!reminders.length && !overencumbered" class="btn btn-lg bg-neutral-5" :to="`${$route.path}/add-reminder`">
				<i aria-hidden="true" class="fas fa-plus green"></i> Create your first reminder
			</router-link>
			<router-link v-else-if="tier.name === 'Free'" class="btn bg-neutral-8 btn-block" to="/patreon">
				Get more reminder slots
			</router-link>
		</div>
		<hk-loader v-else name="reminders" />
	</hk-card>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import ContentHeader from "@/components/userContent/ContentHeader";

	export default {
		name: 'Reminders',
		components: {
			ContentHeader
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				loading_reminders: true,
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
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters("reminders", ["reminders"])
		},
		async mounted() {
			await this.get_reminders();
			this.loading_reminders = false;
		},
		methods: {
			...mapActions("reminders", ["get_reminders", "delete_reminder"]),
			confirmDelete(e, key, reminder) {
				//Instantly delete when shift is held
				if(e.shiftKey) {
					this.deleteReminder(key);
				} else {
					this.$snotify.error('Are you sure you want to delete ' + reminder + '?', 'Delete reminder', {
						timeout: false,
						buttons: [
							{
								text: 'Yes', action: (toast) => { 
								this.deleteReminder(key)
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
			deleteReminder(key) {
				this.delete_reminder(key);
			}
		}
	}
</script>