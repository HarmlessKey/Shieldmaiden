<template>
	<q-list dense :dark="$store.getters.theme === 'dark'">
		<q-item v-for="({ name, icon }, key) in weather_effects" :key="`effect-${key}`">
			<q-item-section :dark="$store.getters.theme === 'dark'" avatar>
				<q-icon :name="icon" :class="weather.smoke && key === 'fog' ? 'neutral-5' : ''" />
				<q-tooltip anchor="top middle" self="center right">
					{{ name }}
				</q-tooltip>
			</q-item-section>
			<q-item-section>
				<q-item-label caption>
					<div class="d-flex justify-between">
						<span
							><strong>{{ name }}</strong
							>: {{ intensity(key) }}</span
						>
						<q-toggle
							v-if="key === 'fog'"
							label="Smoke"
							size="xs"
							v-model="weather.smoke"
							indeterminate-value="something-else"
							:false-value="null"
						/>
					</div>
				</q-item-label>
				<q-slider
					v-model="weather[key]"
					:min="0"
					:max="3"
					markers
					:dark="$store.getters.theme === 'dark'"
				/>
			</q-item-section>
		</q-item>
	</q-list>
</template>

<script>
export default {
	name: "EditWeather",
	props: {
		value: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			weather_effects: {
				rain: { name: "Rain", icon: "fas fa-cloud-showers" },
				snow: { name: "Snow", icon: "fas fa-cloud-snow" },
				hail: { name: "Hail", icon: "fas fa-cloud-hail" },
				lightning: { name: "Lightning", icon: "fas fa-bolt" },
				fog: { name: "Fog", icon: "fas fa-fog" },
				ash: { name: "Ash rain", icon: "fas fa-fire" },
				sand: { name: "Sandstorm", icon: "fas fa-tornado" },
				quake: { name: "Quakes", icon: "fas fa-waveform-path" },
			},
		};
	},
	computed: {
		weather: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
			},
		},
	},
	methods: {
		intensity(type) {
			const value = this.weather[type];
			const intensity = ["Off", "Light", "Medium", "Heavy"];

			const interval = ["Off", "6 minute interval", "3 minute interval", "1 minute interval"];

			const quakes = ["Off", "3 minute interval", "1 minute interval", "constant"];

			if (type === "lightning") {
				return interval[value];
			}
			if (type === "quake") {
				return quakes[value];
			}
			return intensity[value];
		},
	},
};
</script>

<style lang="scss" scoped>
.q-item__label {
	line-height: 30px !important;
}
</style>
