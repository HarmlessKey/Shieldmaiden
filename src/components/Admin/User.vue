<template>
	<div v-if="!loading">
		<Crumble :name="user.username" />

		<div class="container">
			<b-row>
				<b-col md="4">
					<h1>{{ user.username }}</h1>
					<p><i class="gray-hover">{{ id }}</i></p>
				</b-col>
				<b-col md="4">
					<h2>Status</h2>
					<p v-if="status.state">
						<i :class="{ 'green': status.state == 'online', 'gray-hover': status.state == 'offline' }" class="fas fa-circle"></i>
						{{ status.state }}<br/>
						<span v-if="status.state == 'offline'">Last online: {{ makeDate(status.last_changed) }}</span>
					</p>
					<p v-else>Unknown</p>
				</b-col>
				<b-col md="4">
					<h2>Broadcasting</h2>
					<p> 
						<router-link :to="'/user/' + id">
							<div class="live" :class="{ 'active': broadcast.live }">Live</div>
						</router-link>
					</p>
				</b-col>
			</b-row>

			<hr>

			<hk-card-deck>
				<hk-card header="DM Data">
					<p class="data">
						<span class="type">Campaigns: </span> 
						<template v-if="campaigns">{{ Object.keys(campaigns).length }}</template>
						<template v-else>0</template><br/>
						
						<span class="type">Encounters: </span>
						<template v-if="encounters">{{ encounter_count }}</template>
						<template v-else>0</template><br/>

						<span class="type">Players: </span> 
						<template v-if="players">{{ Object.keys(players).length }}</template>
						<template v-else>0</template><br/>

						<span class="type">NPC's: </span> 
						<template v-if="npcs">{{ Object.keys(npcs).length }}</template>
						<template v-else>0</template><br/>
					</p>
				</hk-card>
				<hk-card header="Following">
					<ul class="entities">
						<li v-for="(followed, key) in user.followed" :key="key">
							{{ followed }}
						</li>
					</ul>
				</hk-card>
				<hk-card header="Player Characters">
					<ul class="entities" v-if="!loading_characters">
						<li v-for="(character, key) in characters" :key="key">
							{{ character.character_name }}
						</li>
					</ul>
					<div v-else class="loader"> <span>Loading characters....</span></div>
				</hk-card>
			</hk-card-deck>

			<hk-card header="Voucher">
				<h3>Gift user a subscription</h3>
			
				<b-row class="mb-3">
					<label class="col-md-2">Tier</label>
					<b-col md="3">
						<b-select v-model="voucher.id">
							<option v-for="(tier, key) in tiers" :key="key" :value="tier['.key']">{{ tier.name }}</option>
						</b-select>
					</b-col>
				</b-row>
				<b-row class="mb-3">
					<label class="col-md-2">Duration</label>
					<b-col md="3">
						<b-radio-group name="duration" v-model="duration">
							<b-form-radio value="date">Till date</b-form-radio><br/>
							<b-form-radio value="infinite">Till cancelled</b-form-radio>
						</b-radio-group>
					</b-col>
				</b-row>
				<b-row class="mb-3">
					<label class="col-md-2">Date</label>
					<b-col md="3" v-if="duration == 'date'">
						<b-form-input type="text"
						v-validate="'required'"
						data-vv-as="Date" 
						name="date" 
						placeholder="mm/dd/yyyy"
						v-model="voucher.date"/>
						<p class="validate red" v-if="errors.has('date')">{{ errors.first('date') }}</p>
					</b-col>
				</b-row>
				<b-row class="mb-3">
					<label class="col-md-2">Message</label>
					<b-col>
						<b-form-textarea rows="3" v-model="voucher.message" name="message" placeholder="message" />
					</b-col>
				</b-row>
				<a class="btn" @click="setVoucher()">Save</a>
			</hk-card>
		</div>
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
				title: 'Admin',
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
				loading_characters: true,
				duration: 'date',
				characters: {},
				user: undefined
			}
		},
		firebase() {
			return {
				status: {
					source: db.ref(`status/${this.id}`),
					asObject: true,
				},
				broadcast: {
					source: db.ref(`broadcast/${this.id}`),
					asObject: true
				},
				tiers: db.ref('tiers').orderByChild('order'),
				campaigns: db.ref(`campaigns/${this.id}`),
				encounters: db.ref(`encounters/${this.id}`),
				players: db.ref(`players/${this.id}`),
				npcs: db.ref(`npcs/${this.id}`),
			}
		},
		mounted() {
			var characters = db.ref(`character_control/${this.id}`);
			characters.on('value', async (snapshot) => {
				let characters = snapshot.val();
				
				//Get Players
				for(let key in snapshot.val()) {
					let userId = characters[key].user;
					characters[key].character_name = undefined;

					let getPlayer = db.ref(`players/${userId}/${key}/character_name`);
					getPlayer.on('value', (snapshot) => {
						characters[key].character_name = snapshot.val()
					});
				}
				this.characters = characters;
				this.loading_characters = false;
			});

			var user = db.ref(`users/${this.id}`);
			user.on('value', async (snapshot) => {
				let user = snapshot.val();
				
				let followed = {};
				for(let key in user.follow) {
					let getFollowed = db.ref(`users/${key}/username`);

					await getFollowed.on('value', (snapshot) => {			
						followed[key] = snapshot.val()
					});
				}
				user.followed = followed;
				this.user = user;
				this.loading = false;
			});
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