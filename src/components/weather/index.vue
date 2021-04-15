<template>
	<div class="light" :class="(background && lightning && showWeather) ? `bg-white` : `bg-gray-dark`">
		<div 
			class="weather-wrapper" 
			:style="{ backgroundImage: 'url(\'' + background + '\')' }"
			:class="(lightning && showWeather) ? lightning : ''"
		>
			<template v-if="weather && showWeather">
				<Fog v-if="weather.fog > 0" :intensity="weather.fog" />
				<Rain v-if="weather.rain > 0" :intensity="weather.rain" />
				<Hail v-if="weather.hail > 0" :intensity="weather.hail" />
				<Snow v-if="weather.snow > 0" :intensity="weather.snow" />
			</template>
		</div>
	</div>
</template>

<script>
export default {
		name: 'Weather',
		props: {
			weather: {
				type: Object,
				required: false
			},
			background: {
				type: String,
				required: false
			},
			showWeather: {
				type: Boolean,
				default: true
			}
		},
		components: {
			Fog: () => import('./Fog'),
			Rain: () => import('./Rain'),
			Hail: () => import('./Hail'),
			Snow: () => import('./Snow')
		},
    data() {
			return {
				component: null,
			}
    },
    computed: {
			lightning() {
				if(this.weather && this.weather.lightning > 0) {
					const intensities = ["light", "medium", "heavy"];
					const index = this.weather.lightning - 1;
					return intensities[index];	
				} return false;
			}
    }
}
</script>

<style lang="scss" scoped>
	.light {
		width: 100%;
		height: 100%;

		&::-webkit-scrollbar {
			display: none;
		}

		.weather-wrapper {
			overflow: hidden;
			width: 100%;
			height: 100%;
			background-size: cover;
			background-position: center top;

			&.light {
				animation: lightnings 360s linear infinite;
				@keyframes lightnings {
					0% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.87% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.9% { filter: brightness(2); opacity: .3; background-color:$white; }
					0.93% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.95% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.99% { filter: brightness(2); opacity: .3; background-color:$white; }
					1% { filter: brightness(1); opacity: 1; background-color: unset; }
					100% { filter: brightness(1); opacity: 1; background-color: unset; }
				}
			}
			&.medium {
				animation: lightningm 180s linear infinite;
				@keyframes lightningm {
					0% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.85% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.9% { filter: brightness(2); opacity: .3; background-color:$white; }
					0.95% { filter: brightness(1); opacity: 1; background-color: unset; }
					1% { filter: brightness(1); opacity: 1; background-color: unset; }
					1.05% { filter: brightness(2); opacity: .3; background-color:$white; }
					1.1% { filter: brightness(1); opacity: 1; background-color: unset; }
					100% { filter: brightness(1); opacity: 1; background-color: unset; }
				}
			}
			&.heavy {
				animation: lightning 60s linear infinite;
				@keyframes lightning {
					0% { filter: brightness(1); opacity: 1; background-color: unset; }
					1.8% { filter: brightness(1); opacity: 1; background-color: unset; }
					1.9% { filter: brightness(2); opacity: .3; background-color:$white; }
					2% { filter: brightness(1); opacity: 1; background-color: unset; }
					2.4% { filter: brightness(1); opacity: 1; background-color: unset; }
					2.6% { filter: brightness(2); opacity: .3; background-color:$white; }
					2.9% { filter: brightness(1); opacity: 1; background-color: unset; }
					100% { filter: brightness(1); opacity: 1; background-color: unset;}
				}
			}
		}
	}
</style>