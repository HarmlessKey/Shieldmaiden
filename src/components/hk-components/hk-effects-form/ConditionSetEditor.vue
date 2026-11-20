<template>
	<div class="condition-set">
		<div class="d-flex justify-content-between items-center mb-2">
			<q-btn-toggle
				:value="mode"
				:options="modes"
				:dark="dark"
				size="sm"
				no-caps
				unelevated
				toggle-color="primary"
				@input="setMode"
			/>
			<a v-if="mode !== 'check'" class="btn btn-sm bg-neutral-5 condition-set__add" @click="addItem">
				<i aria-hidden="true" class="fas fa-plus green" />
				<span class="d-none d-md-inline ml-1">Add</span>
				<q-tooltip anchor="top middle" self="center middle">Add check</q-tooltip>
			</a>
		</div>
		<ConditionCheck v-if="mode === 'check'" :value="value" />
		<template v-else>
			<q-list v-if="items.length" :dark="dark" class="accordion">
				<q-expansion-item
					v-for="(item, i) in items"
					:key="`item-${i}`"
					v-model="open[i]"
					:dark="dark"
					switch-toggle-side
				>
					<template v-slot:header>
						<q-item-section v-if="i > 0" avatar class="condition-set__connector neutral-2">
							{{ mode === "any_of" ? "or" : "and" }}
						</q-item-section>
						<q-item-section class="truncate">{{ itemLabel(item) }}</q-item-section>
						<q-item-section v-if="!isGroup(item)" class="truncate neutral-2">
							{{ subjectLabel(item) }}
						</q-item-section>
						<q-item-section avatar>
							<div class="d-flex items-center gap-1">
								<q-chip v-if="!isGroup(item) && item.negate" :dark="dark" size="sm" square>Not</q-chip>
								<button class="btn btn-sm bg-neutral-5" @click.stop.prevent="removeItem(i)">
									<i aria-hidden="true" class="fas fa-trash-alt red" />
									<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
								</button>
							</div>
						</q-item-section>
					</template>
					<div class="accordion-body">
						<ConditionSetEditor :value="item" @input="$set(items, i, $event)" />
					</div>
				</q-expansion-item>
			</q-list>
		</template>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import ConditionCheck from "./ConditionCheck.vue";
import { condition_check_types, condition_subjects } from "src/utils/effectsConstants";

/**
 * A $defs/condition_set: one check, or an "all of" / "any of" group of sets, nested to any
 * depth. Emits a new value when the shape changes; checks and groups are edited in place.
 * A single check is saved as an object, a group as { all_of } or { any_of }. A plain array
 * (from data) is edited as an "all of" group and kept as an array.
 */
export default {
	name: "ConditionSetEditor",
	components: { ConditionCheck },
	mixins: [editorMixin],
	props: {
		value: { type: [Object, Array], required: true },
	},
	data() {
		return {
			modes: [
				{ label: "One check", value: "check" },
				{ label: "All of", value: "all_of" },
				{ label: "Any of", value: "any_of" },
			],
			// Open accordion items, by position (an item replaced by a group stays open)
			open: [],
		};
	},
	computed: {
		mode() {
			if (Array.isArray(this.value) || Array.isArray(this.value.all_of)) return "all_of";
			if (Array.isArray(this.value.any_of)) return "any_of";
			return "check";
		},
		items() {
			if (Array.isArray(this.value)) return this.value;
			return this.value[this.mode] || [];
		},
	},
	methods: {
		setMode(mode) {
			if (mode === this.mode) return;
			if (mode === "check") {
				// Keep the first check of the group
				const first = this.items[0];
				const isCheck = first && !Array.isArray(first) && !first.all_of && !first.any_of;
				this.$emit("input", isCheck ? first : {});
			} else if (this.mode === "check") {
				// The check becomes the group's first item, opened so its inputs stay in view
				this.open = [true];
				this.$emit("input", { [mode]: [this.value] });
			} else {
				this.$emit("input", { [mode]: this.items });
			}
		},
		addItem() {
			this.items.push({});
			// A new check opens, so its inputs show right away
			this.$set(this.open, this.items.length - 1, true);
		},
		removeItem(i) {
			this.items.splice(i, 1);
			this.open.splice(i, 1);
		},
		isGroup(item) {
			return Array.isArray(item) || Array.isArray(item?.all_of) || Array.isArray(item?.any_of);
		},
		// Closed item: the check type, or "Any of: 2 checks" for a nested group
		itemLabel(item) {
			if (this.isGroup(item)) {
				const items = Array.isArray(item) ? item : item.all_of || item.any_of;
				const kind = Array.isArray(item?.any_of) ? "Any of" : "All of";
				return `${kind}: ${items.length} check${items.length === 1 ? "" : "s"}`;
			}
			return condition_check_types[item?.type]?.label || "New check";
		},
		subjectLabel(item) {
			return condition_subjects[item?.subject || "self"]?.label;
		},
	},
};
</script>

<style lang="scss" scoped>
// As small as the One check / All of / Any of toggle next to it
.condition-set__add {
	padding: 2px 8px;
	font-size: 12px;
	line-height: 20px;
}
.condition-set__connector {
	min-width: 30px;
	font-size: 12px;
}
</style>
