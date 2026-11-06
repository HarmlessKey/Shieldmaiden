<template>
	<div class="pb-5">
		<h2>Set Effects</h2>
		<p class="neutral-2">
			{{ playerName }} · outside an encounter. Effects are kept on the campaign and carry into the
			next encounter.
		</p>
		<PlayerEffects
			class="mb-2"
			:campaign-id="campaignId"
			:player-id="playerId"
			:player-name="playerName"
			:effects="playerEffects"
			:names="names"
			:edition="edition"
			:context="data.context"
			editable
		/>
		<hr />
		<!-- Search on the name, over every group (effects 12) -->
		<q-input
			v-model="search"
			:dark="$store.getters.theme === 'dark'"
			placeholder="Search effects"
			filled
			square
			dense
			clearable
			class="mb-3"
		>
			<q-icon slot="prepend" name="search" />
		</q-input>
		<p v-if="srdFailed" class="neutral-2">The SRD conditions and effects couldn't be loaded.</p>
		<p v-else-if="search && !visibleGroups.length" class="neutral-2">No effects match.</p>
		<!-- A tab per group when there are several -->
		<h3 v-if="visibleGroups.length === 1" class="mb-1">{{ visibleGroups[0].name }}</h3>
		<EffectList
			:groups="visibleGroups"
			:definition-of="definitionOf"
			:load-definition="loadDefinition"
			:edition="edition"
			:conditions="srd.conditions"
			:casters="casters"
			:caster-concentration="casterConcentration"
			:default-level="defaultExhaustionLevel"
			:exhaustion-level="exhaustionLevel"
			:presence="presence"
			class="mb-3"
			@apply="apply"
			@remove="remove"
		/>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import EffectList from "src/components/drawers/encounter/effects/EffectList.vue";
import PlayerEffects from "src/components/campaign/PlayerEffects.vue";
import {
	getSrdDefinitions,
	isSrdCondition,
	matchesName,
	withCustomComingSoon,
} from "src/utils/effectFunctions";
import { custom_effects_released, default_edition } from "src/utils/generalConstants";
import { showNotices } from "src/utils/generalFunctions";
import { applyCampaignEffectMixin } from "src/mixins/applyCampaignEffect.js";

/**
 * The Effects drawer for one of the campaign's players outside an encounter (effects 8): the
 * encounter drawer's lists, details and apply form, written to the campaign
 * (campaigns/apply_campaign_effect). The casters are the campaign's players.
 *
 * Drawer data: { campaignId, playerId, campaign, players } (campaign: the campaign with its
 * players' campaign data; players: the players' own data)
 */
export default {
	name: "CampaignEffects",
	mixins: [applyCampaignEffectMixin],
	components: {
		EffectList,
		PlayerEffects,
	},
	props: ["data"],
	data() {
		return {
			customEffects: [],
			// Full custom definitions by id, false when it couldn't be loaded
			customDefinitions: {},
			search: "",
		};
	},
	computed: {
		campaignId() {
			return this.data?.campaignId;
		},
		playerId() {
			return this.data?.playerId;
		},
		campaign() {
			return this.data?.campaign || {};
		},
		players() {
			return this.data?.players || {};
		},
		edition() {
			return this.campaign.edition || default_edition;
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
			return withCustomComingSoon(
				this.groups
					.map((group) => ({ ...group, entries: group.entries.filter(({ name }) => matchesName(name, this.search)) }))
					.filter((group) => group.entries.length)
			);
		},
		// Names of the campaign's players by id
		names() {
			return Object.fromEntries(
				Object.keys(this.campaign.players || {})
					.filter((id) => this.players[id])
					.map((id) => [id, this.players[id].character_name])
			);
		},
		playerName() {
			return this.names[this.playerId] || "";
		},
		playerEffects() {
			return this.campaign.players?.[this.playerId]?.effects || {};
		},
		casters() {
			return Object.entries(this.names).map(([value, label]) => ({ label, value }));
		},
		groups() {
			const srdEntry = (definition) => ({
				id: `srd:${definition.url}`,
				source: "srd",
				sourceKey: definition.url,
				name: definition.name,
				isCondition: isSrdCondition("srd", definition.url),
			});
			const groups = [
				{ name: "Conditions", entries: this.srd.conditions.map(srdEntry) },
				{ name: "Effects", entries: this.srd.effects.map(srdEntry) },
			];
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
		exhaustion() {
			return Object.values(this.playerEffects).find(
				(instance) => instance.source === "srd" && instance.source_key === "exhaustion"
			);
		},
		// The player's Exhaustion level, undefined without it
		exhaustionLevel() {
			return this.exhaustion?.level || undefined;
		},
		defaultExhaustionLevel() {
			return Math.min((this.exhaustion?.level || 0) + 1, 6);
		},
	},
	async mounted() {
		if (this.$store.getters.user && custom_effects_released) {
			this.customEffects = (await this.get_effects()) ? this.$store.getters["effects/effects"] : [];
		}
	},
	methods: {
		...mapActions("effects", ["get_effects", "get_effect"]),
		...mapActions("campaigns", ["remove_campaign_effect"]),
		definitionOf(entry) {
			if (entry.source === "srd") {
				return [...this.srd.conditions, ...this.srd.effects].find(
					(definition) => definition.url === entry.sourceKey
				);
			}
			return this.customDefinitions[entry.sourceKey] || undefined;
		},
		async loadDefinition(entry) {
			if (entry.source !== "custom" || entry.sourceKey in this.customDefinitions) return;
			let definition = false;
			try {
				definition = await this.get_effect({ uid: this.$store.getters.user.uid, id: entry.sourceKey });
			} catch (error) {
				console.error(error);
			}
			this.$set(this.customDefinitions, entry.sourceKey, definition || false);
		},
		effectKeysOf(entry) {
			return Object.keys(this.playerEffects).filter(
				(key) =>
					this.playerEffects[key].source === entry.source &&
					this.playerEffects[key].source_key === entry.sourceKey
			);
		},
		// Whether the player has it, "all" or "none" (EffectList)
		presence(entry) {
			return this.effectKeysOf(entry).length ? "all" : "none";
		},
		// The caster player's Concentration { key, for }, or undefined
		casterConcentration(casterKey) {
			return this.campaignCasterConcentration(this.campaign, casterKey);
		},
		async apply(entry, application) {
			await this.applyCampaignEffectTo({
				campaignId: this.campaignId,
				playerId: this.playerId,
				playerName: this.playerName,
				immunities: this.players[this.playerId]?.condition_immunities || [],
				entry,
				definition: this.definitionOf(entry),
				application,
				casterName: this.names[application.caster_key],
				context: this.data?.context,
			});
		},
		async remove(entry) {
			for (const effectKey of this.effectKeysOf(entry)) {
				this.notify(
					await this.remove_campaign_effect({
						campaignId: this.campaignId,
						playerId: this.playerId,
						effectKey,
						context: this.data?.context,
					})
				);
			}
		},
		/**
		 * What the tracker would prompt for, as notices (effects 8)
		 */
		notify(notices) {
			showNotices(this.$q, notices);
		},
	},
};
</script>

<style lang="scss" scoped>
h3 {
	font-size: 15px;
}
</style>
