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
			exportQueue: {
				npcs: new Set(),
				spells: new Set(),
			},
		};
	},
	mounted() {
		console.log("export mounted");
	},

	methods: {
		...mapActions("npcs", ["get_npc"]),
		...mapActions("spells", ["get_spell"]),
		...mapActions("campaigns", ["get_campaign"]),
		...mapActions("encounters", ["get_encounter", "get_campaign_encounters"]),
		async downloadContent() {
			if (this.content_type === "campaign") {
				await Promise.all([
					this.exportCampaign(this.content_id),
					this.exportCampaignEncounters(this.content_id),
				]);
				await this.exportNpcArray([...this.exportQueue.npcs]);
				await this.exportSpellArray([...this.exportQueue.spells]);

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
							this.exportQueue.npcs.add(entity.id);
						}
					})
				);
			});
		},
		async exportNpcArray(npc_id_array) {
			await Promise.all(
				npc_id_array.map(async (npc_id) => {
					await this.exportNpc(npc_id);
				})
			);
		},
		async exportNpc(npc_id) {
			await this.get_npc({ uid: this.uid, id: npc_id }).then(async (npc) => {
				this.addNpcToExport(npc_id, npc);

				let spells = [];
				if (npc.caster_spells) {
					spells.concat(Object.entries(npc.caster_spells));
				}
				if (npc.innate_spells) {
					spells.concat(Object.entries(npc.innate_spells));
				}
				await Promise.all(
					spells.map(async (spell_id, spell) => {
						console.log("add spell to Q", spell);
						if (spell.custom) {
							this.exportQueue.spells.add(spell_id);
						}
					})
				);
			});
		},
		async exportSpellArray(spell_id_array) {
			await Promise.all(
				spell_id_array.map(async (spell_id) => {
					this.exportSpell(spell_id);
				})
			);
		},
		async exportSpell(spell_id) {
			await this.get_spell({ uid: this.uid, id: spell_id }).then((spell) => {
				this.addSpellToExport(spell_id, spell);
			});
		},
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
			campaign.harmless_key = campaign_id;

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

			encounter.harmless_key = encounter_id;

			if (this.exportData.encounters[campaign_id] === undefined) {
				this.exportData.encounters[campaign_id] = {};
			}
			this.exportData.encounters[campaign_id][encounter_id] = encounter;
		},

		addNpcToExport(npc_id, npc) {
			delete npc.player_id;
			npc.harmless_key = npc_id;

			this.exportData.npcs[npc_id] = npc;
			console.log("custom npc added", npc_id, npc);
		},

		addSpellToExport(spell_id, npc) {
			this.exportData.spells[spell_id] = spell;
			console.log("custom spell added", spell_id, spell);
		},
	},
};
</script>

<style lang="scss" scoped></style>
