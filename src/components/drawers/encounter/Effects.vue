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
			<!-- Search on the name, over every group (effects 12) -->
			<q-input
				v-model="search"
				:dark="$store.getters.theme === 'dark'"
				:placeholder="mode === 'conditions' ? 'Search conditions' : 'Search effects'"
				filled
				square
				dense
				clearable
				class="mb-3"
			>
				<q-icon slot="prepend" name="search" />
			</q-input>
			<p v-if="srdFailed" class="neutral-2">
				The SRD {{ mode === "conditions" ? "conditions" : "effects" }} couldn't be loaded.
			</p>
			<p v-else-if="search && !visibleGroups.length" class="neutral-2">
				No {{ mode === "conditions" ? "conditions" : "effects" }} match.
			</p>
			<!-- A tab per group when there are several -->
			<h3 v-if="visibleGroups.length === 1" class="mb-1">{{ visibleGroups[0].name }}</h3>
			<EffectList
				:groups="visibleGroups"
				:definition-of="definitionOf"
				:load-definition="loadDefinition"
				:edition="edition"
				:conditions="srd.conditions"
				:casters="casters"
				:default-caster="actorEntityKey"
				:caster-concentration="casterConcentration"
				:default-level="defaultExhaustionLevel"
				:exhaustion-level="exhaustionLevel"
				:presence="presence"
				class="mb-3"
				@apply="apply"
				@remove="remove"
			/>
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
import EffectList from "src/components/drawers/encounter/effects/EffectList.vue";
import {
	getSrdDefinitions,
	isSrdCondition,
	matchesName,
	withCustomComingSoon,
} from "src/utils/effectFunctions.js";
import { custom_effects_released } from "src/utils/generalConstants";
import { applyEffectMixin } from "src/mixins/applyEffect.js";

export default {
	name: "EffectsDrawer",
	mixins: [applyEffectMixin],
	components: {
		BasicEntity,
		Effects,
		EffectDetails,
		ApplyEffect,
		EffectList,
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
			// The one effect's definition loading
			loading: undefined,
			customEffects: [],
			// Full custom definitions by id, false when it couldn't be loaded
			customDefinitions: {},
			// One effect for the encounter: "everyone" in combat or the current "targets"
			targetChoice: "everyone",
			search: "",
		};
	},
	computed: {
		...mapGetters(["targeted", "edition", "user"]),
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
		// The SRD definitions come from the API (effects 12)
		srdFailed() {
			return this.$store.getters["api_effects/srd_failed"](this.edition);
		},
		// The groups with the entries that match the search, without empty groups
		visibleGroups() {
			const groups = this.groups
				.map((group) => ({ ...group, entries: group.entries.filter(({ name }) => matchesName(name, this.search)) }))
				.filter((group) => group.entries.length);
			// Signed-in users see that custom effects are coming soon, not in conditions mode
			return this.mode !== "conditions" && this.user ? withCustomComingSoon(groups) : groups;
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
					name: "Custom",
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
		} else if (this.mode !== "conditions" && this.user && custom_effects_released) {
			this.customEffects = (await this.get_effects()) ? this.$store.getters["effects/effects"] : [];
		}
		this.setEffectSize();
	},
	methods: {
		...mapActions(["remove_effect", "setDrawer"]),
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
		/**
		 * Applies to every target (applyEffectMixin): with the form's caster, or the acting entity
		 * without the form
		 */
		async apply(entry, application) {
			const definition = this.definitionOf(entry) || { name: entry.name };
			await this.applyEffectTo({ entry, definition, application, keys: this.targets });
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
