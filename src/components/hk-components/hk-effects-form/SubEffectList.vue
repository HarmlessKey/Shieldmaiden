<template>
	<div class="sub-effect-list">
		<component
			:is="nested ? 'div' : 'h3'"
			class="sub-effect-list__header d-flex justify-content-between items-center"
			:class="{ 'neutral-2': nested }"
		>
			{{ label }}
			<a class="btn btn-sm bg-neutral-5" @click="add">
				<i aria-hidden="true" class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
				<q-tooltip anchor="top middle" self="center middle">Add sub-effect</q-tooltip>
			</a>
		</component>

		<!-- Saving checks this too (schema validation) -->
		<p v-if="value.length < minItems" class="red mb-1">
			Add at least {{ minItems }} sub-effect{{ minItems > 1 ? "s" : "" }}
		</p>

		<q-list :dark="dark" class="accordion">
			<ValidationObserver
				v-for="(sub_effect, i) in value"
				:key="idOf(sub_effect)"
				v-slot="{ valid }"
				slim
			>
				<q-expansion-item
					v-model="open[idOf(sub_effect)]"
					:dark="dark"
					switch-toggle-side
					enter-active-class="animated animate__fadeIn"
					leave-active-class="animated animate__fadeOut"
				>
					<template v-slot:header>
						<q-item-section v-if="!valid" avatar>
							<q-icon name="error" color="red" />
							<q-tooltip anchor="top middle" self="center middle">Validation errors</q-tooltip>
						</q-item-section>
						<q-item-section class="truncate">
							{{ title(sub_effect) }}
						</q-item-section>
						<q-item-section avatar>
							<div class="d-flex gap-1">
								<button
									v-if="i > 0"
									class="btn btn-sm bg-neutral-5"
									@click.stop.prevent="move(i, -1)"
								>
									<i aria-hidden="true" class="fas fa-arrow-up" />
									<q-tooltip anchor="top middle" self="center middle">Move up</q-tooltip>
								</button>
								<button
									v-if="i < value.length - 1"
									class="btn btn-sm bg-neutral-5"
									@click.stop.prevent="move(i, 1)"
								>
									<i aria-hidden="true" class="fas fa-arrow-down" />
									<q-tooltip anchor="top middle" self="center middle">Move down</q-tooltip>
								</button>
								<button class="btn btn-sm bg-neutral-5" @click.stop.prevent="remove(i)">
									<i aria-hidden="true" class="fas fa-trash-alt red" />
									<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
								</button>
							</div>
						</q-item-section>
					</template>

					<div class="accordion-body">
						<SubEffect :value="sub_effect" />
					</div>
				</q-expansion-item>
			</ValidationObserver>
		</q-list>
	</div>
</template>

<script>
import editorMixin from "./editorMixin";
import SubEffect from "./SubEffect.vue";
import { describeSubEffect } from "src/utils/effectFunctions";

// Stable keys for sub-effect objects, so reordering keeps each item's state
const ids = new WeakMap();
let next_id = 0;

/**
 * A list of sub-effects, edited in place: the top-level list and every nested one (aura,
 * save success and fail-by-5 effects, repeat-save on_fail, duration on_expire).
 */
export default {
	name: "SubEffectList",
	components: { SubEffect },
	mixins: [editorMixin],
	props: {
		value: { type: Array, required: true },
		label: { type: String, default: "Sub-effects" },
		// A nested list: smaller header
		nested: { type: Boolean, default: false },
		minItems: { type: Number, default: 0 },
	},
	data() {
		return { open: {} };
	},
	computed: {
		// The list is edited in place (design decision 2)
		items() {
			return this.value;
		},
	},
	methods: {
		idOf(sub_effect) {
			if (!ids.has(sub_effect)) ids.set(sub_effect, `sub-effect-${next_id++}`);
			return ids.get(sub_effect);
		},
		title(sub_effect) {
			if (!sub_effect.type) return "New sub-effect";
			const { description, ...rest } = sub_effect; // eslint-disable-line no-unused-vars
			return describeSubEffect(rest);
		},
		add() {
			const sub_effect = {};
			this.items.push(sub_effect);
			this.$set(this.open, this.idOf(sub_effect), true);
		},
		remove(i) {
			this.items.splice(i, 1);
		},
		move(i, step) {
			const [sub_effect] = this.items.splice(i, 1);
			this.items.splice(i + step, 0, sub_effect);
		},
	},
};
</script>

<style lang="scss" scoped>
// Like the section headers of the NPC abilities form
.sub-effect-list__header {
	border-bottom: solid 1px $neutral-4;
	font-size: 15px;
	margin-bottom: 1px;
	padding-bottom: 4px;
}
</style>
