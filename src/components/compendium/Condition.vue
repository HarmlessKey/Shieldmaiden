<template>
	<!-- A v2 condition is an effect definition: shown as in the Effects drawer (effects 12) -->
	<EffectDetails :definition="condition" :edition="resolvedEdition" />
</template>

<script>
	import { mapActions } from "vuex";
	import EffectDetails from "src/components/drawers/encounter/effects/EffectDetails.vue";

	export default {
		name: "Condition",
		components: {
			EffectDetails,
		},
		props: {
			// If the condition is fetched in a parent component you can send the full condition object in de data prop
			data: {
				type: Object
			},
			// If the id prop is passed, the condition is fetched in the Condition component
			id: {
				type: String
			},
			// Edition to fetch the condition for when using the id prop; falls back to the route edition
			edition: {
				type: String
			}
		},
		data() {
			return {
				condition: undefined,
				loading: true,
			}
		},
		computed: {
			resolvedEdition() {
				return this.edition || (this.$route.params.edition === "5.5e" ? "5.5e" : "5e");
			},
		},
		async beforeMount() {
			if(this.data) {
				this.condition = this.data;
				this.loading = false;
			} else {
				this.condition = await this.fetch_condition({ id: this.id, edition: this.resolvedEdition });
				this.loading = false;
			}
		},
		methods: {
			...mapActions("api_conditions", ["fetch_condition"]),
		}
	};
</script>
