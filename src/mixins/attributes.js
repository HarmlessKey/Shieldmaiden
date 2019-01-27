export const attributes = {
	created() {
		// console.log("CREATED MIXIN")
	},
	methods: {
		calcMod(val) {
			if(val) {
				return Math.floor((val - 10) / 2)
			}
			else {
				return 0;
			}	
		},
		percentage(current, max) {
			var percentage = Math.floor(current / max * 100)
			return percentage
		},
	}
}
