<template>
	<hk-card header="Admin">
		<div class="card-body">
			<q-list>
				<q-item v-for="(item, index) in items" :key="index">
					<q-item-section avatar>
						<i class="mr-2" :class="item.icon" />
					</q-item-section>
					<q-item-section>
						<router-link :to="$route.path+'/'+item.url">{{ item.name }}</router-link>
					</q-item-section>
				</q-item>
			</q-list>
		</div>
	</hk-card>
</template>

<script>
	import Crumble from '@/components/crumble/Compendium.vue'

	export default {
		name: 'Admin',
		components: {
			Crumble,
		},
		data() {
			return {
				items: {
					'users': { 
						name: 'Users',
						url: 'users',
						icon: 'fas fa-users',
					},
					'patrons': { 
						name: 'Patrons',
						url: 'patrons',
						icon: 'fab fa-patreon',
					},
					"export": {
						name: "Export databases",
						url: "export",
						icon: "fas fa-file-export"
					},
					'xml': { 
						name: 'Generate XML sitemap',
						url: 'xml',
						icon: 'fas fa-file-code',
					},
					'monster-update': { 
						name: 'Update monsters',
						url: 'monster-update',
						icon: 'fas fa-file-edit',
					},
					'generate-search-table': {
						name: "Generate search table",
						url: 'search-table',
						icon: 'fas fa-print-search',
					},
					'restruct-database': {
						name: "Restructure Database",
						url: 'restruct-db',
						icon: 'fas fa-folder-tree',
					},
				},
			}
		}
	}
</script>

<style lang="scss" scoped>
	.q-item {
		background-color: $neutral-8;
		margin-bottom: 1px;
	}
</style>