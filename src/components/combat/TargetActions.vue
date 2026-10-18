<template>
	<div v-if="targeted.length" class="d-flex justify-content-between gap-1">
		<button
			v-for="({ key, method, icon, tooltip, step }, i) in display_options"
			ref="options"
			class="btn btn-sm bg-neutral-5"
			:key="`option-${i}`"
			v-shortkey="key"
			:class="{
				'step-highlight': step && demo && follow_tutorial && get_step('run', step),
			}"
			@click="method"
			@shortkey="method"
			@keydown.left="cycleOptions(i, 'left')"
			@keydown.right="cycleOptions(i, 'right')"
		>
			<i aria-hidden="true" class="fas" :class="icon" />
			<q-tooltip anchor="top middle" self="center middle">
				{{ tooltip }}
				<hk-show-keybind :binds="key" show />
			</q-tooltip>

			<TutorialPopover
				v-if="demo && step"
				tutorial="run"
				:step="step"
				position="bottom"
				:offset="[0, 10]"
			/>
		</button>
		<button class="btn btn-sm bg-neutral-5" @click="set_targeted({ type: 'untarget', key: 'all' })">
			<i aria-hidden="true" class="fas fa-times red"></i>
			<q-tooltip anchor="top middle" self="center middle">
				Untarget {{ targeted.length > 1 ? "all" : "" }}
			</q-tooltip>
		</button>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import TutorialPopover from "../demo/TutorialPopover.vue";

/**
 * The actions for the targeted entities, with their shortcuts: the Targeted pane's header in
 * the tracker, and the Overview header on the set initiative screen (effects 8). Out of turn
 * damage/healing only with `outOfTurn` (not before combat).
 */
export default {
	name: "TargetActions",
	components: {
		TutorialPopover,
	},
	props: {
		outOfTurn: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		...mapGetters(["entities", "targeted", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		options() {
			const options = [
				{
					option: "conditions",
					method: () => this.setConditions(),
					key: ["c"],
					icon: "fa-flame",
					tooltip: "Conditions",
					step: "conditions",
				},
				{
					option: "reminders",
					method: () => this.setReminders(),
					key: ["m"],
					icon: "fa-stopwatch",
					tooltip: "Reminders",
					step: "reminders",
				},
				{
					option: "effects",
					method: () => this.setEffects(),
					key: ["f"],
					icon: "fa-sparkles",
					tooltip: "Effects",
				},
				{
					option: "transform",
					method: () => this.transform(),
					key: ["t"],
					icon: "fa-paw-claws",
					tooltip: "Transform",
					step: "transform",
				},
				{
					option: "hide",
					method: () => this.setHidden(),
					key: ["h"],
					icon: "fa-eye",
					tooltip: "Hide / Show",
				},
				{
					option: "edit",
					method: () => this.edit(),
					key: ["e"],
					icon: "fa-pencil",
					tooltip: "Edit",
					step: "edit",
				},
			];
			if (this.outOfTurn) {
				options.unshift({
					option: "damage",
					method: () => this.opportunityAttack(),
					key: ["shift", "d"],
					icon: "fa-swords",
					tooltip: "Out of turn damage/healing",
					step: "opportunity",
				});
			}
			return options;
		},
		target() {
			return this.targeted.length === 1 ? this.entities[this.targeted[0]] : undefined;
		},
		display_options() {
			return this.targeted.length > 1
				? this.options.filter((opt) => {
						return !["transform"].includes(opt.option);
				  })
				: this.options;
		},
	},
	methods: {
		...mapActions(["set_targeted", "setDrawer", "set_hidden"]),
		...mapActions("tutorial", ["completeStep"]),
		focusOptions() {
			this.$refs.options[0].focus();
		},
		cycleOptions(i, dir) {
			let select;
			if (dir === "right") {
				select = i < this.options.length - 1 ? i + 1 : 0;
			} else {
				select = i > 0 ? i - 1 : this.options.length - 1;
			}
			this.$refs.options[select].focus();
		},
		setHidden() {
			for (const key of this.targeted) {
				this.set_hidden({
					key,
					hidden: !this.entities[key].hidden,
				});
			}
		},
		completeTutorialStep(step) {
			if (this.get_step("run", step)) {
				this.completeStep({ tutorial: "run" });
			}
		},
		opportunityAttack() {
			this.setDrawer({ show: true, type: "drawers/encounter/DamageHealing" });
			this.completeTutorialStep("opportunity");
		},
		setConditions() {
			this.setDrawer({ show: true, type: "drawers/encounter/Conditions" });
			this.completeTutorialStep("conditions");
		},
		setReminders() {
			this.setDrawer({ show: true, type: "drawers/encounter/reminders/TargetReminders" });
			this.completeTutorialStep("reminders");
		},
		setEffects() {
			this.setDrawer({ show: true, type: "drawers/encounter/Effects" });
		},
		transform() {
			this.setDrawer({ show: true, type: "drawers/Transform", data: this.target });
			this.completeTutorialStep("transform");
		},
		edit() {
			this.setDrawer({ show: true, type: "drawers/encounter/EditEntity" });
			this.completeTutorialStep("edit");
		},
	},
};
</script>
