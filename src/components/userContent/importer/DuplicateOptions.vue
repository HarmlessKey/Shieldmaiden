<template>
	<div>
		<div class="d-flex gap-1 justify-content-between mb-3">
			<div>
				<strong>New import</strong>
				<DuplicateOptionItem :input="shortImported" />
			</div>
			<div>
				<strong>Existing</strong>
				<DuplicateOptionItem :input="existing" />
			</div>
		</div>
		<q-btn-toggle
			v-if="imported.meta.duplicate"
			slot="footer"
			v-model="imported.meta.overwrite"
			toggle-color="primary"
			dense
			spread
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
			return this.imported.meta.duplicate;
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

<style lang="scss" scoped>
.q-btn-toggle {
	:deep(.q-icon) {
		font-size: 18px;
	}
}
</style>
