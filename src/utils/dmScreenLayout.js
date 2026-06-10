export const STORAGE_KEY = "dm-screen-panes-v1";

export const DEFAULT_PANE_SIZES = Object.freeze({
	left: 25,
	"left-top": 60,
	mid: 45,
	"mid-top": 50,
	right: 30,
});

const KNOWN_PANES = Object.keys(DEFAULT_PANE_SIZES);

function isValidSize(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function pickValid(raw) {
	const valid = {};
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return valid;
	for (const key of KNOWN_PANES) {
		if (Object.prototype.hasOwnProperty.call(raw, key) && isValidSize(raw[key])) {
			valid[key] = Math.round(raw[key] * 100) / 100;
		}
	}
	return valid;
}

function readRaw() {
	if (typeof window === "undefined" || !window.localStorage) return null;
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (!stored) return null;
		return JSON.parse(stored);
	} catch (e) {
		return null;
	}
}

export function loadPaneSizes() {
	const valid = pickValid(readRaw());
	return { ...DEFAULT_PANE_SIZES, ...valid };
}

export function savePaneSizes(partial) {
	if (typeof window === "undefined" || !window.localStorage) return;
	const merged = pickValid({ ...readRaw(), ...partial });
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
	} catch (e) {
		// quota exceeded / storage disabled — silent no-op
	}
}
