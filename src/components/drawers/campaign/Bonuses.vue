<template>
	<div class="pb-5">
		<template v-if="player">
			<h2>{{ title }}</h2>

			<dl class="stat-values">
				<dt>Stored</dt>
				<dd>{{ stored }}</dd>
				<dt>With bonuses</dt>
				<dd class="effective">{{ effective }}</dd>
			</dl>

			<h3>Add a bonus</h3>
			<BonusAddForm :stats="[stat]" class="mb-3" @add="add" />

			<template v-if="lines.length">
				<h3>From effects</h3>
				<ul class="effect-lines">
					<li v-for="(line, index) in lines" :key="index" :class="{ 'not-applied': !line.applied }">
						<span class="effect-lines__value">{{ line.applied ? line.text : "" }}</span>
						<span class="truncate">
							{{ line.name }}{{ line.applied ? "" : `: ${line.text} (not applied)` }}
						</span>
					</li>
				</ul>
			</template>

			<h3>Manual bonuses</h3>
			<ManualBonusRows :bonuses="rows" @update="update" @remove="remove" />
		</template>
		<p v-else class="mt-3">This player is no longer in the campaign.</p>
	</div>
</template>

<script>
import BonusAddForm from "src/components/bonuses/BonusAddForm.vue";
import ManualBonusRows from "src/components/bonuses/ManualBonusRows.vue";
import { effectiveStats } from "src/utils/effectFunctions";
import {
	BONUS_LABELS,
	campaignEntities,
	manualBonuses,
	manualBonusTotal,
	withBonus,
	withoutBonus,
} from "src/utils/entityFunctions";

// The effective stats' field of a bonus value
const FIELDS = { ac: "ac", max_hp: "maxHp" };

/**
 * The manual bonuses of one value of a campaign player outside an encounter (effects 8), as the
 * tracker's StatBonuses drawer: its stored and effective value, the effects that change it and
 * its manual bonuses, saved as they change (campaigns/save_campaign_bonuses)
 *
 * data: { campaignId, playerId, stat: "ac" | "max_hp", context: { basePlayers, definitionOf } }
 */
export default {
	name: "CampaignBonuses",
	components: {
		BonusAddForm,
		ManualBonusRows,
	},
	props: ["data"],
	computed: {
		stat() {
			return this.data.stat || "ac";
		},
		field() {
			return FIELDS[this.stat];
		},
		players() {
			const uid = this.$store.getters.user?.uid;
			return this.$store.state.campaigns.cached_campaigns[uid]?.[this.data.campaignId]?.players || {};
		},
		player() {
			return this.players[this.data.playerId];
		},
		entities() {
			return campaignEntities(this.players, this.data.context?.basePlayers);
		},
		entity() {
			return this.entities[this.data.playerId];
		},
		title() {
			return `${this.entity?.name || ""} ${BONUS_LABELS[this.stat] || this.stat} bonuses`.trim();
		},
		stats() {
			if (!this.entity) return { values: {}, modifiers: {} };
			return effectiveStats({
				entity: this.entity,
				holderKey: this.data.playerId,
				entities: this.entities,
				definitionOf: this.data.context?.definitionOf,
			});
		},
		// A transformed player: its transformed value with its manual bonuses
		transformed() {
			return this.player?.transformed?.[this.field] !== undefined;
		},
		stored() {
			if (this.transformed) return parseInt(this.player.transformed[this.field]) || 0;
			return parseInt(this.entity?.[this.field]) || 0;
		},
		effective() {
			if (this.transformed) return this.stored + manualBonusTotal(this.player, this.stat);
			return this.stats.values[this.field] ?? this.stored;
		},
		// The effects' modifiers; the manual bonuses are in their own list
		lines() {
			if (this.transformed) return [];
			return (this.stats.modifiers[this.field] || []).filter((line) => line.bonusId === undefined);
		},
		rows() {
			return Object.entries(manualBonuses(this.player)[this.stat] || {}).map(([id, bonus]) => ({
				id,
				...bonus,
			}));
		},
	},
	methods: {
		save(bonuses) {
			return this.$store.dispatch("campaigns/save_campaign_bonuses", {
				campaignId: this.data.campaignId,
				playerId: this.data.playerId,
				bonuses,
				context: this.data.context,
			});
		},
		add({ amount, label }) {
			this.save(withBonus(this.player, this.stat, { amount, label }));
		},
		update({ bonus, amount, label }) {
			this.save(withBonus(this.player, this.stat, { id: bonus.id, amount, label }));
		},
		remove(bonus) {
			this.save(withoutBonus(this.player, this.stat, bonus.id));
		},
	},
};
</script>

<style lang="scss" scoped>
dl.stat-values {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 5px 15px;
	margin-bottom: 10px;

	dt {
		color: $neutral-2;
	}
	dd {
		margin: 0;

		&.effective {
			font-weight: bold;
		}
	}
}
h3 {
	margin: 10px 0 5px 0;
}
.effect-lines {
	list-style: none;
	padding: 0;
	margin: 0 0 10px 0;

	li {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-bottom: 5px;
		min-width: 0;

		&.not-applied {
			opacity: 0.6;
		}
	}
	&__value {
		min-width: 40px;
		font-weight: bold;
	}
}
</style>
