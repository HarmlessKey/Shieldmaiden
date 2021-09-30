<template>
<div class="weather">
	<div class="menu">
		<div class="left">
			<router-link :to="prevRoute" class="ml-1 btn btn-sm btn-clear">
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
		<div class="right">
			<!-- <a @click="audio = !audio">
				<i :class="audio ? 'fas fa-volume-up' : 'fas fa-volume-mute'" />
			</a>
			<q-separator vertical dark class="ml-3" /> -->
			<q-btn-dropdown stretch flat dark square>
				<template #label>
					<i class="fas fa-cloud" />
					<span class="ml-1 d-none d-md-inline-block">Select effect</span>
				</template>
				<div class="bg-gray edit-weather">
					<q-item-label header>Weather effects</q-item-label>
					<EditWeather v-model="weather" />
				</div>
			</q-btn-dropdown>
		</div>
	</div>
	<Weather 
		:weather="weather" 
		:key="JSON.stringify(weather)" 
		:background="image ? image : background"
		:audio="audio"
	/>
	<a v-if="!image" class="link text-shadow-3" href="https://www.vecteezy.com/free-vector/tree" target="_blank" rel="noopener">
		Image by Vecteezy
	</a>
</div>
</template>

<script>
	import EditWeather from './Content/Encounters/Edit/Weather';

	export default {
		name: 'WeatherDemo',
		components: {
			EditWeather,
			Weather: () => import('@/components/weather')
		},
		data() {
			return {
				background: require("../assets/_img/atmosphere/winter-landscape.webp"),
				audio: false,
				image: null,
				weather: {
					snow: 1,
					fog: 1
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
			position: absolute;
			top: 0;
			left: 0;
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
			.right {
				display: flex;
				justify-content: flex-end;
			}
		}
		.link {
			position: absolute;
			left: 10px;
			bottom: 10px;
			color: $neutral-2;

			&:hover {
				color: $neutral-1;
			}
		}
	}
	.edit-weather {
		min-width: 240px;
	}
</style>