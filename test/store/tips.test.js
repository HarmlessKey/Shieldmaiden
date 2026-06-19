import tipsModule from "src/store/modules/tips";
import { makeStore, scoped } from "../helpers/store";

const uid = "user-1";

/**
 * A minimal in-memory localStorage stub. The tips module uses the global
 * `localStorage` directly (it is NOT guarded by `process.browser` in
 * `set_tip`), and the Vitest "node" environment provides no `localStorage`,
 * so we install one for the duration of each test.
 */
function installLocalStorage(initial = {}) {
	const store = { ...initial };
	const ls = {
		getItem: vi.fn((key) => (key in store ? store[key] : null)),
		setItem: vi.fn((key, value) => {
			store[key] = String(value);
		}),
		removeItem: vi.fn((key) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			for (const key of Object.keys(store)) delete store[key];
		}),
		__store: store,
	};
	global.localStorage = ls;
	return ls;
}

function setup({ user } = {}) {
	const { store, namespace } = makeStore({
		module: tipsModule,
		namespace: "tips",
		rootGetters: { user },
	});
	return scoped(store, namespace, { global: true });
}

describe("tips store module", () => {
	let originalLocalStorage;
	let originalBrowser;

	beforeEach(() => {
		originalLocalStorage = global.localStorage;
		originalBrowser = process.browser;
	});

	afterEach(() => {
		global.localStorage = originalLocalStorage;
		process.browser = originalBrowser;
	});

	describe("mutations", () => {
		it("SET_TIPS replaces the tips map", () => {
			const s = setup();
			expect(s.state().tips).toEqual({});
			s.commit("SET_TIPS", { foo: true });
			expect(s.state().tips).toEqual({ foo: true });
			s.commit("SET_TIPS", { bar: true });
			expect(s.state().tips).toEqual({ bar: true });
		});
	});

	describe("getters", () => {
		it("get_tip (no user) checks top-level key presence", () => {
			const s = setup();
			s.commit("SET_TIPS", { welcome: true });
			expect(s.getter("get_tip")("welcome")).toBe(true);
			expect(s.getter("get_tip")("missing")).toBe(false);
		});

		it("get_tip (with user) checks key under the user's uid", () => {
			const s = setup({ user: { uid } });
			s.commit("SET_TIPS", { [uid]: { welcome: true } });
			expect(s.getter("get_tip")("welcome")).toBe(true);
			expect(s.getter("get_tip")("missing")).toBe(false);
		});

		it("get_tip (with user) is falsy when the user has no tips object", () => {
			const s = setup({ user: { uid } });
			s.commit("SET_TIPS", {});
			// state.tips[uid] is undefined -> short-circuits to a falsy value
			expect(s.getter("get_tip")("welcome")).toBeFalsy();
		});
	});

	describe("actions", () => {
		it("setTips loads tips from localStorage when process.browser is set", () => {
			process.browser = true;
			installLocalStorage({ tips: JSON.stringify({ a: true }) });
			const s = setup();
			s.dispatch("setTips");
			expect(s.state().tips).toEqual({ a: true });
		});

		it("setTips defaults to an empty object when localStorage has no tips", () => {
			process.browser = true;
			installLocalStorage();
			const s = setup();
			s.dispatch("setTips");
			expect(s.state().tips).toEqual({});
		});

		it("setTips is a no-op when process.browser is falsy", () => {
			process.browser = false;
			const s = setup();
			s.commit("SET_TIPS", { existing: true });
			s.dispatch("setTips");
			// untouched, and never reads localStorage (which is absent)
			expect(s.state().tips).toEqual({ existing: true });
		});

		it("set_tip (no user) stores the key at the top level and persists it", () => {
			const ls = installLocalStorage();
			const s = setup();
			s.dispatch("set_tip", "welcome");
			expect(s.state().tips).toEqual({ welcome: true });
			expect(ls.setItem).toHaveBeenCalledWith("tips", JSON.stringify({ welcome: true }));
		});

		it("set_tip (with user) nests the key under the user's uid", () => {
			const ls = installLocalStorage();
			const s = setup({ user: { uid } });
			s.dispatch("set_tip", "welcome");
			expect(s.state().tips).toEqual({ [uid]: { welcome: true } });
			expect(ls.setItem).toHaveBeenCalledWith(
				"tips",
				JSON.stringify({ [uid]: { welcome: true } })
			);
		});

		it("set_tip (with user) merges into existing user tips", () => {
			installLocalStorage();
			const s = setup({ user: { uid } });
			s.commit("SET_TIPS", { [uid]: { first: true } });
			s.dispatch("set_tip", "second");
			expect(s.state().tips).toEqual({ [uid]: { first: true, second: true } });
		});
	});
});
