<template>
  <div>
		<h3>General settings</h3>
		<ValidationObserver  v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(edit)" greedy>
				<ValidationProvider rules="required" name="Name" v-slot="{ errors, invalid, validated }">
					<q-input
						:dark="$store.getters.theme === 'dark'" filled square
						label="Name"
						autocomplete="off"
						class="mb-3"
						v-model="encounter.encounter"
						:error="invalid && validated"
						:error-message="errors[0]"
					/>
				</ValidationProvider>

				<ValidationProvider rules="audio" name="Audio" v-slot="{ errors, invalid, validated }">
					<div class="audio">
						<div 
							v-if="encounter.audio && !invalid" 
							class="img pointer" >
							<a :href="encounter.audio" target="_blank" rel="noopener">
								<q-icon :class="audio_icons[audio_link_type].icon" :style="`color:${audio_icons[audio_link_type].color};`"></q-icon>
							</a>
						</div>
						<div class="img" v-else>
							<q-icon name="fas fa-music-alt"/>
						</div>
						<div>
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Audio"
								autocomplete="off" 
								v-model="encounter.audio" 
								placeholder="Audio URL"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</div>
					</div>
				</ValidationProvider>

				<ValidationProvider rules="url" name="Audio" v-slot="{ errors, invalid, validated }">
					<div class="background mb-3">
						<div 
							v-if="encounter.background && !invalid" 
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
									:dark="$store.getters.theme === 'dark'" filled square
									label="Background"
									autocomplete="off" 
									v-model="encounter.background" 
									class="mb-2"
									placeholder="Background URL"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
						</div>
					</div>
				</ValidationProvider>

				<h3>
					Weather effects
					<q-icon name="fas fa-eye" class="blue ml-1 pointer" @click="image = true">
						<q-tooltip anchor="top middle" self="center middle">
							Weather preview
						</q-tooltip>
					</q-icon>
				</h3>
				<EditWeather v-model="weather" />

				<div class="d-flex justify-content-start items-center mt-3">
					<q-btn color="primary" type="submit" no-caps>Save</q-btn>
					<q-icon v-if="!valid" name="error" color="red" size="md" class="ml-2">
						<q-tooltip anchor="top middle" self="center middle">
							There are validation errors
						</q-tooltip>
					</q-icon>
				</div>
			</q-form>
		</ValidationObserver>

		<q-dialog v-model="image" full-height full-width>
			<q-card :dark="$store.getters.theme === 'dark'">
				<q-toolbar class="bg-neutral-9">
					<div>Background preview</div>
					<q-space />

					<q-btn-dropdown stretch flat no-caps label="Weather" dark square>
						<div class="bg-neutral-9 edit-weather">
							<q-item-label header>Weather effects</q-item-label>
							<EditWeather v-model="weather" />
						</div>
					</q-btn-dropdown>

					<q-btn flat round dense no-caps icon="close" class="q-mr-sm" v-close-popup />

				</q-toolbar>
				<div class="preview">
					<Weather :weather="weather" :key="JSON.stringify(weather)" :background="encounter.background" />				
				</div>
			</q-card>
		</q-dialog>
	</div>
</template>

<script>
    import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import EditWeather from './Weather';
	import { audio } from '@/mixins/audio';

	export default {
		name: 'General',
		components: {
			EditWeather,
			Weather: () => import('@/components/weather')
		},
		mixins: [audio],
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
				},
			} 
		},
		computed: {
			...mapGetters([
				'encounter',
			]),
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
				this.encounter.weather = (Object.keys(this.weather).length > 0) ? this.weather : null;

				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}`).update(
					this.encounter
				);
				this.$snotify.success('Saved.', 'Critical hit!', {
					position: "rightTop"
				});
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
		},
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
		border: solid 1px $neutral-2;
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
