import VueFire from "vuefire";
import VueCookies from "vue-cookies";
import VueGtag from "vue-gtag";
import numeral from "vue-numeral-filter";
import "animate.css";
import Croppa from "vue-croppa";
import { Cookies } from "quasar";
import { Splitpanes, Pane } from "splitpanes";
import VueGtm from "@gtm-support/vue2-gtm";

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
	Vue.use(VueGtm, {
		id: "GTM-5XJCCDMS",
		queryParams: {},
		defer: false, // Script can be set to `defer` to speed up page load at the cost of less accurate results (in case visitor leaves before script is loaded, which is unlikely but possible). Defaults to false, so the script is loaded `async` by default
		compatibility: false, // Will add `async` and `defer` to the script tag to not block requests for old browsers that do not support `async`
		nonce: "2726c7f26c", // Will add `nonce` to the script tag
		enabled: !!Cookies.get("cookie_consent"), // defaults to true. Plugin can be disabled by setting this to false for Ex: enabled: !!GDPR_Cookie (optional)
		debug: true, // Whether or not display console logs debugs (optional)
		loadScript: true, // Whether or not to load the GTM Script (Helpful if you are including GTM manually, but need the dataLayer functionality in your components) (optional)
		vueRouter: router, // Pass the router instance to automatically sync with router (optional)
		ignoredViews: [], // Don't trigger events for specified router names (optional)
		trackOnNextTick: false, // Whether or not call trackView in Vue.nextTick
	});
};
