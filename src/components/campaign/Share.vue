<template>
	<div>
		<q-tabs
			v-model="tab"
			:dark="$store.getters.theme === 'dark'"
			indicator-color="transparent"
			align="left"
			inline-label
			outside-arrows
			mobile-arrows
		>
			<q-tab
				v-for="{ name, label, icon } in tabs"
				:name="name"
				:icon="icon"
				:label="label"
				:key="name"
			/>
		</q-tabs>
		<q-tab-panels v-model="tab" class="bg-transparent">
			<q-tab-panel name="background">
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					clearable
					label="Background image"
					class="mb-3"
				>
					<i slot="prepend" class="fas fa-image" aria-hidden="true" />
				</q-input>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					clearable
					label="Background video"
					class="mb-3"
				>
					<i slot="prepend" class="fas fa-video" aria-hidden="true" />
				</q-input>
				<button class="btn bg-neutral-5 mr-2">Clear</button>
				<button class="btn">Set</button>
			</q-tab-panel>
			<q-tab-panel name="share">
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					clearable
					label="Share image"
					class="mb-3"
				>
					<i slot="prepend" class="fas fa-image" aria-hidden="true" />
				</q-input>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					clearable
					label="Share video"
					class="mb-3"
				>
					<i slot="prepend" class="fas fa-video" aria-hidden="true" />
				</q-input>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					clearable
					label="Share message"
					type="textarea"
					class="mb-3"
				/>
				<button class="btn bg-neutral-5 mr-2">Stop</button>
				<button class="btn">Share</button>
			</q-tab-panel>
			<q-tab-panel name="weather">
				<Weather v-model="weather" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
import Weather from "src/views/UserContent/Encounters/Edit/Weather";

export default {
	name: "CampaignShare",
	components: {
		Weather,
	},
	data() {
		return {
			tab: "background",
			tabs: [
				{
					name: "background",
					label: "Background",
					icon: "fas fa-image",
				},
				{
					name: "share",
					label: "Share",
					icon: "fas fa-share-alt",
				},
				{
					name: "weather",
					label: "Weather",
					icon: "fas fa-cloud-rain",
				},
			],
			weather: {},
		};
	},
};
</script>

<style lang="scss" scoped>
.q-tabs {
	background-color: $neutral-8;
	position: sticky;
	top: 0;
	z-index: 10;

	.q-tab {
		&--active {
			color: $blue;
		}
	}
}
</style>
