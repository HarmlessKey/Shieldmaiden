<template>
	<q-list dense dark>
		<q-item v-for="({name, icon}, key) in weather_effects" :key="`effect-${key}`">
			<q-item-section dark avatar>
				<q-icon :name="icon" />
				<q-tooltip anchor="top middle" self="center right">
					{{ name }}
				</q-tooltip>
			</q-item-section>
			<q-item-section>
				<q-item-label caption>{{ intensity(key) }}</q-item-label>
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
</template>

<script>
	export default {
		name: 'General',
		props: {
			value: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
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
			weather: {
				get() {
					return this.value;
				},
				set(newVal) {
					this.$emit("input", newVal);
				}
			}
		},
		methods: {
			intensity(type) {
				const value = this.weather[type];
				if(value === 0) return "Off";

				if(type === 'lightning') {
					if(value === 1) return "6 minute interval";
					if(value === 2) return "3 minute interval";
					if(value === 3) return "1 minute interval";
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