// Validates the SRD effect data (effects.js, shared by both editions) and the condition data
// files of both editions (5e/conditions.js, 5.5e/conditions.js).
//
// An edition's set is the effects without `edition`, the effects with that `edition` and that
// edition's conditions.
//
// Checks, per entry:
//   1. every entry validates against src/schemas/hk-effects-schema.json
//   2. no entry carries `key`, `duration_type`, `duration_value` or `cancel_trigger`, nor an
//      origin field (`category`, `spell_level`, `magical`, `tags`, `removed_by`), and no
//      sub-effect carries `scaling` (definitions are generic)
//   3. `edition` is only on effects, and is "5e" or "5.5e"
// Checks, per edition set:
//   4. every entry has a `url`, unique within the set
//   5. every `{ source: "srd", source_key }` reference resolves to a `url` in the set
//   6. `includes` references don't form a cycle
// And: conditions.js holds exactly the 15 SRD conditions.
//
// Usage:
//   node scripts/validate-effects-data/validate.mjs
//
// Options:
//   --data <dir>  data root holding effects.js, 5e/ and 5.5e/ (default src/data)
//
// Prints one `file › entry url › problem` line per problem and exits 1 if there are any.

import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const argValue = (flag) => {
	const i = args.indexOf(flag);
	return i >= 0 ? args[i + 1] : undefined;
};
const DATA = resolve(argValue("--data") || join(ROOT, "src/data"));
const EDITIONS = ["5e", "5.5e"];
const EFFECTS_FILE = join(DATA, "effects.js");
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
const SRD_CONDITIONS = [
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

const schema = JSON.parse(readFileSync(join(ROOT, "src/schemas/hk-effects-schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const problems = [];
const report = (file, entry, message) => {
	const label = entry?.url || entry?.name || "(file)";
	problems.push(`${relative(ROOT, file)} › ${label} › ${message}`);
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

// Imported from a data: URL: the package has no "type": "module", and importing the .js file
// directly makes Node warn about reparsing it as ESM
async function importList(file) {
	try {
		const source = readFileSync(file, "utf8");
		const module = await import(`data:text/javascript,${encodeURIComponent(source)}`);
		if (!Array.isArray(module.default)) {
			report(file, null, "default export is not an array");
			return { list: [] };
		}
		return { list: module.default };
	} catch (error) {
		report(file, null, `can't import: ${error.message}`);
		return { list: [] };
	}
}

// Per entry: schema, forbidden fields, edition
function checkEntry(file, entry, { isEffect }) {
	if (!validate(entry)) {
		for (const error of validate.errors) {
			report(file, entry, `schema: ${error.instancePath || "/"} ${error.message}`);
		}
	}
	FORBIDDEN.filter((field) => field in entry).forEach((field) => report(file, entry, `has forbidden field "${field}"`));
	for (const sub_effect of subEffects(entry)) {
		FORBIDDEN_SUB_EFFECT.filter((field) => field in sub_effect).forEach((field) =>
			report(file, entry, `${sub_effect.type} sub-effect has forbidden field "${field}"`)
		);
	}
	if ("edition" in entry) {
		if (!isEffect) report(file, entry, "a condition has no edition: its file belongs to one edition");
		else if (!EDITIONS.includes(entry.edition)) report(file, entry, `unknown edition "${entry.edition}"`);
	}
}

const { list: effects } = await importList(EFFECTS_FILE);
effects.forEach((entry) => checkEntry(EFFECTS_FILE, entry, { isEffect: true }));

for (const edition of EDITIONS) {
	const entries = effects
		.filter((entry) => !entry.edition || entry.edition === edition)
		.map((entry) => ({ file: EFFECTS_FILE, entry }));

	const conditionsFile = join(DATA, edition, "conditions.js");
	const { list: conditions } = await importList(conditionsFile);
	conditions.forEach((entry) => {
		checkEntry(conditionsFile, entry, { isEffect: false });
		entries.push({ file: conditionsFile, entry });
	});
	const conditionUrls = conditions.map((entry) => entry.url);
	SRD_CONDITIONS.filter((url) => !conditionUrls.includes(url)).forEach((url) =>
		report(conditionsFile, null, `missing SRD condition "${url}"`)
	);
	conditions
		.filter((entry) => !SRD_CONDITIONS.includes(entry.url))
		.forEach((entry) => report(conditionsFile, entry, "not an SRD condition of this edition"));

	// url presence and uniqueness within the edition set
	const byUrl = new Map();
	for (const { file, entry } of entries) {
		if (!entry.url) {
			report(file, entry, "has no url");
		} else if (byUrl.has(entry.url)) {
			report(file, entry, `[${edition}] duplicate url, also in ${relative(ROOT, byUrl.get(entry.url).file)}`);
		} else {
			byUrl.set(entry.url, { file, entry });
		}
	}

	// References resolve in this edition set
	for (const { file, entry } of entries) {
		for (const url of srdRefs(entry.sub_effects)) {
			if (!byUrl.has(url)) report(file, entry, `[${edition}] references missing url "${url}"`);
		}
	}

	// No includes cycles
	const reported = new Set();
	const walk = (url, path) => {
		const node = byUrl.get(url);
		if (!node) return;
		for (const next of includesRefs(node.entry.sub_effects)) {
			if (path.includes(next)) {
				const cycle = [...path.slice(path.indexOf(next)), next].join(" → ");
				if (!reported.has(cycle)) {
					reported.add(cycle);
					report(node.file, node.entry, `includes cycle: ${cycle}`);
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
	console.log(`\n${problems.length} problem(s)`);
	process.exit(1);
}
console.log(`OK: ${EDITIONS.join(", ")} effects and conditions are valid`);
