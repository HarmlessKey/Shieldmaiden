import VueFire from "vuefire";
import VueCookies from "vue-cookies";
import VueGtag from "vue-gtag";
import numeral from "vue-numeral-filter";
import "animate.css";
import Croppa from "vue-croppa";
import { Cookies } from "quasar";
import { Splitpanes, Pane } from "splitpanes";
// import "splitpanes/dist/splitpanes.css";

export default async ({ router, Vue }) => {
	Vue.config.productionTip = false;

	Vue.use(VueFire);
	Vue.use(VueCookies);
	Vue.use(numeral, { locale: "en" });
	Vue.use(Croppa);

	Vue.component("Splitpanes", Splitpanes);
	Vue.component("Pane", Pane);

	require("../functions.js");

	Vue.use(
		VueGtag,
		{
			config: { id: "G-KDSNCEK6X7" },
			bootstrap: !!Cookies.get("cookie_consent"),
		},
		router
	);
};
