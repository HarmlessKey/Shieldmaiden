<template>
	<div
		v-if="targets && allEntities && players && campPlayers && characters"
		class="initiative-wrapper"
		ref="initiative"
	>
		<!-- ACTIONS -->
		<div class="actions" v-if="characters.length !== 0">
			<!-- MOBILE -->
			<div v-if="screenWidth <= 576">
				<q-tabs
					:dark="$store.getters.theme === 'dark'"
					inline-label
					no-caps
					indicator-color="transparent"
				>
					<q-tab name="Damage" icon="fas fa-swords" @click="damageRequest" />
				</q-tabs>
			</div>

			<!-- DESKTOP -->
			<template v-else>
				<div class="text-shadow">
					<span v-if="targeted.length === 0">Select a target to perform actions</span>
					<span v-else>
						{{ targeted.length }} {{ targeted.length > 1 ? "targets" : "target" }}
					</span>
				</div>
				<div class="right">
					<a v-if="targeted.length > 0" @click="damageRequest()">
						<i aria-hidden="true" class="fas fa-sword white"></i>
						<q-tooltip anchor="top middle" self="center middle"> Do damage or healing </q-tooltip>
					</a>
				</div>
			</template>
		</div>

		<!-- INITIATIVE LIST -->
		<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px' }">
			<div>
				<table class="initiative-list targets">
					<thead class="white text-shadow">
						<th class="init">In.</th>
						<th class="image"></th>
						<th class="ac"><i aria-hidden="true" class="fas fa-shield"></i></th>
						<th>Name</th>
						<th class="hp"><i aria-hidden="true" class="fas fa-heart"></i></th>
						<th class="conditions"></th>
					</thead>
					<tbody
						class="entities"
						name="entities"
						is="transition-group"
						enter-active-class="animated animate__fadeIn"
						leave-active-class="animated animate__fadeOut"
					>
						<template v-for="(entity, index) in targets">
							<tr v-if="allEntities[0].key == entity.key && turn > 0" :key="index" class="top">
								<td colspan="6">Top of the round</td>
							</tr>
							<tr
								:key="entity.key"
								:class="{
									pointer: characters.length !== 0,
									targeted: targeted.includes(entity.key),
								}"
								v-touch-hold.mouse="(event) => target(event, 'multi', entity.key)"
								@click="target($event, 'single', entity.key)"
							>
								<td class="init white">
									<i
										aria-hidden="true"
										v-if="targeted.includes(entity.key)"
										class="fas fa-crosshairs"
									></i>
									<template v-else>{{ entity.initiative }}</template>
								</td>

								<td class="image">
									<Avatar class="img" :entity="entity" :players="players" :npcs="npcs" />
								</td>
								<td class="ac">
									<div class="ac_wrapper" :style="{ color: entity.color_label || null }">
										<i aria-hidden="true" class="fas fa-shield" />
										<template
											v-if="
												(playerSettings.ac === undefined &&
													(entity.entityType === 'player' || entity.entityType === 'companion')) ||
												(entity.entityType == 'npc' && displayNPCField('ac', entity) == true)
											"
										>
											<!-- Effective AC: effects and manual bonuses, as in the tracker -->
											<EffectModifiedValue
												class="value"
												:value="acOf(entity).value"
												:changed="acOf(entity).changed"
												:notes="acOf(entity).notes"
											/>
										</template>
										<span v-else class="value">?</span>
									</div>
								</td>

								<td class="name">
									<Name
										:entity="entity"
										:players="players"
										:npcs="npcs"
										:displaySettings="displaySettings"
									/>
								</td>

								<td class="hp">
									<Health
										:entity="entity"
										:campPlayers="campPlayers"
										:campCompanions="campCompanions"
										:players="players"
										:npcs="npcs"
										:displaySettings="displaySettings"
										:effective="effectiveEntities[entity.key]"
									/>
								</td>

								<td class="conditions" v-if="effectsShown(entity)">
									<!-- The tracker's effect chips, read-only -->
									<Effects
										:entity="entity"
										:effect-entries="effectEntries[entity.key] || []"
										:caster-of="casterOf"
										:holder-name="shownName(entity.key)"
										:available-space="effectSpace"
										effects
										collapse
										readonly
									/>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
import { db } from "src/firebase";
import { general } from "src/mixins/general.js";
import { mapActions } from "vuex";
import { trackEncounter } from "src/mixins/trackEncounter.js";
import Health from "./Health.vue";
import Name from "./Name.vue";
import Avatar from "./Avatar.vue";
import Effects from "src/components/combat/entities/effects";
import EffectModifiedValue from "src/components/combat/entities/EffectModifiedValue.vue";

export default {
	name: "Initiative",
	mixins: [general, trackEncounter],
	components: {
		Health,
		Name,
		Avatar,
		Effects,
		EffectModifiedValue,
	},
	props: [
		"encounter",
		"targets",
		"allEntities",
		"turn",
		"campPlayers",
		"campCompanions",
		"players",
		"npcs",
		"displaySettings",
		"screenWidth",
		// Entities with the values effects and manual bonuses give them, by key
		"effectiveEntities",
		// Shown effects per entity key as [{ key, instance, definition }]
		"effectEntries",
	],
	data() {
		return {
			dmId: this.$route.params.userid,
			userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
			width: 0,
			characters: [],
			targeted: [],
		};
	},
	computed: {
		playerSettings() { return this.displaySettings?.player || {}; },
		npcSettings() { return this.displaySettings?.npc; },
		allySettings() { return this.displaySettings?.ally; },
		// Space for effect chips (33px each) by the list's width
		effectSpace() {
			const ITEM_SIZE = 33;
			if (this.width < 400) return ITEM_SIZE;
			if (this.width < 450) return 2 * ITEM_SIZE;
			if (this.width < 550) return 3 * ITEM_SIZE;
			if (this.width < 600) return 4 * ITEM_SIZE;
			if (this.width < 750) return 5 * ITEM_SIZE;
			return 6 * ITEM_SIZE;
		},
	},
	mounted() {
		this.$nextTick(function () {
			window.addEventListener("resize", this.setSize);
			//Init
			this.setSize();
		});

		//Check if user has control over a character in the campaign
		if (this.userId) {
			const allCampaignPlayers = Object.keys(this.campPlayers);
			const getCharacters = db.ref(`character_control/${this.userId}`);
			getCharacters.on("value", async (snapshot) => {
				let controlledCharacters = snapshot.val();

				for (let key in controlledCharacters) {
					if (allCampaignPlayers.includes(key)) {
						this.characters.push(key);
					}
				}
			});
		}
	},
	methods: {
		...mapActions(["setDrawer"]),
		setSize() {
			this.width = this.$refs.initiative.clientWidth;
		},
		target(e, type, key) {
			//Select the target
			let targeted = this.targeted;

			if (type === "multi" || e.shiftKey) {
				if (!targeted.includes(key)) {
					targeted.push(key);
				} else {
					targeted = targeted.filter(function (value) {
						return value != key;
					});
				}
			} else {
				if (targeted.length === 0 || targeted[0] !== key) {
					targeted = [key];
				} else {
					targeted = [];
				}
			}
			this.targeted = targeted;
			this.setDrawer({ show: false });
		},
		damageRequest() {
			this.setDrawer({
				show: true,
				type: "drawers/trackCampaign/playerRequests/index",
				data: {
					characters: this.characters,
					targeted: this.targeted,
					targets: this.targets,
					players: this.players,
					campPlayers: this.campPlayers,
					npcSettings: this.npcSettings,
					allySettings: this.allySettings,
					npcs: this.npcs,
					encounter: {
						key: this.encounter.key,
						turn: this.encounter.turn,
						round: this.encounter.round,
					},
					type: "manual",
				},
			});
		},
		/**
		 * The AC to show: effective, marked when changed, with "Armor class" as the tooltip
		 * when nothing changed it
		 */
		acOf(entity) {
			const ac = this.displayAc(this.effectiveEntities?.[entity.key], this.effectsShown(entity));
			return ac.changed ? ac : { ...ac, notes: ["Armor class"] };
		},
		/**
		 * An entity's name as players see it (Name.vue), or undefined when they can't see it:
		 * not in the encounter, a hidden NPC, or an NPC whose name is hidden
		 */
		shownName(key) {
			const entity = this.encounter.entities?.[key];
			if (!entity?.active) return undefined;
			if (entity.entityType === "player") return this.players?.[key]?.character_name || undefined;
			if (entity.entityType === "companion") return this.npcs?.[key]?.name || undefined;
			if (entity.hidden || !this.displayNPCField("name", { ...entity, key })) return undefined;
			return entity.name ? entity.name.capitalizeEach() : undefined;
		},
		/**
		 * The caster of an effect for its chip, only when players can see who it is
		 */
		casterOf(instance) {
			const name = instance.caster_key ? this.shownName(instance.caster_key) : undefined;
			return name ? { name, label: name } : undefined;
		},
	},
	beforeDestroy() {
		window.removeEventListener("resize", this.setSize);
	},
};
</script>

<style lang="scss" scoped>
.initiative-wrapper {
	overflow: hidden;
	height: 100%;

	.actions {
		display: flex;
		justify-content: space-between;
		height: 35px;
		line-height: 35px;
		border-bottom: solid 2px $white;
		color: $white;

		.right {
			a {
				color: $neutral-1 !important;
				margin-left: 10px;
			}
		}
	}
	.q-scrollarea {
		height: calc(100% - 49px);

		> div {
			padding-right: 6px;

			.initiative-list {
				margin: 20px 0;
				border-collapse: separate;
				width: 100%;
				border-spacing: 0 5px;
				user-select: none;
				table-layout: fixed;

				th.init {
					text-align: center;
					width: 38px;
				}
				th.ac {
					text-align: center;
					width: 46px;
				}
				th.image {
					width: 46px;
				}
				th.conditions {
					max-width: 200px;
				}

				tbody {
					tr.top {
						td {
							font-size: 15px;
							padding: 10px 0 5px 0;
							border: none;
							border-bottom: solid 1px $white;
							cursor: default;
							color: $white !important;

							&:hover {
								border-left: none;
								border-right: none;
								border-top: none;
							}
						}
					}
					tr {
						cursor: pointer;

						td {
							background: $neutral-8-transparent-8;
							border-top: solid 1px transparent;
							border-bottom: solid 1px transparent;
							backdrop-filter: blur(1px);

							&:first-child {
								border-left: solid 1px transparent;
							}
							&:last-child {
								border-right: solid 1px transparent;
							}
						}
						td.init {
							width: 38px;
							text-align: center;
						}
						td.ac {
							padding: 0;
							width: 45px;

							.ac_wrapper {
								height: 44px;
								position: relative;
								color: $neutral-4;
								text-align: center;

								i {
									width: 100%;
									position: absolute;
									left: 0;
									top: 5px;
									font-size: 35px;
								}
								.value {
									font-weight: bold;
									filter: invert(1) grayscale(1) brightness(1.3) contrast(9000);
									mix-blend-mode: luminosity;
									opacity: 0.95;
									line-height: 40px;

									// The contrast filter hides the marking's color
									&.modified {
										text-decoration: underline dotted;
									}
								}
							}
						}
						td.hp {
							white-space: nowrap;
						}
						td.name {
							overflow: hidden;
							white-space: nowrap;
							text-overflow: ellipsis;
							max-width: 0;
						}
						td.image {
							padding: 0;

							.img {
								width: 44px;
								height: 44px;
								font-size: 32px;
							}
						}
						td.conditions {
							max-width: 200px;
						}
						&.targeted {
							td {
								border-color: $blue;
							}
						}
						&:hover {
							@media only screen and (min-width: 576px) {
								td {
									border-color: $blue;
								}
							}
						}
					}
					tr td:first-child,
					thead th {
						color: $neutral-1;
						background: none;
						text-shadow: 0 0 3px $black;
					}
					tr td:first-child,
					thead th:first-child {
						text-align: center;
					}
				}
			}
			.conditions {
				padding: 9px 10px;
			}
			.entities-move {
				transition: transform 0.6s;
			}
		}
	}
}
@media only screen and (max-width: 576px) {
	.initiative-wrapper {
		padding-bottom: 60px;

		.actions {
			position: fixed;
			bottom: 0;
			z-index: 90;
			background: $neutral-9;
			color: $neutral-1;
			left: 0;
			width: 100%;
			border: none;
			height: 60px;
			line-height: 60px;
			display: block;
		}
		.q-scrollarea {
			height: 100%;

			.initiative-list {
				margin: 0 !important;

				th {
					padding: 5px 0;

					&.ac {
						width: 35px;
					}
				}
				tbody {
					tr {
						td {
							padding: 5px;

							&.image {
								padding: 0;
								width: 43px;
								vertical-align: top;

								.img {
									width: 44px;
									height: 44px;
									box-sizing: border-box;
								}
							}
							&.init {
								width: 35px;
							}
							&.ac {
								.ac_wrapper {
									i {
										font-size: 22px;
									}
									.value {
										font-size: 18px;
									}
								}
							}
						}
					}
				}
			}
		}
		.q-tabs {
			height: 60px;
		}
	}
}
@media only screen and (min-width: 1250px) {
	.initiative-wrapper {
		.q-scrollarea {
			> div {
				.initiative-list {
					font-size: 25px;

					th {
						&.image {
							width: 67px;
						}
						&.init {
							width: 55px;
						}
						&.ac {
							width: 59px;
						}
					}

					tbody {
						tr {
							td {
								&.image {
									// max-width: 57px;

									.img {
										width: 67px;
										height: 67px;
										font-size: 48px;
									}
								}
								&.ac {
									.ac_wrapper {
										i {
											top: 2px;
											font-size: 48px;
										}
										.value {
											line-height: 45px;
											font-size: 23px;
										}
									}
								}
							}
						}
					}
				}
				.conditions {
					padding-right: 15px;
				}
			}
		}
	}
}
</style>
