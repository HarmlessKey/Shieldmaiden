<template>
	<hk-card>
		<template v-if="!loading">
			<div slot="header" class="card-header">
				<h1>
					<i aria-hidden="true" :class="`hki-${condition.name.toLowerCase()}`" />
					{{ condition.name }}
				</h1>
				<hk-share 
					v-if="!not_found" 
					:title="condition.meta.title" 
					:text="condition.meta.description" 
					size="sm"
				/>
			</div>
			<div class="card-body">
				<template v-if="not_found">
					<p>Could not find condition <strong>{{ id }}</strong></p>
					<router-link to="/compendium/conditions" class="btn bg-neutral-5">
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
	import { eventBus } from 'src/utils/eventBus';

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
			}
		},
		meta() {
			return {
				title: this.condition.meta.title,
				meta: this.generate_compendium_meta(this.condition.meta)
			}
		},
		mounted() {
			if(this.condition) {
				this.loading = false;
				// Emit with the condition name, so it can be used in Crumble component
				eventBus.emit('route-name', this.condition.name);
			} else {
				this.not_found = true;
				this.loading = false;
			}
		}
	}
</script>