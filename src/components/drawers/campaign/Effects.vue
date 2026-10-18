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
							</div>
						</q-item-section>

						<q-item-section avatar>
							<div class="d-flex items-center">
								<button v-if="has(entry)" class="btn btn-sm btn-clear" @click.stop="remove(entry)">
									<i aria-hidden="true" class="fas fa-minus-circle red" />
									<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
								</button>
								<button class="btn btn-sm btn-clear" @click.stop="onApplyClick(entry)">
									<i aria-hidden="true" class="fas fa-plus-circle green" />
									<q-tooltip anchor="top middle" self="center middle">Apply</q-tooltip>
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
						<EffectDetails v-else :definition="definitionOf(entry)" :edition="edition" />
					</div>
				</q-expansion-item>
			</q-list>
		</div>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import ApplyEffect from "src/components/drawers/encounter/effects/ApplyEffect.vue";
import EffectDetails from "src/components/drawers/encounter/effects/EffectDetails.vue";
import PlayerEffects from "src/components/campaign/PlayerEffects.vue";
import { getSrdDefinitions, isSrdCondition } from "src/utils/effectFunctions";
import { default_edition } from "src/utils/generalConstants";
import { showNotices } from "src/utils/generalFunctions";

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
	components: {
		ApplyEffect,
		EffectDetails,
		PlayerEffects,
	},
	props: ["data"],
	data() {
		return {
			expanded: undefined,
			applying: undefined,
			loading: undefined,
			customEffects: [],
			// Full custom definitions by id, false when it couldn't be loaded
			customDefinitions: {},
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
		defaultExhaustionLevel() {
			const exhaustion = Object.values(this.playerEffects).find(
				(instance) => instance.source === "srd" && instance.source_key === "exhaustion"
			);
			return Math.min((exhaustion?.level || 0) + 1, 6);
		},
	},
	async mounted() {
		if (this.$store.getters.user) {
			this.customEffects = (await this.get_effects()) ? this.$store.getters["effects/effects"] : [];
		}
	},
	methods: {
		...mapActions("effects", ["get_effects", "get_effect"]),
		...mapActions("campaigns", ["apply_campaign_effect", "remove_campaign_effect"]),
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
			this.loading = entry.id;
			let definition = false;
			try {
				definition = await this.get_effect({ uid: this.$store.getters.user.uid, id: entry.sourceKey });
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
		async onApplyClick(entry) {
			await this.loadDefinition(entry);
			this.applying = entry.id;
		},
		effectKeysOf(entry) {
			return Object.keys(this.playerEffects).filter(
				(key) =>
					this.playerEffects[key].source === entry.source &&
					this.playerEffects[key].source_key === entry.sourceKey
			);
		},
		has(entry) {
			return this.effectKeysOf(entry).length > 0;
		},
		/**
		 * The caster player's Concentration { key, for }, or undefined
		 */
		casterConcentration(casterKey) {
			const effects = this.campaign.players?.[casterKey]?.effects || {};
			const key = Object.keys(effects).find(
				(k) => effects[k].source === "srd" && effects[k].source_key === "concentration"
			);
			return key ? { key, for: effects[key].concentration_for } : undefined;
		},
		async apply(entry, application) {
			this.applying = undefined;
			const casterKey = application.caster_key;
			const result = await this.apply_campaign_effect({
				campaignId: this.campaignId,
				playerId: this.playerId,
				immunities: this.players[this.playerId]?.condition_immunities || [],
				entry,
				definition: this.definitionOf(entry) || { name: entry.name },
				application,
				casterKey,
				casterName: casterKey ? this.names[casterKey] : undefined,
				context: this.data?.context,
			});
			if (result?.immune) {
				this.$q.notify({
					message: `${this.playerName} is immune to ${entry.name}`,
					color: "warning",
					position: "top",
					timeout: 2500,
				});
			}
			this.notify(result?.notices);
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
.apply-menu {
	width: 300px;
	padding: 0 10px;
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
}
</style>
