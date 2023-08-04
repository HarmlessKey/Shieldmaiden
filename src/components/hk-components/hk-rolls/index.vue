<template>
	<div v-if="action_rolls && action_rolls.length > 0" class="hk-rolls center-top">
		<transition-group
			tag="div"
			class="rolls"
			name="rolls"
			enter-active-class="animated animate__fadeInDown"
			leave-active-class="animated animate__fadeOutUp"
		>
			<hk-single-roll
				v-for="(roll, index) in action_rolls"
				:key="`roll-${roll.key}`"
				:value="roll"
				:index="index"
			/>
			<q-btn
				v-if="action_rolls && action_rolls.length > 1"
				:key="`clear-button`"
				color="neutral-9"
				class="full-width mb-2 neutral-1"
				icon="fas fa-times"
				no-caps
				v-shortkey="['shift', 'esc']"
				@shortkey="clearRolls"
				@click="clearRolls"
			>
				Clear all <span class="ml-1 neutral-2">[shift]+[esc]</span>
			</q-btn>
		</transition-group>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import hkSingleRoll from "./hk-single-roll.vue";

export default {
	name: "hk-rolls",
	components: {
		hkSingleRoll,
	},
	computed: {
		...mapGetters(["action_rolls"]),
	},
	methods: {
		clearRolls() {
			this.$store.commit("CLEAR_ACTION_ROLLS");
		},
	},
};
</script>

<style lang="scss" scoped>
.hk-rolls {
	&:focus {
		outline: none;
	}
}
.animated {
	animation-duration: 0.4s !important;
}
</style>
