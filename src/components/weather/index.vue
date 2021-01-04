<template>
	<div class="weather-wrapper">
		<div class="lightning" v-if="weather.lightning > 0" />
		<Fog v-if="weather.fog > 0" :intensity="weather.fog" />
		<Rain v-if="weather.rain > 0" :intensity="weather.rain" />
		<Snow v-if="weather.snow > 0" :intensity="weather.snow" />
	</div>
</template>

<script>
export default {
		name: 'Weather',
		props: {
			weather: {
				type: Object,
				required: true
			}
		},
		components: {
			Rain: () => import('./Rain'),
			Snow: () => import('./Snow'),
			Fog: () => import('./Fog')
		},
    data() {
			return {
				component: null,
			}
    },
    computed: {
			loader() {
				return () => import(`./${this.weather.type}.vue`)
			}
    },
    mounted() {
      this.loader()
				.then(() => {
						this.component = () => this.loader()
				})
				.catch(() => {
						this.component = () => import('./Rain.vue')
				})
    },
}
</script>

<style lang="scss" scoped>
	.weather-wrapper {
		overflow: hidden;
    width: 100%;
    height: 100%;

		.lightning {
			background: white;
			position: absolute;
			width: 100%;
			height: 100%;
			opacity: 0;
			animation: lightning 60s linear infinite;
		}
	}
	@keyframes lightning {
		0% { opacity: 0; }
		10.9% { opacity: 0; }
		11% { opacity: .7; }
		11.1% { opacity: 0; }
		11.4% { opacity: 0; }
		11.6% { opacity: .7; }
		11.9% { opacity: 0; }
		100% { opacity: 0; }
	}
</style>