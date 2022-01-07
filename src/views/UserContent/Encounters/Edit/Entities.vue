<template>
	<div>
		<h3>Players</h3>

		<!-- PLAYERS -->
		<div class="players bg-neutral-8 border-radius mb-1" v-if="campaign.players && addable > 0">
			<div 
				v-for="(player, key) in campaign_players" 
				:key="key"
				@click="add($event, key, 'player', player.character_name)" 
			>
			<div class="d-flex justify-content-left">
				<template v-if="!player_in_encounter(key)">
					<span class="img" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }">
						<i v-if="!player.avatar" class="hki-player" />
					</span>
				</template>
			</div>
			<q-tooltip v-if="!player_in_encounter(key)" anchor="top middle" self="center middle">
				Add {{ player.character_name }}
			</q-tooltip>
		</div>

		<div v-if="campaign && campaign.players === undefined">
			<h3 class="red"><i class="fas fa-users"></i> No Players Yet</h3>
			<p>Add players to your campaign first.</p>
			<router-link :to="'/campaigns/' + campaignId" class="btn btn-block">Go to campaign</router-link>
		</div>
		<a v-else class="btn" @click="addAllPlayers($event)">Add all</a>
	</div>
	<p><small>Missing players? <router-link to="/content/campaigns">Add them to your campaign first</router-link>.</small></p>
	<hr>

	<!-- MONSTERS -->
	<q-btn-toggle
		v-if="content_count.npcs"
		class="mb-3"
		v-model="monster_resource"
		spread
		no-caps
		toggle-color="primary"
		:options="[
			{label: 'Custom NPCs', value: 'custom'},
			{label: 'SRD monsters', value: 'srd'}
		]"
	/>

	<!-- CUSTOM NPCs -->
	<template v-if="monster_resource === 'custom'">
		<q-input 
			:dark="$store.getters.theme !== 'light'" 
			v-model="searchNpc"
			borderless 
			filled square
			debounce="300" 
			clearable
			placeholder="Search custom NPCs"
		>
			<q-icon slot="prepend" name="search" />
			<!-- <q-btn slot="after" no-caps color="primary" label="Search" @click="searchNpcs" /> -->
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
			<template v-slot:body-cell="props">
				<q-td v-if="props.col.name !== 'actions'">
					<div  class="truncate-cell">
						<div class="truncate">
							<router-link v-if="props.col.name === 'name'" :to="`/content/npcs/${props.key}`">
								{{ props.value }}
							</router-link>
							<template v-else>
								{{ props.value }}
							</template>
						</div>
					</div>
				</q-td>
				<q-td v-else class="text-right d-flex justify-content-between">
					<div class="monster-actions">
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square dense
							class="multi_nr ml-2" 
							autocomplete="off" 
							type="number" 
							min="1"
							max="99"
							name="name" 
							placeholder="1" 
							v-model="to_add[props.key]"
						/>
						<a class="btn btn-sm bg-neutral-5 mx-1" @click="multi_add($event, props.key, 'npc', props.row.name, true)">
							<i class="fas fa-plus"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Add with average HP
							</q-tooltip>
						</a>
						<a class="btn btn-sm bg-neutral-5" @click="multi_add($event, props.key, 'npc', props.row.name, true, true)">
							<i class="fas fa-dice-d20"></i>
							<q-tooltip anchor="top middle" self="center middle">
								Add with rolled HP
							</q-tooltip>
						</a>
					</div>
				</q-td>
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
			filled square
			debounce="300" 
			clearable
			placeholder="Search SRD monster"
			@change="filter"
		>
			<q-icon slot="prepend" name="search" />
			<q-btn slot="after" no-caps color="primary" label="Search" @click="filter" />
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
					>
						{{ col.label }}
					</q-th>
				</q-tr>
			</template>

			<!-- Body -->
			<template v-slot:body="props">
				<q-tr :props="props">
					<q-td auto-width>
						<a  @click="props.expand = !props.expand">
							<i class="fas" :class="props.expand ? 'fa-chevron-up' : 'fa-chevron-down'" />
						</a>
					</q-td>
					<q-td
						v-for="col in props.cols"
						:key="col.name"
						:props="props"
					>
						<div class="truncate-cell">
							<div class="truncate">
								<router-link v-if="col.name === 'name'" :to="'/compendium/monsters/' + col.value.replace(/ /g, '-').toLowerCase()">
									{{ col.value }}
								</router-link>
								<div v-else-if="col.name === 'actions'" class="monster-actions">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square dense
										class="multi_nr ml-2" 
										autocomplete="off" 
										type="number" 
										min="1"
										max="99"
										name="name" 
										placeholder="1" 
										v-model="to_add[props.key]"
									/>
									<a class="btn btn-sm bg-neutral-5 mx-1" @click="multi_add($event, props.key, 'npc', props.row.name, false)">
										<i class="fas fa-plus"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Add with average HP
										</q-tooltip>
									</a>
									<a class="btn btn-sm bg-neutral-5" @click="multi_add($event, props.key, 'npc', props.row.name, false, true)">
										<i class="fas fa-dice-d20"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Add with rolled HP
										</q-tooltip>
									</a>
								</div>
								<template v-else>{{ col.value }}</template>
							</div>
						</div>
					</q-td>
				</q-tr>
				<q-tr v-if="props.expand" :props="props">
					<q-td colspan="100%" class="px-0 py-0" auto-width>
						<ViewMonster :id="props.key" />
					</q-td>
				</q-tr>
			</template>
		</q-table>
	</template>
	<q-resize-observer @resize="setSize" />
</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	
	import { dice } from '@/mixins/dice.js';
	import { general } from '@/mixins/general.js';
	import ViewMonster from '@/components/ViewMonster.vue';

	export default {
		name: 'Entities',
		props: {
			encounter: {
				type: Object,
				required: true
			},
			campaign: {
				type: Object,
				required: true
			},
			campaign_players: {
				type: Object,
				required: true
			}
		},
		mixins: [general, dice],
		components: {
			ViewMonster
		},
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.user,
				width: 0,
				auto_npcs: [],
				viewNPC: [],
				slide: this.$store.getters.getSlide,
				to_add: {},
				typeFilter: [],
				monsterFields: {
					name: {
						label: 'Name',
						truncate: true,
						sortable: true
					},
					type: {
						label: 'Type',
						truncate: true,
						sortable: true,
						hide: 'sm'
					},
					challenge_rating: {
						label: 'CR',
						sortable: true,
						maxContent: true
					},
					'actions': {
						label: '',
						noPadding: true,
						maxContent: true
					}
				},
				monster_resource_setter: undefined,
				loading_monsters: true,
				loading_npcs: true,
				monsters: [],
				npcs: [],
				players: {},
				searchMonster: "",
				searchNpc: "",
				query: null,
				pagination: {
					sortBy: 'name',
					descending: false,
					page: 1,
					rowsPerPage: 15,
					rowsNumber: 0
				},
				npcPaginationSetter: undefined,
				columns: [
					{
						name: "name",
						label: "Name",
						field: "name",
						sortable: true,
						align: "left",
						format: val => val.capitalizeEach()
					},
					{
						name: "type",
						label: "Type",
						field: "type",
						align: "left",
						sortable: true
					},
					{
						name: "challenge_rating",
						label: "CR",
						field: "challenge_rating",
						align: "left",
						sortable: true,
						format: val => this.cr(val)
					},
					{
						name: "actions",
						label: "",
						sortable: false,
						align: "right"
					}
				]
			} 
		},
		async mounted() {

			await this.fetchMonsters();
			this.npcs = await this.get_npcs();
			this.loading_npcs = false;
		},
		computed: {
			...mapGetters(["content_count"]),
			...mapGetters("npcs", ["npc_count"]),
			monster_resource: {
				get() {
					const resource = (this.npc_count) ? "custom" : "srd";
					return (this.monster_resource_setter) ? this.monster_resource_setter : resource;
				},
				set(newVal) {
					this.monster_resource_setter = newVal;
				}
			},
			npc_pagination: {
				get() {
					return (this.npcPaginationSetter) ? this.npcPaginationSetter : {
						sortBy: "name",
						rowsPerPage: 15,
						rowsNumber: this.npc_count
					};
				},
				set(newVal) {
					this.npcPaginationSetter = newVal;
				}
			},
			visibleColumns() {
				return (this.width > 600) ? 
					["name", "type", "challenge_rating", "actions"] : 
					(this.width > 450) ? 
					["name", "type", "actions"] :
					["name", "actions"];
			},
			addable() {
				let count = 0;
				for (const playerId in this.campaign_players) {
					if (!this.player_in_encounter(playerId)) {
						++count;
					}
				}
				return count
			}
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("api_monsters", ["get_monsters", "get_monster"]),
			...mapActions("npcs", ["get_npcs", "get_npc"]),
			...mapActions("players", ["get_players", "get_player"]),
			...mapActions("encounters", [
				"add_player_encounter", 
				"add_npc_encounter"
			]),
			cr(val) {
				return (val == 0.125) ? "1/8" : 
					(val == 0.25) ? "1/4" :
					(val == 0.5) ? "1/2" :
					val;
			},
			filter() {
				this.loading_monsters = true;
				this.monsters = [];
				this.pagination.page = 1;
				this.query = {
					search: this.searchMonster
				}
				this.fetchMonsters();
			},
			request(req) {
				this.pagination = req.pagination;
				this.fetchMonsters();		
			},
			async fetchMonsters() {
				await this.get_monsters({
					pageNumber: this.pagination.page,
					pageSize: this.pagination.rowsPerPage,
					query: this.query,
					fields: ["name", "type", "challenge_rating"],
					sortBy: this.pagination.sortBy,
					descending: this.pagination.descending
				}).then(result => {
					this.pagination.rowsNumber = result.meta.count;
					this.monsters = result.results;
					this.loading_monsters = false;
				});
			},
			multi_add(e, id,type,name,custom=false,rollHp=false) {
				if (!this.to_add[id]) {
					this.to_add[id] = 1
				}
				for (let i = 0; i < this.to_add[id]; i++ ) {
					this.add(e, id,type,name,custom,rollHp)
				}
				this.to_add[id] = 1
			},
			async add(e, id, type, name, custom = false, rollHp = false, companion_of = undefined ) {
				let entity = {
					id: id,
					name: name,
					entityType: type,
					initiative: 0,
					active: true,
				}
				let HP = undefined;

				// NPC
				if(type === 'npc') {
					entity.active = true;
					let last = -1;
					let n = 0;
					for (let i in this.encounter.entities) {
						let match = this.encounter.entities[i].name.match(/(?:^(.*)(?:\s\((\d)\))$)|(?:^(.*)(?!\s\(\d\))$)/);
						
						let name = match[1] || match[3];
						if (name == entity.name) {
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
					if(!custom) {
						let npc_data = await this.get_monster(id);
						entity.npc = "srd";
						if(rollHp && npc_data.hit_dice) {
							let dice = npc_data.hit_dice.split('d');
							let mod = dice[0] * this.calcMod(npc_data.constitution);

							HP = this.rollD(e, dice[1], dice[0], mod, "Hit points roll", npc_data.name);

							entity.curHp = HP.total;
							entity.maxHp = HP.total;
						}
						else {
							entity.curHp = npc_data.hit_points;
							entity.maxHp = npc_data.hit_points;
						}
						entity.ac = npc_data.armor_class;
					}

					// CUSTOM NPC
					else {
						let npc_data = await this.get_npc({ uid: this.user.uid, id });
						entity.npc = 'custom';
						entity.ac = (npc_data.old) ? npc_data.ac : npc_data.armor_class;

						if (npc_data.friendly) {
							entity.friendly = true;
						}

						if(rollHp && npc_data.hit_dice) {
							let dice = npc_data.hit_dice.split('d');
							let mod = dice[0] * this.calcMod(npc_data.constitution);

							HP = this.rollD(e, dice[1], dice[0], mod, "Hit points roll", npc_data.name);
							
							entity.curHp = HP.total;
							entity.maxHp = HP.total;
						}
						else {
							entity.curHp = (npc_data.old) ? npc_data.maxHp : npc_data.hit_points;
							entity.maxHp = (npc_data.old) ? npc_data.maxHp : npc_data.hit_points;
						}
					}
					this.add_npc_encounter({
						campaignId: this.campaignId,
						encounterId: this.encounterId,
						npc: entity
					});
				}

				// PLAYER
				else if (type == 'player') {
					this.add_player_encounter({
						campaignId: this.campaignId,
						encounterId: this.encounterId,
						playerId: id,
						player: entity
					});
					const companions = this.campaign_players[id].companions;
					for (let key in companions) {
						this.add(e, key, 'companion', this.npcs[key].name , true, false, id);
					}
				}

				// COMPANION
				else if (type == 'companion') {
					entity.npc = 'custom';
					entity.player = companion_of;
					this.add_player_encounter({
						campaignId: this.campaignId,
						encounterId: this.encounterId,
						playerId: id,
						player: entity
					});
				}

				// NOTIFICATION
				if(type === 'npc') {
					let notifyHP = [];

					if(HP) {
						notifyHP.total = HP.total
						notifyHP.throws = ' [' + HP.throws + '] '
						notifyHP.mod = HP.mod
					}
					else {
						notifyHP.total = entity.maxHp;
						notifyHP.throws = ''
						notifyHP.mod = ''
					}

					this.$snotify.success('HP: ' + notifyHP.total + notifyHP.throws + notifyHP.mod, 'NPC added', {
						position: "centerTop"
					});
				}
			},
			addAllPlayers(e) {
				for(let player in this.campaign.players) {
					let name = this.campaign_players[player].character_name;
					this.add(e, player, 'player', name)
				}
			},
			player_in_encounter(id) {
				if(this.encounter.entities) {
					return Object.keys(this.encounter.entities).indexOf(id) >= 0;
				} else {
					return false
				}
			},
			setSize(e) {
				this.width = e.width;
			}
		}
	}
</script>

<style lang="scss" scoped>
// Remove arrows from number field
input[type="number"]::-webkit-outer-spin-button, input[type='number']::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
.monster-actions {
	display: flex;
	justify-content: flex-end;
	align-items: center;

	.multi_nr {
		width: 45px;
		height: 30px;
		text-align: center;
		margin-left: 4px;
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

.hk-table {
	margin-bottom: 30px;
}
[data-theme="light"] {
	.players .img {
		background-color: $neutral-2;
		color: $neutral-8;
	}
}
</style>