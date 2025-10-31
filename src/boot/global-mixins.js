/**
 * Global Mixins Boot File
 *
 * Registers global mixins that provide helper methods available in all components.
 * This replaces functionality that was previously provided by Vue 2 filters or plugins.
 */

import { numeralMixin } from '../mixins/numeral';

export default async ({ app }) => {
  // Register numeral helper mixin globally
  // Provides $numeral() method to all components
  app.mixin(numeralMixin);
};
