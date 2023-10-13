<template>
	<div>
		<div class="d-flex justify-content-between">
			<DuplicateOptionItem :input="shortImported" />
			<DuplicateOptionItem :input="existing" />
		</div>
		<q-btn-toggle
			v-if="imported.meta.duplicate"
			v-model="imported.meta.overwrite"
			toggle-color="primary"
			dense
			flat
			:options="[
				{ value: 'overwrite', icon: 'fas fa-pen', slot: 'overwrite' },
				{ value: 'duplicate', icon: 'fas fa-copy', slot: 'duplicate' },
				{ value: 'skip', icon: 'fas fa-ban', slot: 'skip' },
			]"
		>
			<template v-slot:overwrite>
				<q-tooltip>Overwrite</q-tooltip>
			</template>
			<template v-slot:duplicate>
				<q-tooltip>Duplicate</q-tooltip>
			</template>
			<template v-slot:skip>
				<q-tooltip>Skip</q-tooltip>
			</template>
		</q-btn-toggle>
	</div>
</template>

<script>
import DuplicateOptionItem from "./DuplicateOptionItem.vue";
export default {
	name: "DuplicateOptions",

	components: {
		DuplicateOptionItem,
	},
	props: {
		value: Object,
	},
	computed: {
		imported: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
			},
		},
		existing() {
			const existing = this.imported.meta.duplicate;
			delete existing.key;
			return existing;
		},
		shortImported() {
			return Object.fromEntries(
				Object.entries(this.imported).filter(([prop, val]) =>
					Object.keys(this.existing).includes(prop)
				)
			);
		},
	},
	data() {
		return {};
	},

	mounted() {},

	methods: {},
};
</script>

<style lang="scss" scoped></style>
