// Checks that src/utils/effectsConstants.js is in sync with the effects schema, the SRD
// effect data and the database rules.
//
// Checks:
//   1. every enum in src/schemas/hk-effects-schema.json is mapped to a constants export,
//      and the values match both ways (legacy aliases included)
//   2. every effect_types entry only lists known sub-types and sub-effect fields, every
//      sub-effect field is common or used by a type, and every duration type only lists
//      duration fields
//   3. every type / sub-type pair and every type-specific key in the SRD effect and
//      condition data of both editions is allowed by effect_types
//   4. the duration types accepted by the `effects` blocks in firebase-rules.json match
//      $defs/duration.type (skipped with a warning when the rules file is missing)
//
// Usage:
//   node scripts/validate-effects-data/check-constants.mjs
//
// Options:
//   --schema <file>     effects schema (default src/schemas/hk-effects-schema.json)
//   --constants <file>  effects constants (default src/utils/effectsConstants.js)
//   --data <dir>        data root holding 5e/ and 5.5e/ (default src/data)
//   --rules <file>      database rules (default ../firebase_rules/firebase-rules.json)
//
// Prints one `source › subject › problem` line per problem and exits 1 if there are any.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const argValue = (flag) => {
	const i = args.indexOf(flag);
	return i >= 0 ? args[i + 1] : undefined;
};
const SCHEMA = resolve(argValue("--schema") || join(ROOT, "src/schemas/hk-effects-schema.json"));
const CONSTANTS = resolve(argValue("--constants") || join(ROOT, "src/utils/effectsConstants.js"));
const GENERAL = join(ROOT, "src/utils/generalConstants.js");
const DATA = resolve(argValue("--data") || join(ROOT, "src/data"));
const RULES = resolve(argValue("--rules") || join(ROOT, "../firebase_rules/firebase-rules.json"));
const EDITIONS = ["5e", "5.5e"];
const FILES = ["effects.js", "conditions.js"];

// Schema enum pointer → [module, export]. "effects" is effectsConstants.js (keyed objects),
// "general" is generalConstants.js (arrays).
const ENUM_MAP = {
	"#/$defs/ability-select": ["general", "abilities"],
	"#/$defs/damage-type-select": ["general", "damage_types"],
	"#/$defs/creature-type-select": ["general", "creature_types"],
	"#/$defs/size-select": ["effects", "sizes"],
	"#/$defs/attack-type-select": ["effects", "attack_types"],
	"#/$defs/time/properties/unit": ["effects", "time_units"],
	"#/$defs/formula/properties/round": ["effects", "rounding"],
	"#/$defs/effect_ref/properties/source": ["effects", "effect_sources"],
	"#/$defs/trigger": ["effects", "triggers"],
	"#/$defs/trigger_filter/properties/by": ["effects", "trigger_by"],
	"#/$defs/condition_check/properties/subject": ["effects", "condition_subjects"],
	"#/$defs/condition_check/properties/type": ["effects", "condition_check_types"],
	"#/$defs/condition_check/properties/comparator": ["effects", "comparators"],
	"#/$defs/stacking/properties/mode": ["effects", "stacking_modes"],
	"#/$defs/sustain/properties/manual_cost": ["effects", "sustain_costs"],
	"#/$defs/aura/properties/affects": ["effects", "aura_affects"],
	"#/$defs/save_spec/properties/on_success": ["effects", "save_on_success"],
	"#/$defs/escape/properties/by": ["effects", "escape_by"],
	"#/$defs/escape/properties/cost": ["effects", "escape_costs"],
	"#/$defs/duration/properties/type": ["effects", "duration_types"],
	"#/$defs/duration/properties/unit": ["effects", "time_units"],
	"#/$defs/duration/properties/anchor": ["effects", "duration_anchors"],
	"#/$defs/duration/properties/edge": ["effects", "turn_edges"],
	"#/$defs/duration/properties/rest_type": ["effects", "rest_types"],
	"#/$defs/duration/properties/ends_by_action": ["effects", "ends_by_action"],
	"#/$defs/active_instance/properties/source": ["effects", "effect_sources"],
	"#/$defs/active_instance/properties/concentration_for/properties/source": ["effects", "effect_sources"],
	"#/$defs/consume/properties/on": ["effects", "consume_on"],
	"#/$defs/consume/properties/scope": ["effects", "consume_scopes"],
	"#/$defs/sub_effect/properties/type": ["effects", "effect_types"],
	"#/$defs/sub_effect/properties/perspective": ["effects", "perspectives"],
	"#/$defs/sub_effect/properties/choice": ["effects", "choice_kinds"],
	"#/$defs/sub_effect/properties/bypass/items": ["effects", "bypass_sources"],
	"#/$defs/sub_effect/properties/mechanics/items": ["effects", "mechanics"],
	"#/$defs/sub_effect/properties/keep": ["effects", "reroll_keep"],
	"#/$defs/sub_effect/properties/applies_to": ["effects", "roll_floor_applies_to"],
	"#/$defs/sub_effect/properties/stacking": ["effects", "temp_hp_stacking"],
	"#/$defs/sub_effect/properties/exclusive/items": ["effects", "exclusive_actions"],
	"#/$defs/sub_effect/properties/to": ["effects", "transfer_to"],
	"#/$defs/sub_effect/properties/direction": ["effects", "damage_directions"],
	"#/$defs/sub_effect/properties/proficiency_level": ["effects", "proficiency_levels"],
	"#/$defs/sub_effect/properties/frequency": ["effects", "frequencies"],
	"#/$defs/sub_effect/properties/target": ["effects", "targets"],
	"#/$defs/sub_type": ["effects", "effect_subtypes"],
};

// Lists of sub-effects inside a definition
const NESTED_LISTS = ["sub_effects", "success_effects", "fail_by_5_effects", "on_fail", "on_expire"];

const problems = [];
const warnings = [];
const report = (source, subject, message) => {
	problems.push(`${relative(ROOT, source)} › ${subject} › ${message}`);
};

// Imported from a data: URL: the package has no "type": "module", and importing the .js
// file directly makes Node warn about reparsing it as ESM
const importModule = async (file) =>
	import(`data:text/javascript,${encodeURIComponent(readFileSync(file, "utf8"))}`);

const schema = JSON.parse(readFileSync(SCHEMA, "utf8"));
const modules = {
	effects: await importModule(CONSTANTS),
	general: await importModule(GENERAL),
};
const valuesOf = (moduleName, exportName) => {
	const value = modules[moduleName][exportName];
	if (Array.isArray(value)) return value;
	if (value && typeof value === "object") return Object.keys(value);
	return undefined;
};

// 1. Schema enums against constants
const enums = [];
const collectEnums = (value, pointer) => {
	if (Array.isArray(value)) return value.forEach((item, i) => collectEnums(item, `${pointer}/${i}`));
	if (!value || typeof value !== "object") return;
	if (Array.isArray(value.enum)) enums.push({ pointer, values: value.enum });
	for (const [key, item] of Object.entries(value)) {
		if (key !== "enum") collectEnums(item, `${pointer}/${key}`);
	}
};
collectEnums(schema, "#");

for (const { pointer, values } of enums) {
	const mapped = ENUM_MAP[pointer];
	if (!mapped) {
		report(SCHEMA, pointer, "enum is not mapped to a constants export (add it to ENUM_MAP)");
		continue;
	}
	const [moduleName, exportName] = mapped;
	const source = moduleName === "effects" ? CONSTANTS : GENERAL;
	const constants = valuesOf(moduleName, exportName);
	if (!constants) {
		report(source, exportName, `export is missing (mapped from ${pointer})`);
		continue;
	}
	values
		.filter((value) => !constants.includes(value))
		.forEach((value) => report(source, exportName, `no entry for "${value}" (${pointer})`));
	constants
		.filter((value) => !values.includes(value))
		.forEach((value) => report(source, exportName, `"${value}" is not in the schema (${pointer})`));
}
const enumPointers = new Set(enums.map(({ pointer }) => pointer));
Object.keys(ENUM_MAP)
	.filter((pointer) => !enumPointers.has(pointer))
	.forEach((pointer) => report(SCHEMA, pointer, "mapped in ENUM_MAP but not an enum in the schema"));

// 2. Type metadata
const { effect_types = {}, effect_subtypes = {}, duration_types = {}, common_sub_effect_fields = [] } =
	modules.effects;
const subEffectFields = Object.keys(schema.$defs?.sub_effect?.properties || {});
const durationFields = Object.keys(schema.$defs?.duration?.properties || {});
const typeFields = new Set(common_sub_effect_fields);

common_sub_effect_fields
	.filter((field) => !subEffectFields.includes(field))
	.forEach((field) => report(CONSTANTS, "common_sub_effect_fields", `"${field}" is not a sub-effect field`));

for (const [type, entry] of Object.entries(effect_types)) {
	for (const sub_type of entry.sub_types || []) {
		if (!effect_subtypes[sub_type]) report(CONSTANTS, `effect_types.${type}`, `unknown sub-type "${sub_type}"`);
	}
	for (const field of entry.fields || []) {
		typeFields.add(field);
		if (!subEffectFields.includes(field)) {
			report(CONSTANTS, `effect_types.${type}`, `"${field}" is not a sub-effect field`);
		}
	}
	for (const required of (entry.required || []).flat()) {
		if (!(entry.fields || []).includes(required)) {
			report(CONSTANTS, `effect_types.${type}`, `required "${required}" is not in its fields`);
		}
	}
}
subEffectFields
	.filter((field) => !typeFields.has(field))
	.forEach((field) => report(CONSTANTS, "effect_types", `sub-effect field "${field}" is used by no type`));

for (const [type, entry] of Object.entries(duration_types)) {
	for (const field of entry.fields || []) {
		if (!durationFields.includes(field)) {
			report(CONSTANTS, `duration_types.${type}`, `"${field}" is not a duration field`);
		}
	}
}

// 3. SRD data against effect_types
const subEffectsIn = (value, found = []) => {
	if (Array.isArray(value)) value.forEach((item) => subEffectsIn(item, found));
	else if (value && typeof value === "object") {
		for (const [key, item] of Object.entries(value)) {
			if (NESTED_LISTS.includes(key) && Array.isArray(item)) {
				item.filter((s) => s && typeof s === "object").forEach((s) => found.push(s));
			}
			subEffectsIn(item, found);
		}
	}
	return found;
};

for (const edition of EDITIONS) {
	for (const name of FILES) {
		const file = join(DATA, edition, name);
		let list;
		try {
			list = (await importModule(file)).default;
		} catch (error) {
			report(file, "(file)", `can't import: ${error.message}`);
			continue;
		}
		for (const entry of Array.isArray(list) ? list : []) {
			for (const sub_effect of subEffectsIn([entry])) {
				const label = entry.url || entry.name;
				const type = effect_types[sub_effect.type];
				if (!type) {
					report(file, label, `sub-effect type "${sub_effect.type}" has no effect_types entry`);
					continue;
				}
				for (const sub_type of sub_effect.sub_types || []) {
					if (!type.sub_types.includes(sub_type)) {
						report(file, label, `${sub_effect.type} → "${sub_type}" is not allowed by effect_types`);
					}
				}
				for (const key of Object.keys(sub_effect)) {
					if (!common_sub_effect_fields.includes(key) && !type.fields.includes(key)) {
						report(file, label, `${sub_effect.type} uses "${key}", which isn't in its fields`);
					}
				}
			}
		}
	}
}

// 4. Database rules
if (!existsSync(RULES)) {
	warnings.push(`rules file not found (${RULES}), skipped the rules check`);
} else {
	const durationEnum = schema.$defs?.duration?.properties?.type?.enum || [];
	const rules = JSON.parse(readFileSync(RULES, "utf8"));
	let found = 0;
	const walkRules = (value, path, inEffects) => {
		if (!value || typeof value !== "object") return;
		for (const [key, item] of Object.entries(value)) {
			const itemPath = [...path, key];
			if (inEffects && key === "duration" && item?.type?.[".validate"]) {
				found++;
				const where = `${itemPath.join("/")}/type`;
				const match = item.type[".validate"].match(/matches\(\/\^\(([^)]*)\)\$\//);
				if (!match) {
					report(RULES, where, "can't read the duration type regex");
					continue;
				}
				const accepted = match[1].split("|");
				durationEnum
					.filter((type) => !accepted.includes(type))
					.forEach((type) => report(RULES, where, `doesn't accept duration type "${type}"`));
				accepted
					.filter((type) => !durationEnum.includes(type))
					.forEach((type) => report(RULES, where, `accepts "${type}", which isn't in the schema`));
			}
			walkRules(item, itemPath, inEffects || key === "effects");
		}
	};
	walkRules(rules, [], false);
	if (!found) report(RULES, "(file)", "no duration type rules found under an effects key");
}

warnings.forEach((warning) => console.log(`warning: ${warning}`));
if (problems.length) {
	console.log(problems.join("\n"));
	console.log(`\n${problems.length} problem(s)`);
	process.exit(1);
}
console.log("OK: effects constants match the schema, the SRD data and the rules");
