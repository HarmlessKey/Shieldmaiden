<template>
	<hk-select
		v-bind="$attrs"
		v-model="selected"
		:options="condition_list"
		autocomplete="off"
		type="text"
		multiple
	>
		<slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot" />
		<template v-if="selected" slot="selected-item" slot-scope="scope">
			<q-chip
				:key="`selected-${scope.opt}`"
				:dark="$store.getters.theme === 'dark'"
				removable
				@remove="select(scope.opt)"
			>
				<span class="truncate">{{ scope.opt.capitalize() }}</span>
			</q-chip>
		</template>
		<template v-slot:option="scope">
			<q-item
				clickable
				v-ripple
				:active="selected && selected.includes(scope.opt)"
				@click="select(scope.opt)"
			>
				<q-item-section avatar>
					<i aria-hidden="true" :class="`hki-${scope.opt}`" />
				</q-item-section>
				<q-item-section>
					<q-item-label v-text="scope.opt.capitalize()" />
				</q-item-section>
			</q-item>
		</template>
	</hk-select>
</template>

<script>
import { conditions } from "src/mixins/conditions.js";

export default {
	name: "hk-condition-select",
	mixins: [conditions],
	props: {
		value: {
			type: [String, Array],
			default: undefined,
		},
		nonMagical: {
			type: Boolean,
			default: false,
		},
		multiple: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		selected: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
			},
		},
		condition_list() {
			return this.conditionList.map((item) => {
				return item.value;
			});
		},
	},
	methods: {
		select(option) {
			if (this.multiple) {
				if (this.selected) {
					const index = this.selected.indexOf(option);
					if (index > -1) {
						this.selected.splice(index, 1);
					} else {
						this.selected.push(option);
					}
				} else {
					this.selected = [option];
				}
			} else {
				this.selected = option;
			}
		},
	},
};
</script>
