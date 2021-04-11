<template>
	<q-select 
		dark filled square
		:dense="dense"
		:clearable="clearable"
		:use-input="hide_selected"
		input-debounce="0"
		:label="label"
		:options="filtered_damage_types"
		v-model="damage_type"
		@filter="filterTypes"
		:rules="required ? [val => !!val || 'Required'] : ''"
		@focus="hide_selected = true"
		@blur="hide_selected = false"
	>
		<template v-slot:selected>
			<span v-if="damage_type && !hide_selected" class="truncate">
				<i :class="[damage_type_icons[damage_type], damage_type]"/>
				{{ damage_type.capitalize() }} damage
			</span>
			<span v-else>
				{{ !hide_selected ? placeholder : "" }}
			</span>
		</template>
		<template v-slot:option="scope">
			<q-item
				clickable
				v-ripple
				v-close-popup
				:active="damage_type === scope.opt"
				@click="damage_type = scope.opt"
			>
				<q-item-section avatar>
					<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt"/>
				</q-item-section>
				<q-item-section>
					<q-item-label v-html="scope.opt.capitalize()"/>
				</q-item-section>
			</q-item>
		</template>
	</q-select>
</template>

<script>
	import { damage_types } from "@/mixins/damageTypes.js";

	export default {
		name: 'hk-dmg-type-select',
		mixins: [damage_types],
		props: {
			value: {
				type: String,
				default: undefined
			},
			label: {
				type: String,
				default: undefined
			},
			placeholder: {
				type: String,
				default: undefined
			},
			clearable: {
				type: Boolean,
				required: false,
				default: false
			},
			dense: {
				type: Boolean,
				required: false,
				default: false
			},
			required: {
				type: Boolean,
				required: false,
				default: false
			},
		},
		computed: {
			damage_type: {
				get() {
					return this.value;
				},
				set(newVal) {
					this.$emit("input", newVal);
				}
			}
		},
		data() {
			return {
				filtered_damage_types: this.damage_types,
				hide_selected: false
			}
		},
		methods: {
			filterTypes(val, update) {
				if (val === '') {
					update(() => {
						this.filtered_damage_types = this.damage_types;
					})
					return
				}

				update(() => {
					const needle = val.toLowerCase();
					this.filtered_damage_types = this.damage_types.filter(v => v.toLowerCase().indexOf(needle) > -1);
				});
			}
		}
	}
</script>