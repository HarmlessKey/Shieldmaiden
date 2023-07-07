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
			<q-tab-panel name="background"> </q-tab-panel>
			<q-tab-panel name="share"> </q-tab-panel>
			<q-tab-panel name="weather"> </q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
export default {
	name: "CampaignShare",
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
		};
	},
};
</script>

<style lang="scss" scoped>
.q-tabs {
	background-color: $neutral-8;

	.q-tab {
		&--active {
			color: $blue;
		}
	}
}
</style>
