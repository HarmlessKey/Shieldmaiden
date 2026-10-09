<template>
	<Weather
		:weather="encounter.weather"
		:background="getBackground(encounter)"
		:show-weather="weather"
		class="track-wrapper"
		:class="{ 'rolling-initiative': encounter.round === 0 }"
	>
		<!-- ROLL FOR INITIATIVE -->
		<RollForInitiative v-if="encounter.round === 0" />

		<!-- ACTIVE ENCOUNTER -->
		<template v-else>
			<Turns
				:encounter="encounter"
				:current="_non_hidden_targets[0]"
				:entities_len="Object.keys(_non_hidden).length"
				:turn="turn"
				:campPlayers="campaign.players"
				:campCompanions="campaign.companions"
				:players="players"
				:npcs="npcs"
				:displaySettings="displaySettings"
				:effectiveEntities="effectiveEntities"
				@setWeather="setWeather"
				:timer="timer['.value']"
			/>

			<!-- DESKTOP -->
			<div
				class="track desktop"
				:class="{ 'no-meters': playerSettings.meters !== undefined }"
				v-if="width > 576"
			>
				<div class="initiative">
					<Initiative
						v-if="!encounter.finished"
						:encounter="encounter"
						:targets="_non_hidden_targets"
						:allEntities="_non_hidden"
						:turn="turn"
						:campPlayers="campaign.players"
						:campCompanions="campaign.companions"
						:players="players"
						:npcs="npcs"
						:displaySettings="displaySettings"
						:screenWidth="width"
						:effectiveEntities="effectiveEntities"
						:effectEntries="effectEntries"
					/>
					<Rewards v-else :encounter="encounter" />
				</div>
				<div class="side" v-if="playerSettings.meters === undefined">
					<q-scroll-area
						:dark="$store.getters.theme === 'dark'"
						:thumb-style="{ width: '5px' }"
						class="during-encounter"
					>
						<div class="meters-wrapper">
							<Meters
								:entities="encounter.entities"
								:npcs="npcs"
								:players="players"
								:displaySettings="displaySettings"
							/>
						</div>
					</q-scroll-area>
				</div>
				<div class="shares-bar" :class="{ shown: showShares }">
					<div class="show" @click="showShares = !showShares">
						<i aria-hidden="true" class="fas fa-chevron-left" />
					</div>
					<Shares
						:shares="shares"
						:encounterId="encounter.key"
						:entities="encounter.entities"
						:npcs="npcs"
						:players="players"
						:displaySettings="displaySettings"
					/>
				</div>
			</div>

			<!-- MOBILE -->
			<div v-else class="track mobile">
				<div class="bg-neutral-6">
					<q-select
						:dark="$store.getters.theme === 'dark'"
						filled
						square
						v-model="panel"
						:options="panels"
					>
						<template v-slot:selected>
							<q-item>
								<q-item-section avatar>
									<q-icon
										:name="
											panels.filter((item) => {
												return item.value === panel;
											})[0].icon
										"
									/>
								</q-item-section>
								<q-item-section>
									<q-item-label
										v-text="
											panels.filter((item) => {
												return item.value === panel;
											})[0].label
										"
									/>
								</q-item-section>
							</q-item>
						</template>
						<template v-slot:option="scope">
							<q-item
								clickable
								v-ripple
								v-close-popup
								:active="panel === scope.opt.value"
								@click="panel = scope.opt.value"
							>
								<q-item-section avatar>
									<q-icon :name="scope.opt.icon" />
								</q-item-section>
								<q-item-label v-text="scope.opt.label" />
								<q-item-section> </q-item-section>
							</q-item>
						</template>
					</q-select>
				</div>
				<q-tab-panels v-model="panel" animated swipeable infinite class="transparent-bg">
					<q-tab-panel name="initiative">
						<Initiative
							v-if="!encounter.finished"
							:encounter="encounter"
							:targets="_non_hidden_targets"
							:allEntities="_non_hidden"
							:turn="turn"
							:campPlayers="campaign.players"
							:campCompanions="campaign.companions"
							:players="players"
							:npcs="npcs"
							:displaySettings="displaySettings"
							:screenWidth="width"
							:effectiveEntities="effectiveEntities"
							:effectEntries="effectEntries"
						/>
						<Rewards v-else :encounter="encounter" />
					</q-tab-panel>
					<q-tab-panel name="meters" v-if="playerSettings.meters === undefined">
						<Meters
							:entities="encounter.entities"
							:npcs="npcs"
							:players="players"
							:displaySettings="displaySettings"
						/>
					</q-tab-panel>
					<q-tab-panel name="shares">
						<Shares
							:shares="shares"
							:encounterId="encounter.key"
							:entities="encounter.entities"
							:npcs="npcs"
							:players="players"
							:displaySettings="displaySettings"
						/>
					</q-tab-panel>
				</q-tab-panels>
			</div>
		</template>
	</Weather>
</template>

<script>
import _ from "lodash";
import { db } from "src/firebase";
import { EffectServices } from "src/services/effects";
import {
	effectiveEntity,
	effectiveStats,
	findSrdDefinition,
	resolveDefinition,
} from "src/utils/effectFunctions";
import { effectSubject } from "src/utils/entityFunctions";
import { default_edition } from "src/utils/generalConstants";

import Turns from "./Turns.vue";
import Initiative from "./Initiative.vue";
import Meters from "../Meters.vue";
import RollForInitiative from "./RollForInitiative.vue";

export default {
	name: "live",
	components: {
		Turns,
		Initiative,
		Meters,
		RollForInitiative,
		Shares: () => import("../Shares"),
		Rewards: () => import("./Rewards"),
		Weather: () => import("src/components/weather"),
	},
	props: ["encounter", "campaign", "players", "width", "shares"],
	data() {
		return {
			userId: this.$route.params.userid,
			panel: "initiative",
			counter: 0,
			rolls: [],
			weather: true,
			showShares: false,
			// Resolved effect definitions by "source:source_key" (the DM's custom effects)
			definitions: {},
			// SRD monsters of SRD NPCs by "edition:id", for the stats effects read
			monsters: {},
			panels: [
				{
					label: "Initiative list",
					value: "initiative",
					icon: "fas fa-list-ul",
				},
				{
					label: "Damage meters",
					value: "meters",
					icon: "fas fa-swords",
				},
				{
					label: "Shares",
					value: "shares",
					icon: "fas fa-share",
				},
			],
		};
	},
	firebase() {
		return {
			npcs: {
				source: db.ref(`npcs/${this.userId}`),
				asObject: true,
			},
			npcSettings: {
				source: db.ref(`settings/${this.userId}/track/npc`),
				asObject: true,
			},
			allySettings: {
				source: db.ref(`settings/${this.userId}/track/ally`),
				asObject: true,
			},
			playerSettings: {
				source: db.ref(`settings/${this.userId}/track/player`),
				asObject: true,
			},
			timer: {
				source: db.ref(`settings/${this.userId}/encounter/timer`),
				asObject: true,
			},
		};
	},
	computed: {
		displaySettings() {
			return {
				npc: this.npcSettings,
				ally: this.allySettings,
				player: this.playerSettings,
			};
		},
		_allEntities() {
			return _.chain(this.encounter.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return entity.active && !entity.down;
				})
				.orderBy(function (entity) {
					return entity.name;
				}, "asc")
				.orderBy(function (entity) {
					return Number(entity.initiative);
				}, "desc")
				.value();
		},
		_targets() {
			let t = this.encounter.turn;
			let turns = Object.keys(this._allEntities);
			let order = turns.slice(t).concat(turns.slice(0, t));
			return Array.from(order, (i) => this._allEntities[i]);
		},
		//All entities, without hidden entities
		_non_hidden() {
			return _.chain(this.encounter.entities)
				.filter(function (entity, key) {
					entity.key = key;
					return entity.active && !entity.down && !entity.hidden;
				})
				.orderBy(function (entity) {
					return entity.name;
				}, "asc")
				.orderBy(function (entity) {
					return Number(entity.initiative);
				}, "desc")
				.value();
		},
		_hidden_count() {
			return _.filter(this.encounter.entities, function (entity, key) {
				entity.key = key;
				return entity.active && !entity.down && entity.hidden;
			}).length;
		},
		_non_hidden_targets() {
			let t = this.turn;
			let turns = Object.keys(this._non_hidden);
			let order = turns.slice(t).concat(turns.slice(0, t));
			return Array.from(order, (i) => this._non_hidden[i]);
		},
		turn() {
			let t = this.encounter.turn;
			let hidden = 0;
			for (let i = 0; i <= t; i++) {
				if (this._allEntities[i].hidden) {
					hidden++;
				}
			}
			// If more hidden then turn it's still turn 0
			if (t - hidden < 0) {
				return 0;
			}
			return t - hidden;
		},
		tabs() {
			let tabs = [];
			if (this.playerSettings.meters === undefined) {
				tabs.push({
					name: "damage",
					label: "Damage meters",
					icon: "fas fa-swords",
				});
			}
			tabs.push({
				name: "rolls",
				label: "Rolls",
				icon: "fas fa-dice-d20",
			});
			return tabs;
		},
		edition() {
			return this.campaign.edition || default_edition;
		},
		/**
		 * Active effect instances per entity key: NPC effects are on the encounter,
		 * player and companion effects on the campaign
		 */
		effectInstances() {
			const instances = {};
			for (const [key, entity] of Object.entries(this.encounter.entities || {})) {
				if (!entity?.active) continue;
				const effects =
					entity.entityType === "player"
						? this.campaign.players?.[key]?.effects
						: entity.entityType === "companion"
						? this.campaign.companions?.[key]?.effects
						: entity.effects;
				instances[key] = effects || {};
			}
			return instances;
		},
		// Every definition the shown effects use, once
		effectRefs() {
			const refs = {};
			for (const effects of Object.values(this.effectInstances)) {
				for (const { source, source_key } of Object.values(effects)) {
					refs[`${source}:${source_key}`] = { source, source_key };
				}
			}
			return Object.values(refs);
		},
		// SRD NPCs with effects or casting one, whose monster stats formulas may need
		monsterRefs() {
			const casters = new Set();
			for (const effects of Object.values(this.effectInstances)) {
				for (const instance of Object.values(effects)) {
					if (instance.caster_key) casters.add(instance.caster_key);
				}
			}
			const refs = {};
			for (const [key, entity] of Object.entries(this.encounter.entities || {})) {
				if (!entity?.active || !entity.npc || entity.npc === "custom" || !entity.id) continue;
				if (!Object.keys(this.effectInstances[key] || {}).length && !casters.has(key)) continue;
				const edition = entity.edition || default_edition;
				refs[`${edition}:${entity.id}`] = { id: entity.id, edition };
			}
			return Object.values(refs);
		},
		/**
		 * The active entities with the fields effects read (effectSubject), hidden ones included:
		 * they can be the caster of a shown effect
		 */
		subjects() {
			const subjects = {};
			for (const [key, entity] of Object.entries(this.encounter.entities || {})) {
				if (!entity?.active) continue;
				const type = entity.entityType;
				let npc;
				if (type === "companion") npc = this.npcs?.[key];
				else if (type === "npc" && entity.npc === "custom") npc = this.npcs?.[entity.id];
				else if (type === "npc" && entity.npc) {
					npc = this.monsters[`${entity.edition || default_edition}:${entity.id}`];
				}
				subjects[key] = effectSubject({
					entity,
					campaignEntry:
						type === "player"
							? this.campaign.players?.[key]
							: type === "companion"
							? this.campaign.companions?.[key]
							: undefined,
					player: type === "player" ? this.players?.[key] : undefined,
					npc,
				});
			}
			return subjects;
		},
		/**
		 * The active entities with the values their effects and manual bonuses give them,
		 * calculated as in the tracker (effective_entity)
		 */
		effectiveEntities() {
			const effective = {};
			for (const [key, subject] of Object.entries(this.subjects)) {
				effective[key] = effectiveEntity(
					subject,
					effectiveStats({
						entity: subject,
						holderKey: key,
						entities: this.subjects,
						definitionOf: this.definitionOf,
					})
				);
			}
			return effective;
		},
		/**
		 * The shown effects per entity key as [{ key, instance, definition }], for the chips
		 */
		effectEntries() {
			const entries = {};
			for (const [key, effects] of Object.entries(this.effectInstances)) {
				entries[key] = Object.entries(effects).map(([effectKey, instance]) => ({
					key: effectKey,
					instance,
					definition: this.definitionOf(instance),
				}));
			}
			return entries;
		},
	},
	watch: {
		effectRefs: {
			handler: "resolveDefinitions",
			immediate: true,
		},
		monsterRefs: {
			handler: "fetchMonsters",
			immediate: true,
		},
	},
	methods: {
		setWeather(value) {
			this.weather = value;
		},
		/**
		 * The resolved definition of an instance; undefined while it's being read
		 */
		definitionOf(instance) {
			return this.definitions[`${instance.source}:${instance.source_key}`];
		},
		/**
		 * Resolves definitions that aren't known yet: SRD ones from the campaign's edition, custom
		 * ones from the DM's custom effects (not the viewer's, and not through the effects store,
		 * which holds the viewer's own). A definition that can't be read is stored unresolved.
		 */
		async resolveDefinitions(refs = []) {
			if (!this.resolving) this.resolving = new Set();
			const services = new EffectServices();
			const lookup = async ({ source, source_key }) => {
				if (source === "srd") return findSrdDefinition(this.edition, source_key);
				if (source === "custom") return (await services.getEffect(this.userId, source_key)) || undefined;
				return undefined;
			};
			await Promise.all(
				refs.map(async ({ source, source_key }) => {
					const id = `${source}:${source_key}`;
					if (this.definitions[id] || this.resolving.has(id)) return;
					this.resolving.add(id);
					const definition = await resolveDefinition({ source, sourceKey: source_key, lookup });
					this.$set(this.definitions, id, definition);
					this.resolving.delete(id);
				})
			);
		},
		/**
		 * Fetches the SRD monsters that aren't known yet, once each
		 */
		async fetchMonsters(refs = []) {
			if (!this.fetching) this.fetching = new Set();
			await Promise.all(
				refs.map(async ({ id, edition }) => {
					const cacheKey = `${edition}:${id}`;
					if (this.monsters[cacheKey] || this.fetching.has(cacheKey)) return;
					this.fetching.add(cacheKey);
					try {
						const monster = await this.$store.dispatch("api_monsters/fetch_monster", { id, edition });
						if (monster) this.$set(this.monsters, cacheKey, monster);
					} catch (error) {
						console.error(`Failed to fetch monster ${cacheKey}`, error);
					}
				})
			);
		},
		getBackground(encounter) {
			if (encounter && encounter.background) return encounter.background;
			if (encounter && encounter.hk_background)
				return require(`src/assets/_img/atmosphere/${encounter.hk_background}.jpg`);
			return undefined;
		},
	},
};
</script>

<style lang="scss" scoped>
.track {
	margin: auto;
	width: 100%;
	height: calc(100% - 60px);
	display: grid;

	.turns {
		position: relative;
		z-index: 1;
	}

	&.desktop {
		grid-template-columns: 3fr 1fr minmax(200px, 250px);
		grid-template-rows: 1fr;
		grid-gap: 15px;

		.initiative {
			padding: 30px 0 0 15px;
			overflow: hidden;

			.q-scrollarea {
				height: calc(100% - 86px);

				> div {
					padding-right: 6px;
				}
			}
		}
		.side {
			overflow: hidden;
			padding-top: 30px;

			.q-scrollarea {
				height: calc(100% - 56px);

				&.during-encounter {
					height: calc(100% - 50px);
				}
			}
		}
		.shares-bar {
			height: 100%;

			.show {
				display: none;
			}
			.shares {
				width: 100%;
			}
		}

		&.no-meters {
			grid-template-columns: 1fr minmax(200px, 250px);
		}
	}
	&.mobile {
		grid-template-rows: 60px 1fr;
		grid-template-columns: 1fr;

		.transparent-bg {
			background: none;
		}
		.q-tab-panel {
			padding: 0 15px;
		}
	}

	&::-webkit-scrollbar {
		display: none;
	}
}

@media only screen and (max-width: 900px) {
	.track.desktop {
		grid-template-columns: 2fr 1fr !important;

		.side {
			padding-right: 15px;
		}
		.shares-bar {
			width: 250px;
			position: absolute;
			right: -250px;
			display: flex;
			justify-content: center;
			transition: all 0.5s linear;

			.show {
				background-color: $blue;
				color: $neutral-1;
				display: block;
				width: 18px;
				text-align: center;
				cursor: pointer;
				height: 50px;
				line-height: 50px;
				position: absolute;
				top: 50%;
				left: -18px;
				transform: translateY(-50%);

				i {
					transition: all 0.3s linear;
				}
			}
			&.shown {
				right: 0;

				.show {
					i {
						transform: rotate(180deg);
					}
				}
			}
		}
		&.no-meters {
			grid-template-columns: 1fr !important;

			.initiative {
				padding-right: 15px;
			}
		}
	}
}
@media only screen and (max-width: 992px) {
	.track.desktop {
		grid-template-columns: 3fr 1fr minmax(180px, 200px);

		&.no-meters {
			grid-template-columns: 1fr minmax(180px, 200px);
		}
	}
}
@media only screen and (min-width: 1250px) {
	.track.desktop {
		grid-template-columns: 3fr 1fr minmax(250px, 300px);
		grid-gap: 30px;

		.initiative {
			padding-left: 30px;
		}

		&.no-meters {
			grid-template-columns: 1fr minmax(180px, 200px);
		}
	}
}
</style>
