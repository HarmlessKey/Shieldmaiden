<template>
	<hk-card>
		<template v-if="!loading">
			<div slot="header" class="card-header">
				<h1>
					{{ not_found ? "Spell not found" : spell.name.capitalizeEach() }}
				</h1>
				<span class="neutral-3">
					{{ spell.page }}
				</span>
			</div>
			<div class="card-body">
				<template v-if="not_found">
					<p>Could not find spell <b>{{ id }}</b></p>
					<router-link to="/compendium/spells" class="btn bg-neutral-5">
						Find spells
					</router-link>
				</template>
				<Spell v-else :data="spell" />
			</div>
		</template>
		<hk-loader v-else name="Loading spell" />
	</hk-card>
</template>

<script>
	import { mapActions } from "vuex";
	import Spell from "@/components/compendium/Spell";

	export default {
		name: "ViewSpell",
		components: {
			Spell
		},
		metaInfo() {
			return {
				title: `${this.spell.name ? this.spell.name.capitalizeEach() : "Spell"} D&D 5e`,
				meta: [
					{ 
						vmid: "description", 
						name: "description", 
						content: `D&D 5th Edition: ${ this.spell.name ? this.spell.name.capitalizeEach() : "Spell" }. ${this.spell.description}`
					},
					{
						vmid: "og-title",
						property: "og:title", 
						content: `D&D 5th Edition: ${ this.spell.name ? this.spell.name.capitalizeEach() : "Spell" }. ${this.spell.description}`
					},
					{ 
						vmid: "og-description", 
						property: "og:description",
						name: "description", 
						content: `D&D 5th Edition: ${ this.spell.name ? this.spell.name.capitalizeEach() : "Spell" }. ${this.spell.description}`
					},
					{ 
						vmid: "twitter-title",
						name: "twitter:title", 
						content: `${this.spell.name ? this.spell.name.capitalizeEach() : "Spell"} D&D 5e`
					},
					{ 
						vmid: "twitter-description", 
						name: "twitter:description",
						content: `D&D 5th Edition: ${ this.spell.name ? this.spell.name.capitalizeEach() : "Spell" }. ${this.spell.description}`
					},
				],
			}
		},
		data() {
			return {
				id: this.$route.params.id,
				loading: true,
				spell: {},
				not_found: false
			}
		},
		async mounted() {
			await this.get_api_spell(this.id).then(spell => {
				const maxLength = 160 - (29 + spell.name.length);
				spell.description = `${spell.desc.join(" ").substring(0, maxLength).trim()}...`;

				this.spell = spell;
				this.loading = false;
			}).catch(() => {
				this.not_found = true;
				this.loading = false;
			});
			// Root emit with the spell name, so it can be used in Crumble component
			this.$root.$emit('route-name', this.spell.name);
		},
		methods: {
			...mapActions("api_spells", ["get_api_spell"]),
		}
	}
</script>