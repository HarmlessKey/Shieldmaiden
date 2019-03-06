<template>
	<div class="d-none d-md-block">
		<ul class="crumble d-flex justify-content-left">
			<li>
				<router-link to="/">Home</router-link>
			</li>
			<li>
				<i class="fas fa-chevron-right mr-2"></i>
				<router-link :to="explodePath($route.path, 1)">Compendium</router-link>
			</li>
			<template v-if="$route.meta.baseName">
				<li>
					<i class="fas fa-chevron-right mr-2"></i>
					<router-link :to="explodePath($route.path, 2)">{{ $route.meta.baseName }}</router-link>
				</li>
				<li v-if="name">
					<i class="fas fa-chevron-right mr-2"></i>
					{{ name }}
				</li>
			</template>
		</ul>
	</div>
</template>

<script>
	export default {
		name: 'Crumble',
		props: ['name'],
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