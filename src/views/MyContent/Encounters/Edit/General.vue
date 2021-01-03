<template>
  <div>
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

		<div class="background">
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

				<div class="row q-col-gutter-sm">
					<div class="col">
						<q-select 
							dark filled square
							label="Weather effect"
							clearable
							v-model="weather.type"
							:options="weather_types"
						/>
					</div>
					<div class="col">
						<q-select 
							dark filled square
							label="Weather intensity"
							clearable
							v-model="weather.intensity"
							:options="weather_intensities"
						/>
					</div>
				</div>
			</div>
		</div>


		<button class="btn mt-3" @click="edit()">Save Name & Background</button>

		<q-dialog v-model="image" full-height full-width>
			<q-card>
				<q-toolbar class="bg-gray-dark">
					<div>Background preview</div>
					<q-space />

					<q-btn-dropdown stretch flat label="Weather" dark square>
						<div class="bg-gray">
							<q-list dark square>
								<q-item-label header>Type</q-item-label>
								<q-item 
									v-for="(type, i) in weather_types" 
									:key="`type-${i}`" 
									clickable
									:active="weather.type === type"
									@click="$set(weather, 'type', type)"
								>
									<q-item-section avatar>
										<q-icon :name="type === 'Rain' ? 'fas fa-cloud-showers' : 'fas fa-cloud-snow'"></q-icon>
									</q-item-section>
									<q-item-section>
										<q-item-label>{{ type }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-separator inset spaced />
								<q-item-label header>Intensity</q-item-label>
								<q-item 
									v-for="(intensity, i) in weather_intensities" 
									:key="`intensity-${i}`" 
									clickable
									:active="weather.intensity === intensity"
									@click="$set(weather, 'intensity', intensity)"
								>
									<q-item-section>
										<q-item-label>{{ intensity.capitalize() }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-separator inset spaced />
								<q-item-label header>Effects</q-item-label>
								<q-item 
									v-for="(effect, i) in weather_effects" 
									:key="`effect-${i}`" 
									clickable
									:active="weather.effects.includes(effect)"
									@click="addEffect(effect)"
								>
									<q-item-section avatar>
										<q-icon :name="effect === 'Lightning' ? 'fas fa-bolt' : 'fas fa-fog'"></q-icon>
									</q-item-section>
									<q-item-section>
										<q-item-label>{{ effect.capitalize() }}</q-item-label>
									</q-item-section>
								</q-item>
							</q-list>
						</div>
					</q-btn-dropdown>

					<q-btn flat round dense icon="close" class="q-mr-sm" v-close-popup />

				</q-toolbar>
				<div class="preview" :style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }">
					<div class="weathter" v-if="weather.type">
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
				weather_types: [
					"Rain",
					"Snow"
				],
				weather_intensities: [
					"Light",
					"Medium",
					"Heavy"
				],
				weather_effects: [
					"Lightning",
					"Fog"
				],
				weather: {
					type: undefined,
					intensity: undefined,
					effects: []
				}
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
		},
		methods: {
			...mapActions([
				'fetchEncounter'
			]),
      edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}`).update(
							this.encounter
						);
						this.$snotify.success('Saved.', 'Critical hit!', {
							position: "rightTop"
						});
					}
				})
			},
			addEffect(effect) {
				const index = this.weather.effects.indexOf(effect);
				if(index >= 0) {
					this.$delete(this.weather.effects, index);
				} else {
					this.weather.effects.push(effect);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.background {
	display: grid;
	grid-template-columns: 120px 1fr;
	grid-column-gap: 10px;
	font-size: 35px;
	text-align: center;

	.img {
		border: solid 1px #b2b2b2;
		display: block;
		width: 120px;
		height: 120px;
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