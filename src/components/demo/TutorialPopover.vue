<template>
	<q-menu
		v-model="show"
		:dark="$store.getters.theme === 'dark'"
		:anchor="anchor"
		:self="self"
		persistent
		no-parent-event
	>
		<hk-card class="tutorial" no-margin>
			<q-linear-progress size="5" color="info" :value="progress(tutorial, step)" />
			<div class="p-2">
				<div class="tutorial__header">
					{{ steps.indexOf(step) + 1 }}/{{ steps.length }} {{ name }}
				</div>
				<div class="tutorial__title">
					{{ current_step.title }}
				</div>
				<p v-html="current_step.description" />
				<div class="d-flex justify-content-end items-center gap-1">
					<button class="btn btn-sm bg-yellow black" @click="nextStep(tutorial)">
						Next <hk-icon icon="fas fa-chevron-right" />
					</button>
				</div>
			</div>
		</hk-card>
	</q-menu>
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
		position: {
			type: String,
			default: "bottom",
		},
	},
	data() {
		return {
			stepSetter: undefined,
		};
	},
	computed: {
		...mapGetters("tutorial", [
			"get_step",
			"get_progress",
			"progress",
			"get_order",
			"get_tutorial",
		]),
		current_step() {
			return this.get_step(this.tutorial, this.step);
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
				return this.stepSetter !== undefined
					? this.stepSetter
					: this.get_progress(this.tutorial) === this.step;
			},
			set(newVal) {
				this.stepSetter = newVal;
			},
		},
		name() {
			return this.get_tutorial(this.tutorial)?.name;
		},
		steps() {
			return this.get_order(this.tutorial) || [];
		},
	},
	methods: {
		...mapActions("tutorial", ["nextStep"]),
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
	}
	&__title {
		font-weight: bold;
	}
}
</style>
