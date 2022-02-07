<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1>
				<i :class="`hki-${condition.value}`" />
				{{ condition.name }}
			</h1>
		</div>
		<div class="card-body">
			<Condition :data="condition" />
		</div>
	</hk-card>
</template>

<script>
	import { conditions } from '@/mixins/conditions.js';
	import Condition from "@/components/compendium/Condition";

	export default {
		name: 'ViewCondition',
		mixins: [conditions],
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
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.description}`
					},
					{
						vmid: "og-title",
						property: "og:title", 
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.description}`
					},
					{ 
						vmid: "og-description", 
						property: "og:description",
						name: "description", 
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.description}`
					},
					{ 
						vmid: "twitter-title",
						name: "twitter:title", 
						content: `${this.condition.name ? this.condition.name.capitalizeEach() : "Condition"} D&D 5e`
					},
					{ 
						vmid: "twitter-description", 
						name: "twitter:description",
						content: `D&D 5th Edition condition: ${ this.condition.name ? this.condition.name.capitalizeEach() : "Condition" }. ${this.description}`
					},
				],
			}
		},
		data() {
			return {
				id: this.$route.params.id
			}
		},
		computed: {
			condition() {
				return this.conditionList.filter(item => {
					return item.value === this.id;
				})[0];
			},
			description() {
				const maxLength = 160 - (29 + this.condition.name.length);
				return (this.condition && this.condition.effects) ? `${this.condition.effects.join(" ").substring(0, maxLength).trim()}...` : "";
			}
		},
		beforeMount() {
			// Root emit with the condition name, so it can be used in Crumble component
			this.$root.$emit('route-name', this.condition.name);
		}
	}
</script>