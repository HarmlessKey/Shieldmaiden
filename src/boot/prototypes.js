import "../functions.js";
import numeral from "numeral";

export default async ({ app }) => {
	// Vue 3 removed template filters. `{{ value | numeral("0,0") }}` becomes
	// `{{ $numeral(value, "0,0") }}`, which this global property backs.
	app.config.globalProperties.$numeral = (value, format) => numeral(value).format(format);
};
