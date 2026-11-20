<template>
	<quick-edit ref="popup" :entity="entity" v-slot="{ editable_entity }">
		<button class="btn btn-sm btn-block bg-neutral-5" @click.stop="openBonuses('ac')">
			<i aria-hidden="true" class="fas fa-shield-check mr-1" /> AC bonuses
		</button>
		<hk-input
			v-model="editable_entity.ac"
			class="mt-2"
			dense
			label="Override AC"
			type="number"
			@keydown.enter="setAC('ac', editable_entity.ac)"
		>
			<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
			<q-icon slot="prepend" size="xs" name="fas fa-shield" />
			<q-btn
				slot="after"
				no-caps
				color="primary"
				label="Save"
				v-close-popup
				@click.stop="setAC('ac', editable_entity.ac)"
			/>
		</hk-input>
	</quick-edit>
</template>

<script>
import { mapActions } from "vuex";
import QuickEdit from "./index.vue";

export default {
	name: "ArmorClassQuickEdit",
	components: {
		QuickEdit,
	},
	props: {
		entity: {
			type: Object,
			required: true,
		},
	},
	methods: {
		...mapActions(["edit_entity_prop", "setDrawer"]),
		openBonuses(stat) {
			this.$refs.popup.hide();
			this.setDrawer({
				show: true,
				type: "drawers/encounter/StatBonuses",
				data: { entityKey: this.entity.key, stat },
			});
		},
		setAC(prop, value) {
			if (prop === "ac" && value === undefined) {
				return;
			}
			this.edit_entity_prop({
				key: this.entity.key,
				entityType: this.entity.entityType,
				prop,
				value,
			});
			this.$refs.popup.hide();
		},
	},
};
</script>

<style lang="scss" scoped>
::v-deep {
	.q-input {
		max-width: 200px;
	}
}
</style>
