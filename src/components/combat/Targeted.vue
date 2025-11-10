<template>
	<Pane
		title="Targeted"
		id="targeted"
		:class="{
			'step-highlight': demo && follow_tutorial && get_step('run', 'targeted'),
		}"
		@focus="$emit('focus')"
	>
		<div v-if="targeted.length" slot="header-action" class="d-flex justify-content-between gap-1">
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
			<button
				class="btn btn-sm bg-neutral-5"
				@click="set_targeted({ type: 'untarget', key: 'all' })"
			>
				<i aria-hidden="true" class="fas fa-times red"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Untarget {{ targeted.length > 1 ? "all" : "" }}
				</q-tooltip>
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
					<div class="header">
						<BasicEntity :entity="entities[key]">
							<div class="header__actions">
								<template v-if="manual.value">
									<Defenses v-if="manual.type" :entity-key="key" />
									<Multipliers :entity-key="key" />
									<div class="value">
										{{ calculateAmount(key) }}
										<i
											v-if="manual.type"
											:class="[damage_type_icons[manual.type], manual.type]"
											aria-hidden="true"
										/>
									</div>
								</template>
								<a class="clear" @click="set_targeted({ type: 'untarget', key })">
									<hk-icon icon="fas fa-times red" />
									<q-tooltip anchor="top middle" self="center middle">Untarget</q-tooltip>
								</a>
							</div>
						</BasicEntity>
					</div>
					<div class="scores">
						<div class="ability">
							<div class="ability-name" />
							<div class="ability-type">MOD</div>
							<div class="ability-type">SAVE</div>
						</div>
						<div v-for="(ability, index) in abilities" :key="`score-${index}`" class="ability">
							<div class="ability-name">{{ ability.substring(0, 3).toUpperCase() }}</div>
							<hk-roll
								tooltip="Roll check"
								:roll="{
									d: 20,
									n: 1,
									m: modifier(entities[key][ability] || 10),
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
								<div class="mod bg-neutral-8">
									{{
										modifier(entities[key][ability] || 10) > 0
											? `+${modifier(entities[key][ability] || 10)}`
											: modifier(entities[key][ability] || 10)
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
					</div>
				</div>
			</template>
			<div v-else class="noTargetInfo">
				<h3><hk-icon icon="fas fa-arrow-left" /> Select a target</h3>
				<p>Select at least 1 target from the target list to perform targeted actions.</p>

				<p>
					<strong>Selecting a target</strong><br />
					<span class="neutral-2">
						<hk-icon icon="fas fa-hand-pointer" /> Click on an entity in the target list, or use
						<hk-show-keybind show :binds="['0-9']" /> on your keyboard to target it.
					</span>
				</p>
				<p>
					<strong>Multi-targeting</strong><br />
					<span class="neutral-2">
						Hold down <hk-show-keybind show :binds="['shift']" /> shift and click on multiple
						entities to target them all at once.
					</span>
				</p>
				<p>
					<strong>Cycle through targets</strong><br />
					<span class="neutral-2">
						Use the
						<hk-show-keybind show :binds="['up']" /> and
						<hk-show-keybind show :binds="['down']" /> arrow keys on your keyboard to cycle through
						the targets. Hold <hk-show-keybind show :binds="['shift']" /> to select multiple targets
						in a row.
					</span>
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
import { calc_mod } from "src/utils/generalFunctions";
import Multipliers from "./entities/multipliers/Multipliers.vue";
import Defenses from "./entities/multipliers/Defenses.vue";
import { calculateManualDamage } from "src/utils/combatFunctions";
import { damage_type_icons } from "src/utils/generalConstants";

export default {
	name: "Targeted",
	mixins: [dice, experience],
	components: {
		Pane,
		BasicEntity,
		TargetInfo,
		TutorialPopover,
		Multipliers,
		Defenses,
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
			damage_type_icons: damage_type_icons,
		};
	},
	computed: {
		...mapGetters([
			"encounterId",
			"entities",
			"turn",
			"targeted",
			"broadcast",
			"demo",
			"manual",
			"target_multipliers",
		]),
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
			if (this.outOfTurnActions) {
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
		modifier: calc_mod,
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
					? parseInt(this.modifier(entity[ability] || 10)) + proficiency
					: parseInt(this.modifier(entity[ability] || 10));
			return save > 0 ? `+${save}` : save;
		},
		calculateAmount(key) {
			const target = this.entities[key];
			const multiplier = this.target_multipliers.multipliers?.[key];
			const defense = this.target_multipliers.defenses?.[key];
			return calculateManualDamage(this.manual, target, multiplier, defense);
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
	.target {
		margin-bottom: 10px;
		border: solid 1px $neutral-5;
		border-radius: $border-radius-small;
		background-color: $neutral-6;

		.header {
			display: flex;
			justify-content: space-between;
			gap: 5px;
			background: $neutral-8;
			padding: 3px;

			&__actions {
				display: flex;
				justify-content: flex-end;
				gap: 5px;
				align-items: center;
				flex-grow: 1;
			}
			.value {
				font-weight: bold;
				display: flex;
				align-items: center;
				gap: 4px;
			}

			.clear {
				display: block;
				width: 34px;
				height: 34px;
				line-height: 34px;
				font-size: 15px;
				text-align: center;
			}
		}
		.scores {
			width: 100%;
			display: flex;
			user-select: none;
			gap: 1px;

			.ability {
				text-align: center;
				flex-grow: 1;

				&-name,
				&-type {
					line-height: 25px;
					height: 25px;
					font-weight: bold;
					color: $neutral-2;
					font-size: 13px;
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
					color: $green;
				}
				.disadvantage .mod:hover {
					color: $red;
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
