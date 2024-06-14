<template>
	<div>
		<button v-if="!follow_tutorial" class="btn btn-block mb-3" @click="toggle">
			Continue tutorial
		</button>
		<h3>{{ full_tutorial.name }}</h3>
		<q-stepper v-model="current_step" :dark="$store.getters.theme === 'dark'" vertical animated>
			<q-step
				v-for="({ title, description }, i) in full_tutorial.steps"
				:name="i"
				:title="title"
				done-icon="fas fa-check white"
				icon="fas fa-exclamation white"
				active-icon="fas fa-exclamation white"
				done-color="positive"
				:done="current_step > i"
				:key="`step-${i}`"
			>
				<div v-html="description" />
				<q-stepper-navigation>
					<q-btn color="primary" label="Show me" no-caps @click="toggle" />
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
		...mapGetters("tutorial", ["follow_tutorial", "get_current_step_index", "get_tutorial"]),
		current_step() {
			return this.get_current_step_index(this.tutorial);
		},
		full_tutorial() {
			return this.get_tutorial(this.tutorial);
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("tutorial", ["completeStep", "toggleTutorial"]),
		toggle() {
			this.setDrawer({ show: false });
			this.toggleTutorial();
		},
	},
};
</script>

<style lang="scss" scoped>
.q-stepper {
	border: none;
	padding: 0;
}
</style>
