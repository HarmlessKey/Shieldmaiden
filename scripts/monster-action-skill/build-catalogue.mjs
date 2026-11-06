// Writes the effect catalogue of the monster-action-parser skill
// (.claude/skills/monster-action-parser/references/effects-catalogue.md) from the SRD effects and
// conditions the HK API serves (/v2/effects/<edition>), so the skill only names urls that exist.
//
// Usage:
//   node scripts/monster-action-skill/build-catalogue.mjs
//
// Options:
//   --api <root>  the API (default VUE_APP_HK_API_ROOT, or https://api.harmlesskey.com)
//   --from <dir>  read <dir>/5e.json and <dir>/5.5e.json (raw API responses) instead
//   --out <file>  write somewhere else
//
// Exits 1 when an edition can't be read; the file is then left as it is.

import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EDITIONS, loadRaw, splitRaw } from "../validate-effects-data/srdData.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, ".claude/skills/monster-action-parser/references/effects-catalogue.md");

// Stat block wording that calls for an effect, for the effects monsters use. Effects listed here
// come first in their section; the others only show their description.
const HINTS = {
	blinded: "has the Blinded condition, is blinded",
	charmed: "has the Charmed condition, is charmed",
	deafened: "has the Deafened condition, is deafened",
	exhaustion: "gains N Exhaustion levels (set `level`)",
	frightened: "has the Frightened condition, becomes frightened",
	grappled: "has the Grappled condition (escape DC N), is grappled (escape DC N)",
	incapacitated: "has the Incapacitated condition, is incapacitated",
	invisible: "has the Invisible condition, turns invisible",
	paralyzed: "has the Paralyzed condition, is paralyzed",
	petrified: "has the Petrified condition, is petrified, turns to stone",
	poisoned: "has the Poisoned condition, is poisoned",
	prone: "has the Prone condition, is knocked prone",
	restrained: "has the Restrained condition, is restrained",
	stunned: "has the Stunned condition, is stunned",
	unconscious: "has the Unconscious condition, falls unconscious",
	"no-healing": "can't regain Hit Points",
	"speed-halved": "its Speed is halved",
	"no-reactions": "can't take Reactions",
	"damage-over-time":
		"takes N (XdY) <Type> damage at the start of each of its turns: choices damage_type and value (the average N)",
	"hit-point-maximum-reduction":
		"its Hit Point maximum decreases by …, when a save decides it (otherwise roll special `drain`): value only when it's a fixed number",
	"ability-score-bonus":
		"its <Ability> score decreases by N: choice ability; value only when it's a fixed number, negative",
	"armor-class-bonus": "adds N to its AC, +N bonus to AC: choice value",
	"speed-bonus": "its Speed increases/decreases by N feet: choice value (negative for a decrease)",
	"attack-roll-bonus": "a bonus or penalty to attack rolls: choice value",
	"saving-throw-bonus": "a bonus or penalty to all saving throws: choice value",
	"advantage-on-attack-rolls": "has Advantage on attack rolls (always on, or for a duration)",
	"disadvantage-on-attack-rolls": "has Disadvantage on attack rolls",
	"attacks-against-have-advantage": "attack rolls against it have Advantage",
	"attacks-against-have-disadvantage": "attack rolls against it have Disadvantage",
	"advantage-on-saving-throws": "has Advantage on <Ability> saving throws: choice ability",
	"disadvantage-on-saving-throws": "has Disadvantage on <Ability> saving throws: choice ability",
	"advantage-on-ability-checks": "has Advantage on <Ability> checks: choice ability",
	"disadvantage-on-ability-checks": "has Disadvantage on <Ability> checks: choice ability",
	"advantage-on-skill-checks": "has Advantage on <Ability> (<Skill>) checks: choice skill",
	"disadvantage-on-skill-checks": "has Disadvantage on <Ability> (<Skill>) checks: choice skill",
	"magic-resistance":
		"trait: Advantage on saving throws against spells and other magical effects",
	"undead-fortitude": "trait: Undead Fortitude",
	evasion: "trait: Evasion",
	absorption:
		"trait: whenever it is subjected to <Type> damage, it takes no damage and regains Hit Points instead: choice damage_type",
	"damage-resistance": "has Resistance to <Type> damage: choice damage_type",
	"damage-vulnerability": "has Vulnerability to <Type> damage: choice damage_type",
	"damage-immunity": "has Immunity to <Type> damage: choice damage_type",
	"damage-reduction": "<Type> damage it takes is reduced by N: choices damage_type and value",
	burning: "has the Burning condition, catches fire and burns (5.5e only)",
	surprised: "is surprised",
};

const argValue = (argv, flag) => {
	const i = argv.indexOf(flag);
	return i >= 0 ? argv[i + 1] : undefined;
};

/**
 * The choice kinds a definition asks for, in order of appearance
 */
function choiceKinds(definition) {
	const kinds = [];
	const walk = (subEffects = []) => {
		for (const sub of subEffects) {
			for (const kind of [].concat(sub.choice || [])) if (!kinds.includes(kind)) kinds.push(kind);
			walk(sub.save?.success_effects);
			walk(sub.save?.fail_by_5_effects);
		}
	};
	walk(definition.sub_effects);
	walk(definition.aura?.sub_effects);
	return kinds;
}

const oneLine = (text = "") => text.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
const short = (text, max = 160) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/**
 * Rows for a list of entries keyed by url: one row per url, with the editions it exists in
 */
function rows(byEdition) {
	const urls = new Map();
	for (const edition of EDITIONS) {
		for (const definition of byEdition[edition]) {
			const row = urls.get(definition.url) || { definition, editions: [] };
			row.editions.push(edition);
			urls.set(definition.url, row);
		}
	}
	return [...urls.entries()].map(([url, { definition, editions }]) => ({
		url,
		name: definition.name,
		editions,
		choices: choiceKinds(definition),
		leveled: !!definition.level,
		hint: HINTS[url],
		description: definition.description || "",
	}));
}

function table(list) {
	const lines = ["| url | name | editions | choices | use for |", "|---|---|---|---|---|"];
	for (const row of list) {
		const choices = [...row.choices, ...(row.leveled ? ["(level)"] : [])].join(", ") || "–";
		const use = row.hint ? oneLine(row.hint) : short(oneLine(row.description));
		lines.push(`| \`${row.url}\` | ${row.name} | ${row.editions.join(", ")} | ${choices} | ${use} |`);
	}
	return lines.join("\n");
}

const byHintOrder = (a, b) => {
	const order = Object.keys(HINTS);
	const ia = order.indexOf(a.url);
	const ib = order.indexOf(b.url);
	if (ia >= 0 && ib >= 0) return ia - ib;
	if (ia >= 0) return -1;
	if (ib >= 0) return 1;
	return a.url.localeCompare(b.url);
};

const args = process.argv.slice(2);
const { source, raw, problems, failed } = await loadRaw(args);
if (failed) {
	for (const problem of problems) console.error(problem);
	process.exit(1);
}
const split = splitRaw(raw);

const perEdition = (kind) => Object.fromEntries(EDITIONS.map((e) => [e, split[e][kind]]));
const conditions = rows(perEdition("conditions")).sort(byHintOrder);
const effects = rows(perEdition("effects"));
const monsterEffects = effects.filter((row) => row.hint).sort(byHintOrder);
const otherEffects = effects.filter((row) => !row.hint).sort(byHintOrder);

const sourceLabel = argValue(args, "--from") ? "saved /v2/effects responses" : source;
const content = `# SRD effect catalogue

Generated by \`scripts/monster-action-skill/build-catalogue.mjs\` from ${sourceLabel}.
Do not edit by hand: re-run the script.

Link an effect with \`{ "source": "srd", "source_key": "<url>", "name": "<name>" }\`. Use only
urls from these tables, and only when the monster's edition is in the **editions** column. When
nothing here matches a mechanic, link nothing: the description keeps it.

**choices**: the choices the effect asks for. Fix a choice in the link's \`choices\` when the
text gives it (\`{ "damage_type": "fire", "value": "10" }\`; a value is a number written as a
string); leave it out when the text doesn't. \`(level)\`: the effect has levels, set the link's
\`level\`.

## Conditions

${table(conditions)}

## Effects monsters use

${table(monsterEffects)}

## Other SRD effects

Spells, class features and plain bonuses. Only link one of these when the description names it
or describes exactly its mechanic.

${table(otherEffects)}
`;

const out = argValue(args, "--out") ? resolve(argValue(args, "--out")) : OUT;
writeFileSync(out, content);
console.log(`Wrote ${out}: ${conditions.length} conditions, ${effects.length} effects`);
