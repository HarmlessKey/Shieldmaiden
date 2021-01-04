<template>
	<div class="weather-wrapper">
		<Fog v-if="weather.fog > 0" :intensity="weather.fog" />
		<Lightning v-if="weather.lightning > 0" :intensity="weather.lightning" />
		<Rain v-if="weather.rain > 0" :intensity="weather.rain" />
		<Hail v-if="weather.hail > 0" :intensity="weather.hail" />
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
			Fog: () => import('./Fog'),
			Lightning: () => import('./Lightning'),
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
	}
</style>