import "animate.css";
import { Splitpanes, Pane } from "splitpanes";
import { createGtm } from "@gtm-support/vue-gtm";

export default async ({ app, router }) => {
	app.component("Splitpanes", Splitpanes);
	app.component("Pane", Pane);

	// GTM injects a script tag into the document; client only
	if (process.env.CLIENT) {
		app.use(
			createGtm({
				id: "GTM-5XJCCDMS",
				vueRouter: router,
				enabled: process.env.NODE_ENV === "production",
			})
		);
	}

	require("../functions.js");
};
