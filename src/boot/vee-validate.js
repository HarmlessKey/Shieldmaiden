import { db } from 'src/firebase';
import { defineRule, configure, Field, Form, ErrorMessage } from 'vee-validate';
import * as AllRules from '@vee-validate/rules';

export default async ({ router, app }) => {
  // Register VeeValidate components globally
  app.component('Field', Field);
  app.component('Form', Form);
  app.component('ErrorMessage', ErrorMessage);

  // NOTE: VeeValidate 4 changes:
  // - ValidationProvider → Field
  // - ValidationObserver → Form
  // - extend() → defineRule()
  // Components using VeeValidate will need updates

  // Register all default rules from @vee-validate/rules
  Object.keys(AllRules).forEach(rule => {
    defineRule(rule, AllRules[rule]);
  });

  // Configure VeeValidate with custom messages
  configure({
    generateMessage: (ctx) => {
      const messages = {
        required: `${ctx.field} is required`,
        max: `${ctx.field} must be ${ctx.rule.params[0]} or less`,
        max_value: `${ctx.field} must be ${ctx.rule.params[0]} or less`,
        min: `${ctx.field} can't be under ${ctx.rule.params[0]}`,
        min_value: `${ctx.field} can't be under ${ctx.rule.params[0]}`,
        alpha_dash: `${ctx.field} may only contain alpha-numeric characters, dashes and underscores`,
        alpha_num: `${ctx.field} may only contain alpha-numeric characters.`,
        email: `${ctx.field} must be a valid email address.`,
        confirmed: `${ctx.field} confirmation does not match`,
      };

      return messages[ctx.rule.name] || `${ctx.field} is invalid`;
    },
  });

  // Custom validation rules

  // Value must be between 2 numbers
  defineRule('between', (value, [minimum, maximum]) => {
    if (!value) return true;
    return Number(minimum) <= value && Number(maximum) >= value || `Must be between ${minimum} and ${maximum}`;
  });

  // Recharge 1, 5-6 or rest
  defineRule('recharge', (value) => {
    if (!value) return true;
    const regex = /^[\d]+(-[\d]+)*$/;
    return regex.test(value) || value === "rest" || 'Allowed format: 6, 5-6 or rest';
  });

  // Range
  defineRule('range', (value) => {
    if (!value) return true;
    const regex = /^[\d]+(\/[\d]+)*$/g;
    return regex.test(value) || 'Allowed format: 20 or 20/60';
  });

  // Hit dice
  defineRule('hit_dice', (value) => {
    if (!value) return true;
    const regex = /^[\d]+d[\d]+$/;
    return regex.test(value) || 'Allowed format: 2d6';
  });

  // Validate url input
  defineRule('url', (value) => {
    if (!value) return true;
    const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z\d]+([-.]{1}[a-z\d]+)*\.[a-z]{2,5}(:[\d]{1,5})?(\/.*)?$/;
    return regex.test(value) || 'Must be a valid URL';
  });

  // Validate audio URL or URI
  defineRule('audio', (value) => {
    if (!value) return true;
    // Check if value is url
    const url_expr = /[A-z\d@:%._+~#=-]{1,256}\.[A-z\d()]{1,6}\b([A-z\d()@:%_+.~#?&/=-]+)?/gi;
    if (value.match(url_expr)) {
      return true;
    }
    // Check if value is spotify URI
    const spotify_expr = /^spotify:.+/gi;
    return value.match(spotify_expr) || 'Must be a valid URL or URI';
  });

  // Check if variable used in a description exists
  defineRule('variable_check', (value, [variables]) => {
    if (!value) return true;
    let regexpr = /\[(\w+)\]/g;
    let text_vars = value.match(regexpr, "$1");
    if (!text_vars) return true;

    for (let v of text_vars) {
      let stripped = v.slice(1, -1);
      if (!variables || !Object.keys(variables).includes(stripped)) {
        return 'Contains undefined variables';
      }
    }
    return true;
  });

  // Validate JSON
  defineRule('json', (value) => {
    if (!value) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return 'This field contains invalid JSON';
    }
  });

  // Check if username is available
  defineRule('username', async (value) => {
    if (!value) return true;
    let username_ref = db.ref(`search_users`).orderByChild('username').equalTo(value.toLowerCase());

    // Check username
    let exists = false;
    await username_ref.once('value', (snapshot) => {
      exists = snapshot.exists();
    });

    return !exists || 'This username has already been taken';
  });
};