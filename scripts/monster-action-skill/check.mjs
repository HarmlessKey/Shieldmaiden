// Checks the monster-action-parser skill's benchmark, or scores a model's answers against it.
//
//   node scripts/monster-action-skill/check.mjs --self
//     Validates the expected answers in benchmark/cases.json and the outputs of the skill's
//     worked examples (references/examples.md), and checks that no benchmark description is
//     quoted anywhere in the skill.
//
//   node scripts/monster-action-skill/check.mjs --results <dir> [--only <ids>] [--verbose]
//     Scores <dir>/<case id>.json (one ability per file, see run.mjs) against the expected
//     answers and writes <dir>/report.json. --only: comma-separated case ids or id prefixes.
//
// An answer passes when it validates against src/schemas/hk-npc-schema.json (with the effects
// schema), passes the semantic checks below and equals the expected answer after normalizing.
// Semantic checks: every link names a url of the skill's catalogue that exists in the case's
// edition, sits under an outcome that fits its entry's type, has a duration (trait effects:
// none, and every choice set), and only fixes choice kinds its effect has; leveled links only
// on leveled effects. Normalizing: the name ignores case, the description whitespace, roll
// mods take their defaults (miss_mod 0, save_fail_mod 0.5), `magical: false` counts as unset,
// and lists whose order doesn't matter (links, escape checks, triggers, specials) are sorted.
//
// Exits 1 when something fails.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SKILL_DIR = join(ROOT, ".claude/skills/monster-action-parser");
const CASES = join(dirname(fileURLToPath(import.meta.url)), "benchmark/cases.json");

const ATTACK_TYPES = ["melee_weapon", "ranged_weapon", "spell_attack"];
const OUTCOMES = {
	on_hit: ATTACK_TYPES,
	on_miss: ATTACK_TYPES,
	on_fail: ["save"],
	on_success: ["save"],
	always: null,
};

const args = process.argv.slice(2);
const argValue = (flag) => {
	const i = args.indexOf(flag);
	return i >= 0 ? args[i + 1] : undefined;
};
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

// ---- Schema ----

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(readJson(join(ROOT, "src/schemas/hk-effects-schema.json")));
const validateNpc = ajv.compile(readJson(join(ROOT, "src/schemas/hk-npc-schema.json")));

/**
 * Schema errors of one ability, validated inside a minimal NPC
 */
function schemaProblems(ability, group) {
	const npc = {
		name: "Benchmark",
		size: "Medium",
		type: "Monstrosity",
		challenge_rating: 1,
		armor_class: 10,
		hit_points: 10,
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,
		[group]: [ability],
	};
	if (validateNpc(npc)) return [];
	return validateNpc.errors.map(
		(e) => `schema: ${e.instancePath.replace("/" + group + "/0", "") || "/"} ${e.message}`
	);
}

// ---- Catalogue (parsed from the skill's generated reference) ----

function loadCatalogue() {
	const text = readFileSync(join(SKILL_DIR, "references/effects-catalogue.md"), "utf8");
	const catalogue = {};
	for (const line of text.split("\n")) {
		const match = line.match(/^\| `([a-z0-9_-]+)` \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
		if (!match) continue;
		const [, url, name, editions, choices] = match;
		catalogue[url] = {
			name: name.trim(),
			editions: editions.split(",").map((e) => e.trim()),
			choices: choices
				.split(",")
				.map((c) => c.trim())
				.filter((c) => c && c !== "–" && c !== "(level)"),
			leveled: choices.includes("(level)"),
		};
	}
	return catalogue;
}
const CATALOGUE = loadCatalogue();

function linkProblems(link, { where, edition, trait }) {
	const problems = [];
	const key = link?.effect?.source_key;
	const definition = CATALOGUE[key];
	if (link?.effect?.source !== "srd") problems.push(`${where}: source must be "srd"`);
	if (!definition) {
		problems.push(`${where}: "${key}" is not in the catalogue`);
		return problems;
	}
	if (!definition.editions.includes(edition)) problems.push(`${where}: "${key}" doesn't exist in ${edition}`);
	if (link.effect.name !== definition.name) problems.push(`${where}: name should be "${definition.name}"`);
	for (const kind of Object.keys(link.choices || {})) {
		if (!definition.choices.includes(kind)) problems.push(`${where}: "${key}" has no ${kind} choice`);
	}
	if (link.level !== undefined && !definition.leveled) problems.push(`${where}: "${key}" has no levels`);
	if (trait) {
		const missing = definition.choices.filter((kind) => link.choices?.[kind] === undefined);
		if (missing.length) problems.push(`${where}: trait effect without its ${missing.join(", ")} choice`);
		if (link.magical) problems.push(`${where}: trait effects aren't magical`);
	} else if (!link.duration) {
		problems.push(`${where}: action link without a duration`);
	}
	return problems;
}

/**
 * Problems the schema doesn't catch
 */
function semanticProblems(ability, { edition }) {
	const problems = [];
	const list = ability?.action_list;
	if (!Array.isArray(list) || list.length === 0) problems.push("action_list: needs at least one entry");
	(list || []).forEach((entry, i) => {
		for (const [outcome, links] of Object.entries(entry?.effects || {})) {
			const types = OUTCOMES[outcome];
			if (types && !types.includes(entry.type)) {
				problems.push(`action_list[${i}].effects.${outcome}: doesn't fit type ${entry.type}`);
			}
			(links || []).forEach((link, j) => {
				problems.push(...linkProblems(link, { where: `action_list[${i}].effects.${outcome}[${j}]`, edition }));
			});
		}
	});
	(ability?.effects || []).forEach((link, j) => {
		problems.push(...linkProblems(link, { where: `effects[${j}]`, edition, trait: true }));
	});
	return problems;
}

// ---- Normalizing and comparing ----

const sortBy = (list, key = (x) => JSON.stringify(x)) =>
	[...list].sort((a, b) => {
		const [ka, kb] = [key(a), key(b)];
		if (ka === kb) return 0;
		return ka < kb ? -1 : 1;
	});

/**
 * Drops undefined, null, empty arrays and empty objects, recursively
 */
function prune(value) {
	if (Array.isArray(value)) {
		const list = value.map(prune).filter((v) => v !== undefined);
		return list.length ? list : undefined;
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value)
			.map(([k, v]) => [k, prune(v)])
			.filter(([, v]) => v !== undefined);
		return entries.length ? Object.fromEntries(entries) : undefined;
	}
	return value === null ? undefined : value;
}

function normalizeDuration(duration) {
	if (!duration || typeof duration !== "object") return duration;
	const d = { ...duration };
	if (d.escape?.checks) d.escape = { ...d.escape, checks: sortBy(d.escape.checks) };
	if (d.save?.triggers) d.save = { ...d.save, triggers: sortBy(d.save.triggers) };
	if (d.cancel_triggers) d.cancel_triggers = sortBy(d.cancel_triggers);
	return d;
}

function normalizeLink(link) {
	if (!link || typeof link !== "object") return link;
	const l = { ...link };
	if (l.effect) l.effect = { ...l.effect, name: String(l.effect.name || "").toLowerCase() };
	if (l.magical === false) delete l.magical;
	if (l.choices) l.choices = Object.fromEntries(Object.entries(l.choices).map(([k, v]) => [k, String(v)]));
	l.duration = normalizeDuration(l.duration);
	return l;
}

const sortLinks = (links) =>
	sortBy((links || []).map(normalizeLink), (l) => `${l?.effect?.source_key}|${JSON.stringify(l)}`);

function normalizeAbility(ability) {
	if (!ability || typeof ability !== "object") return ability;
	const a = { ...ability };
	if (typeof a.name === "string") a.name = a.name.trim().toLowerCase();
	if (typeof a.desc === "string") a.desc = a.desc.replace(/\s+/g, " ").trim();
	if (Array.isArray(a.action_list)) {
		a.action_list = a.action_list.map((entry) => {
			const e = { ...entry };
			if (Array.isArray(e.rolls)) {
				e.rolls = e.rolls.map((roll) => {
					const r = { ...roll };
					if (ATTACK_TYPES.includes(e.type) && r.miss_mod === undefined) r.miss_mod = 0;
					if (e.type === "save" && r.save_fail_mod === undefined) r.save_fail_mod = 0.5;
					if (r.magical === false) delete r.magical;
					if (Array.isArray(r.special)) r.special = sortBy(r.special);
					return r;
				});
			}
			if (e.effects && typeof e.effects === "object") {
				e.effects = Object.fromEntries(
					Object.entries(e.effects).map(([outcome, links]) => [outcome, sortLinks(links)])
				);
			}
			return e;
		});
	}
	if (Array.isArray(a.effects)) a.effects = sortLinks(a.effects);
	return prune(a);
}

/**
 * Leaf paths of a value: { "action_list[0].type": "save", … }
 */
function leaves(value, path = "", out = {}) {
	if (Array.isArray(value)) value.forEach((v, i) => leaves(v, `${path}[${i}]`, out));
	else if (value && typeof value === "object") {
		for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k, out);
	} else out[path] = value;
	return out;
}

function compare(expected, actual) {
	const e = leaves(expected);
	const a = leaves(actual);
	const paths = [...new Set([...Object.keys(e), ...Object.keys(a)])].sort((x, y) => x.localeCompare(y));
	const diffs = paths.filter((p) => e[p] !== a[p]).map((p) => ({ path: p, expected: e[p], actual: a[p] }));
	return { diffs, accuracy: paths.length ? (paths.length - diffs.length) / paths.length : 1 };
}

// ---- Inputs ----

function loadCases() {
	return readJson(CASES).map((c) => ({ ...c, expected: { ...c.expected, desc: c.desc } }));
}

/**
 * The worked examples of references/examples.md: each ```text input and the ```json after it
 */
function loadExamples() {
	const text = readFileSync(join(SKILL_DIR, "references/examples.md"), "utf8");
	const examples = [];
	const pattern = /```text\n([\s\S]*?)```\s*```json\n([\s\S]*?)```/g;
	let match;
	while ((match = pattern.exec(text))) {
		const input = Object.fromEntries(
			match[1]
				.trim()
				.split("\n")
				.map((line) => {
					const i = line.indexOf(":");
					return [line.slice(0, i).trim().toLowerCase(), line.slice(i + 1).trim()];
				})
		);
		examples.push({ input, output: JSON.parse(match[2]) });
	}
	return examples;
}

function skillText() {
	const files = [
		join(SKILL_DIR, "SKILL.md"),
		...readdirSync(join(SKILL_DIR, "references")).map((f) => join(SKILL_DIR, "references", f)),
	];
	return files
		.map((f) => readFileSync(f, "utf8"))
		.join("\n")
		.replace(/\s+/g, " ");
}

const LEAK_WINDOW = 50;
const LEAK_LIMIT = 0.4;

/**
 * How much of a benchmark description the skill quotes: the share of its characters inside a
 * 50-character stretch that also appears in the skill. Stat blocks share boilerplate ("ending
 * the effect on itself on a success"), so some overlap is normal; a quoted description isn't.
 */
function coverage(desc, text) {
	const covered = new Array(desc.length).fill(false);
	if (desc.length <= LEAK_WINDOW) return text.includes(desc) ? 1 : 0;
	for (let i = 0; i + LEAK_WINDOW <= desc.length; i++) {
		if (text.includes(desc.slice(i, i + LEAK_WINDOW))) covered.fill(true, i, i + LEAK_WINDOW);
	}
	return covered.filter(Boolean).length / desc.length;
}

function leaks(cases) {
	const text = skillText();
	const found = [];
	for (const c of cases) {
		const share = coverage(c.desc.replace(/\s+/g, " "), text);
		const pct = Math.round(share * 100);
		if (args.includes("--verbose") && share > 0) console.log(`     ${c.id}: ${pct}% quoted by the skill`);
		if (share > LEAK_LIMIT) found.push(`${c.id}: the skill quotes ${pct}% of its description`);
	}
	return found;
}

// ---- Modes ----

const indented = (lines) => lines.map((line) => `\n       ${line}`).join("");

function selfCheck() {
	let failed = false;
	const cases = loadCases();
	const ids = new Set();
	for (const c of cases) {
		const problems = [...schemaProblems(c.expected, c.group), ...semanticProblems(c.expected, c)];
		if (ids.has(c.id)) problems.push("duplicate id");
		ids.add(c.id);
		if (problems.length) failed = true;
		console.log(`${problems.length ? "FAIL" : "ok  "} case ${c.id}${indented(problems)}`);
	}

	const examples = loadExamples();
	examples.forEach(({ input, output }, i) => {
		const problems = [
			...schemaProblems(output, input.group),
			...semanticProblems(output, { edition: input.edition }),
		];
		if (output.desc !== input.description) problems.push("desc differs from the input description");
		if (problems.length) failed = true;
		console.log(`${problems.length ? "FAIL" : "ok  "} example ${i + 1} (${input.name})${indented(problems)}`);
	});

	const leaked = leaks(cases);
	for (const leak of leaked) console.log(`FAIL leak ${leak}`);
	if (leaked.length) failed = true;

	const counts = `${cases.length} cases, ${examples.length} examples, ${leaked.length} leaks`;
	console.log(`\n${counts}: ${failed ? "FAILED" : "all good"}`);
	return failed;
}

function scoreResults(dir) {
	const verbose = args.includes("--verbose");
	const only = (argValue("--only") || "")
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
	const cases = loadCases().filter((c) => !only.length || only.some((id) => c.id.startsWith(id)));
	const report = [];
	for (const c of cases) {
		const file = join(dir, `${c.id}.json`);
		const row = { id: c.id, tests: c.tests, pass: false, accuracy: 0, problems: [], diffs: [] };
		if (!existsSync(file)) {
			row.problems.push("no answer");
		} else {
			let answer;
			try {
				answer = readJson(file);
			} catch (error) {
				row.problems.push(`not JSON: ${error.message}`);
			}
			if (answer !== undefined) {
				row.problems.push(...schemaProblems(answer, c.group), ...semanticProblems(answer, c));
				const { diffs, accuracy } = compare(normalizeAbility(c.expected), normalizeAbility(answer));
				row.diffs = diffs;
				row.accuracy = accuracy;
				row.pass = !row.problems.length && !diffs.length;
			}
		}
		report.push(row);
		const pct = `${Math.round(row.accuracy * 100)}%`.padStart(4);
		console.log(`${row.pass ? "PASS" : "FAIL"} ${pct} ${c.id}`);
		if (!row.pass) {
			for (const p of row.problems) console.log(`       ${p}`);
			const shown = verbose ? row.diffs : row.diffs.slice(0, 6);
			for (const d of shown) {
				console.log(`       ${d.path}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`);
			}
			if (shown.length < row.diffs.length) {
				console.log(`       … ${row.diffs.length - shown.length} more (--verbose)`);
			}
		}
	}
	const passed = report.filter((r) => r.pass).length;
	const overallAccuracy = report.reduce((sum, r) => sum + r.accuracy, 0) / report.length;
	console.log(`\n${passed}/${report.length} passed, field accuracy ${(overallAccuracy * 100).toFixed(1)}%`);
	writeFileSync(
		join(dir, "report.json"),
		JSON.stringify({ passed, total: report.length, accuracy: overallAccuracy, cases: report }, null, "\t")
	);
	return passed < report.length;
}

if (args.includes("--self")) {
	process.exit(selfCheck() ? 1 : 0);
} else if (argValue("--results")) {
	process.exit(scoreResults(resolve(argValue("--results"))) ? 1 : 0);
} else {
	console.error("Usage: check.mjs --self | --results <dir> [--verbose]");
	process.exit(2);
}
