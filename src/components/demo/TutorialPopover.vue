<template>
	<q-menu
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
				<div class="d-flex justify-content-end items-center gap-1">
					<button class="btn btn-sm bg-yellow black" @click="completeStep({ tutorial, branch })">
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
	},
	data() {
		return {
			stepSetter: undefined,
		};
	},
	computed: {
		...mapGetters("tutorial", ["follow_tutorial", "get_current_step", "get_step", "get_tutorial"]),
		...mapActions(["current"]),
		current_step() {
			const step = this.get_current_step(this.tutorial, this.branch, this.transition);
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
		show() {
			console.log("TUTORIAL CURRENT STEP", this.step, this.current_step);
			return (
				this.follow_tutorial &&
				this.get_step(this.tutorial, this.step, this.branch, this.transition)
			);
		},
		name() {
			return this.get_tutorial(this.tutorial)?.name;
		},
		entity_type() {
			return this.current.entityType === "player" ? "player" : "monster";
		},
	},
	methods: {
		...mapActions("tutorial", ["completeStep", "toggleTutorial"]),
		stop() {
			this.toggleTutorial();
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
}
</style>
