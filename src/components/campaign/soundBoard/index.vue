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
			<q-tab-panel name="music">
				<Board type="music" />
			</q-tab-panel>
			<q-tab-panel name="ambience">
				<Board type="ambience" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
import Board from "./Board.vue";

export default {
	name: "Media",
	components: {
		Board,
	},
	data() {
		return {
			tab: "music",
			tabs: [
				{
					name: "ambience",
					label: "Ambience",
					icon: "fas fa-volume",
				},
				{
					name: "music",
					label: "Music",
					icon: "fas fa-music",
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
	z-index: 50;

	.q-tab {
		&--active {
			color: $blue;
		}
	}
}
.q-tab-panels {
	height: 100%;
	position: static;
}
.q-tab-panel {
	padding: 10px;
	min-height: 100%;
	position: static;
}
</style>
