<template>
	<div>
		<q-tabs v-model="tab" :dark="$store.getters.theme === 'dark'" inline-label dense no-caps>
			<q-tab
				v-for="({ name, icon, label }, index) in tabs"
				:key="`tab-${index}`"
				:name="name"
				:icon="icon"
				:label="label"
			/>
		</q-tabs>

		<q-tab-panels v-model="tab" class="bg-transparent overflow-visible">
			<q-tab-panel :name="name" v-for="{ name } in tabs" :key="`panel-${name}`">
				<Manual v-if="name === 'manual'" :current="current" :autofocus="autofocus" />
				<CustomRoll v-if="name === 'roll'" :current="current" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
import Manual from "./Manual";
import CustomRoll from "./CustomRoll";

export default {
	name: "CustomInput",
	props: ["current", "autofocus"],
	components: {
		Manual,
		CustomRoll,
	},
	data() {
		return {
			tab: "manual",
			tabs: [
				{ name: "manual", label: "Manual", icon: "fas fa-keyboard" },
				{ name: "roll", label: "Roll", icon: "fas fa-dice-d20" },
			],
		};
	},
};
</script>

<style lang="scss" scoped>
.q-tab-panel {
	padding: 15px 0;
}
.overflow-visible {
	overflow: visible;
	:deep(.q-panel) {
			overflow: visible;
	}
}
</style>
