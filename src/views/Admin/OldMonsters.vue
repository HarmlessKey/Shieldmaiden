<template>
	<div class="content" v-if="!loading">
		<Crumble />
		<h3>Tag current monsters with "old"</h3>
		<p>{{ users.length }} users not yet tagged.</p>
		<hk-loader v-if="tagging" name="Tagging monsters" />
		<template v-else>
			<a class="btn bnt-large mb-2" v-if="users.length > 0" @click="tagMonsters()">Tag monsters with old</a><br/>
			<a class="btn bnt-large bg-red" @click="removeTags()">Remove tagged tag from users</a>
		</template>
	</div>
	<hk-loader v-else name="Loading users" />
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
				loading: true,
				tagging: false
			}
		},
		firebase() {
			return {
				all_users: {
					source: db.ref('search_users'),
					readyCallback: () => this.loading = false
				}
			}
		},
		computed: {
			users() {
				return this.all_users.filter(user => {
					return !user.tagged
				});
			}
		},
		methods: {
			removeTags() {
				for(const user of this.all_users) {
					db.ref(`search_users/${user['.key']}/tagged`).remove();
				}
			},
			async tagMonsters() {
				this.tagging = true;
				try {
					for(const user of this.users) {
						const npc_ref = db.ref(`npcs/${user['.key']}`);
						npc_ref.on('value', async (snapshot) => {
							const npcs = snapshot.val();
							if(npcs) {
								console.log("USER:", user['.key']);
								for(const [key, value] of Object.entries(npcs)) {
									if(!value.old) {
										db.ref(`npcs/${user['.key']}/${key}/old`).set(true);
										console.log("- monster:", key, "tagged");
									}
								}
							}
						});
						db.ref(`search_users/${user['.key']}/tagged`).set(true);
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