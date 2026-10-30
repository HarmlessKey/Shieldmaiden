import { registerSrdDefinitions } from "src/utils/effectFunctions";

/**
 * The SRD effects and conditions come from the HK API (effects 12): the SRD lookups read the
 * api_effects store's lists, and both editions start loading when the app does. Screens that
 * need them right away (the tracker, the live view) wait for their edition themselves.
 */
export default ({ store }) => {
	registerSrdDefinitions(store.state.api_effects.lists);
	for (const edition of ["5e", "5.5e"]) {
		store.dispatch("api_effects/fetch_srd_definitions", { edition });
	}
};
