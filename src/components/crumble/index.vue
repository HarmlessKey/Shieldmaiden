<template>
	<div class="breadcrumb">
		<q-breadcrumbs>
			<template v-slot:separator> / </template>
			<q-breadcrumbs-el icon="fas fa-home-alt" to="/" />
			<q-breadcrumbs-el v-for="route in crumbs" :key="route.path" :to="route.to">
				{{ route.name }}
			</q-breadcrumbs-el>
		</q-breadcrumbs>
	</div>
</template>

<script>
export default {
	name: "Crumble",
	data() {
		return {
			last_route: undefined,
		};
	},
	computed: {
		crumbs() {
			const compendiumEditionCrumbs = this.compendiumEditionCrumbs();
			if (compendiumEditionCrumbs) return compendiumEditionCrumbs;

			let pathArray = this.$route.path.split("/");
			pathArray.shift();
			let breadcrumbs = pathArray.reduce((breadcrumbArray, path, i) => {
				if (path) {
					breadcrumbArray.push({
						path: path,
						to: breadcrumbArray[i - 1] ? breadcrumbArray[i - 1].to + "/" + path : "/" + path,
						name: this.$route.matched[i] ? this.$route.matched[i].meta.crumb || this.$route.matched[i].meta.title || path : path,
					});
				}
				return breadcrumbArray;
			}, []);
			if (this.last_route) breadcrumbs.at(-1).name = this.last_route;
			return breadcrumbs;
		},
	},
	methods: {
		compendiumEditionCrumbs() {
			const [, base, section, edition, id] = this.$route.path.split("/");
			if (base !== "compendium" || edition !== "5.5e") return null;

			const sectionLabels = {
				conditions: "Conditions",
				items: "Items",
				monsters: "Monsters",
				rules: "Rules",
				spells: "Spells",
			};
			if (!sectionLabels[section]) return null;

			const breadcrumbs = [
				{
					path: "compendium",
					to: "/compendium",
					name: this.$route.matched[0]?.meta.crumb || this.$route.matched[0]?.meta.title || "Compendium",
				},
				{
					path: section,
					to: `/compendium/${section}/${edition}`,
					name: sectionLabels[section],
				},
			];

			if (id) {
				breadcrumbs.push({
					path: id,
					to: this.$route.path,
					name: this.last_route || this.$route.meta.crumb || this.$route.meta.title || id,
				});
			} else if (this.last_route) {
				breadcrumbs.at(-1).name = this.last_route;
			}
			return breadcrumbs;
		},
	},
	mounted() {
		// Replace the last name in breadcrumb with a value emitted from a component
		this.$root.$on("route-name", (name) => {
			this.last_route = name;
		});
	},
	watch: {
		$route() {
			// Reset the
			this.last_route = undefined;
		},
	},
};
</script>
