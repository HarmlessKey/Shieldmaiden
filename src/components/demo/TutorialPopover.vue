<template>
	<q-popup-proxy
		v-model="show"
		v-bind="$attrs"
		:dark="$store.getters.theme === 'dark'"
		:anchor="anchor"
		:self="self"
		persistent
		no-parent-event
	>
		<hk-card class="tutorial" no-margin>
			<!-- <q-linear-progress size="5" color="info" :value="progress(tutorial, step)" /> -->
			<div class="p-2">
				<div class="tutorial__header">
					<span>{{ name }}</span>
					<span class="p-1 pointer" @click="stop">
						<hk-icon icon="fas fa-times-circle" />
						<q-tooltip anchor="top middle" self="bottom middle">Stop tutorial</q-tooltip>
					</span>
				</div>
				<div class="tutorial__title">
					{{ current_step?.title }}
				</div>
				<p v-html="current_step?.description" />
				<div class="d-flex justify-content-between items-center gap-1">
					<div class="tutorial__action" v-html="current_step.action" />
					<div>
						<button
							v-if="current_step.next"
							class="btn btn-sm bg-yellow black d-none d-md-block"
							@click="completeStep({ tutorial })"
						>
							Next <hk-icon icon="fas fa-chevron-right" />
						</button>
						<button class="btn btn-sm bg-yellow black d-block d-md-none" @click="hideOrNext">
							{{ current_step.next ? "Next" : "Hide" }}
						</button>
					</div>
				</div>
			</div>
		</hk-card>
	</q-popup-proxy>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
	name: "TutorialPopover",
	props: {
		tutorial: {
			type: String,
			default: "run",
		},
		step: {
			type: String,
		},
		branch: {
			type: String,
		},
		transition: {
			type: Boolean,
			default: false,
		},
		position: {
			type: String,
			default: "bottom",
		},
		no_button: {
			type: Boolean,
			default: false,
		},
		requirement: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			stepSetter: undefined,
		};
	},
	computed: {
		...mapGetters("tutorial", [
			"follow_tutorial",
			"get_current_step",
			"get_step",
			"get_tutorial",
			"get_requirement",
			"get_required",
		]),
		...mapGetters(["targeted"]),
		current_step() {
			const step = this.requirement
				? this.get_requirement(this.tutorial, this.requirement)
				: this.get_current_step(this.tutorial);
			return step;
		},
		anchor() {
			switch (this.position) {
				case "bottom":
					return "bottom middle";
				case "top":
					return "top middle";
				case "left":
					return "center left";
				case "right":
					return "center right";
				default:
					return "bottom middle";
			}
		},
		self() {
			switch (this.position) {
				case "bottom":
					return "top middle";
				case "top":
					return "bottom middle";
				case "left":
					return "center right";
				case "right":
					return "center left";
				default:
					return "top middle";
			}
		},
		show: {
			get() {
				if (this.stepSetter !== undefined) {
					return this.stepSetter;
				}

				if (!this.follow_tutorial) {
					return false;
				}

				if (!this.requirement) {
					return this.get_step(this.tutorial, this.step, this.transition);
				}

				// If we are in a requirement popover we need to check if this requirement is needed for the current step
				return this.get_required(this.tutorial, this.requirement);
			},
			set(newVal) {
				this.stepSetter = newVal;
			},
		},
		name() {
			return this.get_tutorial(this.tutorial)?.title;
		},
	},
	methods: {
		...mapActions("tutorial", ["completeStep", "toggleTutorial"]),
		stop() {
			this.toggleTutorial();
		},
		hideOrNext() {
			this.current_step.next ? this.completeStep() : (this.show = false);
		},
	},
};
</script>

<style lang="scss" scoped>
.tutorial {
	max-width: 200px;
	font-size: 14px;
	line-height: normal;
	background: $yellow-light;
	color: $black;
	border: none;

	&__header {
		margin-bottom: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	&__title {
		font-weight: bold;
	}
	&__action {
		font-weight: bold;
	}
}
</style>
