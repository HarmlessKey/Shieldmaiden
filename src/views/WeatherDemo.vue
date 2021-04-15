<template>
<div class="weather">
	<div class="menu">
		<div class="left">
			<router-link :to="prevRoute" class="pl-2">
				<i class="fas fa-chevron-left" />
				Back
			</router-link>
			<q-separator vertical dark class="mx-2" />
			<q-input 
				dark square dense clearable
				v-model="image"
				placeholder="Background image URL"
				borderless
			/>
		</div>
		<q-btn-dropdown stretch flat dark square>
			<template #label>
				<i class="fas fa-cloud mr-1" /> Select effect
			</template>
			<div class="bg-gray edit-weather">
				<q-item-label header>Weather effects</q-item-label>
				<EditWeather v-model="weather" />
			</div>
		</q-btn-dropdown>
	</div>
	<Weather :weather="weather" :key="JSON.stringify(weather)" :background="image ? image : background" />
</div>
</template>

<script>
	import EditWeather from './MyContent/Encounters/Edit/Weather';

	export default {
		name: 'WeatherDemo',
		components: {
			EditWeather,
			Weather: () => import('@/components/weather')
		},
		data() {
			return {
				background: require("../assets/_img/weather-background.jpg"),
				image: null,
				weather: {
					rain: 1
				},
				prevRoute: "/"
			}
		},
		beforeRouteEnter(to, from, next) {
			next(vm => {
				vm.prevRoute = from.path
			})
		},	
	}
</script>

<style lang="scss" scoped>
	.weather {
		overflow: hidden;
		height: 100%;
		width: 100%;
		position: relative;
		background-size: cover;
		background-position: center top;

		&::-webkit-scrollbar {
			display: none;
		}

		.menu {
			background: $gray-darker;
			height: 36px;
			width: 100%;
			z-index: 999;
			position: relative;
			display: flex;
			justify-content: space-between;
			line-height: 36px;

			.left {
				display: flex;
				justify-content: flex-start;
			}
		}
	}
	.edit-weather {
		min-width: 240px;
	}
</style>