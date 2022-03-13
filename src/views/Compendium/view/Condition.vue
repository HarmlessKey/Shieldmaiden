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
					:title="condition.name" 
					:text="condition.description" 
					size="sm"
				/>
			</div>
			<div class="card-body">
				<template v-if="not_found">
					<p>Could not find condition <b>{{ id }}</b></p>
					<router-link to="/compendium/conditions" class="btn bg-neutral-5">
						Find conditions
					</router-link>
				</template>
				<Condition v-else :data="condition" />
			</div>
		</template>
		<hk-loader v-else name="Loading condition" />
	</hk-card>
</template>

<script>
	import { mapActions } from "vuex";
	import Condition from "src/components/compendium/Condition";

	export default {
		name: 'ViewCondition',
		components: {
			Condition
		},
		metaInfo() {
			return {
				title: `${this.condition.name ? this.condition.name.capitalizeEach() : "Condition"} D&D 5e`,
				meta: [
					{ 
						vmid: "description", 
						name: "description", 
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.condition.description}`
					},
					{
						vmid: "og-title",
						property: "og:title", 
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.condition.description}`
					},
					{ 
						vmid: "og-description", 
						property: "og:description",
						name: "description", 
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.condition.description}`
					},
					{ 
						vmid: "twitter-title",
						name: "twitter:title", 
						content: `${this.condition.name ? this.condition.name.capitalizeEach() : "Condition"} D&D 5e`
					},
					{ 
						vmid: "twitter-description", 
						name: "twitter:description",
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.condition.description}`
					},
				],
			}
		},
		data() {
			return {
				id: this.$route.params.id,
				loading: true,
				condition: {},
				not_found: false
			}
		},
		async mounted() {
			await this.get_condition(this.id).then(condition => {
				const maxLength = 160 - (29 + condition.name.length);
				condition.description =  (condition.effects) ? `${condition.effects.join(" ").substring(0, maxLength).trim()}...` : "";

				this.condition = condition;
				this.loading = false;
			}).catch(() => {
				this.not_found = true;
				this.loading = false;
			});
			// Root emit with the condition name, so it can be used in Crumble component
			this.$root.$emit('route-name', this.condition.name);
		},
		methods: {
			...mapActions("api_conditions", ["get_condition"]),
		}
	}
</script>