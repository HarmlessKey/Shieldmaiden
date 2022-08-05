<template>
	<div class="light" :class="(background && lightning && showWeather) ? `bg-white` : `bg-neutral-5`">
		<div 
			class="weather-wrapper" 
			:style="{ backgroundImage: 'url(\'' + background + '\')' }"
			:class="(lightning && showWeather) ? lightning : ''"
		>
			<template v-if="weather && showWeather">
				<Fog v-if="weather.fog > 0" :intensity="weather.fog" :smoke="weather.smoke" :audio="audio" />
				<Sand v-if="weather.sand > 0" :intensity="weather.sand" :audio="audio" />
				<Rain v-if="weather.rain > 0" :intensity="weather.rain" :audio="audio" />
				<Hail v-if="weather.hail > 0" :intensity="weather.hail" :audio="audio" />
				<Snow v-if="weather.snow > 0" :intensity="weather.snow" :audio="audio" />
				<Ash v-if="weather.ash > 0" :intensity="weather.ash" :audio="audio" />
			</template>
		</div>
		<audio v-if="audio && thunder_interval" :src="thunder_audio" ref="thunder" autoplay />
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
		},
		audio: {
			type: Boolean,
			default: false
		}
	},
	components: {
		Fog: () => import('./Fog'),
		Rain: () => import('./Rain'),
		Hail: () => import('./Hail'),
		Snow: () => import('./Snow'),
		Ash: () => import('./Ash'),
		Sand: () => import('./Sand'),
	},
	data() {
		return {
			component: null,
			thunder_audio: undefined
		}
	},
	computed: {
		lightning() {
			if(this.weather && this.weather.lightning > 0) {
				const intensities = ["light", "medium", "heavy"];
				const index = this.weather.lightning - 1;
				return intensities[index];	
			} return undefined;
		},
		thunder_interval() {
			if(this.weather && this.weather.lightning > 0) {
				const intervals = [360000, 180000, 60000];
				const index = this.weather.lightning - 1;
				return intervals[index];
			} return undefined;
		}
	},
	mounted() {
		if(this.audio && this.weather && this.weather.lightning > 0) {
			// this.thunder_audio = require("src/assets/_audio/weather/thunder.wav");
			this.thunder();
		}
	},
	methods: {
		thunder() {
			const vm = this;
			setInterval(function() { 
				vm.$refs.thunder.play(); 
			}, vm.thunder_interval);
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
			animation: imagezoom 30s ease-in-out infinite;
			animation-direction: alternate-reverse;

			&.light {
				animation: lightnings 360s linear infinite;
				@keyframes lightnings {
					0% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.87% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.9% { filter: brightness(2); opacity: .3; background-color:$neutral-1; }
					0.93% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.95% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.99% { filter: brightness(2); opacity: .3; background-color:$neutral-1; }
					1% { filter: brightness(1); opacity: 1; background-color: unset; }
					100% { filter: brightness(1); opacity: 1; background-color: unset; }
				}
			}
			&.medium {
				animation: lightningm 180s linear infinite;
				@keyframes lightningm {
					0% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.85% { filter: brightness(1); opacity: 1; background-color: unset; }
					0.9% { filter: brightness(2); opacity: .3; background-color:$neutral-1; }
					0.95% { filter: brightness(1); opacity: 1; background-color: unset; }
					1% { filter: brightness(1); opacity: 1; background-color: unset; }
					1.05% { filter: brightness(2); opacity: .3; background-color:$neutral-1; }
					1.1% { filter: brightness(1); opacity: 1; background-color: unset; }
					100% { filter: brightness(1); opacity: 1; background-color: unset; }
				}
			}
			&.heavy {
				animation: lightning 60s linear infinite;
				@keyframes lightning {
					0% { filter: brightness(1); opacity: 1; background-color: unset; }
					1.8% { filter: brightness(1); opacity: 1; background-color: unset; }
					1.9% { filter: brightness(2); opacity: .3; background-color:$neutral-1; }
					2% { filter: brightness(1); opacity: 1; background-color: unset; }
					2.4% { filter: brightness(1); opacity: 1; background-color: unset; }
					2.6% { filter: brightness(2); opacity: .3; background-color:$neutral-1; }
					2.9% { filter: brightness(1); opacity: 1; background-color: unset; }
					100% { filter: brightness(1); opacity: 1; background-color: unset;}
				}
			}
		}
	}
	@keyframes imagezoom {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(1.25);
		}
	}
</style>