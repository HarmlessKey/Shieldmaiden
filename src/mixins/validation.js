export const validation = {
	data() {
		return {
			
		}
	},
	computed: {
		
	},
	methods: {
		// Work in progress
		// validate(val, rules, disabled) {
		// 	console.log(rules[0](val))
		// 	let valid = rules.map(r => r(val))
		// 	console.log(valid)
		// 	return valid.every(v => v == true) || disabled;
		// },
		required(val, disabled=false) {
			// console.log(event, val)
			return (disabled || !!val) || 'Required'
		},			
	}
}
