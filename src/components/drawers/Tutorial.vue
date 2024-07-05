<template>
	<div>
		<button v-if="!follow_tutorial" class="btn bg-neutral-5 mb-3 mr-1" @click="resetTutorial()">
			Reset tutorial
		</button>
		<button v-if="!follow_tutorial && !isMobile" class="btn mb-3" @click="toggle">
			Continue tutorial
		</button>
		<h3>{{ tutorial_title }}</h3>
		<q-stepper v-model="current_step" :dark="$store.getters.theme === 'dark'" vertical animated>
			<q-step
				v-for="({ title, completed, description }, i) in tutorial_progress"
				:name="i"
				:title="title"
				done-icon="fas fa-check white"
				icon="fas fa-exclamation white"
				active-icon="fas fa-exclamation white"
				done-color="positive"
				:done="completed"
				:key="`step-${i}`"
			>
				<div v-html="description" />
				<q-stepper-navigation>
					<q-btn v-if="!isMobile" color="primary" label="Show me" no-caps @click="toggle" />
					<q-btn v-else color="primary" label="Next step" no-caps @click="next_step" />
				</q-stepper-navigation>
			</q-step>
		</q-stepper>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "TutorialDrawer",
	props: {
		data: {
			type: Object,
			default: () => {
				return { tutorial: "run" };
			},
		},
	},
	data() {
		return {
			tutorial: this.data.tutorial,
			stepSetter: undefined,
		};
	},
	computed: {
		...mapGetters("tutorial", [
			"follow_tutorial",
			"get_current_step_index",
			"get_tutorial",
			"get_progress_steps",
		]),
		isMobile() {
			// This only works for real mobiles, not for small desktop screens
			return this.$q.platform.is.mobile;
		},
		current_step() {
			return this.tutorial_progress.findIndex((step) => !step.completed);
		},
		tutorial_title() {
			return this.get_tutorial(this.tutorial)?.title;
		},
		tutorial_progress() {
			return this.get_progress_steps(this.tutorial);
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("tutorial", ["completeStep", "toggleTutorial", "resetTutorial"]),
		toggle() {
			this.setDrawer({ show: false });
			this.toggleTutorial();
		},
		next_step() {
			this.completeStep({ tutorial: this.tutorial });
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
