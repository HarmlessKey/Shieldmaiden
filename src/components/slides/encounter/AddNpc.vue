<template>
	<div class="pb-5">
		<h2>Add entity</h2>

		<q-tabs
			v-if="!demo"
			v-model="tab"
			:dark="$store.getters.theme === 'dark'"
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
				<a class="btn bg-neutral-5 full-width mb-3" @click="copy_dialog = true">
					<i class="fas fa-copy" /> Copy NPC
				</a>

				<ValidationObserver v-slot="{ handleSubmit, validate, valid }">
					<q-form @submit="valid ? handleSubmit(addNPC) : validate()" greedy>
						<ValidationProvider rules="required|max:100" name="Name" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								autocomplete="off"
								label="Name"
								type="text" 
								name="name" 
								v-model="entity.name"
								no-error-icon
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
						<hr>
						<div class="row q-col-gutter-md mb-2">
							<div class="col">
								<ValidationProvider rules="required|between:0,99" name="Initiative" v-slot="{ errors, invalid, validated }">
								<q-input 
									:dark="$store.getters.theme === 'dark'" filled square
									autocomplete="off"
									label="Initiative"
									type="number" 
									min="0" max="99"
									v-model="entity.initiative"
									no-error-icon
									:error="invalid && validated"
									:error-message="errors[0]"
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
								</ValidationProvider>
							</div>
							<div class="col">
								<ValidationProvider rules="required|between:1,99" name="AC" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										autocomplete="off"
										label="Armor class"
										type="number" 
										min="1" max="99"
										v-model="entity.ac"
										no-error-icon
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
							<div class="col">
								<ValidationProvider rules="required|between:1,9999" name="HP" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										autocomplete="off"
										label="Hit points"
										type="number" 
										min="1" max="9999"
										v-model="entity.maxHp"
										no-error-icon
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
							</div>
						</div>
						<label class="my-2">When to add</label>
						<q-btn-toggle
							class="mt-2"
							v-model="addMoment"
							spread
							no-caps
							flat
							:dark="$store.getters.theme === 'dark'"
							:options="options"
							toggle-color="primary"
						/>
						<hr>
						<q-btn class="full-width mb-3" color="primary" no-caps type="submit" label="Add" />
					</q-form>
				</ValidationObserver>
			</q-tab-panel>
			<q-tab-panel name="player">
				<q-form @submit="addPlayer()" v-if="Object.keys(players).length > 0">
					<ul class="entities">
						<template v-for="(player, key) in players">
							<li v-if="!Object.keys(entities).includes(key)" :key="key" class="players">
								<q-checkbox 
									slot="append"
									size="s" 
									:dark="$store.getters.theme === 'dark'" 
									:false-value="undefined" 
									indeterminate-value="something-else"
									v-model="selectedPlayers"
									:val="key" 
									:label="player.character_name"
								/>
								<q-input 
									:dark="$store.getters.theme === 'dark'" filled square dense
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
						:dark="$store.getters.theme === 'dark'"
						:options="options"
						toggle-color="primary"
					/>
					<hr>
					<q-btn 
						v-if="selectedPlayers.length > 0" 
						color="primary"
						type="submit" 
						no-caps
						:label="`Add player${selectedPlayers.length > 1 ? 's' : ''}`"
					/>
				</q-form>
				<p v-else>
					<b class="red">No players available</b><br/>
					There are no players in this campaign that are not in the current encounter.
				</p>
			</q-tab-panel>
		</q-tab-panels>

		<q-dialog v-model="copy_dialog">
			<hk-card header="Copy NPC" :min-width="320">
				<div class="card-body">
					<CopyContent @copy="set" type="monster" button="copy" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import { general } from '@/mixins/general.js';
	import { dice } from '@/mixins/dice.js';
	import CopyContent from "@/components/CopyContent";

	export default {
		name: 'AddEntity',
		mixins: [general, dice],
		components: {
			CopyContent
		},
		data() {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				copy_dialog: false,
				entity: {},
				dexterity: undefined,
				players: {},
				selectedPlayers: [],
				playerInitiative: {},
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
		async mounted() {
			await this.get_campaign({
				uid: this.userId,
				id: this.campaignId
			}).then(async campaign => {
				const players = {};

				for(const id in campaign.players) {
					if(!Object.keys(this.entities).includes(id)) {
						players[id] = await this.get_player({uid: this.userId, id});
					}
				}
				this.players = players;
			});
		},
		computed: {
			...mapGetters([
				"entities",
				"broadcast"
			]),
			share() {
				return (this.broadcast.shares && this.broadcast.shares.includes("initiative_rolls")) || false;
			},
		},
		methods: {
			...mapActions([
				"setSlide",
				"add_entity_demo",
				"add_player",
				"add_npc"
			]),
			...mapActions("campaigns", ["get_campaign"]),
			...mapActions("players", ["get_player"]),
			...mapActions("npcs", ["get_npc"]),
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
			set({ result, id, resource }) {
				this.$set(this.entity, "id", id);
				this.$set(this.entity, "npc", (resource === "custom") ? "custom" : "api");
				this.$set(this.entity, "maxHp", parseInt(result.hit_points));
				this.$set(this.entity, "ac", parseInt(result.armor_class));
				this.$set(this.entity, "name", result.name);

				this.dexterity = result.dexterity; // needed to roll initiative

				this.copy_dialog = false;
				this.$forceUpdate();
			},
			async addNPC() {
				this.entity.entityType = "npc";
				this.entity.curHp = this.entity.maxHp;

				if(this.addMoment === "next") {
					this.entity.addNextRound = true;
					this.entity.active = false;
				} else {
					this.entity.active = true;
				}
				await this.add_npc(this.entity);
			},
			isValid(key) {
				return (this.selectedPlayers.includes(key) && this.playerInitiative[key] > 0) 
					|| !this.selectedPlayers.includes(key);
			},
			async addPlayer() {
				for(const key of this.selectedPlayers) {
					if(this.playerInitiative[key] > 0) {
						const player = this.players[key];

						const entity = {
							entityType: "player",
							curHp: player.maxHp,
							initiative: this.playerInitiative[key],
							name: player.character_name,
							id: key
						};

						if(this.addMoment === 'next') {
							entity.addNextRound = true;
							entity.active = false;
						} else {
							entity.active = true;
						}

						// Add player
						await this.add_player({ id: key, entity });

						// Add companions
						const companions = player.companions;
						for (let companionId in companions) {
							const companion = await this.get_npc({ uid: this.userId, id: companionId });

							let companionEntity = {
								entityType: "companion",
								curHp: companion.hit_points,
								initiative: this.playerInitiative[key],
								name: companion.name,
								player: key,
								id: companionId,
								npc: "custom"
							};
							
							if(this.addMoment === 'next') {
								companionEntity.addNextRound = true;
								companionEntity.active = false;
							} else {
								companionEntity.active = true;
							}

							await this.add_player({
								id: companionId,
								entity: companionEntity
							});
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
	.q-tab-panel {
		padding: 15px 0 0 0 !important;
	}
</style>
