<template>
	<div v-if="!loading">
		<hk-card>
			<div class="card-header">
				<span>
					<i :class="{ 'green': status.state == 'online', 'neutral-3': status.state == 'offline' }" class="fas fa-circle"></i>
					{{ user.username }}
				</span>
				<router-link :to="'/user/' + id">
					<div class="live" :class="{ 'active': broadcast.live }">Live</div>
				</router-link>
			</div>
			<div class="card-body">
				<p>{{ user.email }}</p>
				<p v-if="user.patreon_email">patron: {{ user.patreon_email }}</p>
				<p><i class="neutral-3">{{ id }}</i></p>
			</div>
		</hk-card>

		<hk-card-deck class="mb-3">
			<hk-card header="DM Data">
				<div class="card-body data">
					<span class="type">Campaigns: </span> 
					<template v-if="campaigns['.value']">{{ campaigns[".value"] }}</template>
					<template v-else>0</template><br/>
					
					<span class="type">Players: </span> 
					<template v-if="players['.value']">{{ players[".value"] }}</template>
					<template v-else>0</template><br/>

					<span class="type">NPC's: </span> 
					<template v-if="npcs['.value']">{{ npcs[".value"] }}</template>
					<template v-else>0</template><br/>

					<span class="type">Items: </span>
					<template v-if="items['.value']">{{ items[".value"] }}</template>
					<template v-else>0</template><br/>

					<span class="type">Reminders: </span>
					<template v-if="reminders['.value']">{{ reminders[".value"] }}</template>
					<template v-else>0</template><br/>
				</div>
			</hk-card>
			<hk-card header="Following">
				<div class="card-body">
					<ul class="entities">
						<li v-for="(followed, key) in user.followed" :key="key">
							{{ followed }}
						</li>
					</ul>
				</div>
			</hk-card>
			<hk-card header="Player Characters">
				<div class="card-body">
					<ul class="entities" v-if="!loading_characters">
						<li v-for="(character, key) in characters" :key="key">
							{{ character.character_name }}
						</li>
					</ul>
					<div v-else class="loader"> <span>Loading characters...</span></div>
				</div>
			</hk-card>
		</hk-card-deck>

		<hk-card header="User info">
			<div class="card-body">
				<q-select
					:dark="$store.getters.theme === 'dark'" filled square multiple
					label="contribute"
					class="mb-3"
					:options="contributes"
					v-model="user.contribute"
					@input="setContribute($event)"
				/>

				<h3>Link a Patreon account</h3>

				<q-input
					:dark="$store.getters.theme === 'dark'" filled square
					type="email"
					label="Patreon Email"
					v-model="user.patreon_email">
					<template #after>
						<a class="btn" @click="setPatronEmail()">Save</a>
					</template>
				</q-input>
			</div>
		</hk-card>

		<hk-card header="Voucher">
			<div class="card-body">
				<h3>Gift user a subscription</h3>
				<ValidationObserver v-slot="{ valid }">
					<q-form>
						<q-select 
							:dark="$store.getters.theme === 'dark'" filled square
							emit-value
							map-options
							label="Tier"
							v-model="voucher.id"
							:options="Object.values(tiers)"
							option-label="name"
							option-value=".key"
						>
						</q-select>
						
						<q-option-group
							:dark="$store.getters.theme === 'dark'"
							v-model="duration"
							:options="duration_options"
						/>

						<ValidationProvider v-if="duration === 'date'" rules="required" name="Date" v-slot="{ errors, invalid, validated }">
							<q-input 	
								:dark="$store.getters.theme === 'dark'" filled square
								label="Date"
								type="text"
								placeholder="mm/dd/yyyy"
								class="mb-2"
								v-model="voucher.date"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>

						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							label="Message"
							v-model="voucher.message" 
							name="message" 
							class="mb-2"
							autogrow
						/>
						<a class="btn" @click="setVoucher(valid)">Save</a>
					</q-form>
				</ValidationObserver>
			</div>
		</hk-card>
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
		data() {
			return {
				loading: true,
				loading_characters: true,
				duration: 'date',
				characters: {},
				user: undefined,
				duration_options: [
					{
						value: 'date',
						label: 'Till date'
					},
					{
						value: 'infinite',
						label: 'Till cancelled'
					}
				],
				contributes: [
					"monsters",
					"spells"
				]
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
				campaigns: {
					source: db.ref(`search_campaigns/${this.id}/metadata/count`),
					asObject: true
				},
				players: {
					source: db.ref(`search_players/${this.id}/metadata/count`),
					asObject: true
				},
				npcs: {
					source: db.ref(`search_npcs/${this.id}/metadata/count`),
					asObject: true
				},
				items: {
					source: db.ref(`search_items/${this.id}/metadata/count`),
					asObject: true
				},
				reminders: {
					source: db.ref(`search_reminders/${this.id}/metadata/count`),
					asObject: true
				} 
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
			tiersArray() {
				let array = [];
				for(const value of Object.values(this.tiers)) {
					array.push({
						value: value['.key'],
						label: value.name
					});
				}
				return array;
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
			setVoucher(valid) {
				console.log(valid)
				if (valid) {
					if(this.voucher.id === 'basic') {
						db.ref(`users/${this.id}/voucher`).remove()
					}
					else {
						if(this.duration === 'infinite') {
							delete this.voucher.date
						}
						db.ref(`users/${this.id}/voucher`).set(this.voucher)
					}
					this.$snotify.success('Voucher given.', 'Voucher set!', {
						position: "rightTop"
					});
				}
			},
			setPatronEmail() {
				if (this.user.patreon_email == "") {
					db.ref(`users/${this.id}/patreon_email`).remove()	
				}
				else {
					db.ref(`users/${this.id}/patreon_email`).set(this.user.patreon_email)
				}
				this.$snotify.success('Patreon email linked.', 'Saved!', {
					position: "rightTop"
				});
			},
			setContribute(value) {
				value = (!value) ? null : value;
				db.ref(`users/${this.id}/contribute`).set(value);

				this.$snotify.success('Contribute set.', 'Saved!', {
					position: "rightTop"
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