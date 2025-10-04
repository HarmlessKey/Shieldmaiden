<template>
	<quick-edit ref="popup" :entity="entity" v-slot="{ editable_entity }">
		<hk-input
			dense
			autofocus
			label="Initiative"
			type="number"
			v-model="editable_entity.initiative"
			@keydown.enter="setInitiative(editable_entity.initiative)"
		>
			<q-btn
				slot="after"
				color="primary"
				v-close-popup
				no-caps
				@click.stop="setInitiative(editable_entity.initiative)"
			>
				Save
			</q-btn>
		</hk-input>
	</quick-edit>
</template>

<script>
import { mapActions } from "vuex";
import QuickEdit from "./index.vue";

export default {
	name: "InitiativeQuickEdit",
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
		...mapActions(["set_initiative"]),
		setInitiative(value) {
			if (value === undefined) {
				return;
			}
			this.set_initiative({ key: this.entity.key, initiative: value });
			this.$refs.popup.hide();
		},
	},
};
</script>

<style lang="scss" scoped>
::v-deep {
	.q-input {
		max-width: 180px;
	}
}
</style>
