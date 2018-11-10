export const dice = {
	created() {
	// console.log("CREATED MIXIN")
	},
	methods: {
		rollD(d=20,n=1,m=0) {
			const add = (a, b) => a + b
			let throws = []
			for (var i=0; i < n; i++) {
				throws.push(Math.ceil(Math.random() * d))
			}
			console.log(throws)
			
			return throws.reduce(add) + m * n
		},
		rollD6(n=1,m=0) {
			return this.rollD(6,n,m)
		},
		rollD8(n=1,m=0) {
			return this.rollD(8,n,m)
		},
		rollD10(n=1,m=0) {
			return this.rollD(10,n,m)
		},
	rollD20(n=1,m=0) {
			return this.rollD(20,n,m)
		},
		rollD100(n=1,m=0) {
			return this.rollD(100,n,m)
		},
	}
}
