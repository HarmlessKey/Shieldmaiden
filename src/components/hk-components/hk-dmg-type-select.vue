<template>
	<hk-select
		v-bind="$attrs"
		v-model="damage_type"
		:multiple="multiple"
		:use-input="hide_selected"
		input-debounce="0"
		:label="label"
		:options="filtered_damage_types"
		@filter="filterTypes"
		@focus="hide_selected = true"
		@blur="hide_selected = false"
	>
		<slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot" />
		<template slot="selected-item" scope="scope">
			<q-chip
				v-if="multiple"
				:dark="$store.getters.theme === 'dark'"
				removable
				@remove="select(scope.opt)"
			>
				<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt" class="-ml-1 mr-2" />
				<span class="truncate">{{ typeLabel(scope.opt) }}</span>
			</q-chip>
			<template v-else>
				<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt" class="mr-1" />
				{{ typeLabel(scope.opt) }} damage
			</template>
		</template>
		<template v-slot:option="scope">
			<q-item
				clickable
				v-ripple
				v-close-popup="!multiple"
				:active="scope.selected"
				@click="select(scope.opt)"
			>
				<q-item-section avatar>
					<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt" />
				</q-item-section>
				<q-item-section>
					<q-item-label v-text="typeLabel(scope.opt)" />
				</q-item-section>
			</q-item>
		</template>
	</hk-select>
</template>

<script>
import { damage_types, damage_type_icons } from "src/utils/generalConstants";

export default {
	name: "hk-dmg-type-select",
	props: {
		value: {
			type: [String, Array],
			default: undefined,
		},
		label: {
			type: String,
			default: undefined,
		},
		placeholder: {
			type: String,
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
		damage_type: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
			},
		},
		damage_types() {
			if (!this.nonMagical) {
				return damage_types.filter((type) => !type.startsWith("non_magical"));
			}
			return damage_types;
		},
	},
	data() {
		return {
			damage_type_icons: damage_type_icons,
			filtered_damage_types: damage_types,
			hide_selected: false,
		};
	},
	methods: {
		typeLabel(value) {
			value = value.split("_");
			return value.join(" ").capitalizeEach();
		},
		filterTypes(val, update) {
			if (val === "") {
				update(() => {
					this.filtered_damage_types = this.damage_types;
				});
				return;
			}

			update(() => {
				const needle = val.toLowerCase();
				this.filtered_damage_types = this.damage_types.filter(
					(v) => v.toLowerCase().indexOf(needle) > -1
				);
			});
		},
		select(option) {
			if (this.multiple) {
				if (this.damage_type) {
					const index = this.damage_type.indexOf(option);
					if (index > -1) {
						this.damage_type.splice(index, 1);
					} else {
						this.damage_type.push(option);
					}
				} else {
					this.damage_type = [option];
				}
			} else {
				this.damage_type = option;
			}
		},
	},
};
</script>
