import { mapActions } from "vuex";
import { showNotices } from "src/utils/generalFunctions";

/**
 * Applying an effect to a campaign player outside an encounter, as the campaign Effects
 * drawer does (effects 12, moved from drawers/campaign/Effects.vue for the bonus drawers):
 * the caster player's Concentration, and applying with the immunity notice and the notices
 * the tracker would prompt for.
 */
export const applyCampaignEffectMixin = {
	methods: {
		...mapActions("campaigns", ["apply_campaign_effect"]),
		/**
		 * Caster options: the campaign's players by name
		 *
		 * @param {object} campaign The campaign with its players' campaign data
		 * @param {object} basePlayers The players' own data by id
		 * @returns {{ label: string, value: string }[]}
		 */
		campaignCasters(campaign, basePlayers = {}) {
			return Object.keys(campaign?.players || {})
				.filter((id) => basePlayers[id])
				.map((id) => ({ label: basePlayers[id].character_name, value: id }));
		},
		/**
		 * The caster player's Concentration { key, for }, or undefined
		 *
		 * @param {object} campaign The campaign with its players' campaign data
		 * @param {string} casterKey A player id
		 */
		campaignCasterConcentration(campaign, casterKey) {
			const effects = campaign?.players?.[casterKey]?.effects || {};
			const key = Object.keys(effects).find(
				(k) => effects[k].source === "srd" && effects[k].source_key === "concentration"
			);
			return key ? { key, for: effects[key].concentration_for } : undefined;
		},
		/**
		 * Applies an effect to a campaign player (campaigns/apply_campaign_effect)
		 *
		 * @param {string} campaignId
		 * @param {string} playerId
		 * @param {string} playerName For the immunity notice
		 * @param {string[]} immunities The player's condition immunities
		 * @param {object} entry { source, sourceKey, name }
		 * @param {object} definition The effect's definition
		 * @param {object} application The apply form's application
		 * @param {string} casterName The caster player's name, if any
		 * @param {object} context { basePlayers, definitionOf } from the screen
		 */
		async applyCampaignEffectTo({
			campaignId,
			playerId,
			playerName,
			immunities = [],
			entry,
			definition,
			application,
			casterName,
			context,
		}) {
			const casterKey = application.caster_key;
			const result = await this.apply_campaign_effect({
				campaignId,
				playerId,
				immunities,
				entry,
				definition: definition || { name: entry.name },
				application,
				casterKey,
				casterName: casterKey ? casterName : undefined,
				context,
			});
			if (result?.immune) {
				this.$q.notify({
					message: `${playerName} is immune to ${entry.name}`,
					color: "warning",
					position: "top",
					timeout: 2500,
				});
			}
			showNotices(this.$q, result?.notices);
		},
	},
};
