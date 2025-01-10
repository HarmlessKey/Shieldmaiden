<template>
	<Pane
		title="Targeted"
		id="targeted"
		:class="{
			'step-highlight': demo && follow_tutorial && get_step('run', 'targeted'),
		}"
		@focus="$emit('focus')"
	>
		<button
			v-if="targeted.length > 0"
			slot="header-action"
			class="btn btn-sm bg-neutral-5"
			@click="set_targeted({ type: 'untarget', key: 'all' })"
		>
			<i aria-hidden="true" class="fas fa-times red"></i>
			<q-tooltip anchor="top middle" self="center middle"
				>Untarget {{ targeted.length > 1 ? "all" : "" }}</q-tooltip
			>
		</button>

		<!-- SINGLE TARGET OPTIONS -->
		<div
			v-if="targeted.length"
			class="options d-flex justify-content-between gap-1"
			tabindex="0"
			@focus="focusOptions"
		>
			<button
				v-for="({ key, method, icon, tooltip, step }, i) in display_options"
				ref="options"
				tabindex="-1"
				class="option"
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
				<q-tooltip anchor="top middle" self="center middle">{{ tooltip }}</q-tooltip>

				<TutorialPopover
					v-if="demo && step"
					tutorial="run"
					:step="step"
					position="bottom"
					:offset="[0, 10]"
				/>
			</button>
		</div>
		<div>
			<!-- SINGLE TARGET -->
			<template v-if="targeted.length === 1">
				<TargetInfo :data="{ key: targeted[0] }" />
			</template>

			<!-- MULTIPLE TARGETS -->
			<template v-else-if="targeted.length > 1">
				<div v-for="key in targeted" :key="`target-${key}`" class="target">
					<div class="health">
						<BasicEntity :entity="entities[key]" />
						<a class="clear" @click="set_targeted({ type: 'untarget', key })">
							<hk-icon icon="fas fa-times red" />
							<q-tooltip anchor="top middle" self="center middle"> Untarget </q-tooltip>
						</a>
					</div>
					<div class="scores">
						<template v-for="(ability, index) in abilities">
							<div :key="`score-${index}`" v-if="entities[key][ability]" class="ability">
								<hk-roll
									tooltip="Roll check"
									:roll="{
										d: 20,
										n: 1,
										m: modifier(entities[key][ability]),
										title: `${ability.capitalize()} check`,
										entity_name: entities[key].name.capitalizeEach(),
										notify: true,
									}"
									:share="
										shares.includes('ability_rolls')
											? {
													encounter_id: encounterId,
													entity_key: key,
												}
											: null
									"
								>
									<div class="abilityName">{{ ability.substring(0, 3).toUpperCase() }}</div>
									<div class="mod bg-neutral-8">
										{{
											modifier(entities[key][ability]) > 0
												? `+${modifier(entities[key][ability])}`
												: modifier(entities[key][ability])
										}}
									</div>
								</hk-roll>
								<hk-roll
									tooltip="Roll save"
									:roll="{
										d: 20,
										n: 1,
										m: savingThrow(entities[key], ability),
										title: `${ability.capitalize()} save`,
										entity_name: entities[key].name.capitalizeEach(),
										notify: true,
									}"
									:share="
										shares.includes('save_rolls')
											? {
													encounter_id: encounterId,
													entity_key: key,
												}
											: null
									"
								>
									<div class="mod bg-neutral-8">
										{{ savingThrow(entities[key], ability) }}
									</div>
								</hk-roll>
							</div>
						</template>
					</div>
				</div>
			</template>
			<div v-else class="noTargetInfo">
				<h3 class="red">No target selected</h3>
				<p>Select at least 1 target from the target list to perform targeted actions.</p>

				<p>
					<strong>Selecting a target</strong><br />Click on an entity in the target list, or use
					[0-9] on your keyboard to target it.
				</p>
				<p>
					<strong>Multi-targeting</strong><br />Hold down shift and click on multiple entities to
					target them all at once.
				</p>
				<p>
					<strong>Cycle through targets</strong><br />Use the up and down arrow keys on your
					keyboard to cycle through the targets. Hold shift to select multiple targets in a row.
				</p>
			</div>
		</div>

		<TutorialPopover
			v-if="demo"
			tutorial="run"
			position="right"
			step="targeted"
			:offset="[10, 0]"
		/>
	</Pane>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { dice } from "src/mixins/dice.js";
import { abilities } from "src/utils/generalConstants";
import Pane from "./Pane.vue";
import BasicEntity from "./entities/BasicEntity.vue";
import TargetInfo from "src/components/combat/TargetInfo.vue";
import { experience } from "src/mixins/experience.js";
import TutorialPopover from "../demo/TutorialPopover.vue";

export default {
	name: "Targeted",
	mixins: [dice, experience],
	components: {
		Pane,
		BasicEntity,
		TargetInfo,
		TutorialPopover,
	},
	props: {
		outOfTurnActions: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			setShadow: 0,
			abilities: abilities,
		};
	},
	computed: {
		...mapGetters(["encounterId", "entities", "turn", "targeted", "broadcast", "demo"]),
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		options() {
			const options = [
				{
					option: "conditions",
					method: () => this.setConditions(),
					key: ["c"],
					icon: "fa-flame",
					tooltip: "[c] Conditions",
					step: "conditions",
				},
				{
					option: "reminders",
					method: () => this.setReminders(),
					key: ["m"],
					icon: "fa-stopwatch",
					tooltip: "[m] Reminders",
					step: "reminders",
				},
				{
					option: "transform",
					method: () => this.transform(),
					key: ["t"],
					icon: "fa-paw-claws",
					tooltip: "[t] Transform",
					step: "transform",
				},
				{
					option: "hide",
					method: () => this.setHidden(),
					key: ["h"],
					icon: "fa-eye",
					tooltip: "[h] Hide / Show",
				},
				{
					option: "edit",
					method: () => this.edit(),
					key: ["e"],
					icon: "fa-pencil",
					tooltip: "[e] Edit",
					step: "edit",
				},
			];
			if (this.outOfTurnActions) {
				options.unshift({
					option: "damage",
					method: () => this.opportunityAttack(),
					key: ["shift", "d"],
					icon: "fa-swords",
					tooltip: "[shift]+[d] Out of turn damage/healing",
					step: "opportunity",
				});
			}
			return options;
		},
		shares() {
			return this.broadcast.shares || [];
		},
		target() {
			return this.targeted.length === 1 ? this.entities[this.targeted[0]] : undefined;
		},
		death_fails() {
			let fails = 0;
			for (let key in this.target.saves) {
				if (this.target.saves[key] === "fail") {
					fails++;
				}
			}
			return fails;
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
		...mapActions([
			"set_targeted",
			"setDrawer",
			"set_save",
			"set_stable",
			"set_targetReminder",
			"set_hidden",
		]),
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
		shadow() {
			this.setShadow = this.$refs.scroll.scrollPosition;
		},
		save(check, index) {
			this.set_save({
				key: this.target.key,
				check: check,
				index,
			});
		},
		stabilize() {
			this.set_stable({
				key: this.target.key,
				action: "set",
			});
		},
		displayStats(target) {
			var stats = "";
			if (target.transformed) {
				stats = {
					ac: target.transformedAc,
					maxHp: target.transformedMaxHp,
					curHp: target.transformedCurHp,
				};
			} else {
				stats = {
					ac: target.ac,
					maxHp: target.maxHp,
					curHp: target.curHp,
				};
			}
			return stats;
		},
		modifier(score) {
			return Math.floor((score - 10) / 2);
		},
		savingThrow(entity, ability) {
			let proficiency;
			if (entity.entityType === "player") {
				proficiency = this.returnProficiency(
					entity.level ? entity.level : this.calculatedLevel(entity.experience)
				);
			} else {
				proficiency = entity.proficiency;
			}
			const save =
				entity.saving_throws && entity.saving_throws.includes(ability)
					? parseInt(this.modifier(entity[ability])) + proficiency
					: parseInt(this.modifier(entity[ability]));
			return save > 0 ? `+${save}` : save;
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

<style lang="scss" scoped>
#targeted {
	grid-area: targeted;
	overflow: hidden;

	.noTargetInfo {
		font-size: 15px;
		line-height: 25px;
	}
	.btn.save {
		width: 49.5%;
	}
	.health {
		display: grid;
		grid-template-columns: 1fr 34px;
		grid-template-rows: 34px;
		grid-gap: 0;
		background: $neutral-8;
		padding: 3px;

		.clear {
			display: block;
			width: 34px;
			height: 34px;
			line-height: 34px;
			font-size: 15px;
			text-align: center;
		}
	}
	.target {
		margin-bottom: 10px;
		border: solid 1px $neutral-5;
		border-radius: $border-radius-small;
		background-color: $neutral-6;

		.scores {
			width: 100%;
			display: grid;
			grid-template-columns: repeat(6, 1fr);
			user-select: none;
			grid-column-gap: 1px;

			.ability {
				margin-top: 5px;
				text-align: center;

				.abilityName {
					margin-bottom: 3px;
				}
				.hk-roll {
					width: 100%;
					.mod {
						cursor: pointer;
						line-height: 25px;
						margin-top: 1px;
					}
				}
				.advantage .mod:hover {
					color: $neutral-1;
					background-color: $green !important;
				}
				.disadvantage .mod:hover {
					color: $neutral-1;
					background-color: $red !important;
				}
			}
		}
	}
	.options {
		margin-bottom: 10px;

		button {
			background-color: $neutral-2;
			width: 100%;
			line-height: 35px;
			font-size: 18px;
			border-radius: $border-radius-small;
			border: none;
			cursor: pointer;
			text-align: center;
			color: $neutral-11;

			&:hover {
				background: $neutral-3;
			}
		}
	}
}
@media only screen and (max-width: 900px) {
	// #targeted {
	// 	display: none;
	// }
}
@media only screen and (max-width: 600px) {
	.hide {
		display: none;
	}
}
</style>
