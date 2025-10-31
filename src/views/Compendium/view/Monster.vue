<template>
	<hk-card>
		<hk-loader v-if="loading" name="monster" />
		<template v-else>
			<div slot="header" class="card-header">
				<h1>
					{{ not_found ? "Monster not found" : monster.name.capitalizeEach() }}
				</h1>
				<div>
					<span class="neutral-3">
						{{ monster.source }}
					</span>
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
				<router-link to="/compendium/monsters" class="btn bg-neutral-5">
					Find monsters
				</router-link>
			</div>
			<ViewMonster v-else :data="monster" />
		</template>
	</hk-card>
</template>

<script>
import ViewMonster from "src/components/compendium/Monster";
import { mapGetters } from "vuex";
import { metaCompendium } from "src/mixins/metaCompendium";
import { eventBus } from 'src/utils/eventBus';

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
		await store.dispatch("api_monsters/fetch_monster", currentRoute.params.id, { root: true });
	},
	computed: {
		...mapGetters("api_monsters", ["get_monster"]),
		monster() {
			return this.get_monster(this.id);
		},
	},
	meta() {
		return {
			title: this.monster.meta.title,
			meta: this.generate_compendium_meta(this.monster.meta),
		};
	},
	mounted() {
		if (this.monster) {
			this.loading = false;
			eventBus.emit("route-name", this.monster.name.capitalizeEach());
		} else {
			this.not_found = true;
			this.loading = false;
		}
	},
};
</script>
