/**
 * Encounter reminders (effects 9): which reminders fire, how their triggers read, and the
 * conversion of legacy entity reminders and old personal reminders.
 *
 * A reminder, stored on the encounter (`encounter.reminders/<id>`):
 * {
 *   title, text?, color,
 *   entity_key?,                        // absent: about the encounter
 *   trigger: { type, round?, every?, from?, turn? },  // turn: round triggers, at that turn
 *   repeat: boolean,                    // from the trigger (triggerRepeats)
 *   fired?: true,                       // once reminders after firing
 *   effect?: { source: "srd" | "custom", source_key, name },  // or damage, not both
 *   damage?: { dice_count?, dice_type?, fixed_val?, damage_type? },
 *   variables?: { <name>: <chosen value> },
 *   template_id?                        // the personal reminder it came from
 * }
 */

// Triggers of a reminder about the encounter, and of one about an entity. "in_rounds" (the old
// timer: the start of its turn N rounds from now) is only used by forms and templates; it is
// stored as turn_start in that round (resolveTrigger).
export const ENCOUNTER_TRIGGER_TYPES = Object.freeze(["combat_start", "round_start", "every_rounds"]);
export const ENTITY_TRIGGER_TYPES = Object.freeze(["turn_start", "turn_end", "in_rounds", "defeated"]);

export const REMINDER_TRIGGER_LABELS = Object.freeze({
	combat_start: "When combat starts",
	round_start: "Start of round N",
	every_rounds: "Every N rounds (from round M)",
	turn_start: "Start of its turn",
	turn_end: "End of its turn",
	in_rounds: "Start of its turn in N rounds",
	defeated: "When it's defeated or removed",
});

// Old reminder colors were class names; new ones are CSS colors picked from the Shieldmaiden
// palette, as an NPC's color label
export const REMINDER_COLORS = Object.freeze([
	"green-light",
	"yellow-light",
	"orange-light",
	"red-light",
	"purple",
	"blue-light",
]);
const CSS_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9., %]+\))$/;

/**
 * A reminder's color as stored: a CSS color, or an old color name; undefined otherwise
 *
 * @param {string} color
 * @returns {string|undefined}
 */
export function cleanColor(color) {
	if (typeof color !== "string") return undefined;
	const trimmed = color.trim();
	return REMINDER_COLORS.includes(trimmed) || CSS_COLOR.test(trimmed) ? trimmed : undefined;
}

/**
 * The CSS color to show a reminder in: its color, an old color name as its CSS variable, or the
 * default green
 *
 * @param {string} color
 * @returns {string}
 */
export function reminderColor(color) {
	const clean = cleanColor(color);
	if (!clean) return "var(--green-light)";
	return REMINDER_COLORS.includes(clean) ? `var(--${clean})` : clean;
}

// Premade reminders that effects replaced: dropped when converting
const RETIRED_PREMADE = ["concentration", "reaction", "surprised"];

/**
 * Whether a trigger type fits a reminder about the encounter or about an entity
 *
 * @param {string} type
 * @param {boolean} aboutEntity
 * @returns {boolean}
 */
export function triggerFits(type, aboutEntity) {
	return (aboutEntity ? ENTITY_TRIGGER_TYPES : ENCOUNTER_TRIGGER_TYPES).includes(type);
}

/**
 * Whether a trigger comes back: every N rounds, and the start or end of a turn in every round.
 * The others happen once (combat start, round N, a turn in round N, defeated).
 *
 * @param {object} trigger
 * @returns {boolean}
 */
export function triggerRepeats(trigger = {}) {
	if (trigger.type === "every_rounds") return true;
	return ["turn_start", "turn_end"].includes(trigger.type) && !trigger.round;
}

/**
 * A form's or template's trigger as it's stored: "in_rounds" becomes the start of the entity's
 * turn in the round N rounds from now
 *
 * @param {object} trigger { type, round, every, from, rounds }
 * @param {number} round The encounter's current round
 * @returns {object}
 */
export function resolveTrigger(trigger = {}, round) {
	if (trigger.type !== "in_rounds") return { ...trigger };
	const left = Math.max(1, parseInt(trigger.rounds) || 1);
	return { type: "turn_start", round: Math.min(999, (parseInt(round) || 0) + left) };
}

/**
 * The trigger object of an old personal reminder or legacy reminder's trigger name, for the
 * form: startTurn, endTurn, timed (as in_rounds); undefined for damage
 *
 * @param {string} trigger
 * @param {number} rounds
 * @returns {object|undefined}
 */
export function formTrigger(trigger, rounds) {
	if (trigger === "startTurn") return { type: "turn_start" };
	if (trigger === "endTurn") return { type: "turn_end" };
	if (trigger === "timed") return { type: "in_rounds", rounds: Math.max(1, parseInt(rounds) || 1) };
	return undefined;
}

/**
 * The reminders that fire for an event
 *
 * @param {object} reminders { [id]: reminder }
 * @param {object} event { type: "combat_start" | "round_start" | "encounter_turn" | "turn_start" |
 *   "turn_end" | "defeated", round, entityKey, turn (1-based) and turns (in the round) for
 *   encounter_turn }
 * @returns {string[]} Reminder ids, in the order stored
 */
export function remindersToFire(reminders = {}, event = {}) {
	const round = parseInt(event.round);
	return Object.entries(reminders || {})
		.filter(([, reminder]) => {
			if (!reminder?.trigger) return false;
			if (reminder.fired && !reminder.repeat) return false;
			const { type, round: onRound, every, from, turn: atTurn } = reminder.trigger;
			// The encounter's round triggers: this round? (at its start, or at one of its turns)
			const roundMatches = () => {
				if (type === "round_start") return parseInt(onRound) === round;
				if (type === "every_rounds") {
					const step = parseInt(every) || 1;
					const start = parseInt(from) || 1;
					return round >= start && (round - start) % step === 0;
				}
				return false;
			};
			switch (event.type) {
				case "combat_start":
					return type === "combat_start" && !reminder.entity_key;
				case "round_start":
					return !reminder.entity_key && !atTurn && roundMatches();
				case "encounter_turn": {
					// At turn T of the round; a round with fewer turns fires it at its last turn
					if (reminder.entity_key || !atTurn || !roundMatches()) return false;
					const target = Math.min(parseInt(atTurn), parseInt(event.turns) || parseInt(atTurn));
					return parseInt(event.turn) === target;
				}
				case "turn_start":
				case "turn_end":
					return (
						type === event.type &&
						reminder.entity_key === event.entityKey &&
						(!onRound || parseInt(onRound) === round)
					);
				case "defeated":
					return type === "defeated" && reminder.entity_key === event.entityKey;
				default:
					return false;
			}
		})
		.map(([id]) => id);
}

/**
 * A trigger in words: "Start of round 3", "Every 2 rounds from round 1",
 * "Start of the goblin's turn in round 2"
 *
 * @param {object} trigger { type, round, every, from }
 * @param {string} entityName For entity triggers; "its" when left out
 * @returns {string}
 */
export function triggerText(trigger = {}, entityName) {
	const whose = entityName ? `${entityName}'s` : "its";
	const inRound = trigger.round ? ` in round ${trigger.round}` : "";
	const atTurn = trigger.turn ? `, turn ${trigger.turn}` : "";
	switch (trigger.type) {
		case "combat_start":
			return "When combat starts";
		case "round_start":
			return `${trigger.turn ? "Round" : "Start of round"} ${trigger.round || "?"}${atTurn}`;
		case "every_rounds": {
			const every = parseInt(trigger.every) || 1;
			const rounds = every === 1 ? "Every round" : `Every ${every} rounds`;
			const from = parseInt(trigger.from) || 1;
			return `${from > 1 ? `${rounds} from round ${from}` : rounds}${atTurn}`;
		}
		case "turn_start":
			return `Start of ${whose} turn${inRound}`;
		case "turn_end":
			return `End of ${whose} turn${inRound}`;
		case "defeated":
			return entityName ? `When ${entityName} is defeated or removed` : "When defeated or removed";
		default:
			return "No trigger";
	}
}

/**
 * The title of a reminder's prompt: "Goblin: burning", "Round 3: the boss may flee"
 *
 * @param {object} reminder
 * @param {string} entityName The entity's name, for a reminder about an entity
 * @param {number} round The current round, for a reminder about the encounter
 * @returns {string}
 */
export function promptTitle(reminder = {}, entityName, round) {
	const title = fillVariables(reminder.title || "Reminder", reminder.variables);
	if (reminder.entity_key) return `${entityName || "Unknown"}: ${title}`;
	if (reminder.trigger?.type === "combat_start") return `Combat starts: ${title}`;
	const turn = reminder.trigger?.turn ? `, turn ${reminder.trigger.turn}` : "";
	return `Round ${round}${turn}: ${title}`;
}

/**
 * Text with its [variables] filled in (moved from remindersMixin.replaceReminderVariables).
 * Unknown variables stay as they are.
 *
 * @param {string} text
 * @param {object} variables { <name>: <value> }
 * @returns {string}
 */
export function fillVariables(text, variables) {
	if (typeof text !== "string" || !variables) return text;
	return text.replace(/\[(\w+)\]/g, (match, name) =>
		variables[name] !== undefined && variables[name] !== null ? variables[name] : match
	);
}

/**
 * A reminder from the parts every source has: title, text, color, chosen variables
 */
function baseReminder({ title, notify, text, color, selectedVars, variables } = {}) {
	const reminder = { title: String(title || "Reminder").slice(0, 999) };
	const body = text ?? notify;
	if (body) reminder.text = String(body).slice(0, 999);
	if (cleanColor(color)) reminder.color = cleanColor(color);
	const chosen = selectedVars || variables;
	if (chosen && typeof chosen === "object" && Object.keys(chosen).length) {
		reminder.variables = Object.fromEntries(
			Object.entries(chosen).map(([name, value]) => [name, String(value ?? "").slice(0, 100)])
		);
	}
	return reminder;
}

/**
 * The trigger of an old entity reminder or old personal reminder (startTurn, endTurn, timed),
 * for an entity; undefined for "damage" (no matching trigger)
 *
 * @param {string} trigger Old trigger name
 * @param {number} rounds Rounds left, for timed
 * @param {number} round The encounter's current round
 * @returns {object|undefined}
 */
function legacyTrigger(trigger, rounds, round) {
	// The timer's countdown went down once per turn of the entity: it ends N rounds from now
	const form = formTrigger(trigger, rounds);
	return form ? resolveTrigger(form, round) : undefined;
}

/**
 * Converts a legacy entity reminder (entity.reminders/<key>) to a reminder about that entity.
 * "remove on trigger" becomes once, "notify" repeating; a timed one fires once.
 *
 * @param {string} key The legacy reminder's key (premade ones: concentration, reaction, surprised)
 * @param {object} old { title, notify, color, trigger, rounds, action, selectedVars }
 * @param {string} entityKey
 * @param {number} round The encounter's current round
 * @returns {object|undefined} The reminder; undefined when it's dropped (damage, retired premade)
 */
export function convertLegacyReminder(key, old, entityKey, round) {
	if (!old || RETIRED_PREMADE.includes(key)) return undefined;
	const trigger = legacyTrigger(old.trigger, old.rounds, round);
	if (!trigger) return undefined;
	return {
		...baseReminder(old),
		entity_key: entityKey,
		trigger,
		repeat: old.trigger !== "timed" && old.action !== "remove",
	};
}

/**
 * A reminder set from a personal reminder (template). New templates carry a trigger object and
 * repeat; old ones a trigger name and an action, mapped as the legacy reminders are.
 *
 * @param {object} template The personal reminder
 * @param {string} entityKey The entity it's set for; undefined for the encounter
 * @param {number} round The encounter's current round
 * @param {object} variables The chosen variable values
 * @param {string} templateId
 * @returns {object} { reminder } or { needsTrigger: true, reminder } when the DM must pick a trigger
 *   (an old "damage" template, or a trigger that doesn't fit the encounter or an entity)
 */
export function reminderFromTemplate(template = {}, { entityKey, round, variables, templateId } = {}) {
	// A template's `variables` are its option lists; the reminder keeps the chosen values
	const reminder = { ...baseReminder({ ...template, variables: undefined, selectedVars: variables }) };
	if (entityKey) reminder.entity_key = entityKey;
	if (templateId) reminder.template_id = templateId;
	if (!entityKey && cleanDamage(template.damage)) reminder.damage = cleanDamage(template.damage);
	else if (template.effect?.source && template.effect?.source_key) reminder.effect = { ...template.effect };

	let trigger;
	let repeat;
	if (template.trigger && typeof template.trigger === "object") {
		trigger = { ...template.trigger };
		// The trigger decides (triggerRepeats, in cleanReminder)
		repeat = undefined;
	} else {
		trigger = entityKey ? legacyTrigger(template.trigger, template.rounds, round) : undefined;
		repeat = template.trigger !== "timed" && template.action !== "remove";
	}
	if (repeat !== undefined) reminder.repeat = repeat;
	if (!trigger?.type || !triggerFits(trigger.type, !!entityKey)) return { needsTrigger: true, reminder };
	reminder.trigger = resolveTrigger(trigger, round);
	// The trigger decides; an old "remove on trigger" template stays once
	reminder.repeat = triggerRepeats(reminder.trigger) && repeat !== false;
	return { reminder };
}

// Dice a reminder's damage can use
export const REMINDER_DICE = Object.freeze([4, 6, 8, 10, 12, 20, 100]);

/**
 * A reminder's damage as stored: dice (count and type, both or neither), a fixed value and a
 * damage type; undefined when it deals nothing
 *
 * @param {object} damage { dice_count, dice_type, fixed_val, damage_type }
 * @returns {object|undefined}
 */
export function cleanDamage(damage) {
	if (!damage || typeof damage !== "object") return undefined;
	const clean = {};
	const count = parseInt(damage.dice_count);
	const type = parseInt(damage.dice_type);
	if (count >= 1 && REMINDER_DICE.includes(type)) {
		clean.dice_count = Math.min(99, count);
		clean.dice_type = type;
	}
	const fixed = parseInt(damage.fixed_val);
	if (Number.isFinite(fixed) && fixed !== 0) clean.fixed_val = Math.max(-999, Math.min(999, fixed));
	if (!clean.dice_count && !(clean.fixed_val > 0)) return undefined;
	if (damage.damage_type) clean.damage_type = String(damage.damage_type).slice(0, 50);
	return clean;
}

/**
 * A reminder's damage in words: "2d6+3 fire damage"
 *
 * @param {object} damage
 * @returns {string}
 */
export function damageText(damage) {
	const clean = cleanDamage(damage);
	if (!clean) return "";
	const dice = clean.dice_count ? `${clean.dice_count}d${clean.dice_type}` : "";
	const fixed = clean.fixed_val ? `${dice && clean.fixed_val > 0 ? "+" : ""}${clean.fixed_val}` : "";
	const type = clean.damage_type ? ` ${clean.damage_type.replace(/_/g, " ")}` : "";
	return `${dice}${fixed}${type} damage`;
}

/**
 * A reminder ready to store: only the fields the database accepts, numbers as numbers
 *
 * @param {object} reminder
 * @returns {object}
 */
export function cleanReminder(reminder = {}) {
	const clean = baseReminder(reminder);
	if (reminder.entity_key) clean.entity_key = String(reminder.entity_key);
	const { type, round, every, from, turn } = reminder.trigger || {};
	clean.trigger = { type };
	// A turn only for the encounter's round triggers
	const atTurn = ["round_start", "every_rounds"].includes(type) ? turn : undefined;
	for (const [field, value] of Object.entries({ round, every, from, turn: atTurn })) {
		const number = parseInt(value);
		if (number >= 1) clean.trigger[field] = Math.min(999, number);
	}
	// The trigger decides; a converted "remove on trigger" turn reminder (repeat false) stays once
	clean.repeat = triggerRepeats(clean.trigger) && reminder.repeat !== false;
	if (reminder.fired) clean.fired = true;
	// An effect or damage, not both: damage wins when both are set. Damage is for the
	// encounter's reminders only; on a creature that's an effect
	const damage = clean.entity_key ? undefined : cleanDamage(reminder.damage);
	if (damage) {
		clean.damage = damage;
	} else if (reminder.effect?.source && reminder.effect?.source_key) {
		clean.effect = {
			source: reminder.effect.source,
			source_key: String(reminder.effect.source_key),
			...(reminder.effect.name ? { name: String(reminder.effect.name).slice(0, 200) } : {}),
		};
	}
	if (reminder.template_id) clean.template_id = String(reminder.template_id);
	return clean;
}
