/**
 * Rule registry for the validation plugin.
 *
 * This mirrors the vee-validate 3 `extend()` contract that src/boot/vee-validate.js
 * is written against, so the rule definitions in that file did not have to change:
 *
 *   extend(name, { validate, params?, message? })
 *
 * - `validate(value, params)` may return a boolean or a Promise of one.
 * - When the rule declares `params: ["a", "b"]`, `params` is an object keyed by those
 *   names. When it declares none, `params` is the raw argument array, which is what
 *   rules like `variable_check` expect.
 * - `message` is a string with `{_field_}` / `{paramName}` placeholders, or a function
 *   `(field, params) => string`.
 */

const registry = Object.create(null);

export function extend(name, definition) {
	const next = typeof definition === "function" ? { validate: definition } : { ...definition };
	// Merging lets a caller override only the message of a built-in rule:
	//   extend("required", { message: "{_field_} is required" })
	registry[name] = { ...registry[name], ...next };
}

export function getRule(name) {
	return registry[name];
}

/**
 * Normalise the `rules` prop into [{ name, args }].
 *
 * Accepts the string form ("required|max:30|between:1,20") and the object form
 * ({ required: true, max: 30, between: [1, 20], variable_check: [vars] }).
 */
export function parseRules(rules) {
	// An array here is a Quasar `rules` prop (an array of validator functions), not a
	// vee-validate rule set — those are handled by the Quasar component itself.
	if (!rules || Array.isArray(rules)) return [];

	if (typeof rules === "string") {
		return rules
			.split("|")
			.map((part) => part.trim())
			.filter(Boolean)
			.map((part) => {
				const [name, rawArgs] = part.split(":");
				return { name, args: rawArgs === undefined ? [] : rawArgs.split(",") };
			});
	}

	return Object.keys(rules)
		.filter((name) => rules[name] !== false && rules[name] !== undefined && rules[name] !== null)
		.map((name) => {
			const value = rules[name];
			if (value === true) return { name, args: [] };
			return { name, args: Array.isArray(value) ? value : [value] };
		});
}

function buildParams(rule, args) {
	if (!rule.params) return args;
	const params = {};
	rule.params.forEach((key, index) => {
		params[key] = args[index];
	});
	return params;
}

function interpolate(message, fieldName, rule, args) {
	if (typeof message === "function") {
		return message(fieldName, buildParams(rule, args));
	}
	let result = String(message).replace(/\{_field_\}/g, fieldName);
	if (rule.params) {
		rule.params.forEach((key, index) => {
			result = result.replace(new RegExp(`\\{${key}\\}`, "g"), args[index]);
		});
	}
	return result;
}

/**
 * Run every rule against `value`. Resolves with an array of messages — empty when valid.
 * `resolveTarget(name)` gives cross-field rules (confirmed) access to sibling values.
 */
export async function runRules(value, rules, fieldName, resolveTarget) {
	const messages = [];

	for (const { name, args } of rules) {
		const rule = registry[name];
		if (!rule) {
			// Unknown rule names are a bug in the template; surface it rather than
			// silently passing validation.
			console.warn(`[validation] no such rule: "${name}"`);
			continue;
		}

		const params = buildParams(rule, args);
		const passed = await rule.validate(value, params, { field: fieldName, resolveTarget });

		if (!passed) {
			messages.push(
				interpolate(rule.message || `{_field_} is not valid`, fieldName, rule, args)
			);
		}
	}

	return messages;
}

function isEmpty(value) {
	return (
		value === null ||
		value === undefined ||
		value === "" ||
		(Array.isArray(value) && value.length === 0)
	);
}

// Rules that vee-validate 3 shipped in "vee-validate/dist/rules" and that this app
// used. src/boot/vee-validate.js re-extends most of them to override the message.
extend("required", {
	validate: (value) => !isEmpty(value) && value !== false,
	message: "{_field_} is required",
});

extend("max", {
	params: ["length"],
	validate: (value, { length }) => isEmpty(value) || String(value).length <= Number(length),
	message: "{_field_} may not be greater than {length} characters",
});

extend("min", {
	params: ["length"],
	validate: (value, { length }) => isEmpty(value) || String(value).length >= Number(length),
	message: "{_field_} must be at least {length} characters",
});

extend("length", {
	params: ["length"],
	validate: (value, { length }) => isEmpty(value) || String(value).length === Number(length),
	message: "{_field_} must be {length} characters",
});

extend("max_value", {
	params: ["max"],
	validate: (value, { max }) => isEmpty(value) || Number(value) <= Number(max),
	message: "{_field_} must be {max} or less",
});

extend("min_value", {
	params: ["min"],
	validate: (value, { min }) => isEmpty(value) || Number(value) >= Number(min),
	message: "{_field_} must be {min} or more",
});

extend("numeric", {
	validate: (value) => isEmpty(value) || /^[0-9]+$/.test(String(value)),
	message: "{_field_} may only contain numeric characters",
});

extend("alpha_num", {
	validate: (value) => isEmpty(value) || /^[0-9A-Z]*$/i.test(String(value)),
	message: "{_field_} may only contain alpha-numeric characters",
});

extend("alpha_dash", {
	validate: (value) => isEmpty(value) || /^[0-9A-Z_-]*$/i.test(String(value)),
	message: "{_field_} may contain alpha-numeric characters as well as dashes and underscores",
});

extend("email", {
	validate: (value) =>
		isEmpty(value) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim()),
	message: "{_field_} must be a valid email",
});

extend("confirmed", {
	params: ["target"],
	validate: (value, { target }, ctx) =>
		ctx && ctx.resolveTarget ? value === ctx.resolveTarget(target) : false,
	message: "{_field_} confirmation does not match",
});
