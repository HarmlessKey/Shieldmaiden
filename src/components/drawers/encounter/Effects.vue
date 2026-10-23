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
		<!-- One effect, from a reminder's prompt (effects 9): its apply form for these targets -->
		<template v-if="single">
			<q-option-group
				v-if="options.encounter"
				v-model="targetChoice"
				:options="[
					{ label: 'Everyone in combat', value: 'everyone' },
					{ label: 'Current targets', value: 'targets' },
				]"
				:dark="$store.getters.theme === 'dark'"
				inline
				class="mb-2"
			/>
			<h3 class="mb-1">
				<i v-if="single.isCondition" aria-hidden="true" :class="`hki-${single.sourceKey}`" class="mr-1" />
				{{ single.name }}
			</h3>
			<q-spinner v-if="loading === single.id" />
			<template v-else>
				<EffectDetails :definition="definitionOf(single)" :edition="edition" />
				<p v-if="!targets.length" class="mt-3">
					{{ targetChoice === "targets" ? "Target one or more entities." : "Nobody is in combat." }}
				</p>
				<ApplyEffect
					v-else
					class="mt-3"
					:definition="definitionOf(single) || { name: single.name }"
					:conditions="srd.conditions"
					:default-level="defaultExhaustionLevel"
					:effect="{ source: single.source, source_key: single.sourceKey, name: single.name }"
					:casters="casters"
					:default-caster="actorEntityKey"
					:caster-concentration="casterConcentration"
					@apply="applySingle($event)"
					@cancel="setDrawer(false)"
				/>
			</template>
		</template>
		<template v-else-if="targets.length > 0">
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
													:effect="{ source: entry.source, source_key: entry.sourceKey, name: entry.name }"
													:casters="casters"
													:default-caster="actorEntityKey"
													:caster-concentration="casterConcentration"
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
	isSrdCondition,
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
		// Entity keys, falls back to the targeted entities. Or { keys, entry, encounter } for one
		// effect (a reminder's prompt, effects 9): entry { source, source_key, name } opens its
		// apply form; encounter lets the DM choose everyone in combat or the current targets
		data: {
			type: [Array, Object],
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
			// One effect for the encounter: "everyone" in combat or the current "targets"
			targetChoice: "everyone",
		};
	},
	computed: {
		...mapGetters([
			"entities",
			"targeted",
			"edition",
			"round",
			"turn",
			"turn_order",
			"actor",
			"user",
		]),
		// The drawer's data as { keys, entry, encounter }
		options() {
			if (Array.isArray(this.data)) return { keys: this.data };
			return this.data || {};
		},
		// The one effect to apply, as a list entry
		single() {
			const entry = this.options.entry;
			if (!entry?.source || !entry?.source_key) return undefined;
			return {
				id: `${entry.source}:${entry.source_key}`,
				source: entry.source,
				sourceKey: entry.source_key,
				name: entry.name || entry.source_key,
				isCondition: isSrdCondition(entry.source, entry.source_key),
			};
		},
		targets() {
			if (this.options.encounter) {
				if (this.targetChoice === "targets") return this.targeted;
				return Object.keys(this.entities).filter((key) => this.entities[key].active && !this.entities[key].down);
			}
			if (this.options.keys?.length > 0) return this.options.keys;
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
				isCondition: isSrdCondition("srd", definition.url),
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
		/**
		 * Key of the acting entity, the default caster: the actor selected out of turn,
		 * else the entity whose turn it is. The Environment acts without a caster.
		 */
		actorEntityKey() {
			if (!this.round) return undefined;
			if (this.actor) {
				return this.actor.key in this.entities ? this.actor.key : undefined;
			}
			return this.turnEntityKey;
		},
		/**
		 * Caster options: the entities in initiative order, then the rest
		 */
		casters() {
			const keys = _.uniq([...(this.turn_order || []), ...Object.keys(this.entities)]).filter(
				(key) => this.entities[key]
			);
			return keys.map((key) => ({
				label: (this.entities[key].name || key).capitalizeEach(),
				value: key,
			}));
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
		if (this.single) {
			await this.loadDefinition(this.single);
		} else if (this.mode !== "conditions" && this.user) {
			this.customEffects = (await this.get_effects()) ? this.$store.getters["effects/effects"] : [];
		}
		this.setEffectSize();
	},
	methods: {
		...mapActions(["apply_effect", "remove_effect", "concentrate_on", "setDrawer"]),
		// The one effect applied: as from the list, then the drawer closes
		async applySingle(application) {
			await this.apply(this.single, application);
			this.setDrawer(false);
		},
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
		 * A caster's active Concentration instance: { key, for }, or undefined
		 */
		casterConcentration(casterKey) {
			const effects = this.entities[casterKey]?.effects || {};
			const key = Object.keys(effects).find(
				(k) => effects[k].source === "srd" && effects[k].source_key === "concentration"
			);
			return key ? { key, for: effects[key].concentration_for } : undefined;
		},
		/**
		 * Carries out a Concentration plan for the caster (concentrationPlan) with the store's
		 * concentrate_on, shared with effects applied from rolls
		 *
		 * @returns {string|undefined} Key of the Concentration to link to, undefined when it failed
		 */
		concentrateOn({ entry, plan, casterKey, duration = {} }) {
			return this.concentrate_on({
				casterKey,
				plan,
				concentrationFor: { source: entry.source, source_key: entry.sourceKey, name: entry.name },
				duration,
				turnKey: this.turnEntityKey,
			});
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
		/**
		 * Applies to every target. The caster is the application's caster_key (the form's
		 * select; undefined for None), or the acting entity without the form.
		 * A Concentration plan is carried out first, so the instances can link to it.
		 */
		async apply(entry, application) {
			const definition = this.definitionOf(entry) || { name: entry.name };
			const { caster_key, concentration: plan, ...rest } = application;
			const casterKey = Object.prototype.hasOwnProperty.call(application, "caster_key")
				? caster_key
				: this.actorEntityKey;
			this.applying = undefined;

			let concentration_id = rest.concentration_id;
			if (casterKey && plan && plan.action !== "none") {
				concentration_id = await this.concentrateOn({
					entry,
					plan,
					casterKey,
					duration: rest.duration,
				});
				// The caster's Concentration couldn't be saved
				if (!concentration_id) return;
			}

			for (const key of this.targets) {
				const instance = buildEffectInstance({
					definition: { ...definition, name: entry.name },
					source: entry.source,
					sourceKey: entry.sourceKey,
					application: { ...rest, concentration_id },
					round: this.round,
					casterKey,
					casterName: this.entities[casterKey]?.name,
					turnKey: this.turnEntityKey,
				});
				this.apply_effect({ key, instance, definition });
			}
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
