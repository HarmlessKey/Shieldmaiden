import { mapGetters, mapActions } from "vuex";

export class ExportUserContent {
	constructor() {
		this.exportData = {
			campaigns: {},
			encounters: {},
			npcs: {},
			spells: {},
			items: {},
		};
	}

	addCampaign(campaign) {
		this.exportData.campaigns.push(campaign);
	}

	addEncounter(encounter) {
		this.exportData.encounters.push(encounter);
	}

	addNpc(npc) {
		this.exportData.npcs.push(npc);
	}

	addSpell(spell) {
		this.exportData.spells.push(spell);
	}

	addItem(item) {
		this.exportData.items.push(item);
	}

	async addCampaignByIds(ids) {
		const user = mapGetters(["user"]).user;
		const actions = mapActions("campaigns", ["get_campaign"]);
		console.log(user);
		console.log(actions.get_campaign());
	}

	async addEncounterByIds(ids) {}

	async addNpcByIds(ids) {}

	async addSpellByIds(ids) {}

	async addItemByIds(ids) {}
}

/**
 * Downloads a JSON file
 *
 * @param {filename} filename
 */
export function downloadJSON(filename) {
	if (filename === undefined) {
		filename = "harmlesskey.json";
	}

	const json = this.exportToJson();
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);

	// var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
	// var downloadAnchorNode = document.createElement("a");
	// downloadAnchorNode.setAttribute("href", dataStr);
	// downloadAnchorNode.setAttribute("download", filename);
	// document.body.appendChild(downloadAnchorNode); // required for firefox
	// downloadAnchorNode.click();
	// downloadAnchorNode.remove();
}

export function exportCampaign(ids) {}

export function exportEncounters(ids) {}

export function exportItems(ids) {}
