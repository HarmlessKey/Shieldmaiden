<template>
	<hk-card header="Download XML Sitemap">
		<div class="card-body">
			<p>Creates an XML with all URLs of the website for Google. Add this file in the public folder as sitemap.xml</p>
			<a class="btn bnt-large" @click="downloadXml()">Download XML sitemap</a>
		</div>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'XML',
		metaInfo: {
			title: 'Admin | XML'
		},
		data() {
			return {
				routes: [
					"http://harmlesskey.com",
					"http://harmlesskey.com/demo",
					"http://harmlesskey.com/documentation",
					"http://harmlesskey.com/about-us",
					"http://harmlesskey.com/sign-up",
					"http://harmlesskey.com/sign-in",
					"http://harmlesskey.com/privacy-policy",
					"http://harmlesskey.com/planned",
					"http://harmlesskey.com/updates",
					"http://harmlesskey.com/feedback",
					"http://harmlesskey.com/compendium",
					"http://harmlesskey.com/compendium/conditions",
					"http://harmlesskey.com/compendium/monsters",
					"http://harmlesskey.com/compendium/spells",
					"http://harmlesskey.com/compendium/items"
				]
			}
		},
		methods: {
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

				//CONDTIONS
				const conditions_ref = db.ref('conditions');
				await conditions_ref.on('value', (snapshot) => {
					let conditions = snapshot.val()

					for(let key in conditions) {
						let urlElement = xmlDoc.createElement("url");

						//Add loc element
						let loc = xmlDoc.createElement("loc");
						let url = xmlDoc.createTextNode(`http://harmlesskey.com/compendium/conditions/${key}`);
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
				});

				//ITEMS
				const items_ref = db.ref('items');
				await items_ref.on('value', (snapshot) => {
					let items = snapshot.val()

					for(let key in items) {
						let urlElement = xmlDoc.createElement("url");

						//Add loc element
						let loc = xmlDoc.createElement("loc");
						let url = xmlDoc.createTextNode(`http://harmlesskey.com/compendium/items/${key}`);
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
				});

				//MONSTERS
				const monsters_ref = db.ref('monsters');
				await monsters_ref.on('value', (snapshot) => {
					let monsters = snapshot.val()

					for(let key in monsters) {
						let urlElement = xmlDoc.createElement("url");

						//Add loc element
						let loc = xmlDoc.createElement("loc");
						let url = xmlDoc.createTextNode(`http://harmlesskey.com/compendium/monsters/${key}`);
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
				});

				//SPELLS
				const spells_ref = db.ref('spells');
				await spells_ref.on('value', (snapshot) => {
					let spells = snapshot.val()

					for(let key in spells) {
						let urlElement = xmlDoc.createElement("url");

						//Add loc element
						let loc = xmlDoc.createElement("loc");
						let url = xmlDoc.createTextNode(`http://harmlesskey.com/compendium/spells/${key}`);
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
				});

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