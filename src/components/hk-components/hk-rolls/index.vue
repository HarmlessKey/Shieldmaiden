<template>
	<q-dialog v-model="show" persistent position="top" @show="focusFirst">
		<transition-group
			tag="div"
			class="rolls"
			name="rolls"
			enter-active-class="animated animate__fadeInDown"
			leave-active-class="animated animate__fadeOutUp"
		>
			<q-btn
				v-if="action_rolls && action_rolls.length > 1"
				:key="`clear-button`"
				color="neutral-9"
				class="full-width mb-2 neutral-1"
				icon="fas fa-times"
				no-caps
				tabindex="-1"
				@click="clearRolls"
			>
				Clear all <span class="ml-1 neutral-2">[esc]</span>
			</q-btn>
			<hk-single-roll
				v-for="(roll, index) in action_rolls"
				:key="`roll-${roll.key}`"
				ref="rolls"
				:value="roll"
				:index="index"
				@remove="removeEl"
			/>
		</transition-group>
	</q-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import { onKeyStroke } from "@vueuse/core";
import hkSingleRoll from "./hk-single-roll.vue";

export default {
	name: "hk-rolls",
	components: {
		hkSingleRoll,
	},
	data() {
		return {
			keyCleanup: null,
		};
	},
	computed: {
		...mapGetters(["action_rolls"]),
		show() {
			return !!this.action_rolls?.length;
		},
	},
	watch: {
		action_rolls: {
			handler() {
				this.$refs?.rolls?.[0]?.$el.focus();
			},
			deep: true,
		},
	},
	mounted() {
		// ESC to clear all rolls
		this.keyCleanup = onKeyStroke("Escape", (e) => {
			if (this.show && this.action_rolls?.length > 1) {
				e.preventDefault();
				this.clearRolls();
			}
		});
	},
	beforeUnmount() {
		// Cleanup keyboard listeners
		if (this.keyCleanup) {
			this.keyCleanup();
		}
	},
	methods: {
		clearRolls() {
			this.$store.commit("CLEAR_ACTION_ROLLS");
		},
		/**
		 * Focuses the first roll
		 */
		focusFirst() {
			this.$refs?.rolls?.[0]?.$el.focus();
		},
		/**
		 * When a roll is deleted it is not automatically removed from the $refs
		 */
		removeEl(index) {
			delete this.$refs?.rolls[index];
		},
	},
};
</script>

<style lang="scss" scoped>
.rolls {
	padding: 10px;
	box-shadow: none !important;
	scrollbar-width: none;
	height: 100vh;

	&::-webkit-scrollbar {
		display: none;
	}

	&:focus {
		outline: none;
	}
}

.animated {
	animation-duration: 0.4s !important;
}
</style>
