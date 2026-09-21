import { computed, defineComponent, inject, onUnmounted, provide, ref } from "vue";
import { OBSERVER_KEY } from "./symbols";

/**
 * Renderless form aggregator with the vee-validate 3 slot contract.
 *
 *   <ValidationObserver v-slot="{ handleSubmit, valid }">
 *     <q-form @submit="handleSubmit(save)"> ... </q-form>
 *   </ValidationObserver>
 *
 * Collects every ValidationProvider below it (including the ones nested inside
 * hk-input / hk-select), reports aggregate validity and runs a full validation
 * pass before handing control to the submit callback.
 */
export default defineComponent({
	name: "ValidationObserver",

	setup(props, { slots, expose }) {
		const fields = ref([]);
		const parent = inject(OBSERVER_KEY, null);

		const valid = computed(() => fields.value.every((field) => field.valid));
		const validated = computed(() => fields.value.some((field) => field.validated));

		function register(field) {
			fields.value = [...fields.value, field];
		}

		function unregister(field) {
			fields.value = fields.value.filter((entry) => entry !== field);
		}

		function getFieldValue(name) {
			const match = fields.value.find((field) => field.name === name);
			return match ? match.getValue() : undefined;
		}

		async function validate() {
			const results = await Promise.all(fields.value.map((field) => field.validate()));
			return results.every(Boolean);
		}

		function reset() {
			fields.value.forEach((field) => field.reset());
		}

		async function handleSubmit(callback) {
			const passed = await validate();
			if (passed && typeof callback === "function") {
				return callback();
			}
		}

		provide(OBSERVER_KEY, { register, unregister, getFieldValue });

		// A nested observer behaves as a single field of its parent, so the outer
		// form's `valid` accounts for everything inside it.
		if (parent) {
			const asField = {
				name: undefined,
				get valid() {
					return valid.value;
				},
				get validated() {
					return validated.value;
				},
				getValue: () => undefined,
				validate,
				reset,
			};
			parent.register(asField);
			onUnmounted(() => parent.unregister(asField));
		}

		expose({ validate, reset, handleSubmit });

		return () => {
			const nodes = slots.default
				? slots.default({
						handleSubmit,
						passes: handleSubmit,
						validate,
						reset,
						valid: valid.value,
						invalid: !valid.value,
						validated: validated.value,
					})
				: [];

			return Array.isArray(nodes) && nodes.length === 1 ? nodes[0] : nodes;
		};
	},
});
