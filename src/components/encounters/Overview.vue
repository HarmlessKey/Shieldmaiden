<template>
	<div>
		<div class="encounter_overview" :class="{ show: showOverview }">
			<hk-card class="overview-main">
				<!-- DIFFICULTY -->
				<template v-if="!loading">
					<div v-if="encDifficulty">
						<div @click="showDifficulty = !showDifficulty" class="diff-header">
							<div>
								<q-icon name="info" size="sm" color="neutral-2 mr-1" />
								Difficulty
							</div>
							<strong
								:class="{
									green: encDifficulty[0] == 'easy',
									yellow: encDifficulty[0] == 'medium',
									orange: encDifficulty[0] == 'hard',
									red: encDifficulty[0] == 'deadly',
								}"
							>
								{{ encDifficulty[0].capitalize() }}
							</strong>
						</div>
						<div class="progress-area">
							<q-linear-progress
								size="3px"
								:value="encDifficulty['compare'] / encDifficulty['deadly']"
								:color="bars[encDifficulty[0]]"
							/>
						</div>
						<q-slide-transition>
							<div class="diff-info" v-show="showDifficulty">
								<div class="d-flex justify-content-between">
									<div class="advanced">
										{{ encDifficulty[1] }}
										<template v-if="encDifficulty['easy']">
											<div class="mb-3">
												<div class="neutral-2"><strong>Party XP thresholds</strong></div>
												<div :class="{ green: encDifficulty[0] === 'easy' }">
													<span class="left">Easy:</span>
													<hk-animated-integer :value="encDifficulty['easy']" />
												</div>
												<div :class="{ yellow: encDifficulty[0] === 'medium' }">
													<span class="left">Medium:</span>
													<hk-animated-integer :value="encDifficulty['medium']" />
												</div>
												<div :class="{ orange: encDifficulty[0] === 'hard' }">
													<span class="left">Hard:</span>
													<hk-animated-integer :value="encDifficulty['hard']" />
												</div>
												<div :class="{ red: encDifficulty[0] === 'deadly' }">
													<span class="left">Deadly:</span>
													<hk-animated-integer :value="encDifficulty['deadly']" />
												</div>
											</div>
											Total XP:
											<hk-animated-integer :value="encDifficulty['totalXp']" class="blue" /><br />
											Adjusted XP:
											<hk-animated-integer :value="encDifficulty['compare']" class="blue" />
										</template>
									</div>
									<q-circular-progress
										class="d-none d-lg-block"
										show-value
										font-size="18px"
										:value="(encDifficulty['compare'] / encDifficulty['deadly']) * 100"
										size="165px"
										:color="bars[encDifficulty[0]]"
										track-color="dark"
									>
										{{ encDifficulty[0].capitalize() }}
									</q-circular-progress>
								</div>
								<hr />
								<small v-if="encDifficulty[0]">
									{{ difficulty_info[encDifficulty[0]] }}
									<span class="neutral-2">(dmg 82)</span>
								</small>
							</div>
						</q-slide-transition>
					</div>
					<hk-loader v-else prefix="Calculating" name="difficulty" />
					<!-- ENTITIES -->
					<div class="overview">
						<template v-if="encounter.entities">
							<h3 class="d-flex justify-between">
								<span>Players and friendlies</span>
								<q-chip
									v-if="Object.keys(_friendlies).length"
									square
									:dark="$store.getters.theme !== 'light'"
								>
									<strong>
										<hk-animated-integer :value="Object.keys(_friendlies).length" />
									</strong>
								</q-chip>
							</h3>

							<hk-table
								class="mb-4"
								:items="_friendlies"
								:columns="entityColumns"
								:showHeader="false"
							>
								<div slot="image" slot-scope="data">
									<!-- Player avatar -->
									<span
										v-if="data.row.entityType === 'player'"
										:style="{
											backgroundImage: avatar(data.row, campaign_players)
												? 'url(\'' + avatar(data.row, campaign_players) + '\')'
												: '',
										}"
										class="image"
									>
										<i
											aria-hidden="true"
											v-if="!avatar(data.row, campaign_players)"
											class="hki-player"
										/>
									</span>

									<!-- Companion avatar -->
									<span
										v-if="data.row.entityType === 'companion'"
										:style="{
											backgroundImage: avatar(data.row, entity_data)
												? 'url(\'' + avatar(data.row, entity_data) + '\')'
												: '',
										}"
										class="image"
									>
										<i
											aria-hidden="true"
											v-if="!avatar(data.row, entity_data)"
											class="hki-companion"
										/>
									</span>

									<!-- Friendly NPC avatar -->
									<span
										v-else-if="data.row.entityType === 'npc'"
										class="image"
										:style="{
											backgroundImage: npcAvatar(data.row, entity_data)
												? 'url(\'' + npcAvatar(data.row, entity_data) + '\')'
												: '',
											'border-color': data.row.color_label ? data.row.color_label : ``,
											color: data.row.color_label ? data.row.color_label : ``,
										}"
									>
										<i
											aria-hidden="true"
											v-if="!npcAvatar(data.row, entity_data)"
											class="hki-monster"
										/>
									</span>
								</div>

								<!-- NAME -->
								<span slot="name" slot-scope="data" class="green">
									{{ data.item.capitalizeEach() }}
								</span>

								<!-- ACTIONS -->
								<div slot="actions" slot-scope="data" class="actions">
									<a
										v-if="data.row.entityType === 'npc'"
										@click="
											setDrawer({
												show: true,
												type: 'drawers/editEncounter/EditEntity',
												data: { npc: data.row, encounter },
											})
										"
										class="mr-2 btn btn-sm bg-neutral-5"
									>
										<i aria-hidden="true" class="fas fa-pencil"></i>
										<q-tooltip anchor="top middle" self="center middle"> Edit </q-tooltip>
									</a>
									<a class="btn btn-sm bg-neutral-5" @click="remove(data.row.key, data.row.name)">
										<i aria-hidden="true" class="fas fa-minus"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Remove character
										</q-tooltip>
									</a>
								</div>
							</hk-table>

							<h3 class="d-flex justify-between">
								<span>Monsters</span>
								<q-chip
									v-if="Object.keys(_monsters).length"
									square
									:dark="$store.getters.theme !== 'light'"
								>
									<strong>
										<hk-animated-integer :value="Object.keys(_monsters).length" />
									</strong>
								</q-chip>
							</h3>

							<!-- Enemy monsters -->
							<hk-table :items="_monsters" :columns="entityColumns" :showHeader="false">
								<span
									slot="image"
									slot-scope="data"
									class="image"
									:style="{
										backgroundImage: npcAvatar(data.row, entity_data)
											? 'url(\'' + npcAvatar(data.row, entity_data) + '\')'
											: '',
										'border-color': data.row.color_label ? data.row.color_label : ``,
										color: data.row.color_label ? data.row.color_label : ``,
									}"
								>
									<i
										aria-hidden="true"
										v-if="!npcAvatar(data.row, entity_data)"
										class="hki-monster"
									/>
								</span>

								<!-- NAME -->
								<span slot="name" slot-scope="data" class="red">
									{{ data.item.capitalizeEach() }}
								</span>

								<div slot="actions" slot-scope="data" class="actions">
									<a
										@click="
											setDrawer({
												show: true,
												type: 'drawers/editEncounter/EditEntity',
												data: { npc: data.row, encounter },
											})
										"
										class="mr-2 btn btn-sm bg-neutral-5"
									>
										<q-tooltip anchor="top middle" self="center middle"> Edit </q-tooltip>
										<i aria-hidden="true" class="fas fa-pencil"></i>
									</a>
									<a class="btn btn-sm bg-neutral-5" @click="remove(data.row.key, data.row.name)">
										<i aria-hidden="true" class="fas fa-minus"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Remove character
										</q-tooltip>
									</a>
								</div>
							</hk-table>
						</template>
						<template v-else>
							<h3>Add entities</h3>
							<p>Add players and monsters to create your encounter.</p>
							<button v-if="!demo" class="btn btn-block" @click="$emit('add-players')">
								Add all players
							</button>
						</template>
					</div>
				</template>
				<hk-loader v-else />
			</hk-card>
			<hk-card v-if="demo || (tier && tier.price === 'Free')" class="background-effects">
				<video
					slot="image"
					class="video"
					src="~assets/_vid/background-effects-rain.mp4"
					muted
					autoplay
					playsinline
					alt="Background Effects Rain"
					loop
				/>
				<div class="p-3 text-center">
					<h3 class="text-bold">Background Effects</h3>
					<p>
						Add animated effects to the initiative list that you share with your group.<br />
						<em>Set them under the General tab.</em>
					</p>
					<q-btn
						to="/weather-demo"
						color="primary"
						label="Check out all effects"
						no-caps
						class="full-width"
					/>
				</div>
			</hk-card>
		</div>
		<div
			class="toggle bg-green"
			:class="{ show: showOverview }"
			@click="showOverview = !showOverview"
		>
			<i aria-hidden="true" class="fas fa-chevron-left"></i>
		</div>
	</div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import { difficulty } from "src/mixins/difficulty.js";

export default {
	name: "Overview",
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
	},
	mixins: [difficulty],
	data() {
		return {
			demo: this.$route.name === "ToolsBuildEncounter",
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			user: this.$store.getters ? this.$store.getters.user : undefined,
			drawer: this.$store.getters.getDrawer,
			showOverview: false,
			encDifficulty: undefined,
			showDifficulty: false,
			loading: true,
			entity_data: {},
			bars: {
				trivial: "grey",
				easy: "positive",
				medium: "info",
				hard: "warning",
				deadly: "negative",
			},
			entityColumns: {
				image: {
					width: 46,
					noPadding: true,
				},
				name: {
					truncate: true,
				},
				actions: {
					noPadding: true,
					maxContent: true,
				},
			},
		};
	},
	computed: {
		...mapGetters(["overencumbered", "tier"]),
		_friendlies() {
			if (this.encounter) {
				return _.chain(this.encounter.entities)
					.filter(function (entity, key) {
						entity.key = key;
						return (
							entity.friendly || entity.entityType === "player" || entity.entityType === "companion"
						);
					})
					.orderBy(function (entity) {
						return entity.name;
					}, "asc")
					.value();
			}
			return [];
		},
		_monsters() {
			if (this.encounter) {
				// eslint-disable-next-line
				return _.chain(this.encounter.entities)
					.filter(function (entity, key) {
						entity.key = key;
						return !entity.friendly && entity.entityType === "npc";
					})
					.orderBy(function (entity) {
						return entity.name;
					}, "asc")
					.value();
			}
			return [];
		},
		totalXp() {
			return this.encDifficulty["totalXp"];
		},
	},
	watch: {
		encounter: {
			deep: true,
			async handler() {
				this.loading = true;
				this.entity_data = await this.get_entity_data();
				this.setDifficulty();
				this.loading = false;
			},
		},
	},
	async mounted() {
		this.entity_data = await this.get_entity_data();
		this.loading = false;
		await this.setDifficulty();
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("encounters", ["delete_entity", "set_xp"]),
		...mapActions("players", ["get_player"]),
		...mapActions("npcs", ["get_npc"]),
		...mapActions("api_monsters", ["fetch_monster"]),
		avatar(entity, entity_data) {
			return entity_data[entity.id]
				? entity_data[entity.id].storage_avatar || entity_data[entity.id].avatar
				: null;
		},
		npcAvatar(npc, entity_data) {
			if (npc.avatar) {
				return npc.avatar;
			} else {
				return npc.id && entity_data[npc.id]
					? entity_data[npc.id].storage_avatar || entity_data[npc.id].avatar
					: null;
			}
		},
		async remove(id) {
			if (!this.demo) {
				await this.delete_entity({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					entityId: id,
				});
			} else {
				this.$delete(this.encounter.entities, id);
			}
		},
		async setDifficulty() {
			this.encDifficulty = await this.difficulty(this.encounter.entities);
			//Store the new xp value for the encounter
			if (!this.demo) {
				this.set_xp({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					type: "calculated",
					value: this.encDifficulty["totalXp"],
				});
			}
		},
		async get_entity_data() {
			const entities = {};
			if (this.encounter.entities) {
				for (const [key, entity] of Object.entries(this.encounter.entities)) {
					if (entity.id in entities) {
						continue;
					}
					if (entity.entityType == "player" && !this.demo) {
						entities[entity.id] = await this.get_player({ uid: this.user.uid, id: key });
					} else if (entity.npc === "custom" && !this.demo) {
						entities[entity.id] = await this.get_npc({ uid: this.user.uid, id: entity.id });
					} else if (entity.npc === "api" || entity.npc === "srd") {
						entities[entity.id] = await this.fetch_monster(entity.id);
					}
				}
			}
			return entities;
		},
	},
};
</script>

<style lang="scss" scoped>
.encounter_overview {
	position: sticky;
	top: 10px;
	grid-area: overview;

	h3 {
		margin-bottom: 10px;
	}
	.diff-header {
		background-color: $neutral-8;
		display: flex;
		justify-content: space-between;
		line-height: 45px;
		padding: 0 15px;
		cursor: pointer;
	}
	.diff-info {
		background: $neutral-7;
		padding: 15px;

		span.left {
			width: 80px;
			display: inline-block;
		}

		.progress-area {
			.progress {
				background-color: $neutral-8 !important;
			}
			.diff {
				display: none;
			}
		}
	}
	.overview {
		padding: 15px;
	}
}
.toggle {
	display: none;
}
@media only screen and (max-width: 850px) {
	.encounter_overview {
		position: fixed;
		top: 0;
		right: -300px;
		height: 100vh;
		z-index: 96;
		background: $neutral-6;
		width: 300px;
		transition: right 0.5s linear, box-shadow 0.5s linear;

		.hk-card.overview-main {
			border: none;
			box-shadow: none;
		}

		.hk-card.background-effects {
			margin: 0 15px;

			.card-body {
				background-color: $neutral-7;
			}
		}

		&.show {
			right: 0;
			box-shadow: 0 10px 15px $black;
		}

		h3.header {
			padding: 10px;
		}

		.q-scrollarea {
			overflow: visible !important;
			height: calc(100% - 286px);
		}

		&::-webkit-scrollbar {
			display: none;
		}
	}
	.toggle {
		position: fixed;
		bottom: 50%;
		transform: translateY(50%);
		right: 0;
		height: 50px;
		width: 18px;
		z-index: 97;
		text-align: center;
		transition: right 0.5s linear;
		display: block;
		cursor: pointer;
		line-height: 50px;
		color: $neutral-1 !important;
		border-top-left-radius: $border-radius-small;
		border-bottom-left-radius: $border-radius-small;

		i {
			transition: transform 0.5s linear;
		}

		&.show {
			right: 300px;

			i {
				transform: rotate(180deg);
			}
		}
	}
}
</style>
