<template>
	<div class="content">
		<template v-if="!$route.params.id">
			<Crumble />
			<h2><i class="fas fa-dragons"></i> Contribute to Monsters</h2>

			<!-- UNTAGGED -->
			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-4">
					<hk-card>
						<div class="card-header" slot="header">
							Untagged Monsters
							<span v-if="untaggedMonsters">{{ Object.keys(untaggedMonsters).length }}</span>
						</div>
						<hk-table
							:items="untaggedMonsters"
							:columns=untaggedColumns
							:perPage="15"
							:search="['name']"
						>
							<router-link 
								:to="'/contribute/monsters/' + data.row['.key']" 
								slot="name" slot-scope="data"
								:class="isDifficult(data.row) ? 'red' : ''"
							>
								<span>{{ data.item }}</span>
								<a v-if="isDifficult(data.row)" class="ml-2">
									<i class="fas fa-exclamation-triangle"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Dificult
									</q-tooltip>
								</a>
							</router-link>
							<div slot="actions" slot-scope="data" class="actions">
								<a 
									v-if="Object.keys(taggedMonster).length === 0"
									@click="tag(data.row['.key'], data.row.name)"
								>
									<i class="fas fa-plus"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Tag
									</q-tooltip>
								</a>
							</div>
						</hk-table>
					</hk-card>
				</div>

				<!-- TAGGED -->
				<div class="col-12 col-md-4">
					<hk-card v-for="({key, name, monsters}, index) in taggedMonsters" :key="`tagged-${index}`">
						<div class="card-header" slot="header">
							{{ name }}
							<span v-if="monsters">{{ Object.keys(monsters).length }}</span>
						</div>

						<hk-table
							:items="monsters"
							:columns="taggedColumns"
						>
							<router-link :to="'/contribute/monsters/' + data.row['.key']" slot="name" slot-scope="data">{{ data.item }}</router-link>

							<div slot="actions" slot-scope="data" class="actions">
								<router-link 
									:to="'/contribute/monsters/' + data.row['.key']+'/edit'"
								>
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a @click="setSlide({show: true, type: 'ViewMonster', data: data.row })">
									<i class="fas fa-eye"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Preview
									</q-tooltip>
								</a>
								<a @click="markDifficult(data.row)">
									<i class="fas fa-exclamation" :class="isDifficult(data.row) ? 'red' : ''"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Mark difficult
									</q-tooltip>
								</a>
								<a 
									@click="confirmFinish(data.row['.key'], data.row.name)"
								>
									<i class="fas fa-check"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Finish
									</q-tooltip>
								</a>
								<a @click="unTag(data.row['.key'])">
									<i class="fas fa-times"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Untag
									</q-tooltip>
								</a>
								<a v-if="key === 'allTagged'">
									<i class="fas fa-info"></i>
									<q-popup-proxy dark square>
										<hk-card header="Info" class="mb-0">
											Tagged by: {{ getPlayerName(data.row.metadata.tagged) }}<br/>
										</hk-card>
									</q-popup-proxy>
								</a>
							</div>
						</hk-table>
					</hk-card>
				</div>

				<!-- FINISHED -->
				<div class="col-12 col-md-4">
					<hk-card>
						<div class="card-header" slot="header">
							Finished Monsters
							<span v-if="finishedMonsters">{{ Object.keys(finishedMonsters).length }}</span>
						</div>
						<hk-table
							:items="finishedMonsters"
							:columns="untaggedColumns"
							:perPage="15"
							:search="['name']"
						>
							<div slot="name" slot-scope="data" :class="isDifficult(data.row) ? 'red' : ''">
								<span>{{ data.item.capitalizeEach() }}</span>
								<a v-if="isDifficult(data.row)" class="ml-2">
									<i class="fas fa-exclamation-triangle"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Difficult
									</q-tooltip>
								</a>
							</div>
							<div slot="actions" slot-scope="data" class="actions">
								<a v-if="isDifficult(data.row)" @click="markDifficult(data.row)">
									<i class="fas fa-exclamation" :class="isDifficult(data.row) ? 'red' : ''"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Unmark difficult
									</q-tooltip>
								</a>
								<router-link 
									v-if="userInfo.admin"
									:to="'/contribute/monsters/' + data.row['.key']"
								>
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a @click="setSlide({ show: true, type: 'contribute/monster/ViewMonster', data: data.row })">
									<i class="fas fa-eye"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Preview
									</q-tooltip>
								</a>
								<a>
									<i class="fas fa-info"></i>
									<q-popup-proxy dark square>
										<hk-card header="Info" class="mb-0">
											Finished by: {{ getPlayerName(data.row.metadata.finished_by) }}
										</hk-card>
									</q-popup-proxy>
								</a>
							</div>
						</hk-table>
					</hk-card>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import Monster from '@/components/compendium/Monster.vue';
	import ViewMonster from '@/components/ViewMonster.vue';
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'Monsters',
		components: {
			Crumble,
			Footer,
			Monster,
			ViewMonster
		},
		metaInfo: {
			title: 'Monsters'
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				untaggedColumns: {
					name: {
						label: 'Name',
						sortable: true,
						truncate: true
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
					}
				},
				taggedColumns: {
					name: {
						label: 'Name',
						truncate: true
					},
					actions: {
						label: '<i class="far fa-ellipsis-h"></i>',
						noPadding: true,
						right: true,
						maxContent: true
					}
				},
				isBusy: true
			}
		},
		firebase() {
			return {
				allMonsters: db.ref('monsters'),
				finishedMonsters: db.ref('new_monsters').orderByChild('metadata/finished').equalTo(true),
				taggedMonster: db.ref('new_monsters').orderByChild('metadata/tagged').equalTo(this.userId),
				admins: db.ref('users').orderByChild('admin').equalTo(true),
				contributors: db.ref('users').orderByChild('contribute').equalTo(true),
			}
		},
		computed: {
			...mapGetters([
				"userInfo"
			]),
			untaggedMonsters: function() {
				return _.chain(this.allMonsters)
					.filter(function(monster) {
						return (!('metadata' in monster) || !('tagged' in monster.metadata))
					})
					.value();
			},
			allTaggedMonsters: function() {
				return _.chain(this.allMonsters)
					.filter(function(monster) {
						return (('metadata' in monster) && ('tagged' in monster.metadata) && !('finished' in monster.metadata))
					}).value();
			},
			taggedMonsters() {
				const yourTagged = {
					key: "yourTagged",
					name: "Your tagged monster",
					monsters: this.taggedMonster
				};
				const allTagged = {
					key: "allTagged",
					name: "All tagged monsters",
					monsters: this.allTaggedMonsters
				};
				return (this.userInfo.admin) ? [yourTagged, allTagged] : [yourTagged];
			},
			users: function() {
				return _.union(this.admins, this.contributors);
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			isDifficult(row) {
				return (row.metadata && row.metadata.difficult)
			},
			tag(key, name) {
				db.ref(`monsters/${key}/metadata`).update({
						tagged: this.userId
				});
				db.ref(`new_monsters/${key}`).update({
					name,
				});
				db.ref(`new_monsters/${key}/metadata`).update({
					tagged: this.userId
				});
			},
			unTag(key) {
				db.ref(`new_monsters/${key}/metadata/tagged`).remove();
				db.ref(`monsters/${key}/metadata/tagged`).remove();
			},
			markDifficult(row) {
				let key = row['.key']
				let current = this.isDifficult(row);
				if (current) {
					db.ref(`new_monsters/${key}/metadata/difficult`).remove();
					db.ref(`monsters/${key}/metadata/difficult`).remove();
				}
				else {
					db.ref(`new_monsters/${key}/metadata`).update({
						difficult: !current
					});
					db.ref(`monsters/${key}/metadata`).update({
						difficult: !current
					});
				}
			},
			getPlayerName(uid) {
				for (let user of this.users) {
					if (user['.key'] === uid)
						return user.username;
				}
			},
			confirmFinish(key, name) {
				this.$snotify.error('Are you sure you\'ve finished the monster "' + name + '"? Make sure not to set incomplete monsters to finised.', 'Finish Item', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.finish(key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			finish(key) {
				db.ref(`new_monsters/${key}/metadata/finished`).set(true);
				db.ref(`new_monsters/${key}/metadata/finished_by`).set(this.userId);
				db.ref(`new_monsters/${key}/metadata/tagged`).remove();

				db.ref(`monsters/${key}/metadata/finished`).set(true);
				db.ref(`monsters/${key}/metadata/finished_by`).set(this.userId);
			}
		},
	}
</script>

<style lang="scss" scoped>
	
</style>