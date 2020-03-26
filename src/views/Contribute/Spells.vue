<template>
	<div class="content">
		<template v-if="!$route.params.id">
			<Crumble />
			<h2><i class="fas fa-wand-magic"></i> Contribute to Spells</h2>

			<el-steps align-center>
				<el-step title="Tag" description="Tag the spell you want to edit"></el-step>
				<el-step title="Edit" description="Edit the spell"></el-step>
				<el-step title="Finish" description="Set it to finished when done"></el-step>
				<el-step title="Tag new" description="Tag the next spell"></el-step>
			</el-steps>

			<div class="grid">
				<div>
					<div class="card">
						<div class="card-header">
							Untagged Spells
							<span v-if="untaggedSpells">{{ Object.keys(untaggedSpells).length }}</span>
						</div>
						<div class="card-body">
							<hk-table
								:items="untaggedSpells"
								:columns=untaggedColumns
								:perPage="15"
								:search="['name']"
							>
								<div slot="actions" slot-scope="data" class="actions">
									<a 
										v-if="Object.keys(taggedSpells).length === 0"
										@click="tag(data.row['.key'], data.row.name)"
										v-b-tooltip.hover title="Tag"
									>
										<i class="fas fa-plus"></i>
									</a>
								</div>
							</hk-table>
						</div>
					</div>
				</div>

				<div>
					<div class="card">
						<div class="card-header">
							Your Tagged Spells
							<span v-if="taggedSpells">{{ Object.keys(taggedSpells).length }}</span>
						</div>
						<div class="card-body">
							<hk-table
								:items="taggedSpells"
								:columns="taggedColumns"
							>
								<router-link :to="'/contribute/spells/' + data.row['.key']" slot="name" slot-scope="data">{{ data.item }}</router-link>

								<div slot="actions" slot-scope="data" class="actions">
									<router-link 
										:to="'/contribute/spells/' + data.row['.key']+'/edit'"
										v-b-tooltip.hover title="Edit"
									>
										<i class="fas fa-pencil"></i>
									</router-link>
									<a @click="setSlide({show: true, type: 'ViewSpell', data: data.row })">
										<i class="fas fa-eye"></i>
									</a>
									<a 
										@click="confirmFinish(data.row['.key'], data.row.name)"
										v-b-tooltip.hover title="Finish"
									>
										<i class="fas fa-check"></i>
									</a>
									<a 
										@click="unTag(data.row['.key'])"
										v-b-tooltip.hover title="Untag"
									>
										<i class="fas fa-times"></i>
									</a>
								</div>
							</hk-table>
						</div>
					</div>
				</div>

				<div>
					<div class="card">
						<div class="card-header">
							Finished Spells
							<span v-if="finishedSpells">{{ Object.keys(finishedSpells).length }}</span>
						</div>
						<div class="card-body">
							<hk-table
								:items="finishedSpells"
								:columns="untaggedColumns"
								:perPage="15"
								:search="['name']"
							>
								<div slot="actions" slot-scope="data" class="actions">
									<router-link 
										v-if="userInfo.admin"
										:to="'/contribute/spells/' + data.row['.key']"
										v-b-tooltip.hover title="Edit"
									>
										<i class="fas fa-pencil"></i>
									</router-link>
									<a @click="setSlide({show: true, type: 'ViewSpell', data: data.row })">
										<i class="fas fa-eye"></i>
									</a>
								</div>
							</hk-table>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import Crumble from '@/components/crumble/Compendium.vue';
	import Footer from '@/components/Footer.vue';
	import Spell from '@/components/compendium/Spell.vue';
	import ViewSpell from '@/components/ViewMonster.vue';
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'Spells',
		components: {
			Crumble,
			Footer,
			Spell,
			ViewSpell
		},
		metaInfo: {
			title: 'Spells'
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
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
				untaggedSpells: db.ref('spells').orderByChild('metadata/tagged').equalTo(null),
				taggedSpells: db.ref('new_spells').orderByChild('metadata/tagged').equalTo(this.userId),
				finishedSpells: db.ref('new_spells').orderByChild('metadata/finished').equalTo(true)
			}
		},
		computed: {
			...mapGetters([
				"userInfo"
			])
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			tag(key, name) {
				db.ref(`spells/${key}`).update({
					metadata: {
						tagged: this.userId
					}
				});
				db.ref(`new_spells/${key}`).update({
					name,
					metadata: {
						tagged: this.userId
					}
				});
			},
			unTag(key) {
				db.ref(`new_spells/${key}/metadata/tagged`).remove();
				db.ref(`spells/${key}/metadata/tagged`).remove();
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
				db.ref(`new_spells/${key}/metadata/tagged`).remove();
			}
		}
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