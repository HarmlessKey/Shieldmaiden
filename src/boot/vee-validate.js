import { Form, Field, ErrorMessage, defineRule, configure } from "vee-validate";
import {
	required,
	length,
	max,
	min,
	max_value,
	min_value,
	alpha_dash,
	numeric,
	alpha_num,
	email,
	confirmed,
	between,
} from "@vee-validate/rules";
import { db } from "src/firebase";

export default async ({ app }) => {
	// Register components globally
	// Use V-prefixed names to avoid conflict with HTML <form> and Quasar components
	app.component("VForm", Form);
	app.component("VField", Field);
	app.component("VErrorMessage", ErrorMessage);

	// Also register under old names for gradual migration
	app.component("ValidationObserver", Form);
	app.component("ValidationProvider", Field);

	// Built-in rules
	defineRule("required", required);
	defineRule("max", max);
	defineRule("max_value", max_value);
	defineRule("min", min);
	defineRule("min_value", min_value);
	defineRule("length", length);
	defineRule("alpha_dash", alpha_dash);
	defineRule("numeric", numeric);
	defineRule("alpha_num", alpha_num);
	defineRule("email", email);
	defineRule("confirmed", confirmed);
	defineRule("between", between);

	// Custom rules

	// Recharge 1, 5-6 or rest
	defineRule("recharge", (value) => {
		if (!value) return "Allowed format: 6, 5-6 or rest";
		return /^[\d]+(-[\d]+)*$/.test(value) || value === "rest" || "Allowed format: 6, 5-6 or rest";
	});

	// Range
	defineRule("range", (value) => {
		if (!value) return "Allowed format: 20 or 20/60";
		return /^[\d]+(\/[\d]+)*$/.test(value) || "Allowed format: 20 or 20/60";
	});

	// Hit dice
	defineRule("hit_dice", (value) => {
		if (!value) return "Allowed format: 2d6";
		return /^[\d]+d[\d]+$/.test(value) || "Allowed format: 2d6";
	});

	// Validate url input
	defineRule("url", (value) => {
		if (!value) return "{field} must be a valid URL";
		const regex =
			/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z\d]+([-.]{1}[a-z\d]+)*\.[a-z]{2,5}(:[\d]{1,5})?(\/.*)?$/;
		return regex.test(value) || "{field} must be a valid URL";
	});

	defineRule("audio", (value) => {
		if (!value) return "{field} must be a valid URL or URI";
		const url_expr =
			/[A-z\d@:%._+~#=-]{1,256}\.[A-z\d()]{1,6}\b([A-z\d()@:%_+.~#?&/=-]+)?/gi;
		const spotify_expr = /^spotify:.+/gi;
		return url_expr.test(value) || spotify_expr.test(value) || "{field} must be a valid URL or URI";
	});

	// Check if variable used in a description, exists
	defineRule("variable_check", (value, [variables]) => {
		const regexpr = /\[(\w+)\]/g;
		const text_vars = value.match(regexpr);
		if (!text_vars) return true;
		for (const v of text_vars) {
			const stripped = v.slice(1, -1);
			if (!variables || !Object.keys(variables).includes(stripped)) {
				return "Contains undefined variables.";
			}
		}
		return true;
	});

	defineRule("json", (value) => {
		try {
			JSON.parse(value);
			return true;
		} catch {
			return "Invalid JSON";
		}
	});

	defineRule("username", async (value) => {
		const username_ref = db
			.ref("search_users")
			.orderByChild("username")
			.equalTo(value.toLowerCase());
		let exists = false;
		await username_ref.once("value", (snapshot) => {
			exists = snapshot.exists();
		});
		return !exists || "This username has already been taken";
	});

	// Configure default messages
	configure({
		generateMessage: (ctx) => `${ctx.field} is invalid`,
	});
};
