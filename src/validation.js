/* eslint-disable no-unused-vars */
import Vue from 'vue';

const Validation = {
	install(Vue, options) {
		// Example code to add validation 
		Vue.prototype.is_valid = (val) => {
			return true;
		},
		// Check if val is url
		Vue.prototype.is_url = (val) => {
			console.log(val)
			const url_expr = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;
			const url_regex = new RegExp(url_expr);
			if (val.match(url_regex)) {
				return true;
			}
			return false;
		}
	}
}

export default Validation