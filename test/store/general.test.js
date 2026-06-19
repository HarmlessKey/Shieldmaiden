import generalModule from "src/store/modules/general";
import { makeStore, scoped } from "../helpers/store";

const uid = "user-1";

function setup({ rootGetters = {}, rootActions = {} } = {}) {
	const { store, namespace } = makeStore({
		module: generalModule,
		namespace: "general",
		rootGetters,
		rootActions,
	});
	return { ...scoped(store, namespace, { global: true }), store };
}

/**
 * The general module's `setTheme` action calls
 * `document.documentElement.setAttribute(...)` whenever it actually changes a
 * theme. The Vitest "node" environment has no `document`, so we install a
 * minimal stub for tests that exercise those branches.
 */
function installDocument() {
	const setAttribute = vi.fn();
	global.document = { documentElement: { setAttribute } };
	// When process.browser is true the store's state initialiser calls
	// browserDetect(), which touches window — stub it so it doesn't throw (its
	// return value is irrelevant to these tests). navigator is a Node built-in.
	global.window = {};
	return setAttribute;
}

function installLocalStorage(initial = {}) {
	const store = { ...initial };
	global.localStorage = {
		getItem: vi.fn((key) => (key in store ? store[key] : null)),
		setItem: vi.fn((key, value) => {
			store[key] = String(value);
		}),
	};
	return global.localStorage;
}

describe("general store module", () => {
	let originalDocument;
	let originalLocalStorage;
	let originalBrowser;
	let originalWindow;

	beforeEach(() => {
		originalDocument = global.document;
		originalLocalStorage = global.localStorage;
		originalBrowser = process.browser;
		originalWindow = global.window;
	});

	afterEach(() => {
		global.document = originalDocument;
		global.localStorage = originalLocalStorage;
		process.browser = originalBrowser;
		global.window = originalWindow;
	});

	describe("mutations", () => {
		it("SET_INITIALIZED sets the flag", () => {
			const s = setup();
			expect(s.state().initialized).toBe(false);
			s.commit("SET_INITIALIZED", true);
			expect(s.state().initialized).toBe(true);
		});

		it("SET_THEME sets the theme", () => {
			const s = setup();
			s.commit("SET_THEME", "light");
			expect(s.state().theme).toBe("light");
		});

		it("SET_SLIDE sets the drawer", () => {
			const s = setup();
			s.commit("SET_SLIDE", { type: "monster", data: { id: 1 } });
			expect(s.state().drawer).toEqual({ type: "monster", data: { id: 1 } });
		});

		it("SET_ROLLS replaces the rolls array", () => {
			const s = setup();
			s.commit("SET_ROLLS", [{ roll: 20 }]);
			expect(s.state().rolls).toEqual([{ roll: 20 }]);
		});

		it("SET_ACTION_ROLLS replaces the action_rolls array", () => {
			const s = setup();
			s.commit("SET_ACTION_ROLLS", [{ a: 1 }]);
			expect(s.state().action_rolls).toEqual([{ a: 1 }]);
		});

		it("CLEAR_ACTION_ROLLS empties the action_rolls array", () => {
			const s = setup();
			s.commit("SET_ACTION_ROLLS", [{ a: 1 }, { b: 2 }]);
			s.commit("CLEAR_ACTION_ROLLS");
			expect(s.state().action_rolls).toEqual([]);
		});

		it("REMOVE_ACTION_ROLL removes the entry at the given index", () => {
			const s = setup();
			s.commit("SET_ACTION_ROLLS", [{ a: 1 }, { b: 2 }, { c: 3 }]);
			s.commit("REMOVE_ACTION_ROLL", 1);
			expect(s.state().action_rolls).toEqual([{ a: 1 }, { c: 3 }]);
		});

		it("TOGGLE_SIDE_COLLAPSE flips side_collapsed", () => {
			const s = setup();
			expect(s.state().side_collapsed).toBe(true);
			s.commit("TOGGLE_SIDE_COLLAPSE");
			expect(s.state().side_collapsed).toBe(false);
			s.commit("TOGGLE_SIDE_COLLAPSE");
			expect(s.state().side_collapsed).toBe(true);
		});

		it("SET_SIDE_COLLAPSE sets side_collapsed", () => {
			const s = setup();
			s.commit("SET_SIDE_COLLAPSE", false);
			expect(s.state().side_collapsed).toBe(false);
		});

		it("SET_SIDE_SMALL_SCREEN sets side_small_screen", () => {
			const s = setup();
			s.commit("SET_SIDE_SMALL_SCREEN", true);
			expect(s.state().side_small_screen).toBe(true);
		});

		it("SET_EXTENSION_INSTALLED stores the version (and coerces null to false)", () => {
			const s = setup();
			s.commit("SET_EXTENSION_INSTALLED", "1.2.3");
			expect(s.state().extensionInstalled).toBe("1.2.3");
			s.commit("SET_EXTENSION_INSTALLED", null);
			expect(s.state().extensionInstalled).toBe(false);
		});

		it("SET_MUSIC stores the music payload", () => {
			const s = setup();
			s.commit("SET_MUSIC", { url: "track.mp3" });
			expect(s.state().music).toEqual({ url: "track.mp3" });
		});

		it("SET_AMBIENCE pushes a new sound", () => {
			const s = setup();
			s.commit("SET_AMBIENCE", { url: "rain.mp3" });
			expect(s.state().ambience).toEqual([{ url: "rain.mp3" }]);
		});

		it("SET_AMBIENCE removes a sound when an existing reference is toggled", () => {
			const s = setup();
			const rain = { url: "rain.mp3" };
			s.commit("SET_AMBIENCE", rain);
			expect(s.state().ambience).toContainEqual(rain);
			// the filter matches on url, so the same object is removed
			s.commit("SET_AMBIENCE", rain);
			expect(s.state().ambience).toEqual([]);
		});
	});

	describe("getters", () => {
		it("expose their corresponding state slices", () => {
			const s = setup();
			s.commit("SET_INITIALIZED", true);
			s.commit("SET_THEME", "light");
			s.commit("SET_SLIDE", { type: "x" });
			s.commit("SET_ROLLS", [1]);
			s.commit("SET_ACTION_ROLLS", [2]);
			s.commit("SET_SIDE_COLLAPSE", false);
			s.commit("SET_SIDE_SMALL_SCREEN", true);
			s.commit("SET_EXTENSION_INSTALLED", "9.9.9");
			s.commit("SET_MUSIC", { url: "m" });
			s.commit("SET_AMBIENCE", { url: "a" });

			expect(s.getter("initialized")).toBe(true);
			expect(s.getter("theme")).toBe("light");
			expect(s.getter("getDrawer")).toEqual({ type: "x" });
			expect(s.getter("rolls")).toEqual([1]);
			expect(s.getter("action_rolls")).toEqual([2]);
			expect(s.getter("side_collapsed")).toBe(false);
			expect(s.getter("side_small_screen")).toBe(true);
			expect(s.getter("extensionInstalled")).toBe("9.9.9");
			expect(s.getter("music")).toEqual({ url: "m" });
			expect(s.getter("ambience")).toEqual([{ url: "a" }]);
		});

		it("browser getter reflects browserDetect() (\"Not a browser\" in the node env)", () => {
			const s = setup();
			// process.browser is falsy under Vitest, so browserDetect() returns "Not a browser"
			expect(s.getter("browser")).toBe("Not a browser");
		});
	});

	describe("actions", () => {
		describe("setTheme", () => {
			it("defaults to dark and commits when no theme and not in a browser", () => {
				process.browser = false;
				const s = setup({ rootGetters: { user: undefined } });
				s.dispatch("setTheme");
				expect(s.state().theme).toBe("dark");
			});

			it("reads the theme from localStorage for an anonymous browser user", () => {
				process.browser = true;
				installDocument();
				installLocalStorage({ theme: "light" });
				const s = setup({ rootGetters: { user: undefined } });
				s.dispatch("setTheme");
				expect(s.state().theme).toBe("light");
			});

			it("reads the theme from userSettings for a logged-in browser user", () => {
				process.browser = true;
				const setAttribute = installDocument();
				const s = setup({
					rootGetters: {
						user: { uid },
						userSettings: { general: { theme: "light" } },
					},
				});
				s.dispatch("setTheme");
				expect(s.state().theme).toBe("light");
				expect(setAttribute).toHaveBeenCalledWith("data-theme", "light");
			});

			it("persists a new theme for an anonymous user via localStorage", () => {
				installDocument();
				const ls = installLocalStorage();
				const s = setup({ rootGetters: { user: undefined } });
				s.dispatch("setTheme", "light");
				expect(ls.setItem).toHaveBeenCalledWith("theme", "light");
				expect(s.state().theme).toBe("light");
			});

			it("dispatches update_settings for a logged-in user changing the theme", () => {
				installDocument();
				const update_settings = vi.fn();
				const s = setup({
					rootGetters: { user: { uid } },
					rootActions: { update_settings },
				});
				s.dispatch("setTheme", "light");
				expect(update_settings).toHaveBeenCalledWith(expect.anything(), {
					category: "general",
					type: "theme",
					value: "light",
				});
				expect(s.state().theme).toBe("light");
			});

			it("does nothing when the chosen theme equals the current one", () => {
				const update_settings = vi.fn();
				const s = setup({
					rootGetters: { user: { uid } },
					rootActions: { update_settings },
				});
				// default state theme is "dark"
				s.dispatch("setTheme", "dark");
				expect(update_settings).not.toHaveBeenCalled();
			});
		});

		it("setRoll unshifts the roll with a date stamp", () => {
			const s = setup();
			s.dispatch("setRoll", { total: 10 });
			s.dispatch("setRoll", { total: 20 });
			const rolls = s.state().rolls;
			expect(rolls).toHaveLength(2);
			expect(rolls[0].total).toBe(20); // most recent first
			expect(rolls[0].date).toBeInstanceOf(Date);
		});

		it("setActionRoll prepends the roll and assigns a key", () => {
			const s = setup();
			s.dispatch("setActionRoll", { name: "fireball" });
			const rolls = s.state().action_rolls;
			expect(rolls).toHaveLength(1);
			expect(rolls[0].name).toBe("fireball");
			expect(typeof rolls[0].key).toBe("string");
			expect(rolls[0].key.length).toBeGreaterThan(0);
		});

		it("removeActionRoll removes the entry at the given index", () => {
			const s = setup();
			s.dispatch("setActionRoll", { name: "a" });
			s.dispatch("setActionRoll", { name: "b" });
			s.dispatch("removeActionRoll", 0);
			expect(s.state().action_rolls).toHaveLength(1);
		});

		describe("setDrawer", () => {
			it("opens a fresh drawer after a tick when type/data differ", async () => {
				vi.useFakeTimers();
				const s = setup();
				s.dispatch("setDrawer", { type: "monster", data: { id: 1 } });
				// first commits false, then schedules the open
				expect(s.state().drawer).toBe(false);
				vi.advanceTimersByTime(100);
				expect(s.state().drawer).toEqual({ type: "monster", data: { id: 1 } });
				vi.useRealTimers();
			});

			it("closes the drawer when the same payload is dispatched again", () => {
				const s = setup();
				s.commit("SET_SLIDE", { type: "monster", data: { id: 1 } });
				s.dispatch("setDrawer", { type: "monster", data: { id: 1 } });
				expect(s.state().drawer).toBe(false);
			});
		});

		it("toggleSideCollapsed flips state then dispatches update_settings", () => {
			const update_settings = vi.fn();
			const s = setup({
				rootGetters: { user: { uid } },
				rootActions: { update_settings },
			});
			// starts true -> toggles to false -> value becomes undefined (false || undefined)
			s.dispatch("toggleSideCollapsed");
			expect(s.state().side_collapsed).toBe(false);
			expect(update_settings).toHaveBeenCalledWith(expect.anything(), {
				category: "general",
				type: "side_collapsed",
				value: undefined,
			});
		});

		describe("setSideCollapsed", () => {
			it("commits the value from userSettings when logged in", () => {
				const s = setup({
					rootGetters: {
						user: { uid },
						userSettings: { general: { side_collapsed: true } },
					},
				});
				s.commit("SET_SIDE_COLLAPSE", false);
				s.dispatch("setSideCollapsed");
				expect(s.state().side_collapsed).toBe(true);
			});

			it("commits false when userSettings has no side_collapsed", () => {
				const s = setup({
					rootGetters: { user: { uid }, userSettings: { general: {} } },
				});
				s.dispatch("setSideCollapsed");
				expect(s.state().side_collapsed).toBe(false);
			});

			it("does nothing without a logged-in user", () => {
				const s = setup({ rootGetters: { user: undefined } });
				s.commit("SET_SIDE_COLLAPSE", true);
				s.dispatch("setSideCollapsed");
				expect(s.state().side_collapsed).toBe(true); // unchanged
			});
		});

		it("setSideSmallScreen commits the payload", () => {
			const s = setup();
			s.dispatch("setSideSmallScreen", true);
			expect(s.state().side_small_screen).toBe(true);
		});

		describe("checkExtensionInstalled", () => {
			it("returns the cached value without re-checking", async () => {
				const s = setup();
				s.commit("SET_EXTENSION_INSTALLED", "1.0.0");
				const result = await s.dispatch("checkExtensionInstalled");
				expect(result).toBe("1.0.0");
			});

			it("checks and caches false when no extension responds (node env)", async () => {
				const s = setup();
				// extensionInstalled() resolves falsy when window/postMessage is absent
				const result = await s.dispatch("checkExtensionInstalled");
				expect(result).toBe(false);
				expect(s.state().extensionInstalled).toBe(false);
			});
		});

		it("play_music commits the payload", () => {
			const s = setup();
			s.dispatch("play_music", { url: "song.mp3" });
			expect(s.state().music).toEqual({ url: "song.mp3" });
		});

		it("play_ambience toggles ambient sounds", () => {
			const s = setup();
			const sound = { url: "wind.mp3" };
			s.dispatch("play_ambience", sound);
			expect(s.state().ambience).toContainEqual(sound);
			s.dispatch("play_ambience", sound);
			expect(s.state().ambience).toEqual([]);
		});

		describe("initialize / reinitialize", () => {
			it("just sets theme + initialized when there is no user", async () => {
				process.browser = false;
				const s = setup({ rootGetters: { user: undefined } });
				await s.dispatch("initialize");
				expect(s.state().initialized).toBe(true);
				expect(s.state().theme).toBe("dark");
			});

			it("is a no-op once already initialized", async () => {
				const s = setup({ rootGetters: { user: undefined } });
				s.commit("SET_INITIALIZED", true);
				await s.dispatch("initialize");
				expect(s.state().initialized).toBe(true);
			});

			it("reinitialize resets the flag then runs initialize again", async () => {
				process.browser = false;
				const s = setup({ rootGetters: { user: undefined } });
				s.commit("SET_INITIALIZED", true);
				await s.dispatch("reinitialize");
				expect(s.state().initialized).toBe(true);
			});
		});
	});
});
