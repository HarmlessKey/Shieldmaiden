import numeral from "numeral";
import { makeDate } from "src/utils/generalFunctions";

export const general = {
	methods: {
		calcMod(val) {
			if (val) {
				return Math.floor((val - 10) / 2);
			} else {
				return 0;
			}
		},
		hitDiceStr(npc) {
			let mod = this.calcMod(npc["constitution"]);
			let nHD = parseInt(npc.hit_dice.split("d")[0]);
			let hdMod = mod * nHD;

			let sign = hdMod > 0 ? "+" : "";
			let mod_str = hdMod ? hdMod : "";

			return "" + npc.hit_dice + sign + mod_str;
		},
		percentage(current, max) {
			return Math.floor((current / max) * 100);
		},
		makeDate(...args) {
			return makeDate(...args);
		},
		toKebabCase(input) {
			return input
				.replace(/(a-z)(A-Z)/g, "$1-$2")
				.replace(/\s+/g, "-")
				.toLowerCase();
		},
	},
};
