<template>
	<span @click="downloadContent()">
		<slot name="button">
			<button class="btn btn-sm btn-clear white">
				<i aria-hidden="true" class="fas fa-arrow-alt-down"></i>
				<q-tooltip anchor="top middle" self="bottom middle"> Export {{ content_type }} </q-tooltip>
			</button>
		</slot>
	</span>
</template>

<script>
import campaigns from "src/store/modules/userContent/campaigns";
import { mapGetters, mapActions } from "vuex";
export default {
	name: "ExportUserContent",

	props: {
		content_type: {
			type: String,
			required: true,
		},
		content_id: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			uid: this.$store.getters.user.uid,
			exportData: {
				campaigns: {},
				encounters: {},
				npcs: {},
				spells: {},
				items: {},
			},
		};
	},
	mounted() {
		console.log("export mounted");
	},

	methods: {
		...mapActions("npcs", ["get_npc"]),
		...mapActions("campaigns", ["get_campaign"]),
		...mapActions("encounters", ["get_encounter", "get_campaign_encounters"]),
		async downloadContent() {
			if (this.content_type === "campaign") {
				await Promise.all([
					this.exportCampaign(this.content_id),
					this.exportCampaignEncounters(this.content_id),
				]);
				console.log("DATA", this.exportData);
			}
		},
		async exportCampaign(campaign_id) {
			await this.get_campaign({ uid: this.uid, id: campaign_id }).then((campaign) => {
				this.addCampaignToExport(campaign_id, campaign);
			});
		},
		async exportCampaignEncounters(campaign_id) {
			await Promise.all([
				this.get_campaign_encounters({
					campaignId: campaign_id,
					finished: false,
				}),
				this.get_campaign_encounters({
					campaignId: campaign_id,
					finished: true,
				}),
			]).then(async ([not_finished, finished]) => {
				// TODO check what goes wrong when encounters not cached in store.
				const encounters = not_finished.concat(finished);
				await Promise.all(
					encounters.map(async (encounter) => {
						await this.exportEncounter(campaign_id, encounter.key);
					})
				);
			});
		},
		async exportEncounter(campaign_id, encounter_id) {
			await this.get_encounter({
				uid: this.uid,
				campaignId: campaign_id,
				id: encounter_id,
			}).then(async (encounter) => {
				this.addEncounterToExport(campaign_id, encounter_id, encounter);
				await Promise.all(
					Object.values(encounter.entities).map(async (entity) => {
						if (entity.entityType === "npc" && entity.npc === "custom") {
							await this.exportNpc(entity.id);
						}
					})
				);
			});
		},
		async exportNpc(npc_id) {
			const npc = await this.get_npc({ uid: this.uid, id: npc_id });
			console.log("npc", npc);
		},
		async exportSpell(spell_id) {},
		addCampaignToExport(campaign_id, campaign) {
			delete campaign.key;
			delete campaign.advancement;
			delete campaign.companions;
			delete campaign.players;
			delete campaign.player_count;
			delete campaign.players;
			delete campaign.timestamp;
			delete campaign.shares;
			// Option to export inventory and currency in future
			delete campaign.inventory;
			delete campaign.currency;
			campaign.harmless_key = campaign.harmless_key ?? campaign_id;

			this.exportData.campaigns[campaign_id] = campaign;
		},

		addEncounterToExport(campaign_id, encounter_id, encounter) {
			const entities = Object.entries(encounter.entities).filter(([_, entity]) => {
				return entity.entityType === "npc";
			});
			encounter.entities = Object.fromEntries(entities);
			encounter.finished = false;
			encounter.round = 0;
			encounter.turn = 0;

			delete encounter.timestamp;

			encounter.harmless_key = encounter.harmless_key ?? encounter_id;

			if (this.exportData.encounters[campaign_id] === undefined) {
				this.exportData.encounters[campaign_id] = {};
			}
			this.exportData.encounters[campaign_id][encounter_id] = encounter;
		},

		addNpcToExport(npc_id, npc) {
			console.log(npc_id, npc);
			delete npc.player_id;
			npc.harmless_key = npc.harmless_key ?? npc_id;
		},
	},
};
</script>

<style lang="scss" scoped></style>
