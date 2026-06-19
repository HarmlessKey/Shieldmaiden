/*
 * Vuex test helper. Builds a real (namespaced) Vuex store around a single
 * module under test, with stub root getters / root actions so that modules
 * which read `rootGetters.user`, `rootGetters.tier`, etc. or dispatch root
 * actions like `checkEncumbrance` can run in isolation.
 */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

/**
 * @param {Object}  options
 * @param {Object}  options.module        The Vuex module under test (default export of a store module).
 * @param {String}  [options.namespace]   Namespace to register the module under (default "mod").
 * @param {Object}  [options.rootGetters] Map of root getter name -> value.
 * @param {Object}  [options.rootState]   Root state.
 * @param {Object}  [options.rootActions] Map of root action name -> vi.fn/impl.
 * @param {Object}  [options.modules]     Extra sibling modules to register.
 * @returns {{ store: import('vuex').Store, namespace: string }}
 */
export function makeStore({
	module,
	namespace = "mod",
	rootGetters = {},
	rootState = {},
	rootActions = {},
	modules = {},
} = {}) {
	const getters = {};
	for (const [key, value] of Object.entries(rootGetters)) {
		getters[key] = () => value;
	}

	const actions = {
		// commonly dispatched with { root: true } by content modules
		checkEncumbrance: () => {},
		...rootActions,
	};

	const store = new Vuex.Store({
		state: { ...rootState },
		getters,
		actions,
		modules: {
			[namespace]: module,
			...modules,
		},
	});

	return { store, namespace };
}

/**
 * Convenience wrappers scoped to a namespace.
 *
 * Some store modules are registered WITHOUT `namespaced: true` (e.g. `tips`,
 * `general`, `user`, `runEncounter`). Their getters/actions/mutations live in
 * the GLOBAL namespace (and their getters receive the global getters as their
 * 2nd argument). Pass `{ global: true }` to address them without a prefix while
 * still reading their state from `store.state[namespace]`.
 */
export function scoped(store, namespace, { global = false } = {}) {
	const prefix = global ? "" : `${namespace}/`;
	return {
		dispatch: (type, payload, options) =>
			store.dispatch(`${prefix}${type}`, payload, options),
		commit: (type, payload, options) => store.commit(`${prefix}${type}`, payload, options),
		getter: (name) => store.getters[`${prefix}${name}`],
		state: () => store.state[namespace],
	};
}
