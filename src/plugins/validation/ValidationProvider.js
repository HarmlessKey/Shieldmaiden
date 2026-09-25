import { defineComponent, inject, onMounted, onUnmounted, onUpdated, reactive } from "vue";
import { parseRules, runRules } from "./rules";
import { OBSERVER_KEY } from "./symbols";

/**
 * Renderless field validator with the vee-validate 3 slot contract.
 *
 *   <ValidationProvider name="Title" rules="required|max:30" v-slot="{ errors, invalid, validated }">
 *     <q-input v-model="title" :error="invalid && validated" :error-message="errors[0]" />
 *   </ValidationProvider>
 *
 * Like vee-validate 3 it detects the field's value from the `v-model` on the slot
 * content rather than taking it as a prop, which is why every existing call site
 * keeps working unchanged. The slot is rendered inside this component's own render,
 * so the bound value is a dependency of this component's render effect: when it
 * changes, this component re-renders and `onUpdated` revalidates.
 */

// v-model compiles to a `modelValue` prop on components and to a `vModel*` directive
// on native inputs. Both carry an "onUpdate:modelValue" prop, which is the marker.
function findModelValue(nodes) {
	if (!Array.isArray(nodes)) {
		nodes = nodes ? [nodes] : [];
	}

	for (const vnode of nodes) {
		if (!vnode || typeof vnode !== "object") continue;

		const props = vnode.props;
		if (props && typeof props["onUpdate:modelValue"] === "function") {
			if ("modelValue" in props) return { found: true, value: props.modelValue };
			if (Array.isArray(vnode.dirs) && vnode.dirs.length) {
				return { found: true, value: vnode.dirs[0].value };
			}
		}

		// Only plain vnode arrays (elements and fragments) can be walked — a child
		// component's slots have not been invoked yet at this point.
		if (Array.isArray(vnode.children)) {
			const nested = findModelValue(vnode.children);
			if (nested.found) return nested;
		}
	}

	return { found: false, value: undefined };
}

export default defineComponent({
	name: "ValidationProvider",

	props: {
		name: { type: String, default: "" },
		vid: { type: String, default: "" },
		rules: { type: [String, Object], default: "" },
	},

	setup(props, { slots, expose }) {
		const state = reactive({
			errors: [],
			valid: true,
			validated: false,
			pending: false,
		});

		const observer = inject(OBSERVER_KEY, null);

		// Captured during render, deliberately non-reactive: writing reactive state
		// from a render function would loop.
		let currentValue;
		let lastValidatedValue;
		let mounted = false;
		let runId = 0;

		const fieldName = () => props.name || props.vid || "This field";

		async function validate({ silent = false } = {}) {
			const id = ++runId;
			const value = currentValue;
			lastValidatedValue = value;
			state.pending = true;

			const messages = await runRules(
				value,
				parseRules(props.rules),
				fieldName(),
				(target) => (observer ? observer.getFieldValue(target) : undefined)
			);

			// A newer run started while this one was awaiting — discard the result.
			if (id !== runId) return state.valid;

			state.pending = false;
			state.errors = messages;
			state.valid = messages.length === 0;
			if (!silent) state.validated = true;

			return state.valid;
		}

		function reset() {
			runId++;
			state.errors = [];
			state.valid = true;
			state.validated = false;
			state.pending = false;
			lastValidatedValue = currentValue;
		}

		const field = {
			get name() {
				return props.name || props.vid;
			},
			get valid() {
				return state.valid;
			},
			get validated() {
				return state.validated;
			},
			getValue: () => currentValue,
			validate,
			reset,
		};

		if (observer) {
			observer.register(field);
			onUnmounted(() => observer.unregister(field));
		}

		onMounted(() => {
			mounted = true;
			// Validate silently so the observer knows whether the form can be submitted,
			// without showing errors on a field the user has not touched yet.
			validate({ silent: true });
		});

		onUpdated(() => {
			if (mounted && currentValue !== lastValidatedValue) {
				validate();
			}
		});

		expose({ validate, reset, state });

		return () => {
			const scope = {
				errors: state.errors,
				invalid: !state.valid,
				valid: state.valid,
				validated: state.validated,
				pending: state.pending,
				reset,
				validate,
			};

			const nodes = slots.default ? slots.default(scope) : [];
			currentValue = findModelValue(nodes).value;

			return Array.isArray(nodes) && nodes.length === 1 ? nodes[0] : nodes;
		};
	},
});
