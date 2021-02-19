<template>
	<div class="content">
		<Crumble />
		<h3>Tag current monsters with "old"</h3>
		<hk-loader v-if="tagging" name="Tagging monsters" />
		<a v-else class="btn bnt-large" @click="tagMonsters()">Tag monsters with old</a>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';

	export default {
		name: 'old-monsters',
		components: {
			Crumble
		},
		metaInfo: {
			title: 'Admin | Old monsters'
		},
		data() {
			return {
				tagging: false
			}
		},
		firebase() {
			return {
				users: db.ref('search_users')
			}
		},
		methods: {
			async tagMonsters() {
				this.tagging = true;
				try {
					for(const user of this.users) {
						const npc_ref = db.ref(`npcs/${user['.key']}`);
						npc_ref.on('value', async (snapshot) => {
							const npcs = snapshot.val();

							if(npcs) {
								for(const key of Object.keys(npcs)) {
									db.ref(`npcs/${user['.key']}/${key}/old`).set(true);
									console.log(user['.key'], key, "tagged");
								}
							}
						});
					}
				} catch (error) {
					console.log(error)
				} finally {
					this.tagging = false;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
</style>