<template>
	<component :is="component" :data="drawer.data" :type="drawer.type" v-if="component" />
</template>

<script>
export default {
	name: "Drawer",
	data() {
		return {
			drawer: this.$store.getters.getDrawer,
			component: null,
		};
	},
	computed: {
		loader() {
			if (!this.drawer.type) {
				return null;
			}
			return () => import(`./${this.drawer.type}.vue`);
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
	},
};
</script>

<style lang="scss" scoped>
.drawer-wrap {
	padding: 10px;
}
</style>
