<template>
	<div>
		<div id="reminders" class="container-fluid" v-if="tier">
			<h1>Your custom reminders</h1>
			<p>These reminders can quicly be used during an encounter.</p>

			<OverEncumbered v-if="overencumbered"/>
			<OutOfSlots 
				v-else-if="content_count.reminders >= tier.benefits.reminders"
				type = 'reminders'
			/>
			<router-link v-else to="/reminders/add-reminder" 
				class="btn btn-block mb-3"
				v-b-modal.addModal>
				<i class="fas fa-plus-square"></i> Add reminder
			</router-link>

			<template v-if="reminders">
				<h2 class="mt-3">Reminders ( 
					<span :class="{ 'green': true, 'red': content_count.reminders >= tier.benefits.reminders }">{{ Object.keys(reminders).length }}</span> 
						/ 
						<i v-if="tier.benefits.reminders == 'infinite'" class="far fa-infinity"></i> 
						<template v-else>{{ tier.benefits.reminders }}</template>	
						)</h2>
				<table class="table mb-5">
					<thead>
						<th></th>
						<th class="n">#</th>
						<th>Title</th>
						<th>Color</th>
						<th class="text-right"><i class="far fa-ellipsis-h"></i></th>
					</thead>
					<tbody name="table-row" 
						is="transition-group"
						enter-active-class="animated flash"
						leave-active-class="animated bounceOutLeft">
						<tr v-for="(reminder, index) in _reminders" :key="reminder.key">
							<td class="n">{{ index + 1 }}</td>
							<td>
								<router-link class="mx-2" 
									:to="'/reminders/' + reminder.key" 
									v-b-tooltip.hover title="Edit">{{ reminder.title }}
								</router-link>
							</td>
							<td class="d-none d-md-table-cell">{{ reminder.title }}</td>
							<td>
								<div class="d-flex justify-content-end">
									<div class="d-flex justify-content-end actions">
										<router-link class="gray-hover mx-1" 
											:to="'/reminders/' + reminder.key" 
											v-b-tooltip.hover title="Edit">
											<i class="fas fa-pencil"></i>
										</router-link>
										<a v-b-tooltip.hover 
											title="Delete" 
											class="gray-hover"
											@click="confirmDelete(reminder.key, reminder.title)">
												<i class="fas fa-trash-alt"></i>
										</a>
									</div>
									<i class="far fa-ellipsis-v ml-3 d-inline d-sm-none"></i>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</template>
			<h2 v-else-if="reminders === null" class="mt-4 px-2 d-flex justify-content-between">
				<i class="fas fa-arrow-up gray-hover"></i> 
				Add your first reminder
				<i class="fas fa-arrow-up gray-hover"></i>
			</h2>
			<div v-else class="loader"><span>Loading Reminders...</span></div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import OverEncumbered from '@/components/OverEncumbered.vue'
	import OutOfSlots from '@/components/OutOfSlots.vue'
	import { mapGetters } from 'vuex'
	import { db } from '@/firebase'

	export default {
		name: 'Players',
		metaInfo: {
			title: 'Players'
		},
		components: {
			OverEncumbered,
			OutOfSlots,
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
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
				'players',
				'campaigns',
				'allEncounters',
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
		},
		methods: {


		}
	}
</script>

<style lang="css" scoped>
	.container-fluid {
		padding: 20px;
	}
	.col {
		margin:10px;
		padding:10px;
		margin-bottom:10px;
		display: grid;
		grid-template-rows: auto;
		grid-template-columns:70px 1fr 10px;
		grid-gap: 10px;
		grid-template-areas: 
		"img info delete";
	}
	.info h3, .info p {
		margin-bottom:5px !important;
	}
	.info {
		grid-area: info;
	}
</style>