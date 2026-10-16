/**
 * Replacement for vuefire 1.x, which is Vue 2 only. vuefire 3 is not an option
 * here because it requires the modular Firebase SDK, and this app is pinned to
 * the v8 namespaced API.
 *
 * It implements the same `firebase()` component option and the same record
 * shape, so every existing binding keeps working:
 *
 *   firebase() {
 *     return {
 *       tiers: db.ref("tiers").orderByChild("order"),          // bound as array
 *       patron: {                                              // bound as object
 *         source: db.ref(`new_patrons/${this.id}`),
 *         asObject: true,
 *         readyCallback: () => (this.loading = false),
 *         cancelCallback: (error) => console.error(error),
 *       },
 *     };
 *   }
 *
 * Records carry the vuefire conventions: `.key` always, and `.value` when the
 * node holds a primitive instead of an object.
 */

function isObject(value) {
	return value !== null && typeof value === "object";
}

function createRecord(snapshot) {
	const value = snapshot.val();
	const record = isObject(value) ? { ...value } : { ".value": value };
	record[".key"] = snapshot.key;
	return record;
}

function indexForKey(array, key) {
	return array.findIndex((record) => record[".key"] === key);
}

function normalize(binding) {
	if (binding && binding.source) return binding;
	return { source: binding };
}

function bindAsArray(target, key, source, readyCallback, cancelCallback) {
	target[key] = [];
	// Read the array back off the reactive target so mutations are tracked.
	const array = target[key];

	const listeners = {
		child_added: source.on(
			"child_added",
			(snapshot, prevKey) => {
				const index = prevKey ? indexForKey(array, prevKey) + 1 : 0;
				array.splice(index, 0, createRecord(snapshot));
			},
			cancelCallback
		),
		child_removed: source.on(
			"child_removed",
			(snapshot) => {
				const index = indexForKey(array, snapshot.key);
				if (index > -1) array.splice(index, 1);
			},
			cancelCallback
		),
		child_changed: source.on(
			"child_changed",
			(snapshot) => {
				const index = indexForKey(array, snapshot.key);
				if (index > -1) array.splice(index, 1, createRecord(snapshot));
			},
			cancelCallback
		),
		child_moved: source.on(
			"child_moved",
			(snapshot, prevKey) => {
				const index = indexForKey(array, snapshot.key);
				if (index < 0) return;
				const [record] = array.splice(index, 1);
				const newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0;
				array.splice(newIndex, 0, record);
			},
			cancelCallback
		),
	};

	if (readyCallback) source.once("value", readyCallback, cancelCallback);

	return listeners;
}

function bindAsObject(target, key, source, readyCallback, cancelCallback) {
	target[key] = {};

	const listeners = {
		value: source.on(
			"value",
			(snapshot) => {
				target[key] = createRecord(snapshot);
			},
			cancelCallback
		),
	};

	if (readyCallback) source.once("value", readyCallback, cancelCallback);

	return listeners;
}

const mixin = {
	created() {
		const option = this.$options.firebase;
		if (!option) return;

		// Binding on the server would attach listeners that never fire before the
		// synchronous render and would never be torn down, since beforeUnmount does
		// not run during SSR. The rendered markup is identical either way.
		if (!process.env.CLIENT) return;

		const bindings = typeof option === "function" ? option.call(this) : option;

		this.$firebaseRefs = Object.create(null);
		this.$firebaseListeners = Object.create(null);

		for (const key of Object.keys(bindings)) {
			const { source, asObject, readyCallback, cancelCallback } = normalize(bindings[key]);
			if (!source) continue;

			this.$firebaseRefs[key] = source;
			this.$firebaseListeners[key] = asObject
				? bindAsObject(this.$data, key, source, readyCallback, cancelCallback)
				: bindAsArray(this.$data, key, source, readyCallback, cancelCallback);
		}
	},

	beforeUnmount() {
		if (!this.$firebaseListeners) return;

		for (const key of Object.keys(this.$firebaseListeners)) {
			const source = this.$firebaseRefs[key];
			const listeners = this.$firebaseListeners[key];
			for (const event of Object.keys(listeners)) {
				source.off(event, listeners[event]);
			}
		}

		this.$firebaseRefs = null;
		this.$firebaseListeners = null;
	},
};

export default {
	install(app) {
		app.mixin(mixin);
	},
};
