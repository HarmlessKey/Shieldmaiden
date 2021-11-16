import Vue from "vue";
import { extend, ValidationObserver,  ValidationProvider } from 'vee-validate';
import { required, length} from "vee-validate/dist/rules";

extend("required", {
  ...required,
  message: "{_field_} is required"
});
extend('length', length);

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);