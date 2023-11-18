<template>
	<div>
		<Compendium />
		<router-link class="btn bg-neutral-5 mt-3 btn-block" to="/compendium">
			View entire compendium
		</router-link>
	</div>
</template>

<script>
import Compendium from "src/components/campaign/resources/Compendium.vue";

export default {
	name: "CompendiumDrawer",
	components: {
		Compendium,
	},
};
</script>
