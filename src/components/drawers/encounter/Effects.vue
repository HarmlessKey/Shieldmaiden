<template>
	<div class="pb-5">
		<h2>{{ mode === "conditions" ? "Set Conditions" : "Set Effects" }}</h2>
		<ul class="targets">
			<li v-for="(target, i) in targets" :key="`target=${i}`">
				<BasicEntity ref="basicEntity" :entity="entities[target]">
					<Effects :entity="entities[target]" :available-space="effectSpace" effects collapse />
				</BasicEntity>
			</li>
		</ul>
		<hr />
		<template v-if="targets.length > 0">
			<div v-for="group in groups" :key="group.name" class="mb-3">
				<h3 class="mb-1">{{ group.name }}</h3>
				<q-list :dark="$store.getters.theme === 'dark'" square class="accordion">
					<q-expansion-item
						v-for="entry in group.entries"
						:key="entry.id"
						:value="expanded === entry.id"
						:dark="$store.getters.theme === 'dark'"
						switch-toggle-side
						@input="toggle(entry, $event)"
					>
						<template v-slot:header>
							<q-item-section>
								<div class="d-flex justify-content-start items-center">
									<i
										v-if="entry.isCondition"
										aria-hidden="true"
										:class="`hki-${entry.sourceKey}`"
										class="icon"
									/>
									<span class="truncate">{{ entry.name }}</span>
									<span
										v-if="entry.sourceKey === 'exhaustion' && exhaustionLevel !== undefined"
										class="exhaustion neutral-11 ml-2"
									>
										{{ exhaustionLevel || "?" }}
										<q-tooltip anchor="top middle" self="center middle">
											{{ exhaustionLevel ? `Level ${exhaustionLevel}` : "Levels differ between targets" }}
										</q-tooltip>
									</span>
								</div>
							</q-item-section>

							<q-item-section avatar>
								<div class="d-flex items-center">
									<span
										v-if="presence(entry) !== 'none'"
										class="presence mr-2"
										:class="presence(entry)"
									>
										<q-tooltip anchor="top middle" self="center middle">
											{{ presence(entry) === "all" ? "All targets" : "Some targets" }}
										</q-tooltip>
									</span>
									<button
										v-if="presence(entry) !== 'none'"
										class="btn btn-sm btn-clear"
										@click.stop="remove(entry)"
									>
										<i aria-hidden="true" class="fas fa-minus-circle red" />
										<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
									</button>
									<button class="btn btn-sm btn-clear" @click.stop="onApplyClick(entry, $event)">
										<i aria-hidden="true" class="fas fa-plus-circle green" />
										<q-tooltip anchor="top middle" self="center middle">
											Apply (shift+click: until removed)
										</q-tooltip>
										<q-menu
											:value="applying === entry.id"
											:dark="$store.getters.theme === 'dark'"
											anchor="bottom right"
											self="top right"
											no-parent-event
											square
											@input="applying = $event ? entry.id : undefined"
										>
											<div class="apply-menu">
												<ApplyEffect
													:definition="definitionOf(entry) || { name: entry.name }"
													:conditions="srd.conditions"
													:default-level="defaultExhaustionLevel"
													:concentration-key="casterConcentrationKey"
													:caster-name="casterName"
													@apply="apply(entry, $event)"
													@cancel="applying = undefined"
												/>
											</div>
										</q-menu>
									</button>
								</div>
							</q-item-section>
						</template>

						<div class="accordion-body">
							<q-spinner v-if="loading === entry.id" />
							<template v-else>
								<EffectDetails :definition="definitionOf(entry)" :edition="edition" />
							</template>
						</div>
					</q-expansion-item>
				</q-list>
			</div>
		</template>
		<p v-else class="mt-4">Select one or multiple targets to apply or remove effects.</p>
	</div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import Effects from "src/components/combat/entities/effects";
import EffectDetails from "src/components/drawers/encounter/effects/EffectDetails.vue";
import ApplyEffect from "src/components/drawers/encounter/effects/ApplyEffect.vue";
import {
	getSrdDefinitions,
	getRequiredChoices,
	buildEffectInstance,
} from "src/utils/effectFunctions.js";

export default {
	name: "EffectsDrawer",
	components: {
		BasicEntity,
		Effects,
		EffectDetails,
		ApplyEffect,
	},
	props: {
		// Entity keys, falls back to the targeted entities
		data: {
			type: Array,
			default: undefined,
		},
		// "conditions" lists only SRD conditions, otherwise SRD and custom effects are listed
		mode: {
			type: String,
			default: undefined,
		},
	},
	data() {
		return {
			effectSpace: 0,
			expanded: undefined,
			// Entry whose application popover is open
			applying: undefined,
			loading: undefined,
			customEffects: [],
			// Full custom definitions by id, false when it couldn't be loaded
			customDefinitions: {},
		};
	},
	computed: {
		...mapGetters(["entities", "targeted", "edition", "round", "turn", "turn_order", "user"]),
		targets() {
			if (this.data !== undefined && this.data.length > 0) return this.data;
			return this.targeted;
		},
		srd() {
			return getSrdDefinitions(this.edition);
		},
		groups() {
			const srdEntry = (definition) => ({
				id: `srd:${definition.url}`,
				source: "srd",
				sourceKey: definition.url,
				name: definition.name,
				isCondition: definition.category === "condition",
			});
			// Conditions have their own mode, the Conditions option
			if (this.mode === "conditions") {
				return [{ name: "Conditions", entries: this.srd.conditions.map(srdEntry) }];
			}

			const groups = [{ name: "Effects", entries: this.srd.effects.map(srdEntry) }];
			if (this.customEffects.length) {
				groups.push({
					name: "Custom effects",
					entries: this.customEffects.map(({ key, name }) => ({
						id: `custom:${key}`,
						source: "custom",
						sourceKey: key,
						name,
						isCondition: false,
					})),
				});
			}
			return groups;
		},
		/**
		 * Key of the entity whose turn it is, ordered like RunEncounter's _active.
		 * Nobody has the turn before combat starts.
		 */
		turnEntityKey() {
			if (!this.round) return undefined;
			return this.turn_order[this.turn];
		},
		casterName() {
			return this.entities[this.turnEntityKey]?.name;
		},
		/**
		 * Key of the caster's active Concentration instance, to link applied effects to
		 */
		casterConcentrationKey() {
			const effects = this.entities[this.turnEntityKey]?.effects || {};
			return Object.keys(effects).find(
				(key) => effects[key].source === "srd" && effects[key].source_key === "concentration"
			);
		},
		/**
		 * Exhaustion level shared by the targets:
		 * undefined if none have it, false if levels differ
		 */
		exhaustionLevel() {
			const levels = _.uniq(this.targets.map((key) => this.exhaustionOf(key)?.level || 0));
			if (levels.length === 1) return levels[0] || undefined;
			return false;
		},
		defaultExhaustionLevel() {
			const highest = Math.max(0, ...this.targets.map((key) => this.exhaustionOf(key)?.level || 0));
			return Math.min(highest + 1, 6);
		},
	},
	async mounted() {
		if (this.mode !== "conditions" && this.user) {
			this.customEffects = (await this.get_effects()) ? this.$store.getters["effects/effects"] : [];
		}
		this.setEffectSize();
	},
	methods: {
		...mapActions(["apply_effect", "remove_effect"]),
		...mapActions("effects", ["get_effects", "get_effect"]),
		setEffectSize() {
			const basicEntity = this.$refs.basicEntity?.[0];
			if (!basicEntity) return;
			const AVATAR_SIZE = 34 + 8; // size + gap
			const MIN_NAME_SIZE = 50 + 8; // width + gap
			this.effectSpace = basicEntity.$el.clientWidth - AVATAR_SIZE - MIN_NAME_SIZE;
		},
		instancesOf(key, entry) {
			const effects = this.entities[key]?.effects || {};
			return Object.values(effects).filter(
				(instance) => instance.source === entry.source && instance.source_key === entry.sourceKey
			);
		},
		exhaustionOf(key) {
			return this.instancesOf(key, { source: "srd", sourceKey: "exhaustion" })[0];
		},
		/**
		 * Whether all, some or none of the targets have the effect
		 */
		presence(entry) {
			const count = this.targets.filter((key) => this.instancesOf(key, entry).length).length;
			if (!count) return "none";
			return count === this.targets.length ? "all" : "some";
		},
		definitionOf(entry) {
			if (entry.source === "srd") {
				return [...this.srd.conditions, ...this.srd.effects].find(
					(definition) => definition.url === entry.sourceKey
				);
			}
			return this.customDefinitions[entry.sourceKey] || undefined;
		},
		/**
		 * Loads the full definition of a custom effect once
		 */
		async loadDefinition(entry) {
			if (entry.source !== "custom" || entry.sourceKey in this.customDefinitions) return;

			this.loading = entry.id;
			let definition = false;
			try {
				definition = await this.get_effect({ uid: this.user.uid, id: entry.sourceKey });
			} catch (error) {
				console.error(error);
			}
			this.$set(this.customDefinitions, entry.sourceKey, definition || false);
			this.loading = undefined;
		},
		async toggle(entry, open) {
			this.expanded = open ? entry.id : undefined;
			if (open) await this.loadDefinition(entry);
		},
		/**
		 * Opens the application popover, shift+click applies until removed
		 */
		async onApplyClick(entry, event) {
			await this.loadDefinition(entry);
			if (event.shiftKey) this.quickApply(entry);
			else this.applying = entry.id;
		},
		/**
		 * Applies until removed, or opens the popover when the effect needs choices.
		 * Exhaustion gets the default level.
		 */
		quickApply(entry) {
			if (getRequiredChoices(this.definitionOf(entry)).length) {
				this.applying = entry.id;
				return;
			}
			const application = { duration: { type: "cancelled" } };
			if (entry.sourceKey === "exhaustion") application.level = this.defaultExhaustionLevel;
			this.apply(entry, application);
		},
		apply(entry, application) {
			const definition = this.definitionOf(entry) || { name: entry.name };

			for (const key of this.targets) {
				const instance = buildEffectInstance({
					definition: { ...definition, name: entry.name },
					source: entry.source,
					sourceKey: entry.sourceKey,
					application,
					round: this.round,
					casterKey: this.turnEntityKey,
					casterName: this.casterName,
				});
				this.apply_effect({ key, instance, definition });
			}
			this.applying = undefined;
		},
		remove(entry) {
			for (const key of this.targets) {
				this.remove_effect({ key, source: entry.source, source_key: entry.sourceKey });
			}
		},
	},
};
</script>

<style lang="scss" scoped>
h3 {
	font-size: 15px;
}
.q-item__section {
	line-height: 27px;

	.icon {
		color: $neutral-3;
		font-size: 23px;
		margin-right: 12px;
	}
	button {
		border-radius: 50%;
		height: 35px;
		width: 35px;
		margin: -8px 0;

		&:focus {
			outline: none;
			background-color: $neutral-5 !important;
		}
	}
	.exhaustion {
		display: block;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: $red;
		text-align: center;
		font-size: 12px;
		line-height: 15px;
		font-weight: bold !important;
	}
	.presence {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: 50%;

		&.all {
			background: $green;
		}
		&.some {
			border: solid 2px $green;
		}
	}
}
.apply-menu {
	width: 300px;
	padding: 0 10px;
}
ul.targets {
	list-style: none;
	padding: 0;

	li {
		margin-bottom: 2px !important;
		border: solid 1px transparent;
		width: 100%;
	}
}
</style>
