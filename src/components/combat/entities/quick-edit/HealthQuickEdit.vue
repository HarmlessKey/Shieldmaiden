<template>
	<quick-edit ref="popup" :entity="entity" v-slot="{ editable_entity }">
		<hk-input
			v-model="editable_entity.tempHp"
			dense
			class="mb-2"
			label="Temp HP"
			type="number"
			color="white"
			@keydown.enter="setHP('tempHp', editable_entity.tempHp)"
		>
			<q-icon slot="prepend" size="xs" name="fas fa-stopwatch" />
			<q-btn
				slot="after"
				no-caps
				color="primary"
				label="Save"
				v-close-popup
				@click.stop="setHP('tempHp', editable_entity.tempHp)"
			/>
		</hk-input>
		<hk-input
			v-model="editable_entity.maxHpMod"
			dense
			label="Max HP Mod"
			type="number"
			color="white"
			@keydown.enter="setHP('maxHpMod', editable_entity.maxHpMod)"
		>
			<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
			<q-icon slot="prepend" size="xs" name="fas fa-plus" />
			<q-btn
				slot="after"
				no-caps
				color="primary"
				label="Save"
				v-close-popup
				@click.stop="setHP('maxHpMod', editable_entity.maxHpMod)"
			/>
		</hk-input>
		<hr />
		<hk-input
			v-model="editable_entity.curHp"
			dense
			label="Current HP"
			type="number"
			color="white"
			class="mb-2"
			@keydown.enter="setHP('curHp', editable_entity.curHp)"
		>
			<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
			<q-icon slot="prepend" size="xs" name="fas fa-heartbeat" />
			<q-btn
				slot="after"
				no-caps
				color="primary"
				label="Save"
				v-close-popup
				@click.stop="setHP('curHp', editable_entity.curHp)"
			/>
		</hk-input>
		<hk-input
			v-model="editable_entity.maxHp"
			dense
			label="Max HP"
			type="number"
			color="white"
			@keydown.enter="setHP('maxHp', editable_entity.maxHp)"
		>
			<q-icon v-if="entity.transformed" slot="prepend" name="fas fa-paw-claws green" />
			<q-icon v-else slot="prepend" size="xs" name="fas fa-heart" />
			<q-btn
				slot="after"
				color="primary"
				label="Save"
				v-close-popup
				@click.stop="setHP('maxHp', editable_entity.maxHp)"
			/>
		</hk-input>
	</quick-edit>
</template>

<script>
import { mapActions } from "vuex";
import QuickEdit from "./index.vue";

export default {
	name: "HealthQuickEdit",
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
		setHP(prop, value) {
			if (prop === "curHp" && value === undefined) {
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
