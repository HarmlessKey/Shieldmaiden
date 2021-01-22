<template>
  <div>
		<h3>General settings</h3>
		<q-input
			dark filled square
			label="Name"
			autocomplete="off"
			class="mb-2"
			v-validate="'required'" 
			data-vv-as="Encounter Name" 
			type="text" 
			name="name" 
			v-model="encounter.encounter"/>
		<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

		<div class="audio">
			<div 
				v-if="encounter.audio && !errors.has('audio')" 
				class="img pointer" >
				<a :href="encounter.audio" target="_blank" rel="noopener">
					<q-icon v-if="audio_link_type == 'spotify'" class="fab fa-spotify"></q-icon>
					<q-icon v-else-if="audio_link_type == 'youtube'" class="fab fa-youtube"></q-icon>
					<q-icon v-else-if="audio_link_type == 'apple'" class="fab fa-itunes"></q-icon>
					<q-icon v-else class="fas fa-play"></q-icon>
				</a>
			</div>
			<div class="img" v-else>
				<q-icon name="fas fa-music"/>
			</div>
			<div>
				<q-input 
					dark filled square
					label="Audio"
					autocomplete="off" 
					
					name="audio" 
					v-model="encounter.audio" 
					class="mb-2"
					placeholder="Audio URL"/>
			</div>
		</div>

		<div class="background mb-3">
			<div 
				v-if="encounter.background && !errors.has('background')" 
				class="img pointer" 
				:style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }"
				@click="image = true"
			>
			</div>
			<div class="img" v-else>
				<q-icon name="fas fa-image"/>
			</div>
			<div>
				<q-input 
					dark filled square
					label="Background"
					autocomplete="off" 
					v-validate="'url'" type="text" 
					name="background" 
					data-vv-as="Background"
					v-model="encounter.background" 
					class="mb-2"
					placeholder="Background URL"/>
				<p class="validate red" v-if="errors.has('background')">{{ errors.first('background') }}</p>
			</div>
		</div>

		<h3>
			Weather effects
			<q-icon name="fas fa-eye" class="blue ml-1 pointer" @click="image = true">
				<q-tooltip anchor="top middle" self="center middle">
					Weather preview
				</q-tooltip>
			</q-icon>
		</h3>
		<EditWeather v-model="weather" />

		<button class="btn btn-lg mt-3" @click="edit()">Save</button>

		<q-dialog v-model="image" full-height full-width>
			<q-card dark>
				<q-toolbar class="bg-gray-dark">
					<div>Background preview</div>
					<q-space />

					<q-btn-dropdown stretch flat label="Weather" dark square>
						<div class="bg-gray edit-weather">
							<q-item-label header>Weather effects</q-item-label>
							<EditWeather v-model="weather" />
						</div>
					</q-btn-dropdown>

					<q-btn flat round dense icon="close" class="q-mr-sm" v-close-popup />

				</q-toolbar>
				<div class="preview">
					
						<Weather :weather="weather" :key="JSON.stringify(weather)" :background="encounter.background" />
					
				</div>
			</q-card>
		</q-dialog>
	</div>
</template>1

<script>
    import { db } from '@/firebase';
		import { mapActions, mapGetters } from 'vuex';
		import EditWeather from './Weather';

	export default {
		name: 'General',
		components: {
			EditWeather,
			Weather: () => import('@/components/weather')
		},
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.user,
				image: false,
				weatherSetter: undefined,
				weather: {},
				weather_effects: {
					rain: { name: "Rain", icon: "fas fa-cloud-showers" },
					snow: { name: "Snow", icon: "fas fa-cloud-snow" },
					hail: { name: "Hail", icon: "fas fa-cloud-hail" },
					lightning: { name: "Lightning", icon: "fas fa-bolt" },
					fog: { name: "Fog", icon: "fas fa-fog" }
				}
			} 
		},
		computed: {
			...mapGetters([
				'encounter',
			]),
			audio_link_type() {
				// This link type identification will fail sometimes
				// Example: https://geo.music.apple.com/us/album/spotify/1528894349?i=1528894351&itsct=music_box&itscg=30200&ct=songs_spotify&app=music&ls=1
				// Check for keyword in url root not in whole string
				if (this.encounter.audio !== undefined) {
					if (this.encounter.audio.includes("spotify"))
						return "spotify"
					else if (this.encounter.audio.includes("youtube"))
						return "youtube"
					else if (this.encounter.audio.includes("apple"))
						return "apple"
				}
				return undefined
			}
		},
		mounted() {
			this.fetchEncounter({
				cid: this.campaignId, 
				eid: this.encounterId, 
			})

			if(this.encounter && this.encounter.weather) {
				this.weather = this.encounter.weather;
			}
		},
		methods: {
			...mapActions([
				'fetchEncounter'
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						this.encounter.weather = (Object.keys(this.weather).length > 0) ? this.weather : null;

						db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}`).update(
							this.encounter
						);
						this.$snotify.success('Saved.', 'Critical hit!', {
							position: "rightTop"
						});
					}
				})
			},
			intensity(type) {
				const value = this.weather[type];
				if(value === 0) return "Off";

				if(type === 'lightning') {
					if(value === 1) return "6m interval";
					if(value === 2) return "3m interval";
					if(value === 3) return "1m interval";
				}
				else {
					if(value === 1) return "Light";
					if(value === 2) return "Medium";
					if(value === 3) return "Heavy";
				}
				
			}
		}
	}
</script>

<style lang="scss" scoped>
.background, .audio {
	display: grid;
	grid-template-columns: 56px 1fr;
	grid-column-gap: 10px;
	font-size: 35px;
	text-align: center;

	.img {
		border: solid 1px #b2b2b2;
		display: block;
		width: 56px;
		height: 56px;
		background-size: cover;
		background-position: center top;
	}
}
.q-card {
	.preview {
		overflow: hidden;
		height: calc(100% - 50px);
		width: 100%;
		position: relative;
		background-size: cover;
		background-position: center top;
	}
}
.edit-weather {
	min-width: 240px;
}
</style>
