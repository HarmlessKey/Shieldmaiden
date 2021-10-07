<template>
	<div>
		<q-breadcrumbs>
			<template v-slot:separator>
				<q-icon name="fas fa-chevron-right" />
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
		<hr>
	</div>
</template>

<script>
	export default {
		name: 'Crumble',
		computed: {
			crumbs() {
      let pathArray = this.$route.path.split("/");
      pathArray.shift();
      let breadcrumbs = pathArray.reduce((breadcrumbArray, path, i) => {
					breadcrumbArray.push({
						path: path,
						to: breadcrumbArray[i - 1]
							? "/" + breadcrumbArray[i - 1].path + "/" + path
							: "/" + path,
						name: this.$route.matched[i] ? this.$route.matched[i].name || path : path,
					});
					return breadcrumbArray;
				}, []);
				return breadcrumbs;
			}
		}
	}
</script>