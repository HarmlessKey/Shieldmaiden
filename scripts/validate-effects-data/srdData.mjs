// Loads the SRD effects and conditions the HK API serves (effects 12), for validate.mjs and
// check-constants.mjs.
//
// Per edition, /v2/effects/<edition> holds that edition's effects, the generic ones
// (edition "generic") and its conditions (is_condition). They are brought to the app's shape
// as the api_effects store does: without _id and is_condition, without edition on conditions
// and generic effects.
//
// Options of the scripts that use it:
//   --api <root>  the API (default VUE_APP_HK_API_ROOT, or https://api.harmlesskey.com)
//   --from <dir>  read <dir>/5e.json and <dir>/5.5e.json (raw API responses) instead

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const EDITIONS = ["5e", "5.5e"];

export const SRD_CONDITIONS = [
	"blinded",
	"charmed",
	"deafened",
	"exhaustion",
	"frightened",
	"grappled",
	"incapacitated",
	"invisible",
	"paralyzed",
	"petrified",
	"poisoned",
	"prone",
	"restrained",
	"stunned",
	"unconscious",
];

/**
 * A definition in the app's shape
 */
export function normalizeApiDefinition(definition = {}) {
	// eslint-disable-next-line no-unused-vars
	const { _id, is_condition, ...rest } = definition;
	if (is_condition || rest.edition === "generic") delete rest.edition;
	return rest;
}

const argValue = (args, flag) => {
	const i = args.indexOf(flag);
	return i >= 0 ? args[i + 1] : undefined;
};

/**
 * The raw API results per edition, from the API or from files
 *
 * @param {string[]} args The script's arguments
 * @returns {Promise<{ source: string, raw: { [edition]: object[] }, problems: string[], failed: boolean }>}
 *   failed: an edition couldn't be read, so its checks would only repeat that
 */
export async function loadRaw(args) {
	const from = argValue(args, "--from");
	const api = argValue(args, "--api") || process.env.VUE_APP_HK_API_ROOT || "https://api.harmlesskey.com";
	const raw = {};
	const problems = [];
	let failed = false;
	for (const edition of EDITIONS) {
		try {
			let data;
			if (from) {
				data = JSON.parse(readFileSync(join(resolve(from), `${edition}.json`), "utf8"));
			} else {
				const response = await fetch(`${api}/v2/effects/${edition}?limit=500&fields=ALL`);
				if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
				data = await response.json();
			}
			const results = Array.isArray(data?.results) ? data.results : [];
			if (data?.meta?.count !== undefined && data.meta.count !== results.length) {
				problems.push(`${edition} › (list) › ${results.length} of ${data.meta.count} entries returned`);
			}
			raw[edition] = results;
		} catch (error) {
			problems.push(`${edition} › (list) › can't read the SRD effects: ${error.message}`);
			raw[edition] = [];
			failed = true;
		}
	}
	return { source: from ? resolve(from) : `${api}/v2/effects`, raw, problems, failed };
}

/**
 * The SRD definitions per edition in the app's shape
 *
 * @param {{ [edition]: object[] }} raw
 * @returns {{ [edition]: { conditions: object[], effects: object[] } }}
 */
export function splitRaw(raw) {
	return Object.fromEntries(
		EDITIONS.map((edition) => [
			edition,
			{
				conditions: (raw[edition] || []).filter((d) => d.is_condition).map(normalizeApiDefinition),
				effects: (raw[edition] || []).filter((d) => !d.is_condition).map(normalizeApiDefinition),
			},
		])
	);
}
