<template>
	<quick-edit ref="popup" :entity="entity" v-slot="{ editable_entity }">
		<hk-input
			v-model="editable_entity.ac_bonus"
			dense
			label="AC bonus"
			type="number"
			@keydown.enter="setAC('ac_bonus', editable_entity.ac_bonus)"
		>
			<template v-slot:prepend>
				<q-icon size="xs" name="fas fa-shield-check" />
			</template>
			<template v-slot:after>
				<q-btn
					color="primary"
					label="Save"
					no-caps
					v-close-popup
					@click.stop="setAC('ac_bonus', editable_entity.ac_bonus)"
				/>
			</template>
		</hk-input>
		<hk-input
			v-model="editable_entity.ac"
			class="mt-2"
			dense
			label="Override AC"
			type="number"
			@keydown.enter="setAC('ac', editable_entity.ac)"
		>
			<template v-slot:prepend>
				<q-icon v-if="entity.transformed" name="fas fa-paw-claws green" />
				<q-icon size="xs" name="fas fa-shield" />
			</template>
			<template v-slot:after>
				<q-btn
					no-caps
					color="primary"
					label="Save"
					v-close-popup
					@click.stop="setAC('ac', editable_entity.ac)"
				/>
			</template>
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
		...mapActions(["edit_entity_prop"]),
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
:deep() {
	.q-input {
		max-width: 200px;
	}
}
</style>
