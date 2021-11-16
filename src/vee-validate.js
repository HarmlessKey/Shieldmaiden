import Vue from "vue";
import { extend, ValidationObserver,  ValidationProvider } from 'vee-validate';
import { required, length, max, min, max_value, min_value, alpha_dash} from "vee-validate/dist/rules";

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

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);