export const attributes = {
	created() {
		// console.log("CREATED MIXIN")
	},
	methods: {
		calcMod(val) {
			return Math.floor((val - 10) / 2)
		}
	}
}
