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

		<div class="background mb-3">
			<div 
				v-if="encounter.background" 
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
		<q-list dense>
			<q-item v-for="({name, icon}, key) in weather_effects" :key="`effect-${key}`">
				<q-item-section dark avatar>
					<q-icon :name="icon" />
					<q-tooltip anchor="top middle" self="center right">
						{{ name }}
					</q-tooltip>
				</q-item-section>
				<q-item-section>
					<q-slider
						v-model="weather[key]"
						:min="0"
						:max="3"
						markers
						dark
					/>
				</q-item-section>
				<q-item-section avatar>
					{{ intensity(key) }}
				</q-item-section>
			</q-item>
		</q-list>


		<button class="btn btn-lg mt-3" @click="edit()">Save</button>

		<q-dialog v-model="image" full-height full-width>
			<q-card>
				<q-toolbar class="bg-gray-dark">
					<div>Background preview</div>
					<q-space />

					<q-btn-dropdown stretch flat label="Weather" dark square>
						<div class="bg-gray">
							<q-list dark dense>
								<q-item v-for="({icon}, key) in weather_effects" :key="`effect-${key}`">
									<q-item-section avatar>
										<q-icon :name="icon" />
									</q-item-section>
									<q-item-section>
										<q-slider
											v-model="weather[key]"
											:min="0"
											:max="3"
											markers
											dark
										/>
									</q-item-section>
								</q-item>
							</q-list>
						</div>
					</q-btn-dropdown>

					<q-btn flat round dense icon="close" class="q-mr-sm" v-close-popup />

				</q-toolbar>
				<div class="preview" :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">
					<div class="weathter" v-if="Object.keys(weather).length > 0">
						<Weather :weather="weather" :key="JSON.stringify(weather)" />
					</div>
				</div>
			</q-card>
		</q-dialog>
	</div>
</template>1

<script>
    import { db } from '@/firebase';
    import { mapActions, mapGetters } from 'vuex';

	export default {
		name: 'General',
		components: {
			Weather: () => import('@/components/weather')
		},
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.user,
				image: false,
				weather_effects: {
					rain: { name: "Rain", icon: "fas fa-cloud-showers" },
					snow: { name: "Snow", icon: "fas fa-cloud-snow" },
					lightning: { name: "Lightning", icon: "fas fa-bolt" },
					fog: { name: "Fog", icon: "fas fa-fog" }
				},
				basicModel: 0
			} 
		},
		computed: {
			...mapGetters([
				'encounter',
			]),
			weather() {
				return this.encounter.weather || {};
			}
		},
		mounted() {
			this.fetchEncounter({
				cid: this.campaignId, 
				eid: this.encounterId, 
			})
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

				if(["rain", "snow", "fog"].includes(type)) {
					if(value === 1) return "Light";
					if(value === 2) return "Medium";
					if(value === 3) return "Heavy";
				}
				if(type === 'lightning') {
					if(value === 1) return "6m interval";
					if(value === 2) return "3m interval";
					if(value === 3) return "1m interval";
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.background {
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
	.q-field {
		width: 120px;
	}
	.preview {
		overflow: hidden;
		height: calc(100% - 50px);
		width: 100%;
		position: relative;
		background-size: cover;
		background-position: center top;

		.weather {
			overflow: hidden;
			position: absolute; 
			left: 0;
			top: 50px;
			height: calc(100% - 50px);
			width: 100%;
		}
	}
}
</style>