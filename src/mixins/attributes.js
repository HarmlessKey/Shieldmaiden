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
		}
	}
}
