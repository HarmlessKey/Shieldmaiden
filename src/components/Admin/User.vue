<template>
	<div>
		<Crumble :name="user.username" />

		<div v-if="loading" class="loader"> <span>Loading user....</span></div>

		<h1>{{ user.username }}</h1>
		<p><i class="gray-hover">{{ user['.key'] }}</i></p>

		
		<h2>Status</h2>
		<p v-if="status.state">
			<i :class="{ 'green': status.state == 'online', 'gray-hover': status.state == 'offline' }" class="fas fa-circle"></i>
			{{ status.state }}<br/>
			<span v-if="status.state == 'offline'">Last online: {{ makeDate(status.last_changed) }}</span>
		</p>
		<p v-else>Unknown</p>

		<h2>Data</h2>
		<p class="data">
			<span class="type gray-hover">Campaigns: </span> 
			<template v-if="campaigns">{{ Object.keys(campaigns).length }}</template>
			<template v-else>0</template><br/>
			
			<span class="type gray-hover">Encounters: </span>
			<template v-if="encounters">{{ encounter_count }}</template>
			<template v-else>0</template><br/>

			<span class="type gray-hover">Players: </span> 
			<template v-if="players">{{ Object.keys(players).length }}</template>
			<template v-else>0</template><br/>

			<span class="type gray-hover">NPC's: </span> 
			<template v-if="npcs">{{ Object.keys(npcs).length }}</template>
			<template v-else>0</template><br/>
		</p>

		<b-card header="Voucher" class="mt-5">
			<p>Gift user a subscription</p>
		
			<b-row>
				<b-col class="col-3">
					<b-form-group label="Tier">
						<b-select v-model="voucher.id">
							<option v-for="(tier, key) in tiers" :key="key" :value="tier['.key']">{{ tier.name }}</option>
						</b-select>
					</b-form-group>
				</b-col>
				<b-col class="col-3">
					<b-form-group label="Duration">
						<b-radio-group name="duration" v-model="duration">
							<b-form-radio value="date">Till date</b-form-radio><br/>
							<b-form-radio value="infinite">Till cancelled</b-form-radio>
						</b-radio-group>
					</b-form-group>
				</b-col>
				<b-col v-if="duration == 'date'">
					<label>Date</label>
					<b-form-input type="text"
					v-validate="'required'"
					data-vv-as="Date" 
					name="date" 
					placeholder="mm/dd/yyyy"
					v-model="voucher.date"/>
					<p class="validate red" v-if="errors.has('date')">{{ errors.first('date') }}</p>
				</b-col>
			</b-row>
			<b-form-group label="Message">
				<b-form-input type="text" v-model="voucher.message" name="message" placeholder="message" />
			</b-form-group>
			<a class="btn" @click="setVoucher()">Save</a>
		</b-card>

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
				duration: 'date',
			}
		},
		firebase() {
			return {
				user: {
					source: db.ref(`users/${this.id}`),
					asObject: true,
					readyCallback: () => this.loading = false
				},
				status: {
					source: db.ref(`status/${this.id}`),
					asObject: true,
				},
				tiers: db.ref('tiers').orderByChild('order'),
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
			},
			voucher() {
				if (this.user.voucher) {
					return this.user.voucher
				} else {
					return {}
				}
			}
		},
		methods: {
			setVoucher() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						if(this.voucher.id == 'basic') {
							db.ref(`users/${this.id}/voucher`).remove()
						}
						else {
							if(this.duration == 'infinite') {
								delete this.voucher.date
							}
							db.ref(`users/${this.id}/voucher`).set(this.voucher)
						}
						this.$snotify.success('Voucher given.', 'Voucher set!', {
							position: "rightTop"
						});
					}
				});
			},
			makeDate(input) {
				let monthNames = [
					"January", "February", "March",
					"April", "May", "June", "July",
					"August", "September", "October",
					"November", "December"
				];

				let d = new Date(input)
				let hours = (d.getHours() < 10) ? '0'+d.getHours() : d.getHours();
				let minutes = (d.getMinutes() < 10) ? '0'+d.getMinutes() : d.getMinutes();
				let seconds = (d.getSeconds() < 10) ? '0'+d.getSeconds() : d.getSeconds();

				let time = hours + ":" + minutes + ":" + seconds;
				let date = d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
				
				return date + " - " + time;
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