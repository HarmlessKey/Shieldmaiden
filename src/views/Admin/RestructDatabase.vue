/* eslint-disable no-unused-vars */
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
				<i aria-hidden="true" class="fas fa-file-edit" />
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
	import { monsterMixin } from "@/mixins/monster";
	import { skills} from "@/mixins/skills";

	export default {
		name: 'GenerateSearchTable',
		mixins: [monsterMixin, skills],
		data() {
			return {
				loading: false,
				ref: undefined,
				refs: [
					'campaign_items'
				],
			}
		},
		methods: {
			async update() {
				if (this.ref === undefined) {
					return
				}
				this.loading = true;

				if (this.ref === 'campaign_items') {
					await this.update_items();
				}

				this.loading = false;
			},
			async update_items() {
				const campaign_ref = db.ref('campaigns');
				const encounter_ref = db.ref('encounters');

				await campaign_ref.once('value', async (snapshot) => {
					const users = snapshot.val();

					for (const uid in users) {
						for (const cid in users[uid]) {
							const campaign = users[uid][cid];

							if ('inventory' in campaign) {
								if ('items' in campaign.inventory) {
									for (const item_key in campaign.inventory.items) {
										const item = campaign.inventory.items[item_key];
										if ('linked_item' in item && typeof item.linked_item === 'string') {
											// Create linked_item object
											const linked_item = {
												"custom": null,
												"key": item.linked_item
											}

											const custom_item = await db.ref(`custom_items/${uid}/${item.linked_item}`).once('value');
											if (custom_item !== undefined) {
												linked_item.custom = true;
											}
											else {
												const srd_item = await db.ref(`items/${item.linked_item}`).once('value');
												// if srd item also null => item is deleted, continue so not added again.
												if (srd_item.val() === null) {
													await db.ref(`campaigns/${uid}/${cid}/inventory/items/${item_key}`).remove();
													continue;
												}
											}

											item.linked_item = linked_item;
										}
										delete item.full_linked_item;
										await db.ref(`campaigns/${uid}/${cid}/inventory/items/${item_key}`).set(item);
									}
								}
							}
						}
					}
				})

				await encounter_ref.once('value', async (snapshot) => {
					const users = snapshot.val();

					for (const uid in users) {
						for (const cid in users[uid]) {
							for (const eid in users[uid][cid]) {

								const encounter = users[uid][cid][eid];
	
								if ('loot' in encounter) {
									const loot = encounter.loot;
									const properties = ["items", "cp", "sp", "ep", "gp", "pp"];
									console.log(Object.keys(loot), properties, properties.filter(val => Object.keys(loot).includes(val)))
									if(properties.filter(val => Object.keys(loot).includes(val)).length > 0) {
										await db.ref(`encounters/${uid}/${cid}/${eid}/loot`).remove();
										console.log("old stuff deleted");
										continue;
									}
									for (const item_key in encounter.loot) {
										const item = encounter.loot[item_key];
										console.log("encounter", eid, item)
										if ('linked_item' in item && typeof item.linked_item === 'string') {
											// Create linked_item object, default to not custom item.
											const linked_item = {
												"custom": null,
												"key": item.linked_item
											}

											// check if custom item
											const custom_item = await db.ref(`custom_items/${uid}/${item.linked_item}`).once('value');
											if (custom_item.val() !== null) {
												linked_item.custom = true;
											} 
											else {
												const srd_item = await db.ref(`items/${item.linked_item}`).once('value');
												// if srd item also null => item is deleted, continue so not added again.
												if (srd_item.val() === null) {
													await db.ref(`encounters/${uid}/${cid}/${eid}/loot/${item_key}`).remove();
													continue;
												}
											}

											item.linked_item = linked_item;
										}
										// Remove full linked item artifact of the past
										delete item.full_linked_item;
										await db.ref(`encounters/${uid}/${cid}/${eid}/loot/${item_key}`).set(item);
									}
								}
							}
						}
					}
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
	.select {
		max-width: 400px;
		margin-bottom: 20px;
	}
</style>