<template>
	<div v-if="entries.length" class="bonus-effects">
		<h3 class="mb-1">Effects</h3>
		<p v-if="disabled" class="neutral-2 mb-1">{{ disabledMessage }}</p>
		<q-input
			v-if="entries.length > 8"
			v-model="search"
			:dark="$store.getters.theme === 'dark'"
			placeholder="Search effects"
			filled
			square
			dense
			clearable
			class="mb-1"
		>
			<q-icon slot="prepend" name="search" />
		</q-input>
		<p v-if="!visible.length" class="neutral-2">No effects match.</p>
		<!-- The Effects drawer's list (effects 12) -->
		<EffectList
			:groups="groups"
			:definition-of="definitionOf"
			:edition="edition"
			:conditions="srd.conditions"
			:casters="casters"
			:default-caster="defaultCaster"
			:caster-concentration="casterConcentration"
			:preset-choices="presetChoices"
			:disabled="disabled"
			@apply="apply"
		/>
	</div>
</template>

<script>
import EffectList from "src/components/drawers/encounter/effects/EffectList.vue";
import {
	effectChoicesFor,
	effectValues,
	getSrdDefinitions,
	matchesName,
	withCustomComingSoon,
} from "src/utils/effectFunctions";
import { custom_effects_released, default_edition } from "src/utils/generalConstants";

/**
 * The effects that change a bonus drawer's values (effects 12), to apply from it: the SRD
 * effects of the edition (not conditions) and the user's custom effects with a sub-effect on
 * one of the values, in the Effects drawers' list (EffectList). The drawer applies them.
 *
 * @emits apply { entry: { source, sourceKey, name }, definition, application }
 */
export default {
	name: "BonusEffects",
	components: { EffectList },
	props: {
		// The drawer's values, BONUS_VALUES keys
		values: {
			type: Array,
			required: true,
		},
		edition: {
			type: String,
			default: default_edition,
		},
		// Caster options [{ label, value }], "None" is added
		casters: {
			type: Array,
			default: () => [],
		},
		defaultCaster: {
			type: String,
			default: undefined,
		},
		// casterKey => the caster's Concentration { key, for }, or undefined
		casterConcentration: {
			type: Function,
			default: () => undefined,
		},
		// Listed, but can't be applied (Group Health without selected players)
		disabled: {
			type: Boolean,
			default: false,
		},
		disabledMessage: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			search: "",
			// The user's custom effects with their full definitions
			customEffects: [],
		};
	},
	computed: {
		srd() {
			return getSrdDefinitions(this.edition);
		},
		entries() {
			const srd = this.srd.effects.map((definition) => ({
				id: `srd:${definition.url}`,
				source: "srd",
				sourceKey: definition.url,
				name: definition.name,
				isCondition: false,
				definition,
			}));
			return [...srd, ...this.customEffects]
				.filter(({ definition }) => effectValues(definition).some((value) => this.values.includes(value)))
				.sort((a, b) => a.name.localeCompare(b.name));
		},
		visible() {
			return this.entries.filter(({ name }) => matchesName(name, this.search));
		},
		// The SRD and custom effects as tabs, without empty ones
		groups() {
			const groups = [
				{ name: "Effects", entries: this.visible.filter(({ source }) => source === "srd") },
				{ name: "Custom", entries: this.visible.filter(({ source }) => source === "custom") },
			].filter(({ entries }) => entries.length);
			// Signed-in users see that custom effects are coming soon
			return this.$store.getters.user ? withCustomComingSoon(groups) : groups;
		},
	},
	async mounted() {
		await this.loadCustomEffects();
	},
	methods: {
		/**
		 * Loads the full definitions of the user's custom effects, to see what they change
		 */
		async loadCustomEffects() {
			const uid = this.$store.getters.user?.uid;
			if (!uid || !custom_effects_released) return;
			try {
				await this.$store.dispatch("effects/get_effects");
				const list = this.$store.getters["effects/effects"] || [];
				const loaded = await Promise.all(
					list.map(async ({ key }) => {
						const definition = await this.$store.dispatch("effects/get_effect", { uid, id: key });
						return definition
							? {
									id: `custom:${key}`,
									source: "custom",
									sourceKey: key,
									name: definition.name,
									isCondition: false,
									definition,
							  }
							: undefined;
					})
				);
				this.customEffects = loaded.filter(Boolean);
			} catch (error) {
				console.error(error);
			}
		},
		definitionOf(entry) {
			return entry.definition;
		},
		presetChoices(entry) {
			return effectChoicesFor(entry.definition, this.values);
		},
		apply(entry, application) {
			this.$emit("apply", {
				entry: { source: entry.source, sourceKey: entry.sourceKey, name: entry.name },
				definition: entry.definition,
				application,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
// As the Effects drawer's group headings
h3 {
	font-size: 15px;
}
</style>
