<template>
	<div class="pb-5">
		<h2>Add entity</h2>

		<q-tabs
			v-if="!demo"
			v-model="tab"
			dark
			inline-label
			dense
			no-caps
		>
			<q-tab 
				v-for="({name, icon, label}, index) in tabs"
				:key="`tab-${index}`" 
				:name="name" 
				:icon="icon"
				:label="label"
			/>
		</q-tabs>

		<q-tab-panels v-model="tab" class="bg-transparent mt-3">
			<q-tab-panel name="npc">
				<q-form @submit="addNPC()">
					<q-input 
						dark filled square
						autocomplete="off"
						label="Name"
						type="text" 
						name="name" 
						v-model="entity.name"
						:rules="[ val => val && val.length > 0 || 'Enter a name']"
						no-error-icon
					/>
					<hr>
					<div class="row q-col-gutter-md mb-2">
						<div class="col">
							<q-input 
								dark filled square
								autocomplete="off"
								label="Initiative"
								type="number" 
								name="initiative"
								min="0"
								v-model="entity.initiative"
								:rules="[ val => val >= 1 || 'Min = 1']"
								no-error-icon
							>
								<template v-slot:append>
									<a @click="rollInitiative">
									<q-icon size="small" name="fas fa-dice-d20"/>
									<q-tooltip anchor="top middle" self="center middle">
										1d20 {{ dexterity ? `+ ${calcMod(dexterity)}` : `` }}
									</q-tooltip>
								</a>
								</template>
							</q-input>
						</div>
						<div class="col">
							<q-input 
								dark filled square
								autocomplete="off"
								label="Armor class"
								type="number" 
								name="ac"
								min="1"
								v-model="entity.ac"
								:rules="[ val => val >= 1 || 'Min = 1']"
								no-error-icon
							/>
						</div>
						<div class="col">
							<q-input 
								dark filled square
								autocomplete="off"
								label="Hit points"
								type="number" 
								name="maxHp"
								min="1"
								v-model="entity.maxHp"
								:rules="[ val => val >= 1 || 'Min = 1']"
								no-error-icon
							/>
						</div>
					</div>
					<label class="my-2">When to add</label>
					<q-btn-toggle
						class="mt-2"
						v-model="addMoment"
						spread
						no-caps
						flat
						dark
						:options="options"
						toggle-color="primary"
					/>
					<hr>
					<q-btn class="btn btn-block mb-3" type="submit" label="Add" />
				</q-form>

				<h2>Copy an NPC from below</h2>
				
				<p>Search all NPC's, including your custom.</p>
				<q-input 
					dark filled square
					label="Search NPC"
					type="text" 
					autocomplete="off" 
					v-model="search"
					@keyup="searchNPC()" 
				>
					<q-icon slot="append" name="fas fa-search" size="xs" @click="searchNPC()" />
				</q-input>
				<ul class="entities">
					<p v-if="noResult" class="red">{{ noResult }}</p>
					<li v-for="(npc, index) in searchResults" :key="index" class="d-flex justify-content-between">
						<span :class="{ 'blue': npc.origin == 'custom' }">
							{{ npc.name.capitalizeEach() }}
						</span>
						<a class="gray-light" @click="set(npc['.key'], npc.origin)">
							<i class="fas fa-copy blue"></i>
							<span class="d-none d-md-inline ml-1">Copy</span>
							<q-tooltip anchor="top middle" self="center middle">
								Copy NPC
							</q-tooltip>
						</a>
					</li>
				</ul>
			</q-tab-panel>
			<q-tab-panel name="player">
				<q-form @submit="addPlayer()" v-if="Object.keys(excludedPlayers).length > 0">
					<ul class="entities">
						<template v-for="(player, key) in excludedPlayers">
							<li v-if="!Object.keys(entities).includes(key)" :key="key" class="players">
								<q-checkbox 
									slot="append"
									size="s" 
									dark 
									:false-value="undefined" 
									indeterminate-value="something-else"
									v-model="selectedPlayers"
									:val="key" 
									:label="player.character_name"
								/>
								<q-input 
									dark filled square dense
									type="number" 
									placeholder="Initiative"
									v-model="playerInitiative[key]"
									:error="!isValid(key)"
									error-message="Set initiative"
									no-error-icon
								/>
							</li>
						</template>
					</ul>

					<label class="my-2">When to add</label>
					<q-btn-toggle
						class="mt-2"
						v-model="addMoment"
						spread
						no-caps
						flat
						dark
						:options="options"
						toggle-color="primary"
					/>
					<hr>
					<q-btn 
						v-if="selectedPlayers.length > 0" 
						class="btn btn-block" 
						type="submit" 
						:label="`Add player${selectedPlayers.length > 1 ? 's' : ''}`"
					/>
				</q-form>
				<p v-else>
					<b class="red">No players available</b><br/>
					There are no players in this campaign that are not in the current encounter.
				</p>
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';

	export default {
		name: 'AddEntity',
		mixins: [general, dice],
		data() {
			return {
				test: undefined,
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				entity: {},
				dexterity: undefined,
				search: '',
				searchResults: [],
				selectedPlayers: [],
				playerInitiative: {},
				noResult: '',
				options: [
					{ label: 'Add next round', value: 'next' },
					{ label: 'Add directly', value: 'directly' },
				],
				addMoment: 'next',
				tabs: [
					{ name: "npc", label: "NPC", icon: "fas fa-dragon" },
					{ name: "player", label: "Player", icon: "fas fa-user" }
				],
				tab: "npc"
			}
		},
		mounted() {
			//GET NPCS
			var monsters = db.ref(`monsters`);
			monsters.on('value', async (snapshot) => {
				let monsters = snapshot.val();

				for(let key in monsters) {
					monsters[key]['.key'] = key;
					monsters[key].origin = 'api';
				}
				let custom = db.ref(`npcs/${this.userId}`);
				custom.on('value', async (snapshot) => {
					let customNpcs = snapshot.val();
					for(let key in customNpcs) {
						customNpcs[key].origin = 'custom';
						customNpcs[key]['.key'] = key;
						monsters.push(customNpcs[key]);
					}
				});
				this.monsters = monsters;
				this.loadingNpcs = false;
			});
		},
		computed: {
			...mapGetters([
				'npcs',
				'players',
				'entities',
				'broadcast'
			]),
			share() {
				return (this.broadcast.shares && this.broadcast.shares.includes("initiative_rolls")) || false;
			},
			excludedPlayers() {
				// Filter players for only in campaign and not in current encounter
				return Object.fromEntries(Object.entries(this.players).filter(([key, player]) => {
					return player.campaign_id === this.campaignId && !Object.keys(this.entities).includes(key);
				}));
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'add_entity_demo',
				'add_entity',
			]),
			searchNPC() {
				this.searchResults = []
				this.searching = true
				for (var i in this.monsters) {
					var m = this.monsters[i]
					if (m.name.toLowerCase().includes(this.search.toLowerCase()) && this.search != '') {
						this.noResult = ''
						this.searchResults.push(m)
					}
				}
				if(this.searchResults == '' && this.search != '') {
					this.noResult = 'No results for "' + this.search + '"';
				}
			},
			rollInitiative(e) {
				const mod = (this.dexterity) ? this.calcMod(this.dexterity) : 0;
				const roll = this.rollD(
					e, 20, 1, mod, 
					"Initiative", 
					this.entity.name ? this.entity.name : "Unnamed", 
					false, {}, 
					this.share ? { encounter_id: this.encounterId } : null
				);
				this.$set(this.entity, "initiative", Number(roll.total));
			},
			set(id, type) {
				this.entity.id = id;

				let npc_data;
				if(type === 'api') {
					npc_data = this.monsters[id];
					this.$set(this.entity, "npc", 'api');
					this.$set(this.entity, "maxHp", parseInt(npc_data.hit_points));
					this.$set(this.entity, "ac", parseInt(npc_data.armor_class));
					this.$set(this.entity, "name", npc_data.name);
				}
				else if(type === 'custom') {
					npc_data = this.npcs;
					this.$set(this.entity, "npc", 'custom');
					this.$set(this.entity, "maxHp", parseInt(npc_data[id].maxHp));
					this.$set(this.entity, "ac", parseInt(npc_data[id].ac));
					this.$set(this.entity, "name", npc_data[id].name);
				}
				this.dexterity = npc_data.dexterity;

				this.searchResults = [];
				this.searching = false;
				this.$forceUpdate();
			},
			addNPC() {
				this.entity.entityType = 'npc';
				this.entity.curHp = this.entity.maxHp;

				if(this.addMoment === 'next') {
					this.entity.addNextRound = true;
					this.entity.active = false;
				} else {
					this.entity.active = true;
				}
				this.entity.npc = (this.entity.npc) ? this.entity.npc : 'custom';
				
				if(!this.demo) {
					db.ref('encounters/' + this.userId + '/' + this.campaignId + '/' + this.encounterId + '/entities').push(this.entity)
						.then(res => {
							//Returns the key of the added entry
							this.add_entity(res.getKey())
						});
				} else {
					this.add_entity_demo(this.entity);
				}
			},
			isValid(key) {
				return (this.selectedPlayers.includes(key) && this.playerInitiative[key] > 0) 
					|| !this.selectedPlayers.includes(key);
			},
			addPlayer() {
				for(const key of this.selectedPlayers) {
					if(this.playerInitiative[key] > 0) {
						const player = this.players[key];

						const entity = {
							entityType: "player",
							curHp: player.maxHp,
							initiative: this.playerInitiative[key],
							name: player.character_name,
							key: key,
							id: key
						};

						if(this.addMoment === 'next') {
							entity.addNextRound = true;
							entity.active = false;
						} else {
							entity.active = true;
						}

						if(!this.demo) {
							// Add player
							db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${key}`).set(entity);
							this.add_entity(key);

							// Add companions
							const companions = player.companions;
							for (let Key in companions) {
								const companion = this.npcs[Key];
								let companionEntity = {
									entityType: "companion",
									curHp: companion.maxHp,
									initiative: this.playerInitiative[key],
									name: companion.name,
									key: Key,
									id: Key
								};
								
								if(this.addMoment === 'next') {
									companionEntity.addNextRound = true;
									companionEntity.active = false;
								} else {
									companionEntity.active = true;
								}

								db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${Key}`).set(companionEntity);
								this.add_entity(Key);
							}

						} else {
							this.add_entity_demo(this.entity);
						}
					}
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	ul.entities {
		list-style: none;
		padding: 0;
		line-height: 25px;

		li {
			margin-bottom:5px;
			padding: 0 10px;

			&.players {
				margin-bottom: 25px;
			}
			a {
				font-size:14px;
			}
			.q-field {
				width: 90px;
				padding: 0;

				.row {
					padding: 0;
				}
			}
		}
	}
	ul.nav {
		a.nav-link {
			&.active {
				background:$gray-active !important;
			}
		}
	}
	.q-tab-panel {
		padding: 15px 0 0 0 !important;
	}
</style>
