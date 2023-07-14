<template>
	<button class="btn" @click="downloadContent()">
		<slot>
			<i aria-hidden="true" class="fas fa-arrow-alt-down"></i>
			<q-tooltip anchor="top middle" self="bottom middle"> Export {{ contentType }} </q-tooltip>
		</slot>
	</button>
</template>

<script>
import { mapActions } from "vuex";
export default {
	name: "ExportUserContent",

	props: {
		contentType: {
			type: String,
			required: true,
		},
		contentId: {
			type: [String, Array],
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
			let filename = "harmlesskey";
			if (this.contentType === "campaign") {
				await Promise.all([
					this.exportCampaign(this.contentId),
					this.exportCampaignEncounters(this.contentId),
				]);
				await this.exportNpcArray([...this.exportQueue.npcs]);
				await this.exportSpellArray([...this.exportQueue.spells]);
				filename = this.exportData.campaigns[this.contentId].name;
			} else if (this.contentType === "npc") {
				const npc_ids = this.inputIsArray() ? this.contentId : [this.contentId];
				await this.exportNpcArray(npc_ids);
				await this.exportSpellArray([...this.exportQueue.spells]);
				filename = this.inputIsArray()
					? "harmless_key_npcs"
					: this.exportData.npcs[this.contentId].name;
			} else if (this.contentType === "spell") {
				const spell_ids = this.inputIsArray() ? this.contentId : [this.contentId];
				await this.exportSpellArray(spell_ids);
				filename = this.inputIsArray()
					? "harmless_key_spells"
					: this.exportData.spells[this.contentId].name;
			}

			this.downloadJson(filename);
		},
		async downloadJson(filename) {
			filename = `${filename}.json`;

			const json = this.cleanExportData();

			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		},
		cleanExportData() {
			return JSON.stringify(
				Object.fromEntries(
					Object.entries(this.exportData).filter(([key, val]) => Object.keys(val).length)
				),
				null,
				2
			);
		},
		inputIsArray() {
			return Array.isArray(this.contentId);
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

				const spell_types = ["caster_spells", "innate_spells"];
				spell_types.map((spell_type) => {
					if (npc[spell_type]) {
						Object.entries(npc[spell_type]).filter(([spell_id, spell]) => {
							if (spell.custom === true) {
								this.exportQueue.spells.add(spell_id);
							}
						});
					}
				});
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
			delete campaign.private;
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
			const entities = Object.entries(encounter.entities)
				.filter(([_, entity]) => {
					return entity.entityType === "npc";
				})
				.map(([entity_id, entity]) => {
					entity.curHp = entity.maxHp;
					entity.initiative = 0;
					delete entity.key;
					delete entity.tempHp;
					delete entity.maxHpMod;
					delete entity.ac_bonus;
					delete entity.reminders;
					delete entity.settings;
					delete entity.surprised;
					delete entity.tempHp;
					delete entity.meters;
					return [entity_id, entity];
				});
			encounter.entities = Object.fromEntries(entities);
			encounter.finished = false;
			encounter.round = 0;
			encounter.turn = 0;

			delete encounter.timestamp;
			delete encounter.loot;

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
		},

		addSpellToExport(spell_id, spell) {
			spell.harmless_key = spell_id;

			this.exportData.spells[spell_id] = spell;
		},
	},
};
</script>

<style lang="scss" scoped></style>
