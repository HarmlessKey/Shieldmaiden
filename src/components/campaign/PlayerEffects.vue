<template>
	<div v-if="entries.length" class="player-effects">
		<Effects
			:entity="{ key: playerId, name: playerName }"
			:effect-entries="entries"
			:caster-of="casterOf"
			:holder-name="playerName"
			:readonly="!editable"
			:effect-drawer-data="drawerData"
			effects
		/>
	</div>
</template>

<script>
import Effects from "src/components/combat/entities/effects";
import { findSrdDefinition } from "src/utils/effectFunctions";
import { default_edition } from "src/utils/generalConstants";

/**
 * A campaign player's effects outside an encounter (effects 8): its chips. For the DM, a chip
 * opens the effect's drawer (ActiveEffect in campaign mode) with its details and Remove.
 */
export default {
	name: "PlayerEffects",
	components: {
		Effects,
	},
	props: {
		campaignId: { type: String, required: true },
		playerId: { type: String, required: true },
		playerName: { type: String, default: undefined },
		// The player's campaign effects { [effectKey]: instance }
		effects: { type: Object, default: () => ({}) },
		// Names of the campaign's players by id, for the caster
		names: { type: Object, default: () => ({}) },
		edition: { type: String, default: default_edition },
		// { basePlayers, definitionOf } for the campaign's effect actions (hit points, notices)
		context: { type: Object, default: undefined },
		// The DM can open an effect's drawer
		editable: { type: Boolean, default: false },
	},
	data() {
		return {
			// Custom effect definitions by key; false when not found
			customDefinitions: {},
		};
	},
	computed: {
		entries() {
			return Object.entries(this.effects || {})
				.filter(([, instance]) => instance && instance.source)
				.map(([key, instance]) => ({ key, instance, definition: this.definitionOf(instance) }));
		},
	},
	watch: {
		effects: {
			immediate: true,
			handler() {
				this.loadCustomDefinitions();
			},
		},
	},
	methods: {
		definitionOf(instance) {
			if (instance.source === "srd") {
				const other = this.edition === "5e" ? "5.5e" : "5e";
				return (
					findSrdDefinition(this.edition, instance.source_key) || findSrdDefinition(other, instance.source_key)
				);
			}
			return this.customDefinitions[instance.source_key] || undefined;
		},
		async loadCustomDefinitions() {
			const uid = this.$store.getters.user?.uid;
			if (!uid) return;
			for (const instance of Object.values(this.effects || {})) {
				const id = instance?.source === "custom" ? instance.source_key : undefined;
				if (!id || id in this.customDefinitions) continue;
				this.$set(this.customDefinitions, id, false);
				try {
					const definition = await this.$store.dispatch("effects/get_effect", { uid, id });
					this.$set(this.customDefinitions, id, definition || false);
				} catch (error) {
					console.error(error);
				}
			}
		},
		casterOf(instance) {
			const name = this.names[instance.caster_key] || instance.caster_name;
			return name ? { name, label: name } : undefined;
		},
		/**
		 * The ActiveEffect drawer's data for a chip: the player's campaign effect
		 */
		drawerData(effect) {
			return {
				campaign: {
					campaignId: this.campaignId,
					playerId: this.playerId,
					playerName: this.playerName,
					names: this.names,
					edition: this.edition,
					context: this.context,
				},
				effectKey: effect.effectKey,
			};
		},
	},
};
</script>

<style lang="scss" scoped>
.player-effects {
	flex-shrink: 0;
	display: flex;
	align-items: center;
}
</style>
