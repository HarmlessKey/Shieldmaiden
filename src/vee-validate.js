import Vue from "vue";
import { extend, ValidationObserver,  ValidationProvider } from 'vee-validate';
import { required, length, max, min, max_value, min_value, alpha_dash, numeric} from "vee-validate/dist/rules";

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

extend("required", {
  ...required,
  message: "{_field_} is required"
});
extend("max", {
  ...max,
  message: "{_field_} must be {length} or less"
});
extend("max_value", {
  ...max_value,
  message: "{_field_} must be {max} or less"
});
extend("min", {
  ...min,
  message: "{_field_} can't be under {length} "
});
extend("min_value", {
  ...min_value,
  message: "{_field_} can't be under {min} "
});
extend('length', length);
extend('alpha_dash', {
  ...alpha_dash,
  message: "{_field_} may only contain alpha-numeric characters, dashes and underscores"
});
extend("numeric", numeric);

// Value must be between 2 numbers
extend("between", {
  validate(value, { min, max } = {}) {
    return Number(min) <= value && Number(max) >= value;
  },
  params: ["min", "max"],
  message: "Must be between {min} and {max}"
});

// Recharge 1, 5-6 or rest
extend('recharge', {
  validate(value) {
    if (value) {
      const regex = /^[0-9]+(-[0-9]+)*$/;
      return regex.test(value) || value === "rest";
    } return false;
  },
  message: 'Allowed format: 6, 5-6 or rest',
});

// Range
extend('range', {
  validate(value) {
    if (value) {
      const regex = /^[0-9]+(\/[0-9]+)*$/g;
      return regex.test(value);
    } return false;
  },
  message: 'Allowed format: 20 or 20/60',
});

// Hit dice
extend('hit_dice', {
  validate(value) {
    if (value) {
      const regex = /^[0-9]+d[0-9]+$/;
      return regex.test(value);
    } return false;
  },
  message: 'Allowed format: 2d6',
});

// Validate url input
extend('url', {
  validate(value) {
    if (value) {
      const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
      return regex.test(value);
    } return false;
  },
  message: '{_field_} must be a valid URL',
});

extend('audio', {
  validate(value) {
    if (value) {
      // Check if value is url
      const url_expr = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;
      const url_regex = new RegExp(url_expr);
      if (value.match(url_regex)) {
        return true;
      }
      // Check if value is spotify URI
      const spotify_expr  = /^spotify:.+/gi;
      const spotify_regex = new RegExp(spotify_expr);
      if (value.match(spotify_regex)) {
        return true;
      }

      return false;
    } return false;
  },
  message: '{_field_} must be a valid URL or URI',
});

// Check if variable used in a description, exists
extend('variable_check', {
  message: field => `The ${field.toLowerCase()} contains undefined variables.`,
  validate: (value, variables) => {
    let regexpr = /\[(\w+)\]/g;
    let text_vars = value.match(regexpr, "$1");
    if (!text_vars)
      return true;
    for (let v of text_vars) {
      let stripped = v.slice(1,-1);
      if (!variables[0] || !Object.keys(variables[0]).includes(stripped))
        return false
    }
    return true;
  }
});