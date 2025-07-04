<template>
	<ActionsDropdown v-if="available_types?.length" v-model="show" :types="available_types">
		<template #select-type>
			<q-item
				clickable
				v-ripple
				v-close-popup
				:class="{ active: selected_type?.length === available_types?.length }"
				@click="(selected_type = available_types), (show = true)"
			>
				<q-item-section>All</q-item-section>
			</q-item>
			<q-item
				v-for="key in available_types"
				:key="key"
				:clickable="!(selected_type?.length === 1 && selected_type.includes(key))"
				v-ripple
				v-close-popup
				:class="{ active: selected_type?.length === 1 && selected_type.includes(key) }"
				@click="(selected_type = [key]), (show = true)"
			>
				<q-item-section>
					{{ action_types[key].label }}
				</q-item-section>
				<q-item-section avatar>
					{{ actor?.[key]?.length }}
				</q-item-section>
			</q-item>
		</template>
		<template v-for="type in selected_type">
			<q-item :key="`header-${type}`">
				<q-item-section>
					{{ action_types[type].label }}
				</q-item-section>
			</q-item>
			<RollActions
				:key="`actions-${type}`"
				:actor="actor"
				:type="type"
				rolls-only
				@roll="show = false"
			/>
		</template>
	</ActionsDropdown>
</template>

<script>
import ActionsDropdown from "./ActionsDropdown.vue";
import RollActions from "../actions/RollActions.vue";

export default {
	name: "ActorActions",
	components: {
		ActionsDropdown,
		RollActions,
	},
	props: {
		actor: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			typeSetter: undefined,
			show: false,
			action_types: {
				actions: { label: "Actions", name: "actions" },
				special_abilities: { label: "Special abilities", name: "special" },
				legendary_actions: { label: "Legendary actions", name: "legendary" },
				reactions: { label: "Reactions", name: "reactions" },
			},
		};
	},
	computed: {
		available_types() {
			const types = [];
			for (const action_type of Object.keys(this.action_types)) {
				if (
					this.actor[action_type]?.find(
						(action) =>
							action?.action_list?.[0]?.type !== "other" && action?.action_list?.[0]?.rolls?.length
					)
				) {
					types.push(action_type);
				}
			}
			return types;
		},
		selected_type: {
			get() {
				return this.typeSetter ? this.typeSetter : this.available_types;
			},
			set(newVal) {
				this.typeSetter = newVal;
			},
		},
	},
};
</script>

<style lang="scss" scoped>
.active {
	font-weight: bold;
}
</style>
