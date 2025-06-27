<template>
	<div class="actor-actions">
		<div v-if="types.length > 1" class="actor-actions__type">
			<hk-icon icon="fas fa-chevron-down" :class="{ open: open }" />
			<q-popup-proxy
				v-model="open"
				:dark="$store.getters.theme === 'dark'"
				content-class="actor-actions__select-type"
				anchor="bottom middle"
				self="top middle"
				transition-show="jump-down"
				transition-hide="jump-up"
				:breakpoint="576"
				:offset="[0, 5]"
			>
				<slot name="select-type" />
			</q-popup-proxy>
		</div>
		<button :disabled="!targeted.length" :class="{ show: showActions }">
			<img :src="require(`../../../assets/_img/logo/logo-icon-no-shield-${type === 'actions' ? 'cyan' : 'yellow'}.svg`)" />
			<div class="label">{{ type.capitalize() }}</div>
			<q-popup-proxy
				v-model="showActions"
				:dark="$store.getters.theme === 'dark'"
				content-class="actor-actions__select"
				anchor="bottom middle"
				self="top middle"
				transition-show="jump-down"
				transition-hide="jump-up"
				:breakpoint="576"
				:offset="[0, 20]"
			>
				<slot />
			</q-popup-proxy>
			<q-tooltip v-if="!targeted.length" anchor="center right" self="center left">
				Select a target
			</q-tooltip>
		</button>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { EventBus } from "src/event-bus.js";

export default {
	name: "ActionsDropdown",
	props: {
		value: {
			type: Boolean,
			default: false,
		},
		type: {
			type: String,
			default: "actions"
		},
		types: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			open: false,
		};
	},
	computed: {
		...mapGetters(["targeted"]),
		showActions: {
			get() {
				return this.value;
			},
			set(newVal) {
				this.$emit("input", newVal);
			},
		},
	},
	methods: {
		toggleShowActions() {
			if (!this.targeted.length) return;
			if (!this.showActions) EventBus.$emit("close-popups", { actor: this.type }); // Close other popups
			this.showActions = !this.showActions;
		},
	},
	mounted() {
		EventBus.$on("close-popups", ({ actor }) => {
			if (actor !== this.type) {
				this.showActions = false;
			}
		});
	},
};
</script>

<style lang="scss" scoped>
.actor-actions {
	display: flex;
	align-items: center;

	&__type {
		background-color: $neutral-9;
		text-align: center;
		width: 55px;
		line-height: 32px;
		margin-right: -20px;
		padding-right: 20px;
		border-top-left-radius: 9999px;
		border-bottom-left-radius: 9999px;
		color: $neutral-2;
		cursor: pointer;

		i {
			transition: transform 0.3s linear;

			&.open {
				vertical-align: 2px;
				transform: rotate(-180deg);
			}
		}
	}
	button {
		display: flex;
		align-items: center;
		cursor: pointer;

		img {
			height: 52px;
			transition: all 0.3s linear;
			z-index: 10;
		}
		.label {
			font-weight: bold;
			background-color: $neutral-9;
			padding: 0 12px 0 20px;
			line-height: 32px;
			margin-left: -15px;
			border-top-right-radius: 9999px;
			border-bottom-right-radius: 9999px;
		}

		&.show {
			img {
				transform: rotate(180deg);
			}
		}
	}
}
</style>
<style lang="scss">
.actor-actions__select {
	width: 100%;
	max-width: 350px;
}
</style>
