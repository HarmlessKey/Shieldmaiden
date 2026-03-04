<template>
	<hk-card class="npc-group-manager">
		<div slot="header" class="card-header">
			<template v-if="selectedGroup">
				<a @click="selectedGroup = null" class="btn btn-sm bg-neutral-5 mr-2">
					<i aria-hidden="true" class="fas fa-arrow-left" />
				</a>
				<span>{{ selectedGroup.name ? selectedGroup.name.capitalizeEach() : "" }}</span>
			</template>
			<span v-else>Manage NPC Groups</span>
			<q-btn padding="sm" size="sm" no-caps icon="fas fa-times" flat v-close-popup />
		</div>
		<div class="card-body">
			<!-- GROUP DETAIL VIEW -->
			<template v-if="selectedGroup">
				<!-- Rename -->
				<div class="row q-col-gutter-sm mb-3">
					<div class="col">
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							dense
							v-model="editName"
							label="Group name"
							@keyup.enter="renameGroup"
						/>
					</div>
					<div class="col-auto">
						<q-btn
							no-caps
							color="primary"
							:disable="!editName || editName.toLowerCase() === selectedGroup.name"
							@click="renameGroup"
						>
							Rename
						</q-btn>
					</div>
				</div>

				<!-- Add NPCs -->
				<q-select
					:dark="$store.getters.theme === 'dark'"
					filled
					square
					dense
					multiple
					use-chips
					label="Add NPCs to group"
					v-model="groupNpcIds"
					:options="npcOptions"
					option-value="value"
					option-label="label"
					emit-value
					map-options
					class="mb-3"
				/>

				<!-- NPC Members -->
				<div v-if="groupMembers.length" class="member-list">
					<div
						v-for="npc in groupMembers"
						:key="npc.key"
						class="member d-flex justify-content-between items-center"
					>
						<span>{{ npc.name ? npc.name.capitalizeEach() : npc.key }}</span>
						<a class="btn btn-sm bg-neutral-5" @click="removeNpcFromGroup(npc.key)">
							<i aria-hidden="true" class="fas fa-times red" />
						</a>
					</div>
				</div>
				<p v-else class="neutral-3">No NPCs in this group yet.</p>
			</template>

			<!-- GROUP LIST VIEW -->
			<template v-else>
				<!-- Add new group -->
				<div class="row q-col-gutter-sm mb-3">
					<div class="col">
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							dense
							v-model="newGroupName"
							label="New group name"
							@keyup.enter="addGroup"
						/>
					</div>
					<div class="col-auto">
						<q-btn no-caps color="primary" :disable="!newGroupName" @click="addGroup">
							Add
						</q-btn>
					</div>
				</div>

				<!-- Groups list -->
				<div v-if="npc_groups && npc_groups.length" class="group-list">
					<div
						v-for="group in npc_groups"
						:key="group.key"
						class="group-item d-flex justify-content-between items-center"
					>
						<a @click="selectGroup(group)" class="group-name truncate">
							{{ group.name ? group.name.capitalizeEach() : group.key }}
						</a>
						<div class="d-flex">
							<a class="btn btn-sm bg-neutral-5 mr-1" @click="selectGroup(group)">
								<i aria-hidden="true" class="fas fa-pencil" />
							</a>
							<a class="btn btn-sm bg-neutral-5" @click="confirmDeleteGroup(group)">
								<i aria-hidden="true" class="fas fa-trash-alt" />
							</a>
						</div>
					</div>
				</div>
				<p v-else class="neutral-3">No groups created yet.</p>
			</template>
		</div>
	</hk-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "NpcGroupManager",
	data() {
		return {
			newGroupName: "",
			selectedGroup: null,
			editName: "",
		};
	},
	computed: {
		...mapGetters("npcGroups", ["npc_groups"]),
		...mapGetters("npcs", ["npcs"]),
		npcOptions() {
			return this.npcs.map((npc) => ({
				label: npc.name ? npc.name.capitalizeEach() : npc.key,
				value: npc.key,
			}));
		},
		groupMembers() {
			if (!this.selectedGroup) return [];
			return this.npcs.filter(
				(npc) => npc.groups && npc.groups[this.selectedGroup.key]
			);
		},
		groupNpcIds: {
			get() {
				return this.groupMembers.map((npc) => npc.key);
			},
			set(val) {
				this.syncGroupNpcs(val);
			},
		},
	},
	methods: {
		...mapActions("npcGroups", ["add_npc_group", "edit_npc_group", "delete_npc_group"]),
		...mapActions("npcs", ["update_npc_groups"]),
		async addGroup() {
			if (!this.newGroupName) return;
			await this.add_npc_group({ name: this.newGroupName });
			this.newGroupName = "";
		},
		selectGroup(group) {
			this.selectedGroup = group;
			this.editName = group.name ? group.name.capitalizeEach() : "";
		},
		async renameGroup() {
			if (!this.editName || this.editName.toLowerCase() === this.selectedGroup.name) return;
			await this.edit_npc_group({
				id: this.selectedGroup.key,
				group: { name: this.editName },
			});
			this.selectedGroup.name = this.editName.toLowerCase();
		},
		confirmDeleteGroup(group) {
			this.$snotify.error(
				`Are you sure you want to delete "${group.name ? group.name.capitalizeEach() : group.key}"?`,
				"Delete Group",
				{
					timeout: false,
					buttons: [
						{
							text: "Yes",
							action: (toast) => {
								this.delete_npc_group(group.key);
								if (this.selectedGroup && this.selectedGroup.key === group.key) {
									this.selectedGroup = null;
								}
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
		async syncGroupNpcs(newNpcIds) {
			const groupId = this.selectedGroup.key;
			const currentNpcIds = this.groupMembers.map((npc) => npc.key);

			// NPCs to add to group
			const toAdd = newNpcIds.filter((id) => !currentNpcIds.includes(id));
			// NPCs to remove from group
			const toRemove = currentNpcIds.filter((id) => !newNpcIds.includes(id));

			for (const npcId of toAdd) {
				const npc = this.npcs.find((n) => n.key === npcId);
				const groups = { ...(npc.groups || {}), [groupId]: true };
				await this.update_npc_groups({ id: npcId, groups });
			}
			for (const npcId of toRemove) {
				await this.removeNpcFromGroup(npcId);
			}
		},
		async removeNpcFromGroup(npcId) {
			const groupId = this.selectedGroup.key;
			const npc = this.npcs.find((n) => n.key === npcId);
			if (npc && npc.groups) {
				const groups = { ...npc.groups };
				delete groups[groupId];
				await this.update_npc_groups({
					id: npcId,
					groups: Object.keys(groups).length ? groups : undefined,
				});
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.npc-group-manager {
	max-width: 95vw;
	width: 576px;
	margin-top: 100px;
}
.group-list,
.member-list {
	.group-item,
	.member {
		padding: 5px 0;
		border-bottom: solid 1px $neutral-6;

		&:last-child {
			border-bottom: none;
		}
	}
	.group-name {
		cursor: pointer;
		&:hover {
			color: $blue;
		}
	}
}
</style>
