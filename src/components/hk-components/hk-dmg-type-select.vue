<template>
	<Field :rules="validationRules" :name="label" v-slot="{ errorMessage, meta }">
		<q-select
			:dark="$store.getters.theme === 'dark'" filled square
			:dense="dense"
			:clearable="clearable"
			:use-input="hide_selected"
			input-debounce="0"
			:label="label"
			:options="filtered_damage_types"
			v-model="damage_type"
			@filter="filterTypes"
			@focus="hide_selected = true"
			@blur="hide_selected = false"
			:error="!meta.valid && meta.validated"
			:error-message="errorMessage"
		>
			<template v-slot:selected>
				<span v-if="damage_type && !hide_selected" class="truncate">
					<i aria-hidden="true" :class="[damage_type_icons[damage_type], damage_type]"/>
					{{ typeLabel(damage_type) }} damage
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
						<q-item-label v-text="typeLabel(scope.opt)"/>
					</q-item-section>
				</q-item>
			</template>
		</q-select>
	</Field>
</template>

<script>
	import { damage_types, damage_type_icons } from "src/utils/generalConstants";

	export default {
		name: 'hk-dmg-type-select',
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
			validationRules: {
				type: String,
				required: false,
				default: ""
			},
			nonMagical: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			damage_type: {
				get() {
					return this.value;
				},
				set(newVal) {
					this.$emit("input", newVal);
				}
			},
			damage_types() {
				if(!this.nonMagical) {
					return damage_types.filter(type => !type.startsWith("non_magical"));
				}
				return damage_types;
			}
		},
		data() {
			return {
				damage_type_icons: damage_type_icons,
				filtered_damage_types: damage_types,
				hide_selected: false
			}
		},
		methods: {
			typeLabel(value) {
				value = value.split("_");
				return value.join(" ").capitalizeEach();
			},
			filterTypes(val, update) {
				if (val === '') {
					update(() => {
						this.filtered_damage_types = this.damage_types;
					})
					return;
				}

				update(() => {
					const needle = val.toLowerCase();
					this.filtered_damage_types = this.damage_types.filter(v => v.toLowerCase().indexOf(needle) > -1);
				});
			}
		}
	}
</script>