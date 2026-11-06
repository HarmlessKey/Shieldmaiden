<template>
	<div>
		<div class="row q-col-gutter-sm">
			<div class="col-4">
				<hk-input
					:value="value.dice_count"
					label="Dice"
					name="Dice count"
					type="number"
					integer
					rules="between:0,99"
					@input="setNumber(value, 'dice_count', $event)"
				/>
			</div>
			<div class="col-4">
				<hk-select
					:value="value.dice_type"
					:options="dice_types"
					label="Die"
					emit-value
					map-options
					clearable
					@input="setField(value, 'dice_type', $event)"
				/>
			</div>
			<div class="col-4">
				<hk-input
					:value="value.fixed_val"
					label="Fixed value"
					name="Fixed value"
					type="number"
					integer
					rules="between:-99,999"
					@input="setNumber(value, 'fixed_val', $event)"
				/>
			</div>
		</div>
		<template v-if="damage">
			<div class="row q-col-gutter-sm mt-1">
				<div class="col-12 col-md-6">
					<hk-dmg-type-select
						:value="value.damage_type"
						label="Damage type"
						clearable
						@input="setField(value, 'damage_type', $event)"
					/>
				</div>
				<div class="col-12 col-md-6">
					<hk-dmg-type-select
						:value="value.damage_type_choice"
						label="Or the caster picks one of"
						multiple
						@input="setField(value, 'damage_type_choice', $event)"
					/>
				</div>
			</div>
			<q-checkbox
				:value="!!value.magical"
				:dark="dark"
				label="Magical damage"
				class="mt-2"
				@input="setField(value, 'magical', $event || undefined)"
			/>
		</template>
		<div class="mt-2">
			<template v-if="value.modifier">
				<div class="d-flex justify-content-between items-center mb-1">
					<span class="neutral-2">Modifier added to the roll</span>
					<a class="btn btn-sm btn-clear" @click="removeBlock(value, 'modifier')">
						<i aria-hidden="true" class="fas fa-trash-alt red" />
						<q-tooltip anchor="top middle" self="center middle">Remove modifier</q-tooltip>
					</a>
				</div>
				<FormulaInput :value="value.modifier" name="Modifier formula" />
			</template>
			<a v-else class="btn btn-sm bg-neutral-5" @click="addBlock(value, 'modifier', { formula: '' })">
				<i aria-hidden="true" class="fas fa-plus green mr-1" />
				Modifier
			</a>
		</div>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import FormulaInput from "./FormulaInput.vue";
import { dice_types } from "src/utils/generalConstants";

export default {
	name: "DiceRollInput",
	components: { FormulaInput },
	mixins: [editorMixin],
	props: {
		value: { type: Object, required: true },
		// Show damage type fields
		damage: { type: Boolean, default: true },
	},
	data() {
		return { dice_types };
	},
};
</script>
