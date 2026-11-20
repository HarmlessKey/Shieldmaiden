<template>
	<Effects mode="conditions" :data="data" />
</template>

<script>
import Effects from "src/components/drawers/encounter/Effects.vue";

// The Conditions option opens the Effects drawer limited to SRD conditions
export default {
	name: "Conditions",
	components: {
		Effects,
	},
	// Entity keys, falls back to the targeted entities
	props: {
		data: {
			type: Array,
			default: undefined,
		},
	},
};
</script>
