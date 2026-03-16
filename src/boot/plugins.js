import "animate.css";
import { Splitpanes, Pane } from "splitpanes";
// VueFire — REMOVED, never used its binding features (all Firebase access is direct SDK calls)
// Croppa — DISABLED until Vue 3 replacement found
// GTM — DISABLED until @gtm-support/vue-gtm (Vue 3 version) is installed

export default async ({ app, router }) => {
	app.component("Splitpanes", Splitpanes);
	app.component("Pane", Pane);

	require("../functions.js");
};
