import { db } from 'src/firebase';
import { extend, ValidationObserver,  ValidationProvider } from 'vee-validate';
import { required, length, max, min, max_value, min_value, alpha_dash, numeric, alpha_num, email, confirmed} from "vee-validate/dist/rules";

export default async ({ router, Vue }) => {
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
  extend('alpha_num', {
    ...alpha_num,
    message: "{_field_} may only contain alpha-numeric characters."
  });

  extend("email", {
    ...email,
    message: "{_field_} must be a valid email address."
  });

  // Value is same as other field
  extend("confirmed", confirmed);

  // Value must be between 2 numbers
  extend("between", {
    validate(value, { minimum, maximum } = {}) {
      return Number(minimum) <= value && Number(maximum) >= value;
    },
    params: ["minimum", "maximum"],
    message: "Must be between {minimum} and {maximum}"
  });

  // Recharge 1, 5-6 or rest
  extend('recharge', {
    validate(value) {
      if (value) {
        const regex = /^[\d]+(-[\d]+)*$/;
        return regex.test(value) || value === "rest";
      } return false;
    },
    message: 'Allowed format: 6, 5-6 or rest',
  });

  // Range
  extend('range', {
    validate(value) {
      if (value) {
        const regex = /^[\d]+(\/[\d]+)*$/g;
        return regex.test(value);
      } return false;
    },
    message: 'Allowed format: 20 or 20/60',
  });

  // Hit dice
  extend('hit_dice', {
    validate(value) {
      if (value) {
        const regex = /^[\d]+d[\d]+$/;
        return regex.test(value);
      } return false;
    },
    message: 'Allowed format: 2d6',
  });

  // Validate url input
  extend('url', {
    validate(value) {
      if (value) {
        const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z\d]+([-.]{1}[a-z\d]+)*\.[a-z]{2,5}(:[\d]{1,5})?(\/.*)?$/;
        return regex.test(value);
      } return false;
    },
    message: '{_field_} must be a valid URL',
  });

  extend('audio', {
    validate(value) {
      if (value) {
        // Check if value is url
        const url_expr = /[A-z\d@:%._+~#=-]{1,256}\.[A-z\d()]{1,6}\b([A-z\d()@:%_+.~#?&/=-]+)?/gi;
        if (value.match(url_expr)) {
          return true;
        }
        // Check if value is spotify URI
        const spotify_expr  = /^spotify:.+/gi;
        
        return value.match(spotify_expr);
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

  extend('json', {
    message: "This field contains invalid JSON",
    validate: (value) => {
      try {
        JSON.parse(value);
        return true;

      } catch {
        return false;
      }
    }
  });

  extend('username', {
    message: "This usename has already been taken",
    validate: async (value) => {
      let username_ref = db.ref(`search_users`).orderByChild('username').equalTo(value.toLowerCase());
  
      // Check username
      let exists = false
      await username_ref.once('value' , (snapshot) => {
        exists = snapshot.exists();
      });

      return !exists;
    }
  })
};