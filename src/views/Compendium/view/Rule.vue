<template>
	<hk-card>
		<div slot="header" class="card-header">
			<h1>{{ !rule ? "Rule not found" : rule.name }}</h1>
			<hk-share 
				v-if="!!rule" 
				:title="rule.name"
				:text="rule.description"
				size="sm"
			/>
		</div>
		<div class="card-body">
			<div v-if="!rule">
				<p>Could not find rule <strong>{{ id }}</strong></p>
				<router-link to="/compendium/rules" class="btn bg-neutral-5">
					Find rules
				</router-link>
			</div>
			<div class="caption">{{ rule.caption }}</div>
			<hk-markdown-editor :value="rule.description" read-only />
			<span class="neutral-2">{{ rule.src }}</span>
		</div>
	</hk-card>
</template>

<script>
	import { rules } from "src/utils/generalConstants";
	import { metaCompendium } from 'src/mixins/metaCompendium';

	export default {
		name: "ViewRule",
		mixins: [
			metaCompendium,
		],
		data() {
			return {
				id: this.$route.params.id
			}
		},
		computed: {
			rule() {
				return rules?.find(rule => rule.url === this.id);
			}
		},
		meta() {
			return {
				title: this.rule?.name,
				meta: this.generate_compendium_meta({ title: this.rule?.name, description: this.rule?.description })
			}
		},
		mounted() {
		}
	}
</script>

<style lang="scss" scoped>
	.caption {
		margin-bottom: .5rem;
		font-style: italic;
		font-size: 18px;
		color: $neutral-2;
	}
</style>