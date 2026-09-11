<template>
	<hk-card header="Feature Flags">
		<div class="card-body">
			<p class="neutral-2">
				Flags are not real-time — a toggle here takes effect for clients on their next page
				load/reload, not immediately for already-open tabs.
			</p>
			<q-list :dark="$store.getters.theme === 'dark'">
				<q-item v-for="(flag, id) in feature_flags" :key="id">
					<q-item-section>
						<q-item-label>{{ flag.label }}</q-item-label>
						<q-item-label caption>{{ id }}</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-toggle
							:value="flags[id]"
							:loading="updating[id]"
							@input="(enabled) => toggle(id, enabled)"
						/>
					</q-item-section>
				</q-item>
			</q-list>
		</div>
	</hk-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { FEATURE_FLAGS } from "src/utils/featureFlags";

export default {
	name: "FeatureFlags",
	data() {
		return {
			feature_flags: FEATURE_FLAGS,
			updating: {},
		};
	},
	computed: {
		...mapGetters("feature_flags", ["flags"]),
	},
	async mounted() {
		await this.fetch_flags();
	},
	methods: {
		...mapActions("feature_flags", ["fetch_flags", "set_flag_enabled"]),
		async toggle(id, enabled) {
			this.$set(this.updating, id, true);
			try {
				await this.set_flag_enabled({ id, enabled });
			} catch (error) {
				this.$snotify.error(error, "Failed to update flag", {});
			} finally {
				this.$delete(this.updating, id);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.q-item {
	background-color: $neutral-8;
	margin-bottom: 1px;
}
</style>
