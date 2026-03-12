import numeral from "numeral";

/**
 * Format a number using numeral.js.
 * Replaces the vue-numeral-filter template filter.
 *
 * @param {number} value
 * @param {string} format - numeral.js format string (e.g. "0,0", "0.0a", "0o")
 * @returns {string}
 */
export function formatNumber(value, format) {
	return numeral(value).format(format);
}
