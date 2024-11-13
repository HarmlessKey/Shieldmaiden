<template>
	<button v-if="available_types.length" :disabled="!targeted.length">
		<img src="../../../assets/_img/logo/logo-icon-no-shield-cyan.svg" />
		<q-popup-proxy
			:dark="$store.getters.theme === 'dark'"
			content-class="actor-actions__select"
			anchor="bottom middle"
			self="top middle"
			transition-show="jump-down"
			transition-hide="jump-up"
			:breakpoint="576"
			:offset="[0, 20]"
		>
			<q-item>
				<q-item-section>
					{{ action_types[type].label }}
				</q-item-section>
			</q-item>
			<RollActions :actor="actor" :type="type" rolls-only />
		</q-popup-proxy>
		<q-tooltip v-if="!targeted.length" anchor="center right" self="center left">
			Select a target
		</q-tooltip>
	</button>
</template>

<script>
import { mapGetters } from "vuex";
import RollActions from "../actions/RollActions.vue";

export default {
	name: "ActorActions",
	components: {
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
			action_types: {
				actions: { label: "Actions", name: "actions" },
				special_abilities: { label: "Special abilities", name: "special" },
				legendary_actions: { label: "Legendary actions", name: "legendary" },
				reactions: { label: "Reactions", name: "reactions" },
			},
		};
	},
	computed: {
		...mapGetters(["targeted"]),
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
		type: {
			get() {
				let type;
				for (const action_type of this.available_types) {
					if (this.actor[action_type]) {
						type = action_type;
						break;
					}
				}
				return this.typeSetter ? this.typeSetter : type;
			},
			set(newVal) {
				this.typeSetter = newVal;
			},
		},
	},
};
</script>

<style lang="scss" scoped>
button {
	display: flex;
	align-items: center;
	cursor: pointer;
	img {
		height: 40px;
	}
}
</style>
<style lang="scss">
.actor-actions__select {
	width: 100%;
	max-width: 350px;
}
</style>
