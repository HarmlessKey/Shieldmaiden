<template>
	<hk-card header="Export a database">
		<div class="card-body">
			<p>
				Creates a JSON file with an array of all entries in a firebase reference.
			</p>
			<ul>
				<li>- ".key" is saved under "_id" for mongodb import.</li>
				<li>- "metadata" is deleted.</li>
				<li>- "changed" is deleted.</li>
				<li>- "url" is generated, kebap-lowercase-name.</li>
			</ul>
			<q-select
				dark filled square
				class="select"
				label="Reference"
				v-model="ref"
				:options="refs"
			/>
			<a class="btn bnt-large" @click="downloadJson()" :disabled="!ref || loading">
				<i aria-hidden="true" class="fas fa-file-download" />
				{{ ref ? `Download ${ref}` : "Select a reference" }}
			</a>
			<span v-if="loading" class="ml-3">
				<span class="loader" />
			</span>
		</div>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'ExportDatabases',
		data() {
			return {
				loading: false,
				ref: undefined,
				refs: [
					"monsters",
					"items",
					"spells",
					"conditions",
				]
			}
		},
		methods: {	
			async downloadJson() {
				this.loading = true;
				const data = [];

				//Fetch the data
				const ref = db.ref(this.ref);
				await ref.once('value', (snapshot) => {
					const results = snapshot.val();

					for(let key in results) {
						let entry = results[key];
						entry["_id"] = key;
						delete entry["metadata"];
						delete entry["changed"];

						// entry.name = entry.name.toLowerCase();
						entry.url = entry.name.toLowerCase().replace(/[\s/]/g, "-").replace(/['()]/g, '');
						
						
						data.push(entry);
					}
				}).then(() => {
					this.loading = false;
					const filename = `hk-${this.ref}.json`;
					const jsonStr = JSON.stringify(data, null, 4);

					let element = document.createElement('a');
					element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
					element.setAttribute('download', filename);

					element.style.display = 'none';
					document.body.appendChild(element);

					element.click();

					document.body.removeChild(element);
				});	
			}
		}
	}
</script>

<style lang="scss" scoped>
	.select {
		max-width: 400px;
		margin-bottom: 20px;
	}
</style>