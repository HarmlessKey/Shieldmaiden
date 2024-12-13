<template>
	<div class="pricing">
		<div class="home__container">
			<div class="head">
				<h2>Pricing</h2>
				<div class="text">
					<p class="mb-4">
						All of our core features are available for free, forever. For DMs running larger
						campaigns and/or wanting some extra functionality, there's paid tiers offering extra
						storage & features.
					</p>
					Your support helps us keep the app afloat & spend more time improving it. Thank you!
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
