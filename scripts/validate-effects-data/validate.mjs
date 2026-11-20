// Validates the SRD effects and conditions the HK API serves (effects 12): per edition,
// /v2/effects/<edition> with that edition's effects, the generic ones and its conditions.
//
// An edition's set is the effects without `edition` (the API's "generic"), the effects with
// that `edition` and that edition's conditions.
//
// Checks, per entry (in the app's shape, see srdData.mjs):
//   1. every entry validates against src/schemas/hk-effects-schema.json
//   2. no entry carries `key`, `duration_type`, `duration_value` or `cancel_trigger`, nor an
//      origin field (`category`, `spell_level`, `magical`, `tags`, `removed_by`), and no
//      sub-effect carries `scaling` (definitions are generic)
//   3. as served: an effect's `edition` is "generic" or the list's edition, a condition's
//      `edition` is the list's edition
// Checks, per edition set:
//   4. every entry has a `url`, unique within the set
//   5. every `{ source: "srd", source_key }` reference resolves to a `url` in the set
//   6. `includes` references don't form a cycle
//   7. the conditions are exactly the 15 SRD conditions
// And: a generic effect is the same in both editions.
//
// Usage:
//   node scripts/validate-effects-data/validate.mjs
//
// Options:
//   --api <root>  the API (default VUE_APP_HK_API_ROOT, or https://api.harmlesskey.com)
//   --from <dir>  read <dir>/5e.json and <dir>/5.5e.json (raw API responses) instead
//
// Prints one `edition › entry url › problem` line per problem and exits 1 if there are any,
// also when the data can't be read.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { EDITIONS, SRD_CONDITIONS, loadRaw, splitRaw } from "./srdData.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FORBIDDEN = [
	"key",
	"duration_type",
	"duration_value",
	"cancel_trigger",
	"category",
	"spell_level",
	"magical",
	"tags",
	"removed_by",
	// Every effect can be removed by the DM
	"cancelable",
	// The area is the action's or spell's, set on it (effects plan step 6)
	"area",
];
// Sub-effect fields that no longer exist (scaling is set on links to spells, steps 6–7)
const FORBIDDEN_SUB_EFFECT = ["scaling"];

const schema = JSON.parse(readFileSync(join(ROOT, "src/schemas/hk-effects-schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const { source, raw, problems: loadProblems, failed } = await loadRaw(process.argv.slice(2));
if (failed) {
	console.log(loadProblems.join("\n"));
	process.exit(1);
}
const problems = [...loadProblems];
const report = (edition, entry, message) => {
	const label = entry?.url || entry?.name || "(list)";
	problems.push(`${edition} › ${label} › ${message}`);
};

// Every { source: "srd", source_key } object anywhere inside a value
function srdRefs(value, found = []) {
	if (Array.isArray(value)) {
		value.forEach((item) => srdRefs(item, found));
	} else if (value && typeof value === "object") {
		if (value.source === "srd" && typeof value.source_key === "string") found.push(value.source_key);
		Object.values(value).forEach((item) => srdRefs(item, found));
	}
	return found;
}

// Every sub-effect (an object with a string `type` in a list) anywhere inside a value
function subEffects(value, found = []) {
	if (Array.isArray(value)) {
		value.forEach((item) => {
			if (item && typeof item === "object" && typeof item.type === "string") found.push(item);
			subEffects(item, found);
		});
	} else if (value && typeof value === "object") {
		Object.values(value).forEach((item) => subEffects(item, found));
	}
	return found;
}

// source_keys of `includes` sub-effects anywhere inside a value
function includesRefs(value, found = []) {
	if (Array.isArray(value)) {
		value.forEach((item) => includesRefs(item, found));
	} else if (value && typeof value === "object") {
		if (value.type === "includes" && value.effect?.source === "srd") found.push(value.effect.source_key);
		Object.values(value).forEach((item) => includesRefs(item, found));
	}
	return found;
}

// Per entry: schema, forbidden fields
function checkEntry(edition, entry) {
	if (!validate(entry)) {
		for (const error of validate.errors) {
			report(edition, entry, `schema: ${error.instancePath || "/"} ${error.message}`);
		}
	}
	FORBIDDEN.filter((field) => field in entry).forEach((field) => report(edition, entry, `has forbidden field "${field}"`));
	for (const sub_effect of subEffects(entry)) {
		FORBIDDEN_SUB_EFFECT.filter((field) => field in sub_effect).forEach((field) =>
			report(edition, entry, `${sub_effect.type} sub-effect has forbidden field "${field}"`)
		);
	}
}

// The editions as served
for (const edition of EDITIONS) {
	for (const entry of raw[edition]) {
		if (entry.is_condition && entry.edition !== edition) {
			report(edition, entry, `condition has edition "${entry.edition}", expected "${edition}"`);
		}
		if (!entry.is_condition && entry.edition !== "generic" && entry.edition !== edition) {
			report(edition, entry, `effect has edition "${entry.edition}", expected "generic" or "${edition}"`);
		}
	}
}

const lists = splitRaw(raw);

// A generic effect is the same in both editions
const generic = (edition) => new Map(lists[edition].effects.filter((e) => !e.edition).map((e) => [e.url, e]));
const [genericA, genericB] = EDITIONS.map(generic);
for (const [url, entry] of genericA) {
	if (!genericB.has(url)) report(EDITIONS[1], entry, `generic effect missing (it is in ${EDITIONS[0]})`);
	else if (JSON.stringify(entry) !== JSON.stringify(genericB.get(url))) {
		report(EDITIONS[1], entry, `generic effect differs from ${EDITIONS[0]}`);
	}
}
for (const [url, entry] of genericB) {
	if (!genericA.has(url)) report(EDITIONS[0], entry, `generic effect missing (it is in ${EDITIONS[1]})`);
}

for (const edition of EDITIONS) {
	const { conditions, effects } = lists[edition];
	const entries = [...effects, ...conditions];
	entries.forEach((entry) => checkEntry(edition, entry));

	// The 15 SRD conditions
	const conditionUrls = conditions.map((entry) => entry.url);
	SRD_CONDITIONS.filter((url) => !conditionUrls.includes(url)).forEach((url) =>
		report(edition, null, `missing SRD condition "${url}"`)
	);
	conditions
		.filter((entry) => !SRD_CONDITIONS.includes(entry.url))
		.forEach((entry) => report(edition, entry, "not an SRD condition of this edition"));

	// url presence and uniqueness within the edition set
	const byUrl = new Map();
	for (const entry of entries) {
		if (!entry.url) report(edition, entry, "has no url");
		else if (byUrl.has(entry.url)) report(edition, entry, "duplicate url");
		else byUrl.set(entry.url, entry);
	}

	// References resolve in this edition set
	for (const entry of entries) {
		for (const url of srdRefs(entry.sub_effects)) {
			if (!byUrl.has(url)) report(edition, entry, `references missing url "${url}"`);
		}
	}

	// No includes cycles
	const reported = new Set();
	const walk = (url, path) => {
		const node = byUrl.get(url);
		if (!node) return;
		for (const next of includesRefs(node.sub_effects)) {
			if (path.includes(next)) {
				const cycle = [...path.slice(path.indexOf(next)), next].join(" → ");
				if (!reported.has(cycle)) {
					reported.add(cycle);
					report(edition, node, `includes cycle: ${cycle}`);
				}
			} else {
				walk(next, [...path, next]);
			}
		}
	};
	for (const url of byUrl.keys()) walk(url, [url]);
}

if (problems.length) {
	console.log(problems.join("\n"));
	console.log(`\n${problems.length} problem(s) in ${source}`);
	process.exit(1);
}
console.log(`OK: ${EDITIONS.join(", ")} effects and conditions are valid (${source})`);
