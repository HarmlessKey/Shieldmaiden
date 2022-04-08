<template>
	<hk-card>
		<template v-if="!loading">
			<div slot="header" class="card-header">
				<h1>
					{{ not_found ? "Spell not found" : spell.name.capitalizeEach() }}
				</h1>
				<div>
					<span class="neutral-3">
						{{ spell.page }}
					</span>
					<hk-share 
						v-if="!not_found" 
						:title="spell.meta.title" 
						:text="spell.meta.description" 
						size="sm"
						class="ml-1"
					/>
				</div>
			</div>
			<div class="card-body">
				<template v-if="not_found">
					<p>Could not find spell <strong>{{ id }}</strong></p>
					<router-link to="/compendium/spells" class="btn bg-neutral-5">
						Find spells
					</router-link>
				</template>
				<Spell v-else :data="spell" />
			</div>
		</template>
		<hk-loader v-else name="spell" />
	</hk-card>
</template>

<script>
	import { mapGetters } from "vuex";
	import Spell from "src/components/compendium/Spell";
	import { metaCompendium } from 'src/mixins/metaCompendium';

	export default {
		name: "ViewSpell",
		mixins: [
			metaCompendium
		],
		components: {
			Spell
		},
		data() {
			return {
				id: this.$route.params.id,
				loading: true,
				not_found: false
			}
		},
		// Fetch the spell Server side, on the Client side retrieve it from the store
		async preFetch({ store, currentRoute }) {
			await store.dispatch("api_spells/fetch_api_spell", currentRoute.params.id, { root: true });
		},
		computed: {
			...mapGetters("api_spells", ["get_api_spell"]),
			spell() {
				return this.get_api_spell(this.id);
			}
		},
		meta() {
			return {
				title: this.spell.meta.title,
				meta: this.generate_compendium_meta(this.spell.meta)
			}
		},
		mounted() {
			if(this.spell) {
				this.loading = false;
				// Root emit with the spell name, so it can be used in Crumble component
				this.$root.$emit('route-name', this.spell.name);
			} else {
				this.not_found = true;
			}
		}
	}
</script>