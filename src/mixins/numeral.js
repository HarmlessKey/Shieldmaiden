/**
 * Numeral Filter Replacement Mixin
 *
 * Vue 3 removed filters, so we provide a global $numeral() method instead.
 * This replaces all {{ value | numeral("format") }} usage with {{ $numeral(value, "format") }}
 *
 * The numeral library is already installed in package.json.
 */

import numeral from 'numeral';

export const numeralMixin = {
  methods: {
    /**
     * Format a number using numeral.js
     * @param {number|string} value - The value to format
     * @param {string} format - The numeral format string (e.g., "0.0a", "$0,0", "0o")
     * @returns {string} Formatted number string
     */
    $numeral(value, format) {
      if (value === null || value === undefined) {
        return '';
      }
      return numeral(value).format(format);
    }
  }
};
