import { toOptions } from "./fieldControls";

/**
 * Shared by the effects form editors. An editor gets the object it edits as `value` and
 * changes it in place (design decision 2): empty values are deleted, so the saved effect
 * only has fields that are set.
 */
export default {
	computed: {
		dark() {
			return this.$store.getters.theme === "dark";
		},
	},
	methods: {
		toOptions,
		/**
		 * Sets a key on an object, or deletes it for an empty value
		 */
		setField(target, key, value) {
			const empty =
				value === undefined ||
				value === null ||
				value === "" ||
				(typeof value === "number" && Number.isNaN(value)) ||
				(Array.isArray(value) && !value.length);
			if (empty) this.$delete(target, key);
			else this.$set(target, key, value);
		},
		/**
		 * A number from a number input, undefined when it's empty or not a number.
		 * hk-input emits both its parsed number and the raw text of q-input (it forwards
		 * the listeners too), so the text has to be parsed again.
		 */
		toNumber(value) {
			if (value === undefined || value === null || value === "") return undefined;
			const number = Number(value);
			return Number.isFinite(number) ? number : undefined;
		},
		/**
		 * setField for a number input
		 */
		setNumber(target, key, value) {
			this.setField(target, key, this.toNumber(value));
		},
		/**
		 * Adds an optional block (an object or a list) when it isn't there yet
		 */
		addBlock(target, key, initial = {}) {
			if (target[key] === undefined) this.$set(target, key, initial);
		},
		removeBlock(target, key) {
			this.$delete(target, key);
		},
	},
};
