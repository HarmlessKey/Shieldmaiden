<template>
	<hk-card header="Download XML Sitemap">
		<div class="card-body">
			<p>Creates an XML with all URLs of the website for Google. Add this file in the public folder as sitemap.xml</p>
			<a class="btn bnt-large" @click="downloadXml()">Download XML sitemap</a>
		</div>
	</hk-card>
</template>

<script>
	import { mapActions } from "vuex";

	export default {
		name: 'XML',
		data() {
			return {
				routes: [
					"https://harmlesskey.com",
					"https://harmlesskey.com/demo",
					"https://harmlesskey.com/documentation",
					"https://harmlesskey.com/about-us",
					"https://harmlesskey.com/sign-up",
					"https://harmlesskey.com/sign-in",
					"https://harmlesskey.com/privacy-policy",
					"https://harmlesskey.com/updates",
					"https://harmlesskey.com/feedback",
					"https://harmlesskey.com/patreon",
					"https://harmlesskey.com/compendium",
					"https://harmlesskey.com/compendium/conditions",
					"https://harmlesskey.com/compendium/monsters",
					"https://harmlesskey.com/compendium/spells",
					"https://harmlesskey.com/compendium/items"
				]
			}
		},

		methods: {
			...mapActions("api_monsters", ["fetch_monsters",]),
			...mapActions("api_items", ["fetch_api_items",]),
			...mapActions("api_spells", ["fetch_api_spells",]),
			...mapActions("api_conditions", ["fetch_conditions",]),
			async downloadXml() {
				const d = new Date();
				const lastmodDate = `${d.getFullYear()}-${d.getMonth() < 10 ? '0'+d.getMonth() : d.getMonth() }-${d.getDate() < 10 ? '0'+d.getDate() : d.getDate() }`;

				let xmlDoc = document.implementation.createDocument ("", "", null);

				//Create element that holds all URLs
				let urlset = xmlDoc.createElement("urlset");
				urlset.setAttribute("xmlns" , "http://www.sitemaps.org/schemas/sitemap/0.9");
				xmlDoc.appendChild(urlset); 

				//General Routes
				for(let route of this.routes) {
					let urlElement = xmlDoc.createElement("url");

					//Add loc element
					let loc = xmlDoc.createElement("loc");
					let url = xmlDoc.createTextNode(route);
					loc.appendChild(url);
					urlElement.appendChild(loc);

					//Add lastmod element
					let lastmod = xmlDoc.createElement("lastmod");
					let date = xmlDoc.createTextNode(lastmodDate);
					lastmod.appendChild(date);
					urlElement.appendChild(lastmod);

					//Add to urlset
					urlset.appendChild(urlElement); 
				}

				// CONDITIONS
				const conditions = await this.fetch_conditions({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});
		
				for(const condition of conditions.results) {
					let urlElement = xmlDoc.createElement("url");

					//Add loc element
					let loc = xmlDoc.createElement("loc");
					let url = xmlDoc.createTextNode(`https://harmlesskey.com/compendium/conditions/${condition.url}`);
					loc.appendChild(url);
					urlElement.appendChild(loc);

					//Add lastmod element
					let lastmod = xmlDoc.createElement("lastmod");
					let date = xmlDoc.createTextNode(lastmodDate);
					lastmod.appendChild(date);
					urlElement.appendChild(lastmod);

					//Add to urlset
					urlset.appendChild(urlElement);
				}

				// ITEMS
				const items = await this.fetch_api_items({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});

				for(const item of items.results) {
					let urlElement = xmlDoc.createElement("url");

					//Add loc element
					let loc = xmlDoc.createElement("loc");
					let url = xmlDoc.createTextNode(`https://harmlesskey.com/compendium/items/${item.url}`);
					loc.appendChild(url);
					urlElement.appendChild(loc);

					//Add lastmod element
					let lastmod = xmlDoc.createElement("lastmod");
					let date = xmlDoc.createTextNode(lastmodDate);
					lastmod.appendChild(date);
					urlElement.appendChild(lastmod);

					//Add to urlset
					urlset.appendChild(urlElement);
				}

				// MONSTERS
				const monsters = await this.fetch_monsters({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});
		
				for(const monster of monsters.results) {
					let urlElement = xmlDoc.createElement("url");

					//Add loc element
					let loc = xmlDoc.createElement("loc");
					let url = xmlDoc.createTextNode(`https://harmlesskey.com/compendium/monsters/${monster.url}`);
					loc.appendChild(url);
					urlElement.appendChild(loc);

					//Add lastmod element
					let lastmod = xmlDoc.createElement("lastmod");
					let date = xmlDoc.createTextNode(lastmodDate);
					lastmod.appendChild(date);
					urlElement.appendChild(lastmod);

					//Add to urlset
					urlset.appendChild(urlElement);
				}

				// SPELLS
				const spells = await this.fetch_api_spells({
					pageNumber: 1,
					pageSize: 0,
					fields: ["url"]
				});
		
				for(const spell of spells.results) {
					let urlElement = xmlDoc.createElement("url");

					//Add loc element
					let loc = xmlDoc.createElement("loc");
					let url = xmlDoc.createTextNode(`https://harmlesskey.com/compendium/spells/${spell.url}`);
					loc.appendChild(url);
					urlElement.appendChild(loc);

					//Add lastmod element
					let lastmod = xmlDoc.createElement("lastmod");
					let date = xmlDoc.createTextNode(lastmodDate);
					lastmod.appendChild(date);
					urlElement.appendChild(lastmod);

					//Add to urlset
					urlset.appendChild(urlElement);
				}

				//TO DOWNLOAD THE FILE
				var serializer = new XMLSerializer();

				//Create downloadable file
				var xmltext = serializer.serializeToString (xmlDoc);
				var file = document.createElement('a');

				var filename = "sitemap.xml";
				var bb = new Blob([xmltext], {type: 'text/plain'});

				file.setAttribute('href', window.URL.createObjectURL(bb));
				file.setAttribute('download', filename);

				file.dataset.downloadurl = ['text/plain', file.download, file.href].join(':');
				file.draggable = true; 
				file.classList.add('dragout');

				file.click();
			}
		}
	}
</script>