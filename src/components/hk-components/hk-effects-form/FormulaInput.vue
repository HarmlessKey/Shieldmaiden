<template>
	<div class="row q-col-gutter-sm">
		<div class="col-12 col-md-6">
			<hk-input
				:value="value.formula"
				:label="label"
				:name="name"
				rules="required|formula"
				@input="setField(value, 'formula', $event)"
			>
				<hk-popover slot="append" header="Formula variables">
					<i class="fas fa-info-circle neutral-2" aria-hidden="true" />
					<template #content>
						<p>Numbers, + - * / and parentheses, and these variables:</p>
						<p>{{ variables }}</p>
						<p class="mb-0">
							<code>class.&lt;column&gt;</code> reads a class table column. Prefix a variable with
							<code>caster.</code> to read the caster's value, e.g. <code>caster.cha_mod</code>.
						</p>
					</template>
				</hk-popover>
			</hk-input>
		</div>
		<div class="col-4 col-md-2">
			<hk-input
				:value="value.min"
				label="Min"
				type="number"
				@input="setNumber(value, 'min', $event)"
			/>
		</div>
		<div class="col-4 col-md-2">
			<hk-input
				:value="value.max"
				label="Max"
				type="number"
				@input="setNumber(value, 'max', $event)"
			/>
		</div>
		<div class="col-4 col-md-2">
			<hk-select
				:value="value.round"
				:options="toOptions(rounding)"
				label="Rounding"
				emit-value
				map-options
				clearable
				@input="setField(value, 'round', $event)"
			/>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import { rounding } from "src/utils/effectsConstants";
import { FORMULA_VARIABLES } from "src/utils/effectFunctions";

export default {
	name: "FormulaInput",
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
		label: { type: String, default: "Formula" },
		name: { type: String, default: "Formula" },
	},
	data() {
		return {
			rounding,
			variables: FORMULA_VARIABLES.join(", "),
		};
	},
};
</script>
