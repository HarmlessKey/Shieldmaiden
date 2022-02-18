<template>
	<div class="content">
		<template v-if="!$route.params.id">
			<Crumble />
			<h2><i class="fas fa-wand-magic"></i> Contribute to Spells</h2>

			<div class="grid">
				<div>
					<hk-card>
						<div class="card-header" slot="header">
							Untagged Spells
							<span v-if="untaggedSpells">{{ Object.keys(untaggedSpells).length }}</span>
						</div>
						<hk-table
							:items="untaggedSpells"
							:columns=untaggedColumns
							:perPage="15"
							:search="['name']"
						>
							<router-link 
								:to="'/contribute/spells/' + data.row['.key']" 
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
									v-if="Object.keys(taggedSpell).length === 0"
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

				<div>
					<hk-card>
						<div class="card-header" slot="header">
							Your Tagged Spell
							<span v-if="taggedSpell">{{ Object.keys(taggedSpell).length }}</span>
						</div>

						<hk-table
							:items="taggedSpell"
							:columns="taggedColumns"
						>
							<router-link :to="'/contribute/spells/' + data.row['.key']" slot="name" slot-scope="data">{{ data.item }}</router-link>

							<div slot="actions" slot-scope="data" class="actions">
								<router-link 
									:to="'/contribute/spells/' + data.row['.key']+'/edit'"
								>
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a @click="setSlide({show: true, type: 'ViewSpell', data: data.row })">
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
							</div>
						</hk-table>
					</hk-card>

					<hk-card v-if="userInfo.admin">
						<div class="card-header" slot="header">
							All Tagged Spells
							<span v-if="taggedSpells">{{ Object.keys(taggedSpells).length }}</span>
						</div>
						<hk-table
							:items="taggedSpells"
							:columns="taggedColumns"
						>
							<router-link :to="'/contribute/spells/' + data.row['.key']" slot="name" slot-scope="data">
								<span>
									{{ data.item }}
									<q-tooltip anchor="top middle" self="center middle">
										{{ getPlayerName(data.row.metadata.tagged) }}
									</q-tooltip>
								</span>
							</router-link>

							<div slot="actions" slot-scope="data" class="actions">
								<router-link 
									:to="'/contribute/spells/' + data.row['.key']+'/edit'"
								>
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a @click="setSlide({show: true, type: 'ViewSpell', data: data.row })">
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
								<a @click="confirmFinish(data.row['.key'], data.row.name)">
									<i class="fas fa-check"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Finish
									</q-tooltip>
								</a>
								<a @click="unTag(data.row['.key'])">
									<i class="fas fa-times"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Mark difficult
									</q-tooltip>
								</a>
							</div>
						</hk-table>
					</hk-card>
				</div>
				<div>
					<hk-card>
						<div class="card-header" slot="header">
							Finished Spells
							<span v-if="finishedSpells">{{ Object.keys(finishedSpells).length }}</span>
						</div>
						<hk-table
							:items="finishedSpells"
							:columns="untaggedColumns"
							:perPage="15"
							:search="['name']"
						>
							<div slot="name" slot-scope="data" :class="isDifficult(data.row) ? 'red' : ''">
								<span>{{data.item}}</span>
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
									:to="'/contribute/spells/' + data.row['.key']"
								>
									<i class="fas fa-pencil"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Edit
									</q-tooltip>
								</router-link>
								<a @click="setSlide({ show: true, type: 'ViewSpell', data: data.row })">
									<i class="fas fa-eye"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Preview
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
	import Spell from '@/components/compendium/Spell.vue';
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'Spells',
		components: {
			Crumble,
			Footer,
			Spell
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
				allSpells: db.ref('spells'),
				// untaggedSpells: db.ref('spells').orderByChild('metadata/tagged').equalTo(null),
				taggedSpell: db.ref('new_spells').orderByChild('metadata/tagged').equalTo(this.userId),
				finishedSpells: db.ref('new_spells').orderByChild('metadata/finished').equalTo(true),
				admins: db.ref('users').orderByChild('admin').equalTo(true),
				contributors: db.ref('users').orderByChild('contribute').equalTo(true),
			}
		},
		computed: {
			...mapGetters([
				"userInfo"
			]),
			untaggedSpells: function() {
				return _.chain(this.allSpells)
					.filter(function(spell) {
						return (!('metadata' in spell) || !('tagged' in spell.metadata))
					})
					.value();
			},
			taggedSpells: function() {
				return _.chain(this.allSpells)
					.filter(function(spell) {
						return (('metadata' in spell) && ('tagged' in spell.metadata) && !('finished' in spell.metadata))
					}).value();
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
				db.ref(`spells/${key}/metadata`).update({
						tagged: this.userId
				});
				db.ref(`new_spells/${key}`).update({
					name,
				});
				db.ref(`new_spells/${key}/metadata`).update({
					tagged: this.userId
				});
			},
			unTag(key) {
				db.ref(`new_spells/${key}/metadata/tagged`).remove();
				db.ref(`spells/${key}/metadata/tagged`).remove();
			},
			markDifficult(row) {
				let key = row['.key']
				let current = this.isDifficult(row);
				if (current) {
					db.ref(`new_spells/${key}/metadata/difficult`).remove();
					db.ref(`spells/${key}/metadata/difficult`).remove();
				}
				else {
					db.ref(`new_spells/${key}/metadata`).update({
						difficult: !current
					});
					db.ref(`spells/${key}/metadata`).update({
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
				this.$snotify.error('Are you sure you\'ve finished the item "' + name + '"? Make sure not to set incomplete items to finised.', 'Finish Item', {
					buttons: [
						{ text: 'Yes', action: (toast) => { this.finish(key); this.$snotify.remove(toast.id); }, bold: false},
						{ text: 'No', action: (toast) => { this.$snotify.remove(toast.id); }, bold: true},
					]
				});
			},
			finish(key) {
				db.ref(`new_spells/${key}/metadata/finished`).set(true);
				db.ref(`new_spells/${key}/metadata/finished_by`).set(this.userId);
				db.ref(`new_spells/${key}/metadata/tagged`).remove();

				db.ref(`spells/${key}/metadata/finished`).set(true);
				db.ref(`spells/${key}/metadata/finished_by`).set(this.userId);
			}
		},
	}
</script>

<style lang="scss" scoped>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: auto;
		grid-gap: 20px;

		.card {
			.card-header {
				display: flex;
				justify-content: space-between
			}
			.card-body {
				padding: 10px;
			}
		}
	}
</style>