<template>
	<div class="content__edit" v-if="!loading">
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(savePlayer)">
				<div id="players" v-if="($route.name == 'Edit Character' && player.control === $store.getters.user.uid) || $route.name != 'Edit Character'">

					<!-- GIVE OUT CONTROL -->
					<hk-card header="Give out control" v-if="$route.name != 'AddPlayers' && $route.name != 'Edit Character'">
						<div class="card-body">
							<GiveCharacterControl :playerId="playerId" :control="player.control" />
						</div>
					</hk-card>

					<hk-card-deck class="mb-4">
						<hk-card header="Basic Info" >
							<div class="card-body">
								<ValidationProvider rules="max:15|required" name="Name" v-slot="{ errors, invalid, validated }">
									<q-input 
										v-if="$route.name !== 'Edit Character'"
										:dark="$store.getters.theme === 'dark'" filled square
										label="Player name *"
										autocomplete="off"  
										type="text" 
										class="mb-2" 
										v-model="player.player_name" 
										maxlength="15"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
								
								<ValidationProvider rules="max:35|required" name="Character name" v-slot="{ errors, invalid, validated }">
									<q-input 
										:dark="$store.getters.theme === 'dark'" filled square
										label="Character name *"
										autocomplete="off"
										type="text" 
										class="mb-2" 
										v-model="player.character_name" 
										maxlength="35"
										:error="invalid && validated"
										:error-message="errors[0]"
									/>
								</ValidationProvider>
			
								<div class="avatar">
									<div class="img" :style="{ backgroundImage: 'url(\'' + player.avatar + '\')' }">
										<i v-if="!player.avatar" class="hki-player" />
									</div>
									<div>
										<ValidationProvider rules="url" name="Avatar" v-slot="{ errors, invalid, validated }">
											<q-input 
												:dark="$store.getters.theme === 'dark'" filled square
												label="Avatar"
												autocomplete="off"  
												type="text" 
												v-model="player.avatar"
												placeholder="Image URL"
												:error="invalid && validated"
												:error-message="errors[0]"
											/>
										</ValidationProvider>
									</div>
								</div>
							</div>
						</hk-card>
						<hk-card header="Level & Base Stats">
							<div class="card-body">
								<div class="row q-col-gutter-md">
									<div class="col-12 col-md-6">
										<ValidationProvider rules="numeric|between:0,355000" name="XP" v-slot="{ errors, invalid, validated }">
											<q-input 
												:dark="$store.getters.theme === 'dark'" filled square
												label="Experience points"
												autocomplete="off" 
												type="number" 
												min="0"
												max="355000"
												v-model="player.experience" 
												:disable="player.level > 0"
												:error="invalid && validated"
												:error-message="errors[0]" 
											>
												<template v-slot:append>
													<small><span class="neutral-2">level:</span> {{ player.level ? player.level : calculatedLevel(player.experience) }}</small>
													<q-icon name="info" class="ml-1 pointer blue" size="xs" @click="setSlide({show: true, type: 'slides/xpTable'})"/>
												</template>
											</q-input>
										</ValidationProvider>			
									</div>
									<div class="col-12 col-md-6">
										<ValidationProvider rules="numeric|between:1,20" name="Level" v-slot="{ errors, invalid, validated }">
											<q-input 
												:dark="$store.getters.theme === 'dark'" filled square
												clearable
												label="Level override"
												autocomplete="off"
												type="number" 
												min="1"
												max="20"
												:value="player.level" 
												@input="parseToInt($event, player, 'level')"
												:error="invalid && validated"
												:error-message="errors[0]" 
											/>
										</ValidationProvider>
									</div>
									<div class="col-12 col-md-4">
										<ValidationProvider rules="required|numeric|between:1,999" name="Max HP" v-slot="{ errors, invalid, validated }">
											<q-input 
												:dark="$store.getters.theme === 'dark'" filled square
												label="Hit points *"
												autocomplete="off"
												type="number" 
												min="1"
												max="999"
												:value="player.maxHp" 
												name="maxHp" 
												placeholder="Maximum Hit Points*"
												@input="parseToInt($event, player, 'maxHp')"
												:error="invalid && validated"
												:error-message="errors[0]" 
											>
												<q-icon slot="prepend" name="fas fa-heart" />
											</q-input>
										</ValidationProvider>
									</div>
									<div class="col-12 col-md-4">
										<ValidationProvider rules="required|numeric|between:1,99" name="AC" v-slot="{ errors, invalid, validated }">
											<q-input 
												:dark="$store.getters.theme === 'dark'" filled square
												label="Armor class *"
												autocomplete="off"  
												min="1"
												max="99"
												type="number" 
												:value="player.ac" 
												@input="parseToInt($event, player, 'ac')"
												:error="invalid && validated"
												:error-message="errors[0]"
											>
												<q-icon slot="prepend" name="fas fa-shield" />
											</q-input>
										</ValidationProvider>
									</div>
									<div class="col-12 col-md-4">
										<ValidationProvider rules="numeric|between:1,99" name="Save DC" v-slot="{ errors, invalid, validated }">
											<q-input 
												:dark="$store.getters.theme === 'dark'" filled square
												label="Spell save DC"
												autocomplete="off"  
												min="1"
												max="99"
												type="number" 
												:value="player.spell_save_dc" 
												@input="parseToInt($event, player, 'spell_save_dc')"
												:error="invalid && validated"
												:error-message="errors[0]"
											>
												<q-icon slot="prepend" name="fas fa-hand-holding-magic" />
											</q-input>
										</ValidationProvider>
									</div>
								</div>
							</div>
						</hk-card>
					</hk-card-deck>

					<!-- ABILITY SCORES -->
					<hk-card header="Ability Scores & Senses" class="ability-card">
						<div class="card-body">
							<h6 class="mb-2">Ability scores</h6>
							<div class="row q-col-gutter-md">
								<div v-for="(ability, index) in abilities" :key="index" class="col-6 col-md-2 mb-2">
									<ValidationProvider rules="numeric|between:1,99" :name="ability.ability" v-slot="{ errors, invalid, validated }">
										<q-input 
											:dark="$store.getters.theme === 'dark'" filled square
											:label="ability.ability.capitalize()"
											autocomplete="off"  
											type="number" 
											min="1"
											max="99"
											v-model="player[ability.ability]" 
											@input="parseToInt($event, player, ability.ability)"
											:error="invalid && validated"
											:error-message="errors[0]"
										>
											<q-checkbox 
												slot="append"
												size="xs" 
												:dark="$store.getters.theme === 'dark'" 
												v-model="player[`${ability.ability}-save-profficient`]" 
												:false-value="null" 
												indeterminate-value="something-else" 
											>
												<q-tooltip anchor="top middle" self="center middle">
													Saving throw proficiency
												</q-tooltip>
											</q-checkbox>
										</q-input>
									</ValidationProvider>
								</div>
							</div>

							<!-- SENSES -->
							<h6 class="mt-3 mb-2">Senses</h6>
							<div class="row q-col-gutter-md">
								<div  class="col-12 col-md-4 mb-2">
									<ValidationProvider rules="numeric|between:1,99" name="Passive perception" v-slot="{ errors, invalid, validated }">
										<q-input 
											:dark="$store.getters.theme === 'dark'" filled square
											label="Passive perception"
											autocomplete="off" 
											type="number"
											min="1"
											max="99"
											v-model="player.passive_perception" 
											placeholder="Perception"
											:error="invalid && validated"
											:error-message="errors[0]"
										>
											<q-icon slot="prepend" name="fas fa-eye" />
										</q-input>
									</ValidationProvider>
								</div>
								<div  class="col-12 col-md-4 mb-2">
									<ValidationProvider rules="numeric|between:1,99" name="Passive investigation" v-slot="{ errors, invalid, validated }">
										<q-input 
											:dark="$store.getters.theme === 'dark'" filled square
											label="Passive investigation"
											autocomplete="off"
											type="number" 
											min="1"
											max="99"
											v-model="player.passive_investigation" 
											placeholder="Investigation"
											:error="invalid && validated"
											:error-message="errors[0]"
										>
											<q-icon slot="prepend" name="fas fa-search" />
										</q-input>
									</ValidationProvider>
								</div>
								<div  class="col-12 col-md-4 mb-2">
									<ValidationProvider rules="numeric|between:1,99" name="Passive insight" v-slot="{ errors, invalid, validated }">
										<q-input 
											:dark="$store.getters.theme === 'dark'" filled square
											label="Passive insight"
											autocomplete="off"
											type="number" 
											min="1"
											max="99"
											v-model="player.passive_insight" 
											placeholder="Insight"
											:error="invalid && validated"
											:error-message="errors[0]"
										>
											<q-icon slot="prepend" name="fas fa-lightbulb-on" />
										</q-input>
									</ValidationProvider>
								</div>
							</div>
						</div>
					</hk-card>

					<Defenses v-model="player" />

					<!-- SKILLS -->
					<hk-card header="Skills">
						<div class="card-body">
							<h5>
								Proficiency Bonus: 
								+<b class="blue">{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}</b>
							</h5>

							<div class="skills">
								<div v-for="(skill, key) in skillList" :key="key" class="d-flex justify-content-start">
									<q-checkbox 
										size="xs" 
										:dark="$store.getters.theme === 'dark'"
										:val="key" 
										v-model="skills_expertise" 
										:false-value="null" indeterminate-value="something-else"
										:disable="player.skills ? !player.skills.includes(key) : true"
									>
										<template slot:label>
											+{{ returnProficiency(player.level ? player.level : calculatedLevel(player.experience)) }}
										</template>
										<q-tooltip anchor="top middle" self="center middle">
											Expertise
										</q-tooltip>
									</q-checkbox>

									<q-checkbox 
										size="xs" 
										:dark="$store.getters.theme === 'dark'"
										:val="key" 
										v-model="skills" 
										:false-value="null" indeterminate-value="something-else"
									>
										<template slot:label>
											<div class="skill">
												<div class="neutral-2 abillity">{{ skill.ability.substring(0,3) }}</div>
												{{ skill.skill  }}
												<div class="mod">
													{{ 
														calculateSkillModifier(
															calcMod(player[skill.ability]),
															player.skills ? (
															player.skills.includes(key) ? 
															returnProficiency(player.level ? player.level : calculatedLevel(player.experience))
															: 0) : 0,
															player.skills_expertise ? player.skills_expertise.includes(key) : false
														) 
													}}
												</div>
											</div>
										</template>
										<q-tooltip anchor="top middle" self="center middle">
											Proficiency
										</q-tooltip>
									</q-checkbox>
								</div>
							</div>
						</div>
					</hk-card>

					<!-- COMPANIONS -->
					<hk-card>
						<div slot="header" class="card-header">
							Companions
							<a 
								v-if="isOwner() && npc_count"
								class="btn btn-sm bg-neutral-5"
								@click="companion_dialog = !companion_dialog"
							>
								<i class="fas fa-plus green mr-1" />
								Add companion
							</a>
						</div>
						<div class="card-body">
							<template v-if="isOwner()">
								<div v-if="!npc_count">
									<p>You currently have no custom npcs created</p>
									<p>First create a custom NPC to use as a companion</p>
									<router-link class="btn bg-green" to="/content/npcs">
										<i class="fas fa-plus"></i>Add an NPC
									</router-link>
								</div>
							</template>

							<!--  Companions table -->
							<hk-table v-if="companions && companions.length"
								:columns="columns"
								:items="companions"
							>
								<template slot="avatar" slot-scope="data">
									<div class="image" :style="{ backgroundImage: 'url(\'' + data.item + '\')' }">
										<i v-if="!data.item" class="hki-monster" />
									</div>
								</template>

								<template slot="name" slot-scope="data">
									<router-link class="mx-2" :to="`/content/companions/${userId}/${data.row.key}`">
											{{ data.item }}
											<q-tooltip anchor="top middle" self="center middle">
												Edit
											</q-tooltip>
									</router-link>
								</template>

								<div slot="actions" slot-scope="data" class="actions">
									<router-link class="btn btn-sm bg-neutral-5 mx-1" :to="`/content/companions/${userId}/${data.row.key}`" >
										<i class="fas fa-pencil"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Edit
										</q-tooltip>
									</router-link>
									<a v-if="isOwner()"
										class="btn btn-sm bg-neutral-5"
										@click="removeCompanion(data.index, data.row.key)">
										<i class="fas fa-trash-alt"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Remove
										</q-tooltip>
									</a>
								</div>
							</hk-table>
							<div v-else-if="!isOwner()">
								<p>You currently have no companions linked to your player character</p>
								<p>Ask your DM to link an NPC to you character</p>
							</div>
							<div v-else>
								<p>No companions linked to player.</p>
								<a 
									v-if="isOwner() && npc_count"
									class="btn bg-neutral-5"
									@click="companion_dialog = !companion_dialog"
								>
									<i class="fas fa-plus green mr-1" />
									Add companion
								</a>
							</div>
						</div>
					</hk-card>

					<div class="save">
						<div class="buttons">
							<q-icon v-if="!valid" name="error" color="red" size="md" class="mr-2">
								<q-tooltip anchor="top middle" self="center middle">
									There are validation errors
								</q-tooltip>
							</q-icon>
							<router-link to="/content/players" class="btn bg-neutral-5 mr-2">
								Cancel
							</router-link>
							<q-btn color="primary" type="submit" no-caps>
								{{ $route.name == "Add player" ? "Add player" : "Save" }}
							</q-btn>
						</div>
					</div>
				</div>
			</q-form>
		</ValidationObserver>

		<q-dialog v-model="companion_dialog">
			<hk-card header="Add companion" :min-width="320">
				<div class="card-body">
					<CopyMonster @copy="add" add custom-only :disabled-custom="npcsAsCompanion" />
				</div>
			</hk-card>
		</q-dialog>
	</div>
	<hk-loader v-else name="player" />
</template>

<script>
	import OverEncumbered from '@/components/OverEncumbered.vue';
	import GiveCharacterControl from '@/components/GiveCharacterControl.vue';
	import { mapGetters, mapActions } from 'vuex';
	import { db } from '@/firebase';
	import { experience } from '@/mixins/experience.js';
	import { skills } from '@/mixins/skills.js';
	import { general } from '@/mixins/general.js';
	import Defenses from './Defenses';
	import CopyMonster from '../../../components/CopyMonster.vue';

	export default {
		name: 'Players',
		mixins: [experience, skills, general],
		metaInfo: {
			title: 'Players'
		},
		components: {
			OverEncumbered,
			GiveCharacterControl,
			Defenses,
			CopyMonster
		},
		data() {
			return {
				playerId: this.$route.params.id,
				userId: undefined,
				companion_dialog: false,
				player: {},
				loading: false,
				companions_to_delete: [],
				npcsAsCompanion: [],
				companions: [],
				columns: {
					avatar: {
						width: 46,
						noPadding: true
					},
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
				}
			}
		},
		firebase() {
			return {
				abilities: db.ref('abilities')
			}
		},
		computed: {
			...mapGetters([
				'tier',
				'overencumbered',
			]),
			...mapGetters("npcs", ["npc_count"]),
			...mapGetters("players", ["player_count"]),
			skills: {
				get() {
					return this.player.skills ? this.player.skills : [];
				},
				set(newValue) {
					this.$set(this.player, 'skills', newValue);
				}
			},
			skills_expertise: {
				get() {
					return this.player.skills_expertise ? this.player.skills_expertise : [];
				},
				set(newValue) {
					this.$set(this.player, 'skills_expertise', newValue);
				}
			}
		},
		async mounted() {
			if(this.$route.name === 'AddPlayers') {
				this.$set(this.player, "strength", 10);
				this.$set(this.player, "dexterity", 10);
				this.$set(this.player, "constitution", 10);
				this.$set(this.player, "intelligence", 10);
				this.$set(this.player, "wisdom", 10);
				this.$set(this.player, "charisma", 10);
			}

			//User ID needs te be different if it is
			//an external controlled character
			if(!this.isOwner()) {
				this.userId = await this.get_owner_id({ uid: this.$store.getters.user.uid, playerId: this.playerId });
			} else {
				this.userId = this.$store.getters.user.uid;
			}

			// Check what NPCs are used as companions
			await this.get_players().then(players => {
				const companions = [];
				for(const player of players) {
					if(player.companions) {
						for(const key in player.companions) {
							companions.push(key);
						}
					}
				}
				this.npcsAsCompanion = companions;
			});

			if(this.playerId) {
				this.loading = true;
				await this.get_player({ uid: this.userId, id: this.playerId }).then(async (player) => {
					this.player = player;

					let comps = [];
					for (let key in player.companions) {
						let npc = await this.get_npc({ uid: this.userId, id: key});

						if(npc) {
							npc.key = key;
							comps.push(npc);
						} 
						// The NPC can't be found, so it was deleted. Also delete it as a companion from the player
						else {
							this.delete_companion({ uid: this.userId, playerId: this.playerId, id: key });
						}
					}
					this.companions = comps;
					this.loading = false;
				});
			}
		},
		methods: {
			...mapActions([
				'setSlide'
			]),
			...mapActions("players", [
				"get_player", 
				"get_owner_id", 
				"add_player",
				"edit_player",
				"get_players",
				"delete_companion"
			]),
			...mapActions("npcs", ["get_npc"]),
			...mapActions("campaigns", ["get_campaign"]),
			isOwner() {
				return (this.$route.name !== 'Edit character');
			},
			savePlayer() {
				if(this.$route.name === "Add player") {
					this.addPlayer();
				} else {
					this.editPlayer();
				}
			},
			async addPlayer() {
				if(this.player_count >= this.tier.benefits.players) {
					this.$snotify.error('You have too many players.', 'Error');
				} else {
					await this.add_player(this.player).then(() => {
						this.$router.replace("/content/players");
					});
				}
			},
			async editPlayer() {
				await this.edit_player({
					uid: this.userId,
					id: this.playerId,
					player: this.player,
					companions: this.companions || [],
					deleted_companions: this.companions_to_delete || []
				});
				this.$router.replace("/content/players");
			},
			add({ npc, id }) {
				this.companion_dialog = false;
				if (this.player.companions === undefined) {
					this.$set(this.player, 'companions', {});
				}

				this.$set(this.player.companions, id, true);
				npc.key = id;
				this.companions.push(npc);
				this.npcsAsCompanion.push(id);

				// If companion was deleted before saving, undelete it
				if (this.companions_to_delete.indexOf(id) > -1) {
					this.companions_to_delete.splice(this.companions_to_delete.indexOf(id), 1);
				}

				this.$forceUpdate();
			},
			removeCompanion(index, id) {
				this.$delete(this.companions, index);
				this.$delete(this.player.companions, id);
				this.companions_to_delete.push(id);

				const npcsAsCompanionIndex = this.npcsAsCompanion.indexOf(id);
				if(npcsAsCompanionIndex > -1) {
					this.npcsAsCompanion.splice(npcsAsCompanionIndex, 1);
				}

			},
			parseToInt(value, object, property) {
				if(value === undefined || value === null || value === "") {
					this.$set(object, property, null);
				} else {
					if(property === "level") {
						value = (value > 20) ? 20 : (value < 1) ? 1 : value;
					}
					this.$set(object, property, parseInt(value));
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

label {
	line-height: 37px;
	margin-bottom: 0;

	&.experience {
		display: flex;
		justify-content: space-between;
	}

	svg {
		fill: $neutral-2;
		width: 20px;
		height: 20px;
	}
}
.avatar {
	display: grid;
	grid-template-columns: 56px 1fr;
	grid-column-gap: 10px;

	.img {
		border: solid 1px $neutral-4;
		display: block;
		width: 56px;
		height: 56px;
		background-size: cover;
		background-position: center top;
		font-size: 45px;
		color: $neutral-2;
		background-color: $neutral-9;

		i::before {
			vertical-align: 5px;
		}
	}
}
.skills {
	columns: 3;

	.skill {
		width: 100%;
		display: grid;
		grid-template-columns: 45px 1fr min-content;

		.abillity {
			text-transform: uppercase;
			text-align: center;
		}
		.mod {
			margin-left: 8px;
		}
	}
}

[data-theme="light"] {
	.avatar .img {
		background-color: $neutral-2;
		color: $neutral-8;
	}
}

@media only screen and (max-width: 1250px) { 
	.skills {
		columns: 2;
	}
}
@media only screen and (max-width: 890px) { 
	.skills {
		columns: 1;
	}
}
</style>