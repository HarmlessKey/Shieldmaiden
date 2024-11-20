import { getCssVariable } from "src/utils/generalFunctions";

export const colors = {
	data() {
		return {
			shieldmaiden_colors: [
				getCssVariable("blue"),
				getCssVariable("blue-light"),
				getCssVariable("green"),
				getCssVariable("green-light"),
				getCssVariable("red"),
				getCssVariable("red-light"),
				getCssVariable("orange"),
				getCssVariable("orange-light"),
				getCssVariable("yellow-light"),
				getCssVariable("accent"),
				getCssVariable("accent-light"),
				getCssVariable("purple"),
				getCssVariable("black"),
				getCssVariable("neutral-2"),
				getCssVariable("white"),
			],
		};
	},
};
