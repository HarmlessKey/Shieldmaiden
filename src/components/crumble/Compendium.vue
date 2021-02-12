<template>
	<div>
		<q-breadcrumbs>
			<template v-slot:separator>
        <q-icon
          name="fas fa-chevron-right"
        />
      </template>
			<q-breadcrumbs-el icon="fas fa-home-alt" to="/" />
			<q-breadcrumbs-el :label="$route.path.split('/')[1] === 'compendium' ? 'Compendium' : 'Contribute'" :to="`/${$route.path.split('/')[1]}`" />
			<template v-if="$route.params.type || $route.meta.baseName">
				<q-breadcrumbs-el :label="$route.params.type || $route.meta.baseName" :to="explodePath($route.path, 2)" />
				<q-breadcrumbs-el v-if="name" :label="name.capitalize()" />
			</template>
		</q-breadcrumbs>
		<hr>
	</div>
</template>

<script>
	export default {
		name: 'Crumble',
		props: ['base', 'name'],
		data() {
			return {
			}
		},
		methods: {
			explodePath(path, N) {
				//Return a specific part of the entire path

				var i;
				var newPath = ''; //create a new empty path
				var parts = path.split('/'); //splite the path up

				//Return only the desired parts (N) of the path
				for(i = 1; i <= N; i++) {
					newPath += '/'+parts[i]
				}
				return newPath
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>