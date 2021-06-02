<template>
	<div class="hk-rolls center-top">
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
				@click="clearRolls"
				color="gray" 
				class="full-width mb-2" 
				label="Clear all" 
				icon="fas fa-times" 
				no-caps
			/>
			<hk-single-roll 
				v-for="(roll, index) in action_rolls" 
				:key="`roll-${roll.key}`" 
				:value="roll" 
				:index="index"
			/>
		</transition-group>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import hkSingleRoll from "./hk-single-roll.vue";

export default {
	name: "hk-rolls",
  components: { 
		hkSingleRoll
	},
	computed: {
		...mapGetters([
			"action_rolls"
		]),
	},
	methods: {
		clearRolls() {
			this.$store.commit("CLEAR_ACTION_ROLLS");
		}
	}
}
</script>