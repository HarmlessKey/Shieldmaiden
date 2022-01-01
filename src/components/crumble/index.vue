<template>
	<div class="mb-3">
		<q-breadcrumbs>
			<template v-slot:separator>
				/
			</template>
			<q-breadcrumbs-el icon="fas fa-home-alt" to="/" />
			<q-breadcrumbs-el 
				v-for="(route) in crumbs"
				:key="route.path" 
				:to="route.to"
			>
				{{ route.name }}
			</q-breadcrumbs-el>
		</q-breadcrumbs>
	</div>
</template>

<script>
	export default {
		name: 'Crumble',
		data() {
			return {
				last_route: undefined
			}
		},
		computed: {
			crumbs() {
      let pathArray = this.$route.path.split("/");
      pathArray.shift();
      let breadcrumbs = pathArray.reduce((breadcrumbArray, path, i) => {
					breadcrumbArray.push({
						path: path,
						to: breadcrumbArray[i - 1]
							? breadcrumbArray[i - 1].to + "/" + path
							: "/" + path,
						name: this.$route.matched[i] ? this.$route.matched[i].meta.title || path : path,
					});
					return breadcrumbArray;
				}, []);
				if(this.last_route) breadcrumbs.at(-1).name = this.last_route;
				return breadcrumbs;
			}
		},
		mounted() {
			// Replace the last name in breadcrumb with a value emitted from a component
			this.$root.$on("route-name", (name) => {
				this.last_route = name;
			});
		},
		watch: {
			'$route' () {
				// Reset the 
				this.last_route = undefined;
			}
		}
	}
</script>