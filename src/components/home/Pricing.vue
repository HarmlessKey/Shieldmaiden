<template>
	<div class="pricing">
		<div class="container">
			<div class="head">
				<h2>Pricing</h2>
				<div class="text">
					Shieldmaiden has a free tier that gives access to al our core features, including our
					Combat Tracker and Encounter Builder.
				</div>
			</div>
			<Tiers class="mb-4" />
			<div class="d-flex justify-center">
				<router-link class="btn btn-lg bg-patreon-red" to="/patreon"
					>More about pricing</router-link
				>
			</div>
		</div>
	</div>
</template>

<script>
import Tiers from "src/components/Tiers.vue";

export default {
	name: "Pricing",
	components: {
		Tiers,
	},
	data() {
		return {};
	},
};
</script>

<style lang="scss" scoped></style>
