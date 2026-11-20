<template>
	<div>
		<router-view />
		<!-- The start modal on /demo, until an edition is chosen in this visit -->
		<DemoStartDialog v-if="showStart" />
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import DemoStartDialog from "src/components/demo/DemoStartDialog.vue";

export default {
	name: "DemoLayout",
	components: {
		DemoStartDialog,
	},
	computed: {
		...mapGetters("encounters", ["demo_edition"]),
		showStart() {
			return this.$route.name === "DemoBuildEncounter" && !this.demo_edition;
		},
	},
};
</script>
