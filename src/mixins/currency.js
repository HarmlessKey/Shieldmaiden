export const currencyMixin = {
	data() {
		return {
			currencies: {
				pp: { name: 'Platinum', color: 'platinum', icon: 'M174.229,78.853l-62.412-62.697H80.184L17.771,79.993v30.208l62.697,63.838h29.638l64.123-64.125V78.853z' },
				gp: { name: 'Gold', color: 'gold', icon: 'M175.611,36.502V15.768H16.496v20.736c17.552,3.475,31.17,28.477,31.17,58.823c0,30.346-13.618,55.348-31.17,58.822v20.736 h159.115v-20.736c-17.551-3.475-31.17-28.477-31.17-58.824C144.441,64.979,158.061,39.978,175.611,36.502z' },
				ep: { name: 'Electrum', color: 'electrum', icon: 'M148.316,20.327H42.705C19.071,36.956,3.613,64.423,3.613,95.518c0,31.091,15.458,58.558,39.092,75.187h105.611 c23.634-16.629,39.092-44.096,39.092-75.187C187.408,64.423,171.95,36.956,148.316,20.327z M95.511,142.814 c-6.683,0-12.101-5.418-12.101-12.1c0-6.684,5.418-12.102,12.101-12.102c6.684,0,12.103,5.418,12.103,12.102 C107.613,137.396,102.194,142.814,95.511,142.814z' },
				sp: { name: 'Silver', color: 'silver', icon: 'M97.369,16.444L2.671,175.561h186.543L97.369,16.444z M95.942,134.695c-7.057,0-12.778-5.723-12.778-12.778 c0-7.057,5.722-12.778,12.778-12.778c7.058,0,12.778,5.722,12.778,12.778C108.721,128.973,103,134.695,95.942,134.695z' },
				cp: { name: 'Copper', color: 'copper', icon: 'M139.727,32.555H55.134L33.602,53.703v86.516l21.532,19.227h84.593l20.765-19.227V53.703L139.727,32.555z M97.868,109.073 c-6.901,0-12.496-5.596-12.496-12.496c0-6.902,5.595-12.497,12.496-12.497s12.498,5.595,12.498,12.497 C110.366,103.478,104.77,109.073,97.868,109.073z' }
			 },
			 maxCurrencyAmount: 4294967295
		}
	},
	methods: {
		currencyToCopper(amount) {
			let cp = (amount.cp) ? parseInt(amount.cp) : 0;
			let sp = (amount.sp) ? parseInt(amount.sp) * 10 : 0;
			let ep = (amount.ep) ? parseInt(amount.ep) * 50 : 0;
			let gp = (amount.gp) ? parseInt(amount.gp) * 100 : 0;
			let pp = (amount.pp) ? parseInt(amount.pp) * 1000 : 0;

			return cp + sp + ep + gp + pp;
		},
		copperToPretty(amount) {
			let cp = parseInt(amount);
			
			let pp = Math.floor(cp / 1000);
			cp = cp % 1000;
			let gp = Math.floor(cp / 100);
			cp = cp % 100;
			let ep = Math.floor(cp / 50);
			cp = cp % 50;
			let sp = Math.floor(cp / 10);
			cp = cp % 10;

			return { pp, gp, ep, sp, cp };
		}
	}
}
