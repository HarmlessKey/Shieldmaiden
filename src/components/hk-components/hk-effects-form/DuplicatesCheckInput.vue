<template>
	<div class="duplicates-check-input">
		<div class="neutral-2 mb-1">{{ label }}</div>
		<div class="row q-col-gutter-sm">
			<div class="col-12 col-md-7">
				<hk-select
					:value="check.when"
					:options="toOptions(duplicates_check_when)"
					label="When *"
					name="When"
					rules="required"
					emit-value
					map-options
					@input="setWhen"
				>
					<template v-slot:option="scope">
						<q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
							<q-item-section>
								<q-item-label>{{ scope.opt.label }}</q-item-label>
								<q-item-label caption>{{ scope.opt.description }}</q-item-label>
							</q-item-section>
						</q-item>
					</template>
				</hk-select>
			</div>
			<div class="col-12 col-md-5">
				<hk-select
					:value="check.dice_type"
					:options="diceOptions"
					label="Die *"
					name="Die"
					rules="required"
					emit-value
					map-options
					@input="update('dice_type', $event)"
				/>
			</div>
		</div>

		<!-- Minimum roll: one number, or a minimum per number of duplicates left -->
		<div class="d-flex justify-content-between items-center mt-2 mb-1">
			<span class="neutral-2">Minimum roll</span>
			<q-btn-toggle
				:value="perDuplicates ? 'table' : 'number'"
				:options="[
					{ label: 'One number', value: 'number' },
					{ label: 'Per duplicates left', value: 'table' },
				]"
				:dark="dark"
				size="sm"
				no-caps
				unelevated
				toggle-color="primary"
				@input="setMinMode"
			/>
		</div>
		<hk-input
			v-if="!perDuplicates"
			:value="check.min_roll"
			label="Minimum roll *"
			name="Minimum roll"
			rules="required|min_value:1"
			type="number"
			integer
			@input="update('min_roll', toNumber($event))"
		/>
		<template v-else>
			<div v-for="(row, i) in check.min_roll" :key="`row-${i}`" class="row q-col-gutter-sm items-center mb-1">
				<div class="col">
					<hk-input
						:value="row.count"
						label="Duplicates left *"
						:name="`Duplicates left ${i + 1}`"
						rules="required|min_value:1"
						type="number"
						integer
						@input="setRow(i, 'count', $event)"
					/>
				</div>
				<div class="col">
					<hk-input
						:value="row.min"
						label="Minimum *"
						:name="`Minimum ${i + 1}`"
						rules="required|min_value:1"
						type="number"
						integer
						@input="setRow(i, 'min', $event)"
					/>
				</div>
				<div class="col-auto">
					<a
						v-if="check.min_roll.length > 1"
						class="btn btn-sm btn-clear"
						aria-label="Remove row"
						@click="removeRow(i)"
					>
						<i aria-hidden="true" class="fas fa-trash-alt red" />
					</a>
				</div>
			</div>
			<a class="btn btn-sm bg-neutral-5" @click="addRow">
				<i aria-hidden="true" class="fas fa-plus green mr-1" />
				Row
			</a>
			<div class="neutral-2 mt-1">
				With a number of duplicates left that has no row, the closest lower row is used.
			</div>
		</template>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import { duplicates_check_when } from "src/utils/effectsConstants";

const DICE = [4, 6, 8, 10, 12, 20, 100];

/**
 * The check of a Duplicates sub-effect ($defs/duplicates_check), on the sub-effect's `check`.
 * The check object is created on the first change.
 */
export default {
	name: "DuplicatesCheckInput",
	mixins: [editorMixin],
	props: {
		// The sub-effect
		value: { type: Object, required: true },
		label: { type: String, default: "Check" },
	},
	data() {
		return {
			duplicates_check_when,
			diceOptions: DICE.map((sides) => ({ label: `d${sides}`, value: sides })),
		};
	},
	computed: {
		check() {
			return this.value.check || {};
		},
		perDuplicates() {
			return Array.isArray(this.check.min_roll);
		},
	},
	methods: {
		ensure() {
			if (!this.value.check) this.$set(this.value, "check", {});
			return this.value.check;
		},
		update(key, value) {
			this.setField(this.ensure(), key, value);
		},
		// The editions' dice: the 2014 d20 before the attack, the 2024 d6 on a hit
		setWhen(when) {
			const check = this.ensure();
			this.setField(check, "when", when);
			if (check.dice_type === undefined) this.$set(check, "dice_type", when === "hit" ? 6 : 20);
		},
		setMinMode(mode) {
			if (mode === "table") {
				const min = typeof this.check.min_roll === "number" ? this.check.min_roll : undefined;
				const count = parseInt(this.value.count) || 1;
				this.update("min_roll", [{ count, min }]);
			} else {
				const first = this.perDuplicates ? this.check.min_roll[0]?.min : undefined;
				this.update("min_roll", first);
			}
		},
		setRow(index, key, value) {
			const rows = [...this.check.min_roll];
			rows[index] = { ...rows[index], [key]: this.toNumber(value) };
			if (rows[index][key] === undefined) delete rows[index][key];
			this.update("min_roll", rows);
		},
		addRow() {
			const rows = [...this.check.min_roll];
			const lowest = Math.min(...rows.map((row) => parseInt(row.count) || 1));
			rows.push({ count: Math.max(1, lowest - 1) });
			this.update("min_roll", rows);
		},
		removeRow(index) {
			this.update(
				"min_roll",
				this.check.min_roll.filter((_, i) => i !== index)
			);
		},
	},
};
</script>
