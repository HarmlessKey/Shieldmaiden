<template>
	<div class="content" v-if="tier">
		<h1>Your reminders</h1>
		<p>Reminders create useful notifications during encounters, so you don't forget someone was concentrating for instance.</p>

		<OverEncumbered v-if="overencumbered"/>
		<OutOfSlots 
			v-else-if="content_count.reminders >= tier.benefits.reminders"
			type = 'reminders'
		/>
		<template v-if="reminders">
			<h2 class="mt-3 d-flex justify-content-between">
				<span>
					Reminders ( 
					<span :class="{ 'green': true, 'red': content_count.reminders >= tier.benefits.reminders }">{{ Object.keys(reminders).length }}</span> 
						/ 
						<i v-if="tier.benefits.reminders == 'infinite'" class="far fa-infinity"></i> 
						<template v-else>{{ tier.benefits.reminders }}</template>	
						)
				</span>
				<router-link v-if="!overencumbered" to="/reminders/add-reminder">
					<i class="fas fa-plus green"></i> New Reminder
				</router-link>
			</h2>

			<HKtable
				:columns="columns"
				:items="reminders"
				:search="['title']"
			>
				<template slot="title" slot-scope="data">
					<router-link class="mx-2" 
						:to="'/reminders/' + data.row['.key']" 
						v-b-tooltip.hover title="Edit">{{ data.item }}
					</router-link>
				</template>

				<div slot="actions" slot-scope="data" class="actions">
					<router-link class="gray-hover mx-1" 
						:to="'/reminders/' + data.row['.key']" 
						v-b-tooltip.hover title="Edit">
						<i class="fas fa-pencil"></i>
					</router-link>
					<a v-b-tooltip.hover 
						title="Delete" 
						class="gray-hover"
						@click="confirmDelete(data.row['.key'], data.row.title)">
							<i class="fas fa-trash-alt"></i>
					</a>
				</div>
			</HKtable>

			<template v-if="slotsLeft > 0 && tier.benefits.reminders !== 'infinite'">
				<div 
					class="openSlot"
					v-for="index in slotsLeft"
					:key="'open-slot-' + index"
				>
					<span>Open reminder slot</span>
					<router-link v-if="!overencumbered" to="/reminders/add-reminder">
						<i class="fas fa-plus green"></i>
					</router-link>
				</div>
			</template>
			<template v-if="slotsLeft <= 0">
				<div class="openSlot none">
					<span class="red">No reminder slots left. </span>
					Delete reminders to create new space, <router-link to="/patreon">or support us for more slots</router-link>.
				</div>
			</template>
		</template>
		<h3 v-else-if="reminders === null" class="mt-4">
			<router-link v-if="!overencumbered" to="/players/add-player">
				<i class="fas fa-plus green"></i> Create your first reminder
			</router-link>
		</h3>
	</div>
</template>

<script>
	import _ from 'lodash';
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import HKtable from '@/components/hk-components/hk-table.vue';
	import OutOfSlots from '@/components/OutOfSlots.vue';
	import { mapGetters } from 'vuex';
	import { db } from '@/firebase';

	export default {
		name: 'Reminders',
		metaInfo: {
			title: 'Reminders'
		},
		components: {
			OverEncumbered,
			OutOfSlots,
			HKtable
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				columns: {
					title: {
						label: 'Title',
						truncate: true,
						sortable: true,
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
                	}
				}
			}
		},
		firebase() {
			return {
				reminders: db.ref(`reminders/${this.userId}`)
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
				'content_count',
			]),
			_reminders: function() {
				return _.chain(this.reminders)
				.filter(function(reminder, key) {
					reminder.key = key
					return reminder
				})
				.orderBy("title", 'asc')
				.value()
			},
			slotsLeft() {
				return this.tier.benefits.reminders - Object.keys(this.reminders).length
			}
		},
		methods: {
			confirmDelete(key, reminder) {
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
			},
			deleteReminder(key) {
				//Remove player
				db.ref(`reminders/${this.userId}`).child(key).remove(); 
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		h2 {
			border-bottom: solid 1px #b2b2b2;
			padding-bottom: 10px;

			a {
				text-transform: none;
				color: #b2b2b2 !important;

				&:hover {
					text-decoration: none;
				}
			}
		}
		.openSlot {
			display: flex;
			justify-content: space-between;
			padding: 0 10px;
			width: 100%;
			height: 46px;
			line-height: 46px;
			border: dashed 1px #5c5757;
			margin-top: 1px;

			&.none {
				display: block;
				text-align: center;
			}
		}
	}
</style>