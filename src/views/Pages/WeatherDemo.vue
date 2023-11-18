<template>
	<div class="weather">
		<div class="menu">
			<div class="left">
				<router-link :to="prevRoute" class="ml-1 btn btn-sm btn-clear">
					<i aria-hidden="true" class="fas fa-chevron-left" />
					Back
				</router-link>
				<q-separator vertical :dark="$store.getters.theme === 'dark'" class="ml-2" />
				<hk-background-select
					v-model="background"
					placeholder="Select background"
					borderless
					:clearable="false"
				/>
			</div>
			<div class="right">
				<q-btn-dropdown stretch no-caps flat :dark="$store.getters.theme === 'dark'" square>
					<template #label>
						<i aria-hidden="true" class="fas fa-cloud" />
						<span class="ml-1 d-none d-md-inline-block">Select effect</span>
					</template>
					<div class="bg-neutral-11 edit-weather">
						<q-item-label header>Weather effects</q-item-label>
						<EditWeather v-model="weather" />
					</div>
				</q-btn-dropdown>
			</div>
		</div>
		<Weather
			:weather="weather"
			:key="JSON.stringify(weather)"
			:background="require(`../../assets/_img/atmosphere/${background}.jpg`)"
			:audio="audio"
		/>
	</div>
</template>

<script>
import EditWeather from "src/components/encounters/Weather";

export default {
	name: "WeatherDemo",
	components: {
		EditWeather,
		Weather: () => import("src/components/weather"),
	},
	data() {
		return {
			background: "winter-landscape",
			audio: false,
			image: null,
			weather: {
				snow: 1,
				fog: 1,
			},
			prevRoute: "/",
		};
	},
	beforeRouteEnter(to, from, next) {
		next((vm) => {
			vm.prevRoute = from.path;
		});
	},
};
</script>

<style lang="scss" scoped>
.weather {
	overflow: hidden;
	height: calc(100vh - 50px);
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
		background: $neutral-8;
		height: 36px;
		width: 100%;
		z-index: 999;
		display: flex;
		justify-content: space-between;
		line-height: 31px;

		a {
			margin: 3px;
		}
		.left {
			display: flex;
			justify-content: flex-start;

			&::v-deep .q-field {
				.row,
				.q-field__control,
				.q-field__inner {
					min-height: 0;
					max-height: 36px;
				}
				input {
					height: 36px;
					line-height: 36px;
				}
			}
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
