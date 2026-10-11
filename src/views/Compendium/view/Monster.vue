<template>
	<hk-card>
		<hk-loader v-if="loading" name="monster" />
		<template v-else>
			<div slot="header" class="card-header">
				<h1>
					{{ not_found ? "Monster not found" : monster.name.capitalizeEach() }}
					<span v-if="!not_found" class="neutral-2">{{ editionLabel }}</span>
				</h1>
				<div class="flex items-center gap-1">
					<span class="neutral-3">
						{{ monster.source }}
					</span>
					<router-link v-if="!not_found" class="btn btn-sm bg-neutral-5" :to="otherEdition.to">
						Show for {{ otherEdition.label }}
					</router-link>
					<hk-share
						v-if="!not_found"
						:title="monster.meta.title"
						:text="monster.meta.description"
						size="sm"
						class="ml-1"
					/>
				</div>
			</div>
			<div v-if="not_found" class="card-body">
				<p>
					Could not find monster <strong>{{ id }}</strong>
				</p>
				<router-link :to="listPath" class="btn bg-neutral-5"> Find monsters </router-link>
			</div>
			<ViewMonster v-else :data="monster" />
		</template>
	</hk-card>
</template>

<script>
import ViewMonster from "src/components/compendium/Monster";
import { mapGetters } from "vuex";
import { metaCompendium } from "src/mixins/metaCompendium";
import { otherEdition } from "src/utils/generalFunctions";

export default {
	name: "Monster",
	mixins: [metaCompendium],
	components: {
		ViewMonster,
	},
	data() {
		return {
			id: this.$route.params.id,
			loading: true,
			not_found: false,
		};
	},
	// Fetch the monster Server side, on the Client side retrieve it from the store
	async preFetch({ store, currentRoute }) {
		await store.dispatch(
			"api_monsters/fetch_monster",
			{ id: currentRoute.params.id, edition: currentRoute.params.edition },
			{ root: true }
		);
	},
	computed: {
		...mapGetters("api_monsters", ["get_monster"]),
		monster() {
			return this.get_monster(this.id, this.$route.params.edition);
		},
		listPath() {
			return this.$route.params.edition
				? `/compendium/monsters/${this.$route.params.edition}`
				: "/compendium/monsters";
		},
		otherEdition() {
			return otherEdition(this.$route);
		},
		editionLabel() {
			return this.$route.params.edition || "5e";
		},
	},
	meta() {
		return {
			title: this.compendium_edition_text(this.monster.meta.title),
			meta: this.generate_compendium_meta(this.monster.meta),
		};
	},
	mounted() {
		if (this.monster) {
			this.loading = false;
			this.$root.$emit("route-name", this.monster.name.capitalizeEach());
		} else {
			this.not_found = true;
			this.loading = false;
		}
	},
};
</script>
