<template>
	<hk-card header="Download XML Sitemap">
		<div class="card-body">
			<p>Creates a json file with an array of all paths that must be prerendered</p>
			<a class="btn bnt-large" @click="downloadJson()">Download JSON</a>
		</div>
	</hk-card>
</template>

<script>
	import { mapActions } from "vuex";

	export default {
		name: 'PrerenderPaths',
		data() {
			return {
				routes: [
					"/",
					"/about-us",
					"/privacy-policy",
					"/patreon",
					"/feedback",
					"/compendium",
					"/compendium/conditions",
					"/compendium/monsters",
					"/compendium/spells",
					"/compendium/items"
				]
			}
		},

		methods: {
			...mapActions("api_monsters", ["get_monsters",]),
			...mapActions("api_items", ["get_api_items",]),
			...mapActions("api_spells", ["get_api_spells",]),
			...mapActions("api_conditions", ["get_conditions",]),
			async downloadJson() {

				// CONDITIONS
				const conditions = await this.get_conditions({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});
		
				for(const condition of conditions.results) {
					this.routes.push(`/compendium/conditions/${condition.url}`);
				}

				// ITEMS
				const items = await this.get_api_items({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});

				for(const item of items.results) {
					this.routes.push(`/compendium/items/${item.url}`);
				}

				// MONSTERS
				const monsters = await this.get_monsters({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});
		
				for(const monster of monsters.results) {
					this.routes.push(`/compendium/monsters/${monster.url}`);
				}

				// SPELLS
				const spells = await this.get_api_spells({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});
		
				for(const spell of spells.results) {
					this.routes.push(`/compendium/spells/${spell.url}`);
				}

				//TO DOWNLOAD THE FILE
				const filename = "prerender.json";
				const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.routes)); 
				const downloadAnchorNode = document.createElement('a'); 
				downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", filename);
				document.body.appendChild(downloadAnchorNode);  // required for firefox 
				downloadAnchorNode.click();
				downloadAnchorNode.remove();
			}
		}
	}
</script>