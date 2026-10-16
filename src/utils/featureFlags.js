// Shared feature flag registry, read by both the client (Vuex module) and the
// SSR server (src-ssr/api/index.js, via require). Keep this file free of any
// Vue/Firebase import so it stays require-able from plain Node.
//
// Flags are code-defined; the admin page can only toggle the `enabled` state
// stored per flag id, never add/remove entries here.
const FEATURE_FLAGS = {
	monster_generator: {
		label: "AI Monster Generator",
		default: true,
	},
};

module.exports = { FEATURE_FLAGS };
