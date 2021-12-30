<template>
	<hk-card header="Generate Search Tables for Firebase">
		<div class="card-body">
			<p>
				Updates monster values to their correct types. A lot of numbers were saved as strings, but now need to be changed to numbers.
			</p>

			<q-select
				dark filled square
				class="select"
				label="Reference"
				v-model="ref"
				:options="refs"
			/>
			<a class="btn bnt-large" @click="update()" :disabled="!ref || loading">
				<i class="fas fa-file-edit" />
				{{ ref ? `Update ${ref}` : "Select a reference" }}
			</a>
			<span v-if="loading" class="ml-3">
				<span class="loader" />
			</span>
		</div>
	</hk-card>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import { monsterMixin } from "@/mixins/monster";
	import { skills} from "@/mixins/skills";

	export default {
		name: 'GenerateSearchTable',
		mixins: [monsterMixin, skills],
		components: {
			Crumble
		},
		metaInfo: {
			title: 'Admin | Generate Search Table'
		},
		data() {
			return {
				loading: false,
				ref: undefined,
				refs: [
					"npcs"
				],
				search_ref: {
					'npcs': 'search_npcs',
					'items': 'search_items',
					'spells': 'search_spells',
					'conditions': 'search_conditions'
				},
				search_fields: {
					'npcs': ['name', 'challenge_rating', 'alignment', 'armor_class', 'hit_points', 'size', 'type']
				}
			}
		},
		methods: {
			async update() {
				this.loading = true;

				//Fetch the data
				const ref = db.ref(this.ref);
				await ref.once('value', (snapshot) => {
					const users = snapshot.val();

					for(let uid in users) {
						const entries = users[uid];
						console.group(`%cUser: ${uid}`, "color: #2c97de; font-weight: bold;")
						for(let key in entries) {
							let entry = entries[key];
							const search_entry = this.extractFields(entry, this.search_fields[this.ref]);
							const search_ref = db.ref(`${this.search_ref[this.ref]}/${uid}/results/${key}`);
							try {
								search_ref.set(search_entry)
							} catch(error) {
								console.error(`Couldn't update search_npc table`, key, entry.name, error, search_entry)
							}	
						}
						console.groupEnd();
						const count_ref = db.ref(`${this.search_ref[this.ref]}/${uid}/metadata/count`);
						count_ref.set(Object.keys(entries).length);
					}
				}).then(() => {

					this.loading = false;
					console.log(`%cFINISHED.`, "color: #83b547;");
				});
			},
			extractFields(entry, fields) {
				let searchable_entry = {}
				for (const field of fields) {
					if (entry[field]) {
						searchable_entry[field] = entry[field]
					}
				}

				return searchable_entry;
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