<template>
	<div>
		<q-tabs
			v-model="tab"
			:dark="$store.getters.theme === 'dark'"
			indicator-color="transparent"
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
			<q-tab-panel name="spotify"> </q-tab-panel>
			<q-tab-panel name="youtube"> </q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
export default {
	name: "Media",
	data() {
		return {
			tab: "spotify",
			tabs: [
				{
					name: "spotify",
					label: "Spotify",
					icon: "fab fa-spotify",
				},
				{
					name: "youtube",
					label: "Youtube",
					icon: "fab fa-youtube",
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
