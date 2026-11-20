// Monster effect scan for the 5.5e (2024) corpus.
//
// Fetches every monster from the public HK API and regex-scans the `desc` text of all
// action-list fields (actions, bonus_actions, reactions, legendary_actions,
// special_abilities and any other array of { name, desc } entries). Prints markdown
// tables for .planning/monster-actions-effect-scan.md.
//
// Usage:
//   node scripts/monster-effect-scan/scan.mjs               # markdown report
//   node scripts/monster-effect-scan/scan.mjs --hits <key>  # every hit for one category key
//   node scripts/monster-effect-scan/scan.mjs --keys        # list category keys
//
// Options:
//   --api <url>     default https://api.harmlesskey.com/monsters/5.5e
//   --cache <file>  read monsters from this JSON file if it exists, otherwise fetch and write it
//
// Counts are regex-based: read them as "at least this many".

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const argValue = (flag) => {
	const i = args.indexOf(flag);
	return i >= 0 ? args[i + 1] : undefined;
};
const API = argValue("--api") || "https://api.harmlesskey.com/monsters/5.5e";
const HITS = argValue("--hits");
const KEYS = args.includes("--keys");
const CACHE = argValue("--cache");
const CONCURRENCY = 8;

const CONDITIONS = [
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
const COND = CONDITIONS.join("|");

// "has the X condition" is used both to apply a condition and to test for one ("unless it
// has the Incapacitated condition", Pack Tactics). A qualifier in the same clause marks a
// state check.
function isStateCheck(m) {
	const before = m.input.slice(0, m.index).split(/[.:]/).pop();
	return /\b(?:unless|while|if|whenever|doesn't|don't|as long as|without|that|who|any creature)\b[^,;]*$/i.test(before);
}

// Each category: key, section, label and a regex (global, case-insensitive).
// `classify(match)` optionally returns a sub-row label (hits are grouped by it) or null to skip the hit.
const CATEGORIES = [
	// Named conditions
	{
		key: "has_condition:any",
		section: "conditions",
		label: "**any condition**",
		re: new RegExp(`\\b(?:has|have|had|having)\\s+the\\s+(?:${COND})(?:\\s+(?:and|or)\\s+(?:the\\s+)?(?:${COND}))?\\s+conditions?\\b`, "gi"),
		classify: (m) => (isStateCheck(m) ? "**any condition — state check**" : "**any condition — applied**"),
	},
	...CONDITIONS.map((c) => ({
		key: `has_condition:${c}`,
		section: "conditions",
		label: c,
		classify: (m) => (isStateCheck(m) ? null : `${c} (applied)`),
		re: new RegExp(
			`\\b(?:has|have|had|having)\\s+the\\s+(?:(?:${COND})\\s+(?:and|or)\\s+(?:the\\s+)?)?${c}\\s+(?:condition|conditions)\\b|\\b(?:has|have)\\s+the\\s+${c}\\s+(?:and|or)\\s+(?:the\\s+)?(?:${COND})\\s+conditions\\b`,
			"gi"
		),
	})),
	...CONDITIONS.map((c) => ({
		key: `mention:${c}`,
		section: "condition_mentions",
		label: c,
		re: new RegExp(`\\b${c}\\b`, "gi"),
	})),

	// Saving Throw blocks
	{
		key: "save_block",
		section: "saves",
		label: "`<Ability> Saving Throw: DC N`",
		re: /\b(?:strength|dexterity|constitution|intelligence|wisdom|charisma) saving throw: dc \d+/gi,
	},
	{
		key: "save_failure_any",
		section: "saves",
		label: "any `Failure:` (incl. First/Second Failure)",
		re: /\bfailure:/gi,
	},
	{
		key: "save_failure",
		section: "saves",
		label: "`Failure:` (plain)",
		re: /(?<!(?:first|second|third|or)\s)\bfailure:/gi,
	},
	{
		key: "save_success_any",
		section: "saves",
		label: "any `Success:` (incl. Failure or Success)",
		re: /\bsuccess:/gi,
	},
	{
		key: "save_success",
		section: "saves",
		label: "`Success:` (plain)",
		re: /(?<!\bor )\bsuccess:/gi,
	},
	{
		key: "save_failure_or_success",
		section: "saves",
		label: "`Failure or Success:`",
		re: /\bfailure or success:/gi,
	},
	{
		key: "save_success_half",
		section: "saves",
		label: "`Success: Half damage`",
		re: /\bsuccess: half damage/gi,
	},

	// Escalating saves
	{
		key: "escalating_save",
		section: "escalation",
		label: "`First/Second/Third Failure:`",
		re: /\b(first|second|third) failure:/gi,
		classify: (m) => `${m[1].toLowerCase()} failure`,
	},
	{
		key: "escalating_failed_by",
		section: "escalation",
		label: "fails the save by N or more",
		re: /\bfail(?:s|ed)? (?:the|that|this) save by \d+ or more/gi,
	},

	// Escape DCs
	{
		key: "escape_dc",
		section: "escape",
		label: "`escape DC N`",
		re: /\bescape dc \d+/gi,
	},

	// Next-turn duration anchors
	{
		key: "next_turn_anchor",
		section: "anchors",
		label: "until the start/end of <X>'s next turn",
		re: /\buntil the (start|end) of (its|their|your|the [a-z' -]+?'s?) next turn/gi,
		classify: (m) => {
			const who = m[2].toLowerCase();
			const target =
				who === "its" ||
				who === "their" ||
				/^the (target|creature|victim)s?'s?$/.test(who);
			return `${m[1].toLowerCase()} of ${target ? "target" : "owner"}'s next turn`;
		},
	},

	// Repeat-save timing
	{
		key: "repeat_save",
		section: "repeat",
		label: "repeats the save",
		re: /\brepeats? the (?:save|saving throw)[^.]*?\bat the (start|end) of (each of (?:its|their) turns|its next turn|each of the [a-z' -]+?'s turns)/gi,
		classify: (m) =>
			`${m[1].toLowerCase()} of ${/next/.test(m[2]) ? "its next turn" : "each of its turns"}`,
	},
	{
		key: "repeat_save_other",
		section: "repeat",
		label: "repeats the save (other phrasing: \"at which point\", on damage, every 24 hours)",
		re: /\brepeats? the (?:save|saving throw)(?![^.]*?\bat the (?:start|end) of)/gi,
	},

	// Bloodied
	{
		key: "bloodied",
		section: "bloodied",
		label: "Bloodied",
		re: /[^.]*\bbloodied\b[^.]*/gi,
		classify: (m) => {
			const s = m[0].toLowerCase();
			if (/becomes? bloodied|is bloodied for the first time/.test(s)) return "trigger (becomes Bloodied)";
			if (/\b(?:target|creature)(?: that)? (?:is|was) (?:already )?bloodied/.test(s))
				return "target condition (target is Bloodied)";
			if (/\b(?:starts|ends) (?:its|any) turn bloodied/.test(s)) return "self, checked at start/end of turn";
			return "self condition (while / if Bloodied)";
		},
	},

	// Reactions
	{
		key: "trigger_response",
		section: "reactions",
		label: "`Trigger: ... Response: ...`",
		re: /\btrigger:[\s\S]*?\bresponse[:—-]/gi,
	},

	// Nested state
	{
		key: "nested_state",
		section: "nested",
		label: "`While <Condition>, ... has the <Condition> condition`",
		re: new RegExp(`\\bwhile (?:(?:it is|the target is|the creature is)\\s+)?(${COND})\\b[^.]*?\\bha(?:s|ve) the (${COND}) condition`, "gi"),
		classify: (m) => `${m[1].toLowerCase()} → ${m[2].toLowerCase()}`,
	},

	// Mechanical patterns (2014-section equivalents, adapted to 2024 wording)
	...[
		["has_advantage_on (holder or target)", /\bhas advantage on\b/gi],
		["has_disadvantage_on (holder or target)", /\bhas disadvantage on\b/gi],
		["attacks_against_holder_adv_disadv", /\battack rolls against (?:it|them|the [a-z' -]+?) (?:have|has|are made with) (?:advantage|disadvantage)/gi],
		["temp_immunity_granted", /\bimmune to (?:the )?[a-z' -]+?(?:'s)? [a-z' -]+? for (?:the next )?\d+ hours?/gi],
		["regain_hp", /\bregains? (?:\d+ \([^)]*\) |a number of |all (?:of its )?)?hit points/gi],
		["temporary_hit_points", /\btemporary hit points/gi],
		["speed_reduced", /\bspeed (?:is halved|decreases|is reduced|becomes 0|is 0|drops to 0)|\bspeed of 0/gi],
		["cant_take_reactions", /\bcan't take reactions/gi],
		["cant_regain_hp", /\bcan't regain hit points/gi],
		["hp_max_reduced", /\bhit point maximum (?:decreases|is reduced)/gi],
		["ability_score_reduction", /\b(?:strength|dexterity|constitution|intelligence|wisdom|charisma) score (?:decreases|is reduced)/gi],
		["swallowed", /\bswallow(?:s|ed)?\b/gi],
		["pushed", /\bpush(?:es|ed)? (?:the target |it |them )?(?:up to )?\d+ feet/gi],
		["pulled", /\bpull(?:s|ed)? (?:the target |it |them )?(?:up to )?\d+ feet/gi],
		["frightful_presence", /\bfrightful presence/gi],
		["legendary_resistance", /\blegendary resistance/gi],
		["disease", /\bdisease/gi],
		["curse", /\bcurse/gi],
		["lycanthropy", /\blycanthrop/gi],
		["shape_change", /\bshape-?shift|\bpolymorph|\bchange shape/gi],
		["teleport", /\bteleports?\b/gi],
		["ongoing_damage_start_of_turn", /\btakes? \d+ \([^)]*\) [a-z]+ damage at the start of each of (?:its|their) turns/gi],
		["auto_fail_save", /\bautomatically fails?\b/gi],
		["creature_type_exception", /\bcreature other than an? [a-z]+/gi],
		["touch_hit_retaliation", /\b(?:touches|hits) (?:it|the [a-z' -]+?) with a melee attack/gi],
	].map(([key, re]) => ({ key, section: "mechanics", label: key, re, withName: true })),
];

const SECTIONS = [
	["conditions", "Named conditions — \"has the X condition\"", "Condition"],
	["condition_mentions", "Named conditions — any mention", "Condition"],
	["saves", "Saving Throw blocks", "Pattern"],
	["escalation", "Escalating saves", "Pattern"],
	["escape", "Escape DCs", "Pattern"],
	["anchors", "Next-turn duration anchors", "Anchor"],
	["repeat", "Repeat-save timing", "Timing"],
	["bloodied", "Bloodied", "Use"],
	["reactions", "Trigger / Response reactions", "Pattern"],
	["nested", "Nested state", "Outer → inner"],
	["mechanics", "Mechanical patterns (compare with the 2014 section)", "Pattern"],
];

async function getJson(url, attempt = 1) {
	const res = await fetch(url);
	if (!res.ok) {
		if (attempt < 4) return getJson(url, attempt + 1);
		throw new Error(`${res.status} ${res.statusText} for ${url}`);
	}
	return res.json();
}

async function fetchMonsters() {
	const list = await getJson(API);
	const results = list.results || list;
	const monsters = new Array(results.length);
	let next = 0;
	const worker = async () => {
		while (next < results.length) {
			const i = next++;
			monsters[i] = await getJson(`${API}/${results[i].url}`);
		}
	};
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	return { count: list.meta?.count ?? results.length, monsters };
}

function actionFields(monster) {
	return Object.keys(monster).filter(
		(k) =>
			Array.isArray(monster[k]) &&
			monster[k].some((e) => e && typeof e === "object" && typeof e.desc === "string")
	);
}

function scan(monsters) {
	const entries = [];
	const fields = {};
	for (const m of monsters) {
		for (const field of actionFields(m)) {
			for (const e of m[field]) {
				if (!e || typeof e.desc !== "string") continue;
				// The API uses curly apostrophes and the odd non-breaking space.
				const desc = e.desc.replace(/[‘’]/g, "'").replace(/ /g, " ");
				entries.push({ monster: m.name, field, name: e.name, desc });
				fields[field] = (fields[field] || 0) + 1;
			}
		}
	}

	const rows = {}; // key -> Map(rowLabel -> { occ, entries:Set, example, hits:[] })
	for (const cat of CATEGORIES) {
		const byRow = new Map();
		for (const [i, entry] of entries.entries()) {
			// Mechanics also scan the entry name: 2024 stat blocks put "Legendary Resistance" there.
			const text = cat.withName ? `${entry.name}: ${entry.desc}` : entry.desc;
			for (const m of text.matchAll(cat.re)) {
				const rowLabel = cat.classify ? cat.classify(m) : cat.label;
				if (rowLabel === null) continue;
				if (!byRow.has(rowLabel)) byRow.set(rowLabel, { occ: 0, entries: new Set(), example: null, hits: [] });
				const row = byRow.get(rowLabel);
				row.occ++;
				row.entries.add(i);
				row.example = row.example || entry;
				row.hits.push({ entry, match: m[0], before: text.slice(Math.max(0, m.index - 50), m.index) });
			}
		}
		rows[cat.key] = byRow;
	}
	return { entries, fields, rows };
}

const cap = (s) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
const snippet = (s) => (s.length > 90 ? s.slice(0, 87).trimEnd() + "…" : s).replace(/\|/g, "\\|");

function report({ count, monsters }, { entries, fields, rows }) {
	const out = [];
	out.push(`Run date: ${new Date().toISOString().slice(0, 10)}`);
	out.push(`Source: ${API} (${count} monsters listed, ${monsters.length} fetched)`);
	out.push(
		`Action/trait entries scanned: ${entries.length} (${Object.entries(fields)
			.map(([f, n]) => `${f} ${n}`)
			.join(", ")})`
	);
	for (const [section, title, col] of SECTIONS) {
		out.push("", `### ${title}`, "");
		out.push(`| ${col} | Occurrences | Distinct entries | Example (monster / entry) — match |`);
		out.push("|---|---|---|---|");
		for (const cat of CATEGORIES.filter((c) => c.section === section)) {
			const byRow = rows[cat.key];
			if (!byRow.size) {
				out.push(`| ${cat.label} | 0 | 0 | — |`);
				continue;
			}
			const sorted = [...byRow.entries()].sort((a, b) => b[1].occ - a[1].occ);
			for (const [label, r] of sorted) {
				const ex = r.hits[0];
				out.push(
					`| ${label} | ${r.occ} | ${r.entries.size} | ${ex.entry.monster} / ${cap(ex.entry.name)} — "${snippet(ex.match)}" |`
				);
			}
		}
	}
	return out.join("\n");
}

function printHits(key, { rows }) {
	const byRow = rows[key];
	if (!byRow) throw new Error(`Unknown category key "${key}". Use --keys to list them.`);
	for (const [label, r] of byRow) {
		console.log(`## ${label} (${r.occ})`);
		for (const h of r.hits)
			console.log(`- ${h.entry.monster} / ${h.entry.name} [${h.entry.field}]: …${h.before}[${h.match}]`);
	}
}

if (KEYS) {
	console.log(CATEGORIES.map((c) => c.key).join("\n"));
} else {
	let data;
	if (CACHE && existsSync(CACHE)) {
		data = JSON.parse(readFileSync(CACHE, "utf8"));
	} else {
		data = await fetchMonsters();
		if (CACHE) writeFileSync(CACHE, JSON.stringify(data));
	}
	const result = scan(data.monsters);
	if (HITS) printHits(HITS, result);
	else console.log(report(data, result));
}
