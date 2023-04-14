<template>
	<div class="content">
		<template v-if="!$route.params.id">
			<h2><i aria-hidden="true" class="fas fa-dragons" /> Contribute to Spells</h2>

			<q-linear-progress
				:dark="$store.getters.theme === 'dark'"
				stripe
				rounded
				size="25px"
				:value="Object.keys(allFinishedSpells).length / Object.keys(allSpells).length"
				color="primary"
				class="mb-4"
			>
				<div class="absolute-full flex flex-center white">
					{{ Object.keys(allFinishedSpells).length }} / {{ Object.keys(allSpells).length }} ({{
						Math.floor(
							(Object.keys(allFinishedSpells).length / Object.keys(allSpells).length) * 100
						)
					}}%)
				</div>
			</q-linear-progress>

			<!-- UNTAGGED -->
			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-4">
					<hk-card>
						<div class="card-header" slot="header">
							Untagged Spells
							<span v-if="untaggedSpells">{{ Object.keys(untaggedSpells).length }}</span>
						</div>
						<hk-table
							:items="untaggedSpells"
							:columns="untaggedColumns"
							:perPage="15"
							:search="['name']"
						>
							<router-link
								:to="'/contribute/spells/' + data.row['.key']"
								slot="name"
								slot-scope="data"
								:class="isDifficult(data.row) ? 'red' : ''"
							>
								<span>{{ data.item }}</span>
								<a v-if="isDifficult(data.row)" class="ml-2">
									<i aria-hidden="true" class="fas fa-exclamation-triangle" />
									<q-tooltip anchor="top middle" self="center middle"> Difficult </q-tooltip>
								</a>
							</router-link>
							<div slot="actions" slot-scope="data" class="actions">
								<a
									v-if="Object.keys(taggedSpell).length === 0"
									@click="tag(data.row['.key'], data.row.name)"
								>
									<i aria-hidden="true" class="fas fa-plus" />
									<q-tooltip anchor="top middle" self="center middle"> Tag </q-tooltip>
								</a>
							</div>
						</hk-table>
					</hk-card>
				</div>

				<!-- TAGGED -->
				<div class="col-12 col-md-4">
					<hk-card v-for="({ key, name, spells }, index) in taggedSpells" :key="`tagged-${index}`">
						<div class="card-header" slot="header">
							{{ name }}
							<span v-if="spells">{{ Object.keys(spells).length }}</span>
						</div>

						<hk-table :items="spells" :columns="taggedColumns">
							<router-link
								:to="'/contribute/spells/' + data.row['.key']"
								slot="name"
								slot-scope="data"
							>
								{{ data.item ? data.item.capitalizeEach() : data.item }}
							</router-link>

							<div slot="actions" slot-scope="data" class="actions">
								<router-link
									:to="'/contribute/spells/' + data.row['.key'] + '/edit'"
									class="btn btn-sm bg-neutral-5"
								>
									<i aria-hidden="true" class="fas fa-pencil" />
									<q-tooltip anchor="top middle" self="center middle"> Edit </q-tooltip>
								</router-link>
								<a
									class="btn btn-sm bg-neutral-5 mx-1"
									@click="
										setSlide({
											show: true,
											type: 'contribute/spell/ViewSpell',
											data: data.row,
										})
									"
								>
									<i aria-hidden="true" class="fas fa-eye" />
									<q-tooltip anchor="top middle" self="center middle"> Preview </q-tooltip>
								</a>
								<a class="btn btn-sm bg-neutral-5" @click="markDifficult(data.row)">
									<i
										aria-hidden="true"
										class="fas fa-exclamation"
										:class="isDifficult(data.row) ? 'red' : ''"
									/>
									<q-tooltip anchor="top middle" self="center middle"> Mark difficult </q-tooltip>
								</a>
								<a
									class="btn btn-sm bg-neutral-5 mx-1"
									@click="confirmFinish(data.row['.key'], data.row.name)"
								>
									<i aria-hidden="true" class="fas fa-check" />
									<q-tooltip anchor="top middle" self="center middle"> Finish </q-tooltip>
								</a>
								<a class="btn btn-sm bg-neutral-5" @click="unTag(data.row['.key'])">
									<i aria-hidden="true" class="fas fa-times" />
									<q-tooltip anchor="top middle" self="center middle"> Untag </q-tooltip>
								</a>
								<hk-popover
									v-if="key === 'allTagged'"
									header="Tagged by"
									:content="getPlayerName(data.row.metadata.tagged)"
								>
									<span class="btn btn-sm bg-neutral-5 ml-1">
										<i aria-hidden="true" class="fas fa-info" />
									</span>
								</hk-popover>
							</div>
						</hk-table>
					</hk-card>
				</div>

				<!-- FINISHED -->
				<div class="col-12 col-md-4">
					<hk-card>
						<div class="card-header" slot="header">
							Finished Spells
							<span v-if="finishedSpells">{{ Object.keys(finishedSpells).length }}</span>
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
							:items="othersFinished ? finishedByOthers : finishedSpells"
							:columns="untaggedColumns"
							:perPage="15"
							:search="['name']"
							class="mb-4"
						>
							<div slot="name" slot-scope="data" :class="isDifficult(data.row) ? 'red' : ''">
								<span>{{ data.item.capitalizeEach() }}</span>
								<a v-if="isDifficult(data.row)" class="ml-2">
									<i aria-hidden="true" class="fas fa-exclamation-triangle" />
									<q-tooltip anchor="top middle" self="center middle">Difficult</q-tooltip>
								</a>
							</div>
							<div slot="actions" slot-scope="data" class="actions">
								<a
									class="btn btn-sm bg-neutral-5"
									v-if="isDifficult(data.row)"
									@click="markDifficult(data.row)"
								>
									<i
										aria-hidden="true"
										class="fas fa-exclamation"
										:class="isDifficult(data.row) ? 'red' : ''"
									/>
									<q-tooltip anchor="top middle" self="center middle">Unmark difficult</q-tooltip>
								</a>
								<router-link
									v-if="userInfo.admin"
									:to="'/contribute/spells/' + data.row['.key']"
									class="btn btn-sm bg-neutral-5 mx-1"
								>
									<i aria-hidden="true" class="fas fa-pencil" />
									<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
								</router-link>
								<a
									class="btn btn-sm bg-neutral-5"
									@click="
										setSlide({
											show: true,
											type: 'contribute/spell/ViewSpell',
											data: data.row,
										})
									"
								>
									<i aria-hidden="true" class="fas fa-eye" />
									<q-tooltip anchor="top middle" self="center middle">Preview</q-tooltip>
								</a>
								<hk-popover
									header="Finished by"
									:content="getPlayerName(data.row.metadata.finished_by)"
								>
									<span class="btn btn-sm bg-neutral-5 ml-1">
										<i aria-hidden="true" class="fas fa-info" />
									</span>
								</hk-popover>
								<a
									class="btn btn-sm bg-neutral-5 ml-1"
									v-if="userInfo.admin && userId !== data.row.metadata.finished_by"
									@click="approve(data.row['.key'])"
								>
									<i aria-hidden="true" class="fas fa-check white" />
									<q-tooltip anchor="top middle" self="center middle">Approve</q-tooltip>
								</a>
							</div>
						</hk-table>

						<h3><i aria-hidden="true" class="fas fa-check green" /> Approved spells</h3>
						<hk-table :items="approvedSpells" :columns="untaggedColumns" :perPage="15">
							<div slot="name" slot-scope="data">
								<span>{{ data.item.capitalizeEach() }}</span>
							</div>
							<div slot="actions" slot-scope="data" class="actions">
								<a
									@click="
										setSlide({
											show: true,
											type: 'contribute/spell/ViewSpell',
											data: data.row,
										})
									"
								>
									<i aria-hidden="true" class="fas fa-eye" />
									<q-tooltip anchor="top middle" self="center middle"> Preview </q-tooltip>
								</a>
								<a v-if="userInfo.admin">
									<i aria-hidden="true" class="fas fa-info" />
									<q-popup-proxy :dark="$store.getters.theme === 'dark'" square>
										<hk-card header="Info" class="mb-0">
											Approved by: {{ getPlayerName(data.row.metadata.approved) }}<br />
											Finished by:
											{{ getPlayerName(data.row.metadata.finished_by) }}
										</hk-card>
									</q-popup-proxy>
								</a>
								<a
									v-if="userInfo.admin && userId !== data.row.metadata.finished_by"
									@click="disApprove(data.row['.key'])"
								>
									<i aria-hidden="true" class="fas fa-times white" />
									<q-tooltip anchor="top middle" self="center middle"> Disapprove </q-tooltip>
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
import _ from "lodash";
import { db } from "src/firebase";
import { mapGetters, mapActions } from "vuex";

export default {
	name: "Spells",
	data() {
		return {
			userId: this.$store.getters.user.uid,
			othersFinished: false,
			untaggedColumns: {
				name: {
					label: "Name",
					sortable: true,
					truncate: true,
				},
				actions: {
					label: '<i aria-hidden="true" class="far fa-ellipsis-h" />',
					noPadding: true,
					right: true,
					maxContent: true,
				},
			},
			taggedColumns: {
				name: {
					label: "Name",
					truncate: true,
				},
				actions: {
					label: '<i aria-hidden="true" class="far fa-ellipsis-h" />',
					noPadding: true,
					right: true,
					maxContent: true,
				},
			},
			isBusy: true,
		};
	},
	firebase() {
		return {
			allSpells: db.ref("spells"),
			allFinishedSpells: db.ref("new_spells").orderByChild("metadata/finished").equalTo(true),
			taggedSpell: db.ref("new_spells").orderByChild("metadata/tagged").equalTo(this.userId),
			admins: db.ref("users").orderByChild("admin").equalTo(true),
			contributors: db.ref("users").orderByChild("contribute").startAt(0),
		};
	},
	computed: {
		...mapGetters(["userInfo"]),
		untaggedSpells: function () {
			return _.chain(this.allSpells)
				.filter(function (spell) {
					return !("metadata" in spell) || !("tagged" in spell.metadata);
				})
				.value();
		},
		allTaggedSpells: function () {
			return _.chain(this.allSpells)
				.filter(function (spell) {
					return (
						"metadata" in spell && "tagged" in spell.metadata && !("finished" in spell.metadata)
					);
				})
				.value();
		},
		finishedSpells() {
			return _.chain(this.allFinishedSpells)
				.filter(function (spell) {
					return !("approved" in spell.metadata);
				})
				.value();
		},
		finishedByOthers() {
			return this.finishedSpells.filter((spell) => {
				return !("approved" in spell.metadata) && spell.metadata.finished_by !== this.userId;
			});
		},
		approvedSpells() {
			return _.chain(this.allFinishedSpells)
				.filter(function (spell) {
					return "approved" in spell.metadata;
				})
				.value();
		},
		taggedSpells() {
			const yourTagged = {
				key: "yourTagged",
				name: "Your tagged spell",
				spells: this.taggedSpell,
			};
			const allTagged = {
				key: "allTagged",
				name: "All tagged spells",
				spells: this.allTaggedSpells,
			};
			return this.userInfo.admin ? [yourTagged, allTagged] : [yourTagged];
		},
		users: function () {
			return _.union(this.admins, this.contributors);
		},
	},
	methods: {
		...mapActions(["setSlide"]),
		isDifficult(row) {
			return row.metadata && row.metadata.difficult;
		},
		tag(key, name) {
			db.ref(`spells/${key}/metadata`)
				.update({
					tagged: this.userId,
				})
				.then(() => {
					db.ref(`new_spells/${key}`).update({
						name,
						metadata: {
							tagged: this.userId,
						},
					});
				});
		},
		unTag(key) {
			db.ref(`new_spells/${key}/metadata/tagged`).remove();
			db.ref(`spells/${key}/metadata/tagged`).remove();
		},
		markDifficult(row) {
			let key = row[".key"];
			let current = this.isDifficult(row);
			if (current) {
				db.ref(`new_spells/${key}/metadata/difficult`).remove();
				db.ref(`spells/${key}/metadata/difficult`).remove();
			} else {
				db.ref(`new_spells/${key}/metadata`).update({
					difficult: !current,
				});
				db.ref(`spells/${key}/metadata`).update({
					difficult: !current,
				});
			}
		},
		getPlayerName(uid) {
			for (let user of this.users) {
				if (user[".key"] === uid) return user.username;
			}
		},
		confirmFinish(key, name) {
			this.$snotify.error(
				"Are you sure you've finished the spell \"" +
					name +
					'"? Make sure not to set incomplete spells to finished.',
				"Finish Item",
				{
					buttons: [
						{
							text: "Yes",
							action: (toast) => {
								this.finish(key);
								this.$snotify.remove(toast.id);
							},
							bold: false,
						},
						{
							text: "No",
							action: (toast) => {
								this.$snotify.remove(toast.id);
							},
							bold: true,
						},
					],
				}
			);
		},
		finish(key) {
			db.ref(`new_spells/${key}/metadata/finished`).set(true);
			db.ref(`new_spells/${key}/metadata/finished_by`).set(this.userId);
			db.ref(`new_spells/${key}/metadata/tagged`).remove();

			db.ref(`spells/${key}/metadata/finished`).set(true);
			db.ref(`spells/${key}/metadata/finished_by`).set(this.userId);
		},
		approve(key) {
			db.ref(`new_spells/${key}/metadata/approved`).set(this.userId);
		},
		disApprove(key) {
			db.ref(`new_spells/${key}/metadata/approved`).remove();
		},
	},
};
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
