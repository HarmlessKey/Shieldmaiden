<template>
	<div class="drawer">
		<a @click="hideDrawer()" class="hide">
			<i aria-hidden="true" class="far fa-chevron-double-right" />
			<span class="neutral-2 ml-2 d-none d-sm-inline">[esc]</span>
			<q-tooltip anchor="bottom middle" self="center middle"> Hide [esc] </q-tooltip>
		</a>
		<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
			<div class="drawer__content" :class="drawer.classes">
				<component
					v-if="component"
					v-bind="!Array.isArray(drawer.data) ? drawer.data : null"
					:is="component"
					:data="drawer.data"
					:type="drawer.type"
				/>
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { onKeyStroke } from "@vueuse/core";

export default {
	name: "Drawer",
	data() {
		return {
			drawer: this.$store.getters.getDrawer,
			component: null,
			keyCleanup: null,
		};
	},
	computed: {
		loader() {
			if (!this.drawer.type) {
				return null;
			}
			// @vite-ignore - Dynamic drawer component loading based on type
			return () => import(/* @vite-ignore */ `./${this.drawer.type}.vue`);
		},
	},
	mounted() {
		this.loader()
			.then(() => {
				this.component = () => this.loader();
			})
			.catch(() => {
				this.component = () => import("./drawers/Error.vue");
			});

		// ESC to hide drawer
		this.keyCleanup = onKeyStroke("Escape", (e) => {
			e.preventDefault();
			this.hideDrawer();
		});
	},
	beforeUnmount() {
		// Cleanup keyboard listeners
		if (this.keyCleanup) {
			this.keyCleanup();
		}
	},
	methods: {
		...mapActions(["setDrawer"]),
		hideDrawer() {
			this.setDrawer(false);
		},
	},
};
</script>

<style lang="scss" scoped>
.q-scrollarea {
	height: 100%;
	position: relative;

	&::v-deep {
		.q-scrollarea__content {
			width: 100%;
		}
	}
}
</style>
