// Validates the SRD effect and condition data files of both editions.
//
// Checks, per edition:
//   1. every entry validates against src/schemas/hk-effects-schema.json
//   2. no entry carries `key`, `duration_type`, `duration_value` or `cancel_trigger`
//   3. every entry has a `url`, unique across effects.js and conditions.js
//   4. every `{ source: "srd", source_key }` reference resolves to a `url` in the same edition
//   5. `includes` references don't form a cycle
//   6. conditions.js holds exactly the 15 SRD conditions
//
// Usage:
//   node scripts/validate-effects-data/validate.mjs
//
// Options:
//   --data <dir>  data root holding 5e/ and 5.5e/ (default src/data)
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
const FILES = ["effects.js", "conditions.js"];
const FORBIDDEN = ["key", "duration_type", "duration_value", "cancel_trigger"];
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

for (const edition of EDITIONS) {
	const entries = []; // { file, entry }

	for (const name of FILES) {
		const file = join(DATA, edition, name);
		let list;
		try {
			// Imported from a data: URL: the package has no "type": "module", and importing the
			// .js file directly makes Node warn about reparsing it as ESM
			const source = readFileSync(file, "utf8");
			list = (await import(`data:text/javascript,${encodeURIComponent(source)}`)).default;
		} catch (error) {
			report(file, null, `can't import: ${error.message}`);
			continue;
		}
		if (!Array.isArray(list)) {
			report(file, null, "default export is not an array");
			continue;
		}
		list.forEach((entry) => entries.push({ file, entry }));

		if (name === "conditions.js") {
			const urls = list.map((entry) => entry.url);
			SRD_CONDITIONS.filter((url) => !urls.includes(url)).forEach((url) =>
				report(file, null, `missing SRD condition "${url}"`)
			);
			list
				.filter((entry) => !SRD_CONDITIONS.includes(entry.url))
				.forEach((entry) => report(file, entry, "not an SRD condition of this edition"));
		}
	}

	// Schema, forbidden fields, url presence and uniqueness
	const byUrl = new Map();
	for (const { file, entry } of entries) {
		if (!validate(entry)) {
			for (const error of validate.errors) {
				report(file, entry, `schema: ${error.instancePath || "/"} ${error.message}`);
			}
		}
		FORBIDDEN.filter((field) => field in entry).forEach((field) =>
			report(file, entry, `has forbidden field "${field}"`)
		);
		if (!entry.url) {
			report(file, entry, "has no url");
		} else if (byUrl.has(entry.url)) {
			report(file, entry, `duplicate url, also in ${relative(ROOT, byUrl.get(entry.url).file)}`);
		} else {
			byUrl.set(entry.url, { file, entry });
		}
	}

	// References resolve in this edition
	for (const { file, entry } of entries) {
		for (const url of srdRefs(entry.sub_effects)) {
			if (!byUrl.has(url)) report(file, entry, `references missing url "${url}"`);
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
