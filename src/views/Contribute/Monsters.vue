<template>
	<div class="content">
		<template v-if="!$route.params.id">
			<Crumble />
			<h2><i aria-hidden="true" class="fas fa-dragons"></i> Contribute to Monsters</h2>

			<q-linear-progress :dark="$store.getters.theme === 'dark'" stripe rounded size="25px" :value="Object.keys(allFinishedMonsters).length / Object.keys(allMonsters).length" color="primary" class="mb-4">
			<div class="absolute-full flex flex-center white">
        {{ Object.keys(allFinishedMonsters).length }} / {{ Object.keys(allMonsters).length }} ({{ Math.floor(Object.keys(allFinishedMonsters).length / Object.keys(allMonsters).length * 100) }}%)
      </div>
			</q-linear-progress>

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
									<i aria-hidden="true" class="fas fa-exclamation-triangle"></i>
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
									<i aria-hidden="true" class="fas fa-plus"></i>
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
							<router-link :to="'/contribute/monsters/' + data.row['.key']" slot="name" slot-scope="data">
								{{ data.item ? data.item.capitalizeEach() : data.item }}
							</router-link>

							<div slot="actions" slot-scope="data" class="actions">
								<router-link 
									:to="'/contribute/monsters/' + data.row['.key']+'/edit'"
								>
									<i aria-hidden="true" class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a @click="setSlide({show: true, type: 'contribute/monster/ViewMonster', data: data.row })">
									<i aria-hidden="true" class="fas fa-eye"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Preview
									</q-tooltip>
								</a>
								<a @click="markDifficult(data.row)">
									<i aria-hidden="true" class="fas fa-exclamation" :class="isDifficult(data.row) ? 'red' : ''"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Mark difficult
									</q-tooltip>
								</a>
								<a 
									@click="confirmFinish(data.row['.key'], data.row.name)"
								>
									<i aria-hidden="true" class="fas fa-check"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Finish
									</q-tooltip>
								</a>
								<a @click="unTag(data.row['.key'])">
									<i aria-hidden="true" class="fas fa-times"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Untag
									</q-tooltip>
								</a>
								<a v-if="key === 'allTagged'">
									<i aria-hidden="true" class="fas fa-info"></i>
									<q-popup-proxy :dark="$store.getters.theme === 'dark'" square>
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

						<q-checkbox
							v-if="userInfo.admin"
							:dark="$store.getters.theme === 'dark'"
							label="Only finished by others"
							v-model="othersFinished"
							indeterminate-value="Something else"
							class="mb-3"
						/>

						<hk-table
							:items="othersFinished ? finishedByOthers : finishedMonsters"
							:columns="untaggedColumns"
							:perPage="15"
							:search="['name']"
							class="mb-4"
						>
							<div slot="name" slot-scope="data" :class="isDifficult(data.row) ? 'red' : ''">
								<span>{{ data.item.capitalizeEach() }}</span>
								<a v-if="isDifficult(data.row)" class="ml-2">
									<i aria-hidden="true" class="fas fa-exclamation-triangle"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Difficult
									</q-tooltip>
								</a>
							</div>
							<div slot="actions" slot-scope="data" class="actions">
								<a v-if="isDifficult(data.row)" @click="markDifficult(data.row)">
									<i aria-hidden="true" class="fas fa-exclamation" :class="isDifficult(data.row) ? 'red' : ''"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Unmark difficult
									</q-tooltip>
								</a>
								<router-link 
									v-if="userInfo.admin"
									:to="'/contribute/monsters/' + data.row['.key']"
								>
									<i aria-hidden="true" class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a @click="setSlide({ show: true, type: 'contribute/monster/ViewMonster', data: data.row })">
									<i aria-hidden="true" class="fas fa-eye"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Preview
									</q-tooltip>
								</a>
								<a v-if="userInfo.admin">
									<i aria-hidden="true" class="fas fa-info"></i>
									<q-popup-proxy :dark="$store.getters.theme === 'dark'" square>
										<hk-card header="Info" class="mb-0">
											Finished by: {{ getPlayerName(data.row.metadata.finished_by) }}
										</hk-card>
									</q-popup-proxy>
								</a>
								<a v-if="userInfo.admin && userId !== data.row.metadata.finished_by" @click="approve(data.row['.key'])">
									<i aria-hidden="true" class="fas fa-check white"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Approve
									</q-tooltip>
								</a>
							</div>
						</hk-table>

						<h3><i aria-hidden="true" class="fas fa-check green"/> Approved monsters</h3>
						<hk-table
							:items="approvedMonsters"
							:columns="untaggedColumns"
							:perPage="15"
						>
							<div slot="name" slot-scope="data">
								<span>{{ data.item.capitalizeEach() }}</span>
							</div>
							<div slot="actions" slot-scope="data" class="actions">
								<a @click="setSlide({ show: true, type: 'contribute/monster/ViewMonster', data: data.row })">
									<i aria-hidden="true" class="fas fa-eye"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Preview
									</q-tooltip>
								</a>
								<a v-if="userInfo.admin">
									<i aria-hidden="true" class="fas fa-info"></i>
									<q-popup-proxy :dark="$store.getters.theme === 'dark'" square>
										<hk-card header="Info" class="mb-0">
											Approved by: {{ getPlayerName(data.row.metadata.approved) }}<br/>
											Finished by: {{ getPlayerName(data.row.metadata.finished_by) }}
										</hk-card>
									</q-popup-proxy>
								</a>
								<a v-if="userInfo.admin && userId !== data.row.metadata.finished_by" @click="disApprove(data.row['.key'])">
									<i aria-hidden="true" class="fas fa-times white"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Disapprove
									</q-tooltip>
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
	import ViewMonster from '@/components/compendium/Monster.vue';
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'Monsters',
		components: {
			Crumble,
			Footer,
			Monster,
			ViewMonster
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				othersFinished: false,
				untaggedColumns: {
					name: {
						label: 'Name',
						sortable: true,
						truncate: true
					},
					actions: {
						label: '<i aria-hidden="true" class="far fa-ellipsis-h"></i>',
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
						label: '<i aria-hidden="true" class="far fa-ellipsis-h"></i>',
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
				allFinishedMonsters: db.ref('new_monsters').orderByChild('metadata/finished').equalTo(true),
				taggedMonster: db.ref('new_monsters').orderByChild('metadata/tagged').equalTo(this.userId),
				admins: db.ref('users').orderByChild('admin').equalTo(true),
				contributors: db.ref('users').orderByChild('contribute').startAt(0),
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
			finishedMonsters() {
				return _.chain(this.allFinishedMonsters)
					.filter(function(monster) {
						return (!('approved' in monster.metadata))
					}).value();
			},
			finishedByOthers() {
				return this.finishedMonsters
					.filter(monster => {
						return (!('approved' in monster.metadata) && monster.metadata.finished_by !== this.userId)
					});
			},
			approvedMonsters() {
				return _.chain(this.allFinishedMonsters)
					.filter(function(monster) {
						return ('approved' in monster.metadata)
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
			},
			approve(key) {
				db.ref(`new_monsters/${key}/metadata/approved`).set(this.userId);
			},
			disApprove(key) {
				db.ref(`new_monsters/${key}/metadata/approved`).remove();
			},
		},
	}
</script>

<style lang="scss" scoped>
	.q-linear-progress {
		.absolute-full {
			height: 25px;
			line-height: 25px;
			font-size: 18px;
		}
	}
</style>