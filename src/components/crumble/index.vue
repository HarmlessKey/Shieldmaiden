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
		data() {
			return {

			}
		},
		methods: {
			
		},
		mounted() {
			console.log(this.$route)
		},
		computed: {
			crumbs: function() {
      let pathArray = this.$route.path.split("/")
      pathArray.shift()
      let breadcrumbs = pathArray.reduce((breadcrumbArray, path, idx) => {
					breadcrumbArray.push({
						path: path,
						to: breadcrumbArray[idx - 1]
							? "/" + breadcrumbArray[idx - 1].path + "/" + path
							: "/" + path,
						name: this.$route.matched[idx].name || path,
					});
					return breadcrumbArray;
				}, [])
				return breadcrumbs;
			}
		}
	}
</script>