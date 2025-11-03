<template>
	<div
		class="light"
		:class="background && lightning && showWeather ? `bg-white` : `bg-neutral-5`"
		:style="{
			'--backgroundImage':
				background && !backgroundVideo && !backgroundYoutube ? 'url(\'' + background + '\')' : '',
		}"
	>
		<div
			class="weather-wrapper"
			:class="[
				lightning && showWeather ? `lightning-effect lightning-effect__${lightning}` : '',
				quake && showWeather ? `quake quake-${quake}` : '',
			]"
		>
			<slot />
			<template v-if="weather && showWeather">
				<Fog
					v-if="weather.fog > 0"
					:intensity="weather.fog"
					:smoke="weather.smoke"
					:audio="audio"
				/>
				<Sand v-if="weather.sand > 0" :intensity="weather.sand" :audio="audio" />
				<Rain v-if="weather.rain > 0" :intensity="weather.rain" :audio="audio" />
				<Hail v-if="weather.hail > 0" :intensity="weather.hail" :audio="audio" />
				<Snow v-if="weather.snow > 0" :intensity="weather.snow" :audio="audio" />
				<Ash v-if="weather.ash > 0" :intensity="weather.ash" :audio="audio" />
			</template>
			<video
				v-if="backgroundVideo"
				:src="backgroundVideo"
				alt="Background video"
				class="bg-video"
				playsinline
				autoplay
				loop
				:muted="muted"
			/>
			<iframe
				ref="youtube"
				v-if="backgroundYoutube"
				:src="`${backgroundYoutube}?autoplay=1&mute=${mute_youtube}&playsinline=1&controls=0`"
				title="YouTube video player"
				class="youtube-player"
				allow="autoplay"
			/>
			<q-resize-observer v-if="backgroundYoutube" @resize="setSize" />
		</div>
		<audio v-if="audio && thunder_interval" :src="thunder_audio" ref="thunder" autoplay />
	</div>
</template>

<script>
export default {
	name: "Weather",
	props: {
		weather: {
			type: Object,
			required: false,
		},
		background: {
			type: String,
			required: false,
		},
		backgroundVideo: {
			type: String,
			required: false,
		},
		backgroundYoutube: {
			type: String,
			required: false,
		},
		showWeather: {
			type: Boolean,
			default: true,
		},
		audio: {
			type: Boolean,
			default: false,
		},
		muted: {
			type: Boolean,
			default: false,
		},
	},
	components: {
		Fog: () => import("./Fog"),
		Rain: () => import("./Rain"),
		Hail: () => import("./Hail"),
		Snow: () => import("./Snow"),
		Ash: () => import("./Ash"),
		Sand: () => import("./Sand"),
	},
	data() {
		return {
			component: null,
			thunder_audio: undefined,
		};
	},
	computed: {
		lightning() {
			if (this.weather && this.weather.lightning > 0) {
				const intensities = ["light", "medium", "heavy"];
				const index = this.weather.lightning - 1;
				return intensities[index];
			}
			return undefined;
		},
		quake() {
			if (this.weather && this.weather.quake > 0) {
				const intensities = ["light", "medium", "heavy"];
				const index = this.weather.quake - 1;
				return intensities[index];
			}
			return undefined;
		},
		thunder_interval() {
			if (this.weather && this.weather.lightning > 0) {
				const intervals = [360000, 180000, 60000];
				const index = this.weather.lightning - 1;
				return intervals[index];
			}
			return undefined;
		},
		mute_youtube() {
			return this.muted ? 1 : 0;
		},
	},
	mounted() {
		if (this.audio && this.weather && this.weather.lightning > 0) {
			// this.thunder_audio = require("src/assets/_audio/weather/thunder.wav");
			this.thunder();
		}
	},
	methods: {
		thunder() {
			const vm = this;
			setInterval(function () {
				vm.$refs.thunder.play();
			}, vm.thunder_interval);
		},
		setSize(size) {
			const req_height = size.width * (9 / 16);
			const req_width = size.height * (16 / 9);
			this.$refs.youtube.style.width = `${Math.ceil(req_width)}px`;
			this.$refs.youtube.style.height = `${Math.ceil(req_height)}px`;
		},
	},
};
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
		position: relative;
		animation-direction: alternate-reverse;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center bottom;
		z-index: 1;

		:deep(.wrapper) {
				pointer-events: none;
		}

		&::before,
		&::after {
			content: "";
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			position: absolute;
			background-image: var(--backgroundImage);
			background-size: cover;
			background-repeat: no-repeat;
			background-position: center bottom;
			z-index: -2;
		}

		.bg-video,
		.youtube-player {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			min-width: 100%;
			min-height: 100%;
			z-index: -2;

			transition: all 0.3s linear;
		}

		&.lightning-effect {
			&__light {
				animation: lightnings 360s linear infinite;
				@keyframes lightnings {
					0% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					0.87% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					0.9% {
						filter: brightness(2);
						opacity: 0.3;
						background-color: $neutral-1;
					}
					0.93% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					0.95% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					0.99% {
						filter: brightness(2);
						opacity: 0.3;
						background-color: $neutral-1;
					}
					1% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					100% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
				}
			}
			&__medium {
				animation: lightningm 180s linear infinite;
				@keyframes lightningm {
					0% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					0.85% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					0.9% {
						filter: brightness(2);
						opacity: 0.3;
						background-color: $neutral-1;
					}
					0.95% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					1% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					1.05% {
						filter: brightness(2);
						opacity: 0.3;
						background-color: $neutral-1;
					}
					1.1% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					100% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
				}
			}
			&__heavy {
				animation: lightning 60s linear infinite;
				@keyframes lightning {
					0% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					1.8% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					1.9% {
						filter: brightness(2);
						opacity: 0.3;
						background-color: $neutral-1;
					}
					2% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					2.4% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					2.6% {
						filter: brightness(2);
						opacity: 0.3;
						background-color: $neutral-1;
					}
					2.9% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
					100% {
						filter: brightness(1);
						opacity: 1;
						background-color: unset;
					}
				}
			}
		}
		&.quake {
			background-image: var(--backgroundImage);

			&-light {
				&::after {
					animation: quake-l 180s ease-in infinite;
					opacity: (0.6);

					@keyframes quake-l {
						0% {
							transform: translate(0, 0) rotate(0deg);
							filter: blur(1px);
						}
						.04% {
							transform: translate(8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.08% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.12% {
							transform: translate(0px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						.16% {
							transform: translate(8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.20% {
							transform: translate(-8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.24% {
							transform: translate(0px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.28% {
							transform: translate(8px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						.32% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.36% {
							transform: translate(0px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.40% {
							transform: translate(8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.44% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.48% {
							transform: translate(0px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						.52% {
							transform: translate(8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.56% {
							transform: translate(-8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.60% {
							transform: translate(0px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.64% {
							transform: translate(8px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						.68% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.72% {
							transform: translate(0px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.76% {
							transform: translate(0, 0) rotate(0deg);
							filter: blur(1px);
						}
						100% {
							transform: translate(0, 0) rotate(0deg);
							filter: blur(1px);
						}
					}
				}
			}
			&-medium {
				&::after {
					animation: quake-m 60s ease-in infinite;
					opacity: (0.6);

					@keyframes quake-m {
						0% {
							transform: translate(0, 0) rotate(0deg);
							filter: blur(1px);
						}
						.11% {
							transform: translate(8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.22% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.33% {
							transform: translate(0px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						.44% {
							transform: translate(8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.55% {
							transform: translate(-8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						.66% {
							transform: translate(0px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.77% {
							transform: translate(8px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						.88% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						.99% {
							transform: translate(0px, 0) rotate(1deg);
							filter: blur(3px);
						}
						1.11% {
							transform: translate(8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						1.22% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						1.33% {
							transform: translate(0px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						1.44% {
							transform: translate(8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						1.55% {
							transform: translate(-8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						1.66% {
							transform: translate(0px, 0) rotate(0deg);
							filter: blur(1px);
						}
						1.77% {
							transform: translate(8px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						1.88% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						1.99% {
							transform: translate(0px, 0) rotate(1deg);
							filter: blur(3px);
						}
						2% {
							transform: translate(0, 0) rotate(0deg);
							filter: blur(1px);
						}
						100% {
							transform: translate(0, 0) rotate(0deg);
							filter: blur(1px);
						}
					}
				}
			}
			&-heavy {
				&::after {
					animation: quake-h 0.6s ease-in infinite;
					opacity: (0.6);

					@keyframes quake-h {
						0% {
							transform: translate(0, 0) rotate(0deg);
							filter: blur(1px);
						}
						11% {
							transform: translate(8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						22% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						33% {
							transform: translate(0px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						44% {
							transform: translate(8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						55% {
							transform: translate(-8px, 0) rotate(1deg);
							filter: blur(3px);
						}
						66% {
							transform: translate(0px, 0) rotate(0deg);
							filter: blur(1px);
						}
						77% {
							transform: translate(8px, 0) rotate(-1deg);
							filter: blur(3px);
						}
						88% {
							transform: translate(-8px, 0) rotate(0deg);
							filter: blur(1px);
						}
						99% {
							transform: translate(0px, 0) rotate(1deg);
							filter: blur(3px);
						}
					}
				}
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
