<template>
	<div class="weather-wrapper">
		<div class="lightning" v-if="weather.effects.includes('Lightning')" />
		<Fog v-if="weather.effects.includes('Fog')" />
		<component 
			:is="component" 
			:intensity="weather.intensity" 
			:effects="weather.effects" 
			v-if="component"
		/>
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
			animation: lightning 8s linear infinite;
		}
	}
	@keyframes lightning {
		0% { opacity: 0; }
		10% { opacity: 0; }
		11% { opacity: .7; }
		12% { opacity: 0; }
		15% { opacity: 0; }
		16% { opacity: .7; }
		17% { opacity: 0; }
		100% { opacity: 0; }
	}
</style>