/**
 * `v-shortkey` — a Vue 3 replacement for the vue-shortkey plugin.
 *
 *   <a v-shortkey="['esc']" @shortkey="close">                       array form
 *   <div v-shortkey="{ left: [','], right: ['.'] }" @shortkey="go">  named form
 *
 * The handler is invoked with an object carrying `srcKey` (the key of the named
 * form, `undefined` for the array form), matching what vue-shortkey emitted.
 *
 * Behaviour kept from the old `Vue.use(shortkey, { prevent: ['input', 'textarea'] })`
 * configuration: shortcuts never fire while the user is typing. `contenteditable`
 * is included in that guard as well, since the markdown editor is one.
 */

// One document-level listener for every binding, rather than one per element.
const bindings = new Map();
let listening = false;

const KEY_ALIASES = {
	escape: "esc",
	" ": "space",
	control: "ctrl",
};

function pressedCombination(event) {
	const pressed = [];
	if (event.ctrlKey) pressed.push("ctrl");
	if (event.shiftKey) pressed.push("shift");
	if (event.altKey) pressed.push("alt");
	if (event.metaKey) pressed.push("meta");

	const key = String(event.key).toLowerCase();
	const name = KEY_ALIASES[key] || key;
	// A modifier keypress on its own is not a shortcut.
	if (!["ctrl", "shift", "alt", "meta"].includes(name)) {
		pressed.push(name);
	}

	return pressed;
}

function matches(combination, keys) {
	if (!Array.isArray(keys) || keys.length !== combination.length) return false;
	return keys.every((key) => combination.includes(String(key).toLowerCase()));
}

function isTyping(target) {
	if (!target || !target.tagName) return false;
	const tag = target.tagName.toLowerCase();
	return tag === "input" || tag === "textarea" || target.isContentEditable === true;
}

function onKeydown(event) {
	if (isTyping(event.target)) return;

	const combination = pressedCombination(event);

	bindings.forEach(({ shortcuts, getHandler }, el) => {
		for (const [srcKey, keys] of shortcuts) {
			if (!matches(combination, keys)) continue;

			const handler = getHandler();
			if (!handler) continue;

			event.preventDefault();
			handler({ srcKey, el });
			// vue-shortkey fired every matching element, so no early return here.
		}
	});
}

// `v-shortkey="['a']"` → [[undefined, ['a']]]
// `v-shortkey="{ left: [','] }"` → [['left', [',']]]
function toShortcuts(value) {
	if (Array.isArray(value)) return [[undefined, value]];
	if (value && typeof value === "object") return Object.entries(value);
	return [];
}

function register(el, binding, vnode) {
	const shortcuts = toShortcuts(binding.value);
	if (!shortcuts.length) return;

	if (!listening && typeof document !== "undefined") {
		document.addEventListener("keydown", onKeydown);
		listening = true;
	}

	bindings.set(el, {
		shortcuts,
		// Resolved lazily: the vnode (and therefore the handler closure) is replaced
		// on every re-render of the owning component.
		getHandler: () => vnode.props && vnode.props.onShortkey,
	});
}

export const shortkey = {
	mounted: register,
	updated(el, binding, vnode) {
		bindings.delete(el);
		register(el, binding, vnode);
	},
	unmounted(el) {
		bindings.delete(el);
		if (listening && bindings.size === 0 && typeof document !== "undefined") {
			document.removeEventListener("keydown", onKeydown);
			listening = false;
		}
	},
};

export default {
	install(app) {
		app.directive("shortkey", shortkey);
	},
};
