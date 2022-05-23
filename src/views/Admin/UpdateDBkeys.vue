<template>
	<hk-card header="Update DB Keys">
		<div class="card-body">
			<p>
				Change db keys, taking into account that they might have been changed in the past.
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
	import { db } from 'src/firebase';
	import { monsterMixin } from "src/mixins/monster";
	import { skills} from "src/mixins/skills";

	export default {
		name: 'UpdateDBkeys',
		mixins: [monsterMixin, skills],
		data() {
			return {
				loading: false,
				ref: undefined,
				refs: [
					'encounters',
					'campaigns',
				],
			}
		},
		methods: {
			async update() {
				if (this.ref === undefined) {
					return
				}
				this.loading = true;

				//Fetch the data
				const ref = db.ref(this.ref);
				await ref.once('value', async (snapshot) => {
					const users = snapshot.val();

					for(let uid in users) {

						const entries = users[uid];
					
						if (this.ref === 'encounters') {
							const campaigns = users[uid];
							console.group(`%cUser: ${uid}`, "color: #2c97de; font-weight: bold;")

							for (const cid in campaigns) {
								const entries = campaigns[cid]

								for (const key in entries) {
									let entry = entries[key];

									// USE THIS TO CHANGE KEY FOR CAMPAIGN NAME FROM CAMPAING TO NAME
									if (entry.encounter !== undefined) {
										if (entry.name === undefined) {
											// Encounter name stored in .encounter should be in .name
											await db.ref(`encounters/${uid}/${cid}/${key}/name`).set(entry.encounter);
										}
										// .encounter should be removed
										await db.ref(`encounters/${uid}/${cid}/${key}/encounter`).remove();
									}

								}
							}
							console.groupEnd();
						}

						else if (this.ref === 'campaigns') {
							const campaigns = users[uid];
							console.group(`%cUser: ${uid}`, "color: #2c97de; font-weight: bold;")
							for (const cid in campaigns) {
								const campaign = campaigns[cid]

								// USE THIS TO CHANGE KEY FOR CAMPAIGN NAME FROM CAMPAING TO NAME
								if (campaign.campaign !== undefined) {
									// A campaign key was found so db needs update
									if (campaign.name === undefined) {
										// campaign has old campaign key and NO name key. Name needs to be generated
										await db.ref(`campaigns/${uid}/${cid}/name`).set(campaign.campaign);
									}
									// campaign has old campaign key so needs to be removed
									await db.ref(`campaigns/${uid}/${cid}/campaign`).remove();
								}
								// If no campaign key found, no update needed.
							}
							console.groupEnd();
						}
					}
				})
				
				this.loading = false;
				console.log(`%cFINISHED.`, "color: #83b547;");
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