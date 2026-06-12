<template>
	<hk-card>
		<template v-if="!loading">
			<div slot="header" class="card-header">
				<h1>
					<i aria-hidden="true" :class="`hki-${condition.name.toLowerCase()}`" />
					{{ condition.name }}
					<span v-if="!not_found" class="neutral-2">{{ editionLabel }}</span>
				</h1>
				<div class="flex items-center gap-1">
					<router-link v-if="!not_found" class="btn btn-sm bg-neutral-5" :to="otherEdition.to">
						Show for {{ otherEdition.label }}
					</router-link>
					<hk-share
						v-if="!not_found"
						:title="condition.meta.title"
						:text="condition.meta.description"
						size="sm"
					/>
				</div>
			</div>
			<div class="card-body">
				<template v-if="not_found">
					<p>Could not find condition <strong>{{ id }}</strong></p>
					<router-link :to="listPath" class="btn bg-neutral-5">
						Find conditions
					</router-link>
				</template>
				<Condition v-else :data="condition" />
			</div>
		</template>
		<hk-loader v-else name="condition" />
	</hk-card>
</template>

<script>
	import Condition from "src/components/compendium/Condition";
	import { mapGetters } from 'vuex';
	import { metaCompendium } from 'src/mixins/metaCompendium';
	import { otherEdition } from 'src/utils/generalFunctions';

	export default {
		name: 'ViewCondition',
		mixins: [
			metaCompendium
		],
		components: {
			Condition
		},
		data() {
			return {
				id: this.$route.params.id,
				loading: true,
				not_found: false
			}
		},
		// Fetch the condition Server side, on the Client side retrieve it from the store
		async preFetch({ store, currentRoute }) {
			await store.dispatch("api_conditions/fetch_condition", currentRoute.params.id, { root: true });
		},
		computed: {
			...mapGetters("api_conditions", ["get_condition"]),
			condition() {
				return this.get_condition(this.id);
			},
			listPath() {
				return this.$route.params.edition ? `/compendium/conditions/${this.$route.params.edition}` : "/compendium/conditions";
			},
			otherEdition() {
				return otherEdition(this.$route);
			},
			editionLabel() {
				return this.$route.params.edition || "5e";
			}
		},
		meta() {
			return {
				title: this.compendium_edition_text(this.condition.meta.title),
				meta: this.generate_compendium_meta(this.condition.meta)
			}
		},
		mounted() {
			if(this.condition) {
				this.loading = false;
				// Root emit with the condition name, so it can be used in Crumble component
				this.$root.$emit('route-name', this.condition.name);
			} else {
				this.not_found = true;
				this.loading = false;
			}
		}
	}
</script>
