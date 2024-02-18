<template>
	<div>
		<!-- PLAYERS -->
		<template v-if="!demo">
			<h3>Players</h3>
			<div class="players bg-neutral-8 border-radius mb-1" v-if="campaign.players && addable > 0">
				<div
					v-for="(player, key) in campaign_players"
					:key="key"
					@click="add($event, key, 'player', player.character_name)"
				>
					<div class="d-flex justify-content-left">
						<template v-if="!player_in_encounter(key)">
							<span
								class="img"
								:style="{
									backgroundImage: player_avatar(player)
										? 'url(\'' + player_avatar(player) + '\')'
										: '',
								}"
							>
								<i aria-hidden="true" v-if="!player_avatar(player)" class="hki-player" />
							</span>
						</template>
					</div>
					<q-tooltip v-if="!player_in_encounter(key)" anchor="top middle" self="center middle">
						Add {{ player.character_name }}
					</q-tooltip>
				</div>

				<div v-if="campaign && campaign.players === undefined">
					<h3 class="red"><i aria-hidden="true" class="fas fa-users"></i> No Players Yet</h3>
					<p>Add players to your campaign first.</p>
					<router-link :to="'/campaigns/' + campaignId" class="btn btn-block"
						>Go to campaign</router-link
					>
				</div>
				<a v-else class="btn" @click="addAllPlayers($event)">Add all</a>
			</div>
			<p>
				<small
					>Missing players?
					<router-link to="/content/campaigns">Add them to your campaign first</router-link>.</small
				>
			</p>
			<hr />
		</template>
		<button v-else class="btn btn-block mb-3" @click="player_dialog = true">
			<i class="fas fa-user-plus" aria-hidden="true" />
			Add players
		</button>

		<!-- MONSTERS -->
		<q-btn-toggle
			v-if="content_count.npcs"
			class="mb-3"
			v-model="monster_resource"
			spread
			no-caps
			toggle-color="primary"
			:options="[
				{ label: 'Custom NPCs', value: 'custom' },
				{ label: 'SRD monsters', value: 'srd' },
			]"
		/>

		<!-- CUSTOM NPCs -->
		<template v-if="monster_resource === 'custom'">
			<q-input
				:dark="$store.getters.theme !== 'light'"
				v-model="searchNpc"
				borderless
				filled
				square
				debounce="300"
				clearable
				placeholder="Search custom NPCs"
			>
				<q-icon slot="prepend" name="search" />
			</q-input>
			<q-table
				:data="npcs"
				:visible-columns="visibleColumns"
				:columns="columns"
				row-key="key"
				card-class="bg-none"
				flat
				:dark="$store.getters.theme !== 'light'"
				:loading="loading_npcs"
				separator="none"
				:pagination="{ rowsPerPage: 15 }"
				:filter="searchNpc"
				wrap-cells
			>
				<template v-slot:body="props">
					<q-tr :props="props">
						<q-td
							v-for="col in props.cols"
							:key="col.name"
							:props="props"
							:auto-width="col.name !== 'name'"
						>
							<router-link v-if="col.name === 'name'" :to="`/content/npcs/${col.key}`">
								{{ col.value }}
							</router-link>
							<span v-else-if="col.name === 'environment'">
								{{ col.value?.[0]?.capitalize() }}
								<template v-if="col.value?.length > 1">
									<span class="neutral-2">+{{ col.value.length - 1 }}</span>
									<q-tooltip anchor="top middle" self="center middle">
										{{ col.value?.join(", ").capitalizeEach() }}
									</q-tooltip>
								</template>
							</span>
							<div v-else-if="col.name === 'actions'" class="text-right d-flex justify-content-between">
								<div class="monster-actions">
									<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									dense
									class="multi_nr ml-2"
									autocomplete="off"
									type="number"
									min="1"
									max="99"
									name="name"
									placeholder="1"
									v-model="to_add[props.key]"
									/>
									<a
									class="btn btn-sm bg-neutral-5 mx-1"
									@click="multi_add($event, props.key, 'npc', props.row.name, true)"
									>
										<i aria-hidden="true" class="fas fa-plus"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Add with average HP
										</q-tooltip>
									</a>
									<a
										class="btn btn-sm bg-neutral-5"
										@click="multi_add($event, props.key, 'npc', props.row.name, true, true)"
									>
										<i aria-hidden="true" class="fas fa-dice-d20"></i>
										<q-tooltip anchor="top middle" self="center middle"> Add with rolled HP </q-tooltip>
									</a>
								</div>
							</div>
							<template v-else>
								{{ col.value }}
							</template>
						</q-td>
					</q-tr>
				</template>
				<div slot="no-data" />
				<hk-loader slot="loading" name="monsters" />
			</q-table>
			<q-btn
				v-if="!searchNpc && npcs.length < npc_count"
				slot="bottom-row"
				no-caps
				color="primary"
				label="Load more"
				@click="load({ pagination: npc_pagination }, true)"
			/>
		</template>

		<!-- SRD MONSTERS -->
		<template v-else>
			<q-input
				:dark="$store.getters.theme !== 'light'"
				v-model="searchMonster"
				borderless
				filled
				square
				debounce="300"
				clearable
				placeholder="Search SRD monster"
				@change="filterMonsters"
				@clear="filterMonsters"
			>
				<q-icon slot="prepend" name="search" />
				<q-btn slot="after" no-caps color="primary" @click="filter_dialog = true">
					Filter
					<i class="fas fa-filter ml-2" aria-hidden="true" />
					<q-badge v-if="Object.keys(filter).length" floating rounded color="red" :label="Object.keys(filter).length" />
				</q-btn>
			</q-input>
			<q-table
				:data="monsters"
				:columns="columns"
				row-key="_id"
				card-class="bg-none"
				flat
				:dark="$store.getters.theme !== 'light'"
				:pagination.sync="pagination"
				:loading="loading_monsters"
				separator="none"
				wrap-cells
				:visible-columns="visibleColumns"
				@request="request"
			>
				<div slot="loading">
					<hk-loader name="monsters" />
				</div>

				<template v-slot:header="props">
					<q-tr :props="props">
						<q-th auto-width />
						<q-th
							v-for="col in props.cols"
							:key="col.name"
							:props="props"
							:auto-width="col.name !== 'name'"
						>
							{{ col.label }}
						</q-th>
					</q-tr>
				</template>

				<!-- Body -->
				<template v-slot:body="props">
					<q-tr :props="props">
						<q-td auto-width>
							<a @click="props.expand = !props.expand" class="neutral-2">
								<i
									aria-hidden="true"
									class="fas"
									:class="props.expand ? 'fa-chevron-up' : 'fa-chevron-down'"
								/>
							</a>
						</q-td>
						<q-td
							v-for="col in props.cols" :key="col.name"
							:props="props"
							:auto-width="col.name !== 'name'"
						>
							<div v-if="col.name === 'actions'" class="monster-actions">
								<q-input
									:dark="$store.getters.theme === 'dark'"
									filled
									square
									dense
									class="multi_nr ml-2"
									autocomplete="off"
									type="number"
									min="1"
									max="99"
									name="name"
									placeholder="1"
									v-model="to_add[props.key]"
								/>
								<a
									class="btn btn-sm bg-neutral-5 mx-1"
									@click="multi_add($event, props.key, 'npc', props.row.name, false)"
								>
									<i aria-hidden="true" class="fas fa-plus"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Add with average HP
									</q-tooltip>
								</a>
								<a
									class="btn btn-sm bg-neutral-5"
									@click="multi_add($event, props.key, 'npc', props.row.name, false, true)"
								>
									<i aria-hidden="true" class="fas fa-dice-d20"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Add with rolled HP
									</q-tooltip>
								</a>
							</div>
							<span v-else-if="col.name === 'environment'">
								{{ col.value?.[0]?.capitalize() }}
								<template v-if="col.value?.length > 1">
									<span class="neutral-2">+{{ col.value.length - 1 }}</span>
									<q-tooltip anchor="top middle" self="center middle">
										{{ col.value?.join(", ").capitalizeEach() }}
									</q-tooltip>
								</template>
							</span>
							<template v-else>{{ col.value }}</template>
						</q-td>
					</q-tr>
					<q-tr v-if="props.expand" :props="props">
						<q-td colspan="100%" class="p-0" auto-width>
							<ViewMonster :id="props.key" />
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</template>
		<q-resize-observer @resize="setSize" />

		<q-dialog v-model="filter_dialog">
			<hk-card header="Filter monsters" :min-width="300">
				<div class="card-body">
					<hk-filter v-model="filter" type="monster" />
				</div>
				<div slot="footer" class="card-footer">
					<button class="btn bg-neutral-5" @click="clearFilter">
						<i class="fas fa-times" aria-hidden="true" />
						Clear filter
					</button>
					<button class="btn ml-2" @click="setFilter">
						<i class="fas fa-filter" aria-hidden="true" />
						Set filter
					</button>
				</div>
			</hk-card>
		</q-dialog>

		<q-dialog v-model="player_dialog">
			<div>
				<ValidationObserver v-slot="{ handleSubmit, valid }">
					<q-form @submit="handleSubmit(add($event, generateUUID(), 'player', player.name))" greedy>
						<hk-card header="Add players" :min-width="300">
							<div class="card-body">
								<ValidationProvider
									rules="required"
									name="Name"
									v-slot="{ errors, invalid, validated }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										label="Name"
										v-model="player.name"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
								<ValidationProvider
									rules="required|between:1,20"
									name="Level"
									v-slot="{ errors, invalid, validated }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										label="Level"
										type="number"
										v-model="player.level"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
								<ValidationProvider
									rules="required|between:1,9999"
									name="Max HP"
									v-slot="{ errors, invalid, validated }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										label="Hit Point Maximum"
										type="number"
										v-model="player.maxHp"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
								<ValidationProvider
									rules="required|between:1,99"
									name="AC"
									v-slot="{ errors, invalid, validated }"
								>
									<q-input
										:dark="$store.getters.theme === 'dark'"
										filled
										square
										label="Armor Class"
										type="number"
										v-model="player.ac"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
							<div slot="footer" class="card-footer">
								<q-btn flat no-caps v-close-popup label="Cancel" />
								<q-btn
									type="submit"
									label="Add"
									class="ml-1"
									no-caps
									color="primary"
									:disable="!valid"
								/>
							</div>
						</hk-card>
					</q-form>
				</ValidationObserver>
			</div>
		</q-dialog>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import { dice } from "src/mixins/dice.js";
import { general } from "src/mixins/general.js";
import ViewMonster from "src/components/compendium/Monster.vue";
import { uuid } from "src/utils/generalFunctions";

export default {
	name: "Entities",
	props: {
		encounter: {
			type: Object,
			required: true,
		},
		campaign: {
			type: Object,
			required: true,
		},
		campaign_players: {
			type: Object,
			required: true,
		},
		addPlayers: {
			type: Boolean,
			default: false,
		},
	},
	mixins: [general, dice],
	components: {
		ViewMonster,
	},
	data() {
		return {
			demo: this.$route.name === "ToolsBuildEncounter",
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			user: this.$store.getters ? this.$store.getters.user : undefined,
			width: 0,
			auto_npcs: [],
			viewNPC: [],
			player_dialog: false,
			player: {},
			drawer: this.$store.getters.getDrawer,
			to_add: {},
			filter_dialog: false,
			filter: {},
			typeFilter: [],
			monsterFields: {
				name: {
					label: "Name",
					truncate: true,
					sortable: true,
				},
				type: {
					label: "Type",
					truncate: true,
					sortable: true,
					hide: "sm",
				},
				challenge_rating: {
					label: "CR",
					sortable: true,
					maxContent: true,
				},
				actions: {
					label: "",
					noPadding: true,
					maxContent: true,
				},
			},
			monster_resource_setter: undefined,
			loading_monsters: true,
			loading_npcs: true,
			monsters: [],
			players: {},
			searchMonster: "",
			searchNpc: "",
			query: null,
			pagination: {
				sortBy: "name",
				descending: false,
				page: 1,
				rowsPerPage: 15,
				rowsNumber: 0,
			},
			npcPaginationSetter: undefined,
			columns: [
				{
					name: "challenge_rating",
					label: "CR",
					field: "challenge_rating",
					align: "left",
					headerStyle: "min-width: 70px;",
					style: "font-weight: bold;",
					sortable: true,
					format: (val) => this.cr(val),
				},
				{
					name: "name",
					label: "Name",
					field: "name",
					sortable: true,
					align: "left",
					classes: "truncate-cell",
					style: "font-weight: bold;",
					format: (val) => val.capitalizeEach(),
				},
				{
					name: "type",
					label: "Type",
					field: "type",
					align: "left",
					sortable: true,
				},
				{
					name: "environment",
					label: "Environment",
					field: "environment",
					style: "white-space: nowrap;",
					align: "left",
				},
				{
					name: "actions",
					label: "",
					sortable: false,
					align: "right",
				},
			],
		};
	},
	async mounted() {
		await this.fetchMonsters();
		this.loading_monsters = false;
		await this.get_npcs();
		this.loading_npcs = false;
	},
	watch: {
		// Prop is changed in parent to trigger addAllPlayers function from Overview.vue
		addPlayers() {
			this.addAllPlayers();
		},
	},
	computed: {
		...mapGetters(["content_count"]),
		...mapGetters("npcs", ["npcs", "npc_count"]),
		monster_resource: {
			get() {
				const resource = this.npc_count ? "custom" : "srd";
				return this.monster_resource_setter ? this.monster_resource_setter : resource;
			},
			set(newVal) {
				this.monster_resource_setter = newVal;
			},
		},
		npc_pagination: {
			get() {
				return this.npcPaginationSetter
					? this.npcPaginationSetter
					: {
							sortBy: "name",
							rowsPerPage: 15,
							rowsNumber: this.npc_count,
					  };
			},
			set(newVal) {
				this.npcPaginationSetter = newVal;
			},
		},
		visibleColumns() {
			switch (true) {
				case this.width > 600:
					return  ["challenge_rating", "name", "type", "environment", "actions"];
				case this.width > 450:
					return  ["challenge_rating", "name", "type", "actions"];
				case this.width > 400:
					return   ["challenge_rating", "name", "actions"];
				default:
					return ["name", "actions"];
			}
		},
		addable() {
			let count = 0;
			for (const playerId in this.campaign_players) {
				if (!this.player_in_encounter(playerId)) {
					++count;
				}
			}
			return count;
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("api_monsters", ["fetch_monsters", "fetch_monster"]),
		...mapActions("npcs", ["get_npcs", "get_npc"]),
		...mapActions("players", ["get_players", "get_player"]),
		...mapActions("encounters", ["add_player_encounter", "add_npc_encounter"]),
		player_avatar(player) {
			return player.storage_avatar || player.avatar;
		},
		generateUUID() {
			return uuid();
		},
		cr(val) {
			return val == 0.125 ? "1/8" : val == 0.25 ? "1/4" : val == 0.5 ? "1/2" : val;
		},
		filterMonsters() {
			this.loading_monsters = true;
			this.monsters = [];
			this.pagination.page = 1;
			this.query = {
				search: this.searchMonster,
				...this.filter
			};
			this.fetchMonsters();
		},
		setFilter() {
			this.filter_dialog = false;
			this.filterMonsters();
		},
		clearFilter() {
				this.filter_dialog = false;
				this.$set(this, "filter", {});
				this.filterMonsters();
			},
		request(req) {
			this.pagination = req.pagination;
			this.fetchMonsters();
		},
		async fetchMonsters() {
			await this.fetch_monsters({
				pageNumber: this.pagination.page,
				pageSize: this.pagination.rowsPerPage,
				query: this.query,
				fields: ["name", "type", "challenge_rating", "environment"],
				sortBy: this.pagination.sortBy,
				descending: this.pagination.descending,
			}).then((result) => {
				this.pagination.rowsNumber = result.meta.count;
				this.monsters = result.results;
				this.loading_monsters = false;
			});
		},
		async multi_add(e, id, type, name, custom = false, rollHp = false) {
			if (!this.to_add[id]) {
				this.to_add[id] = 1;
			}
			for (let i = 0; i < this.to_add[id]; i++) {
				await this.add(e, id, type, name, custom, rollHp);
			}

			// Notification for NPCs
			if (type === "npc") {
				this.$snotify.success(
					`${this.to_add[id]} NPC${this.to_add > 1 ? "s" : ""} added successfully`,
					"NPC added",
					{ position: "centerTop" }
				);
			}

			this.to_add[id] = 1;
		},
		async add(e, id, type, name, custom = false, rollHp = false, companion_of = undefined) {
			let entity = {
				id: id,
				name: name,
				entityType: type,
				initiative: 0,
				active: true,
			};
			let HP = undefined;

			// NPC
			if (type === "npc") {
				entity.active = true;
				let last = -1;
				let n = 0;
				for (let i in this.encounter.entities) {
					let match = this.encounter.entities[i].name.match(
						/(?:^(.*)(?:\s\((\d+)\))$)|(?:^(.*)(?!\s\(\d+\))$)/
					);

					let new_name = match[1] || match[3];
					if (new_name === entity.name) {
						n++;
						let digit = parseInt(match[2]);
						last = digit > last ? digit : last;
					}
				}
				if (last > 0) {
					entity.name = `${entity.name} (${++last})`;
				} else if (n > 0) {
					entity.name = `${entity.name} (${n})`;
				}

				// SRD NPC
				if (!custom) {
					let npc_data = await this.fetch_monster(id);
					entity.npc = "srd";
					if (rollHp && npc_data.hit_dice) {
						let dice_values = npc_data.hit_dice.split("d");
						let mod = dice_values[0] * this.calcMod(npc_data.constitution);

						HP = this.rollD(
							e,
							dice_values[1],
							dice_values[0],
							mod,
							"Hit points roll",
							npc_data.name
						);

						// minimum starting health of NPC is 1
						entity.curHp = HP.total.min(1);
						entity.maxHp = HP.total.min(1);
					} else {
						entity.curHp = npc_data.hit_points;
						entity.maxHp = npc_data.hit_points;
					}
					entity.ac = npc_data.armor_class;
				}

				// CUSTOM NPC
				else {
					let npc_data = await this.get_npc({ uid: this.user.uid, id });
					entity.npc = "custom";
					entity.ac = npc_data.old ? npc_data.ac : npc_data.armor_class;

					if (npc_data.friendly) {
						entity.friendly = true;
					}

					if (rollHp && npc_data.hit_dice) {
						let dice_values = npc_data.hit_dice.split("d");
						let mod = dice_values[0] * this.calcMod(npc_data.constitution);

						HP = this.rollD(
							e,
							dice_values[1],
							dice_values[0],
							mod,
							"Hit points roll",
							npc_data.name
						);

						// minimum starting health of NPC is 1
						entity.curHp = HP.total.min(1);
						entity.maxHp = HP.total.min(1);
					} else {
						entity.curHp = npc_data.old ? npc_data.maxHp : npc_data.hit_points;
						entity.maxHp = npc_data.old ? npc_data.maxHp : npc_data.hit_points;
					}
				}
				if (!this.demo) {
					await this.add_npc_encounter({
						campaignId: this.campaignId,
						encounterId: this.encounterId,
						npc: entity,
					});
				} else {
					this.add_demo_entity(entity);
				}
			}

			// PLAYER
			else if (type === "player") {
				if (!this.demo) {
					await this.add_player_encounter({
						campaignId: this.campaignId,
						encounterId: this.encounterId,
						playerId: id,
						player: entity,
					});
					// Add player companions
					const companions = this.campaign_players[id].companions;
					for (const key in companions) {
						const companion = await this.get_npc({ uid: this.user.uid, id: key });
						await this.add(e, key, "companion", companion.name, true, false, id);
					}
				} else {
					entity = {
						...entity,
						character_name: entity.name,
						level: parseInt(this.player.level),
						ac: parseInt(this.player.ac),
						maxHp: parseInt(this.player.maxHp),
						curHp: parseInt(this.player.maxHp),
					};
					this.add_demo_entity(entity);
					this.player = {};
				}
			}

			// COMPANION
			else if (type === "companion") {
				entity.npc = "custom";
				entity.player = companion_of;
				if (!this.demo) {
					await this.add_player_encounter({
						campaignId: this.campaignId,
						encounterId: this.encounterId,
						playerId: id,
						player: entity,
					});
				} else {
					this.add_demo_entity(entity);
				}
			}

			// NOTIFICATION
			if (type === "npc") {
				let notifyHP = {};

				if (HP) {
					notifyHP.total = HP.total;
					notifyHP.throws = " [" + HP.throws + "] ";
					notifyHP.mod = HP.mod;
				} else {
					notifyHP.total = entity.maxHp;
					notifyHP.throws = "";
					notifyHP.mod = "";
				}
			}
		},
		async addAllPlayers(e) {
			for (let player in this.campaign.players) {
				let name = this.campaign_players[player].character_name;
				await this.add(e, player, "player", name);
			}
		},
		player_in_encounter(id) {
			if (this.encounter.entities) {
				return Object.keys(this.encounter.entities).indexOf(id) >= 0;
			} else {
				return false;
			}
		},
		add_demo_entity(entity) {
			this.encounter.entities
				? this.$set(this.encounter.entities, uuid(), entity)
				: this.$set(this.encounter, "entities", { [uuid()]: entity });
		},
		setSize(e) {
			this.width = e.width;
		},
	},
};
</script>

<style lang="scss" scoped>
// Remove arrows from number field
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
.monster-actions {
	display: flex;
	justify-content: flex-end;
	align-items: center;

	.multi_nr {
		width: 45px;
		height: 31px;
		text-align: center;
		margin-left: 4px;

		&::v-deep .q-field__inner {
			.row {
				height: 31px;
			}
			input {
				height: 31px;
				line-height: 31px;
			}
		}
	}
}

.players {
	display: flex;
	justify-content: flex-start;
	padding: 10px;

	.img {
		width: 38px;
		height: 38px;
		background-size: cover;
		background-position: center top;
		margin-right: 5px;
		background-color: $neutral-9;
		border-radius: $border-radius-small;
		cursor: pointer;
		border: solid 1px $neutral-5;
		color: $neutral-2;
		font-size: 26px;
		text-align: center;
	}
}

[data-theme="light"] {
	.players .img {
		background-color: $neutral-2;
		color: $neutral-8;
	}
}
</style>
