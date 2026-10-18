<template>
	<Pane
		title="Targeted"
		id="targeted"
		:class="{
			'step-highlight': demo && follow_tutorial && get_step('run', 'targeted'),
		}"
		@focus="$emit('focus')"
	>
		<!-- The targeted entities' actions, shared with the set initiative screen (effects 8) -->
		<TargetActions slot="header-action" :out-of-turn="outOfTurnActions" />

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
									m: roll_plans[key][ability].mod.m,
									advantage: roll_plans[key][ability].mod.advantage,
									plan: roll_plans[key][ability].mod,
									title: `${ability.capitalize()} check`,
									entity_name: entities[key].name.capitalizeEach(),
									notify: true,
									trigger: { name: 'on_check', entity_key: key },
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
									<EffectModifiedValue
										:notes="roll_plans[key][ability].mod.notes"
										:changed="roll_plans[key][ability].mod.changed"
										:advantage="roll_plans[key][ability].mod.advantage"
										:value="signed(roll_plans[key][ability].mod.m)"
									/>
								</div>
							</hk-roll>
							<hk-roll
								tooltip="Roll save"
								:roll="{
									d: 20,
									n: 1,
									m: roll_plans[key][ability].save.m,
									advantage: roll_plans[key][ability].save.advantage,
									plan: roll_plans[key][ability].save,
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
									<EffectModifiedValue
										:notes="roll_plans[key][ability].save.notes"
										:changed="roll_plans[key][ability].save.changed"
										:advantage="roll_plans[key][ability].save.advantage"
										:value="signed(roll_plans[key][ability].save.m)"
									/>
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
import { abilities, damage_type_icons } from "src/utils/generalConstants";
import Pane from "./Pane.vue";
import BasicEntity from "./entities/BasicEntity.vue";
import TargetInfo from "src/components/combat/TargetInfo.vue";
import { experience } from "src/mixins/experience.js";
import TutorialPopover from "../demo/TutorialPopover.vue";
import { calc_mod } from "src/utils/generalFunctions";
import Multipliers from "./entities/multipliers/Multipliers.vue";
import Defenses from "./entities/multipliers/Defenses.vue";
import { calculateManualDamage } from "src/utils/combatFunctions";
import { rollPlan } from "src/utils/effectFunctions";
import EffectModifiedValue from "./entities/EffectModifiedValue.vue";
import TargetActions from "./TargetActions.vue";

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
		EffectModifiedValue,
		TargetActions,
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
		shares() {
			return this.broadcast.shares || [];
		},
		/**
		 * Roll plans (effects and manual bonuses) of the targeted entities' checks and saves:
		 * { [key]: { [ability]: { mod, save } } }
		 */
		roll_plans() {
			const plans = {};
			for (const key of this.targeted) {
				if (!this.entities[key]) continue;
				const entity = this.effective(key);
				plans[key] = {};
				for (const ability of this.abilities) {
					const plan = (roll, modifier) =>
						rollPlan(this.$store.getters.roll_modifiers(key, roll), { modifier: parseInt(modifier) || 0 });
					plans[key][ability] = {
						mod: plan({ kind: "check", ability }, this.modifier(entity[ability] || 10)),
						save: plan({ kind: "save", ability }, this.savingThrow(entity, ability)),
					};
				}
			}
			return plans;
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
	},
	methods: {
		...mapActions(["set_targeted", "set_save", "set_stable", "set_targetReminder"]),
		modifier: calc_mod,
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
		/**
		 * Entity with the values its active effects give it (ability scores for mods and saves)
		 */
		effective(key) {
			return this.$store.getters.effective_entity(key) || this.entities[key];
		},
		signed(value) {
			return value > 0 ? `+${value}` : value;
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
			// With its effects' defenses (Petrified, Stoneskin), as the defense buttons show them
			const target = this.$store.getters.effective_entity?.(key) || this.entities[key];
			const multiplier = this.target_multipliers.multipliers?.[key];
			const defense = this.target_multipliers.defenses?.[key];
			return calculateManualDamage(this.manual, target, multiplier, defense);
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
@media only screen and (max-width: 600px) {
	.hide {
		display: none;
	}
}
</style>
