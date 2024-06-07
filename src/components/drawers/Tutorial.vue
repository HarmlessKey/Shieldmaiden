<template>
	<div>
		<q-stepper v-model="current_step" :dark="$store.getters.theme === 'dark'" vertical animated>
			<q-step
				v-for="({ name, description }, i) in steps"
				:name="i"
				:title="name"
				done-icon="fas fa-check white"
				done-color="positive"
				:done="step > i"
				:key="`step-${i}`"
			>
				<div v-html="description" />
				<q-stepper-navigation>
					<q-btn color="primary" label="Show me" no-caps />
				</q-stepper-navigation>
			</q-step>
		</q-stepper>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "TutorialPopover",
	props: {
		data: {
			type: String,
			default: "run",
		},
	},
	data() {
		return {
			tutorial: this.data,
			stepSetter: undefined,
		};
	},
	computed: {
		...mapGetters("tutorial", [
			"follow_tutorial",
			"get_step",
			"get_progress",
			"progress",
			"get_order",
			"get_tutorial",
		]),
		current_step() {
			return this.get_step(this.tutorial, this.step);
		},
		steps() {
			return this.get_tutorial(this.tutorial);
		},
	},
	methods: {
		...mapActions("tutorial", ["nextStep", "stopTutorial"]),
		stop() {
			this.stopTutorial();
			this.show = false;
		},
	},
};
</script>

<style lang="scss" scoped></style>
