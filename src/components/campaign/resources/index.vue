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
			<q-tab-panel name="compendium">
				<Compendium />
			</q-tab-panel>
			<q-tab-panel name="notes">
				<Notes />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
import Compendium from "./Compendium.vue";
import Notes from "./Notes.vue";

export default {
	name: "CampaignInfo",
	components: {
		Compendium,
		Notes,
	},
	data() {
		return {
			tab: "compendium",
			tabs: [
				{
					name: "compendium",
					label: "Compendium",
					icon: "fas fa-book-spells",
				},
				{
					name: "notes",
					label: "Notes",
					icon: "fas fa-sticky-note",
				},
			],
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
