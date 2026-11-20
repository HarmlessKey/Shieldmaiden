let validateEffect;

/**
 * Schema validator for effect definitions, loaded on first use so Ajv and the schema stay
 * out of the main bundle. Used by the effects form and the admins' Paste JSON dialog.
 *
 * @returns {Promise<function>} Ajv validate function (errors on validate.errors)
 */
export async function getEffectValidator() {
	if (!validateEffect) {
		const [{ default: Ajv }, { default: schema }] = await Promise.all([
			import("ajv"),
			import("src/schemas/hk-effects-schema.json"),
		]);
		validateEffect = new Ajv({ allErrors: true, strict: false }).compile(schema);
	}
	return validateEffect;
}
