<template>
	<div
		class="single-roll"
		tabindex="0"
		ref="roll"
		@keydown.enter="shortkeyApply"
		@keydown.backspace="removeRoll(index)"
	>
		<hk-card>
			<div slot="header" class="card-header">
				<div class="truncate">{{ roll.name }}</div>
				<button class="btn btn-sm btn-clear" tabindex="-1" @click="removeRoll(index)">
					<i aria-hidden="true" class="fas fa-times" />
				</button>
			</div>

			<div class="card-body">
				<!-- TARGET -->
				<BasicEntity :entity="roll.target" class="mb-2" />

				<!-- ALL ROLLED ACTIONS -->
				<div
					v-for="(action, action_index) in roll.actions"
					:key="`action-${index}-${action_index}`"
					class="rolled-action"
				>
					<div>
						<!-- TO HIT ROLL -->
						<template v-if="action.toHit">
							<div class="toHit">
								<div class="toHit__roll">
									<span class="toHit__base">
										To hit:
										<span class="advantage" v-if="action.toHit.ignored">
											<span v-html="advantage(action.toHit.advantage_disadvantage)" />
											<span class="ignored neutral-4">
												{{ action.toHit.ignored }}
											</span> </span
										>{{ action.toHit.throwsTotal }}
										<template v-if="parseInt(action.toHit.mod) !== 0">
											{{
												parseInt(action.toHit.mod) > 0
													? `+ ${parseInt(action.toHit.mod)}`
													: `- ${Math.abs(action.toHit.mod)}`
											}}
										</template>
									</span>
									<!-- Bonus dice of effects (Bless +1d4, Bane −1d4); the name is cut off when short of space -->
									<span
										v-for="(bonus, b) in action.toHit.bonus_rolls || []"
										:key="`bonus-${b}`"
										class="bonus-roll"
									>
										<span class="bonus-roll__value">{{ bonusRollText(bonus) }}</span>
										<span class="bonus-roll__name neutral-2"
											>(<span class="truncate">{{ bonus.name }}</span>)</span
										>
										<q-tooltip anchor="top middle" self="bottom middle">
											{{ bonusRollDetail(bonus) }}
										</q-tooltip>
									</span>
								</div>
								<transition
									v-if="naturalOf(action.toHit) == 1"
									:name="`${roll.key}`"
									enter-active-class="animated animate__hinge"
									appear
								>
									<div class="total crit red">
										Crit
										<b><hk-animated-integer :value="1" onMount /></b>
									</div>
								</transition>
								<transition
									v-else-if="isCrit(action, action_index)"
									name="heartBeat"
									enter-active-class="animated animate__heartBeat"
									appear
								>
									<div class="total crit green">
										Crit
										<b><hk-animated-integer :value="action.toHit.total" onMount /></b>
									</div>
								</transition>
								<div v-else class="total">
									<hk-animated-integer :value="action.toHit.total" onMount />
								</div>
							</div>
							<!-- Effects on the attack: crit reason, bonus dice, Advantage sources, reminders -->
							<div v-if="toHitNotes(action, action_index).length" class="save-notes neutral-2 mb-2">
								<div v-for="(note, n) in toHitNotes(action, action_index)" :key="`hit-note-${n}`">
									{{ note }}
								</div>
							</div>
							<q-btn-toggle
								v-model="hitOrMiss[action_index]"
								class="mb-3 neutral-1"
								spread
								no-caps
								:dark="$store.getters.theme === 'dark'"
								dense
								toggle-color="primary"
								color="neutral-9"
								:options="[
									{ label: 'Hit', value: 'hit' },
									{ label: 'Miss', value: 'miss' },
								]"
								:class="{
									'step-highlight': demo && follow_tutorial && get_step('run', 'to-hit', 'monster'),
								}"
								@keydown.enter="shortkeyApply"
								@keydown.backspace="removeRoll(index)"
								@click="
									get_step('run', 'to-hit', 'monster') ? completeStep({ tutorial: 'run' }) : null
								"
							/>
						</template>

						<!-- SAVING THROW -->
						<template v-if="action.type === 'save'">
							<div class="toHit" v-if="action.save_ability || action.save_dc">
								<div v-if="action.save_ability">{{ action.save_ability.capitalize() }} save</div>
								<div v-if="action.save_dc">
									<span class="neutral-2">DC</span>
									<span
										class="total"
										:class="{
											green: savingThrowResult[action_index] === 'fail',
											red: savingThrowResult[action_index] === 'save',
										}"
									>
										{{ action.save_dc }}
									</span>
								</div>
							</div>
							<div class="d-flex gap-1 items-center mb-3">
								<q-btn-toggle
									v-model="savingThrowResult[action_index]"
									class="neutral-1 full-width"
									spread
									no-caps
									:dark="$store.getters.theme === 'dark'"
									dense
									square
									toggle-color="primary"
									color="neutral-9"
									:options="[
										{ label: 'Fail', value: 'fail' },
										{ label: 'Save', value: 'save' },
									]"
									:class="{
										'step-highlight':
											demo && follow_tutorial && get_step('run', 'to-hit', 'monster'),
									}"
									@keydown.enter="shortkeyApply"
									@keydown.backspace="removeRoll(index)"
									@click="
										get_step('run', 'to-hit', 'monster') ? completeStep({ tutorial: 'run' }) : null
									"
								/>
								<hk-roll
									:tooltip="`Roll ${action.save_ability} save`"
									@roll="rollSave($event, action_index, action)"
								>
									<template v-if="rolledSaves[action_index] !== undefined">{{
										rolledSaves[action_index]
									}}</template>
								</hk-roll>
							</div>
							<!-- Roll modifiers of the save: bonus dice, Advantage, reminders -->
							<div v-if="saveNotes[action_index]?.length" class="save-notes neutral-2 mb-3">
								<div v-for="(note, n) in saveNotes[action_index]" :key="`note-${n}`">{{ note }}</div>
							</div>
						</template>

						<TutorialPopover
							v-if="demo && index === 0"
							tutorial="run"
							step="to-hit"
							position="right"
							:offset="[15, 0]"
						/>
					</div>

					<!-- DAMAGE / HEALING ROLLS -->
					<q-list :dark="$store.getters.theme === 'dark'" square :class="`accordion`">
						<q-expansion-item
							v-for="(rolled, rolled_index) in action.rolls"
							:key="`rolled-${rolled_index}`"
							:dark="$store.getters.theme === 'dark'"
							switch-toggle-side
							:group="`rolled-${index}`"
							:class="{
								'step-highlight': demo && follow_tutorial && get_step('run', 'details'),
							}"
							@click="get_step('run', 'details') ? completeStep({ tutorial: 'run' }) : null"
						>
							<template #header>
								<q-item-section v-if="action.type === 'healing'">
									<span class="type truncate green">
										<i aria-hidden="true" class="fas fa-heart" />
										Healing
									</span>
								</q-item-section>
								<q-item-section v-else>
									<div
										class="defenses"
										:class="{
											'step-highlight': demo && follow_tutorial && get_step('run', 'defenses'),
										}"
									>
										<div
											v-for="({ name }, key) in defenses"
											:key="key"
											class="option"
											@click.stop="setDefense(rolled.damage_type, key, roll.key)"
											:class="[
												{ active: checkDefenses(rolled.damage_type, rolled.magical, key) },
												key,
											]"
										>
											<i aria-hidden="true" class="fas fa-shield"></i>
											<span>{{ key.capitalize() }}</span>
											<q-tooltip anchor="top middle" self="center middle">
												{{ name }}
											</q-tooltip>
										</div>
										<span class="type truncate" :class="rolled.damage_type">
											<span class="type__icon-wrapper">
												<i :class="damage_type_icons[rolled.damage_type]" aria-hidden="true" />
												<i v-if="rolled.magical" class="fas fa-sparkles magical" aria-hidden="true">
													<q-tooltip anchor="top middle" self="center middle">Magical</q-tooltip>
												</i>
											</span>
											<template v-if="rolled.name">{{ rolled.name }}: </template>{{ rolled.damage_type }}
										</span>
										<TutorialPopover
											v-if="demo && index === 0"
											tutorial="run"
											step="defenses"
											position="left"
											:offset="[15, 0]"
										/>
									</div>
								</q-item-section>
								<q-item-section avatar :class="action.type === 'healing' ? 'green' : 'red'">
									<q-item-label>
										<strong
											><hk-animated-integer :value="totalRollValue(action, action_index, rolled)"
										/></strong>
									</q-item-label>
									<q-tooltip anchor="top middle" self="center middle">
										{{ rolled.rollResult.roll }}
									</q-tooltip>
								</q-item-section>
								<TutorialPopover
									v-if="demo && index === 0"
									tutorial="run"
									step="details"
									position="right"
									:offset="[10, 0]"
								/>
							</template>
							<div class="accordion-body">
								<div>
									<b>Rolls: </b>
									<template v-if="action.toHit && isCrit(action, action_index)">
										<b class="green">Crit!</b>
										{{ crit_description[critSettings] }} </template
									><br />
									{{ rolled.rollResult.roll }}
									<div class="d-flex justify-content-between">
										<div class="throws">
											<div
												v-for="(Throw, throw_index) in rolled.rollResult.throws"
												:key="`throw-${Throw}-${throw_index}`"
												class="throw"
												:class="{
													red: Throw === 1,
													green: Throw == rolled.rollResult.d,
													rotate: animateRoll === roll.key + rolled_index + throw_index,
												}"
												@click="
													((animateRoll = roll.key + rolled_index + throw_index),
													reroll(
														$event,
														rolled.rollResult,
														throw_index,
														action.toHit && isCrit(action, action_index)
													))
												"
												@animationend="animateRoll = undefined"
											>
												<hk-animated-integer :value="Throw" onMount />
												<q-tooltip anchor="top middle" self="bottom middle">
													Reroll {{ Throw }}
												</q-tooltip>
											</div>
										</div>
										<div class="d-flex justify-content-end">
											<template v-if="parseInt(rolled.rollResult.mod)">
												<q-separator vertical :dark="$store.getters.theme === 'dark'" />
												<div class="throws-modifier">
													{{ rolled.rollResult.mod }}
												</div>
											</template>
											<q-separator vertical :dark="$store.getters.theme === 'dark'" />
											<div class="throws-total">
												<hk-animated-integer :value="rolled.rollResult.total" />
											</div>
										</div>
									</div>
								</div>
								<div v-if="savingThrowResult[action_index] === 'save'" class="mt-3">
									Successful saving throw: <b>{{ missSaveEffect(rolled.missSave, "text") }}</b>
								</div>
								<div v-if="hitOrMiss[action_index] === 'miss'" class="mt-3">
									Missed attack: <b>{{ missSaveEffect(rolled.missSave, "text") }}</b>
								</div>
								<template v-for="({ name, modifier }, key) in defenses">
									<div
										v-if="checkDefenses(rolled.damage_type, rolled.magical, key)"
										class="mt-3"
										:key="`defense-${name}`"
									>
										{{ name }} to {{ rolled.damage_type }}: <b>{{ modifier }} damage</b>
									</div>
								</template>
								<hr />
								<div>
									<b>Final result</b><br />
									(<hk-animated-integer :value="rolled.rollResult.total" />)
									<span
										v-if="
											savingThrowResult[action_index] === 'save' ||
											hitOrMiss[action_index] === 'miss'
										"
									>
										{{ missSaveEffect(rolled.missSave, "calc") }}
									</span>
									<!-- What the switched-on damage modifier toggles did, before defenses -->
									<template v-if="damagePart(action_index, rolled_index)">
										<span v-if="damagePart(action_index, rolled_index).reduced">
											− {{ damagePart(action_index, rolled_index).reduced }}</span
										>
										<span v-if="damagePart(action_index, rolled_index).halved"> / 2</span>
										<span v-if="damagePart(action_index, rolled_index).negated"> no effect</span>
										<span v-if="damagePart(action_index, rolled_index).absorbed"> absorbed</span>
									</template>
									<template v-if="resistances">
										<span v-if="checkDefenses(rolled.damage_type, rolled.magical, 'v')"> * 2</span>
										<span v-if="checkDefenses(rolled.damage_type, rolled.magical, 'r')"> / 2</span>
										<span v-if="checkDefenses(rolled.damage_type, rolled.magical, 'i')">
											no effect</span
										>
									</template>
									<span>
										=
										<b :class="action.type === 'healing' ? 'green' : rolled.damage_type">
											<hk-animated-integer :value="totalRollValue(action, action_index, rolled)" />
										</b>
										{{ action.type === "healing" ? "healing" : rolled.damage_type }}
									</span>
								</div>

								<!-- Special events -->
								<div
									v-if="
										rolled.special?.length &&
										(savingThrowResult[action_index] === 'fail' ||
											hitOrMiss[action_index] === 'hit')
									"
									class="mt-3"
								>
									<b>Events on {{ action.toHit ? "hit" : "failed save" }}</b
									><br />
									<div v-for="(event, event_index) in rolled.special" :key="`event-${event_index}`">
										{{ eventValues(event, totalRollValue(action, action_index, rolled)).name }}
										<b :class="event === 'drain' ? 'red' : 'green'">
											{{ eventValues(event, totalRollValue(action, action_index, rolled)).value }}
										</b>
										<q-tooltip anchor="center left" self="center right">
											{{ event === "drain" ? "Reduces targets max HP" : "Heals caster" }}
										</q-tooltip>
									</div>
								</div>
							</div>
						</q-expansion-item>
					</q-list>

					<!-- EFFECTS LINKED TO THE ACTION: whether they apply with the chosen result -->
					<div v-if="linkedEffects(action, action_index).length" class="linked-effects">
						<div
							v-for="(linked, linked_index) in linkedEffects(action, action_index)"
							:key="`linked-${linked_index}`"
							class="linked-effects__effect"
							:class="{ 'neutral-3': linked.applies === false }"
						>
							<span class="truncate">
								<i aria-hidden="true" class="fas fa-sparkles mr-1" />
								<b>{{ linked.name }}</b>
								<span class="neutral-2"> · {{ linked.when }}</span>
							</span>
							<span v-if="linked.applies === true" class="green">Applies</span>
							<span v-else-if="linked.applies === false">Doesn't apply</span>
							<span v-else class="neutral-2">{{ linked.pending }}</span>
						</div>					</div>

					<!-- TOTAL OF THE ACTION -->
					<div v-if="roll.actions.length > 1 && action.rolls.length" class="total-action-damage">
						<div>Total {{ action.type === "healing" ? "healing" : "damage" }}</div>
						<div class="total" :class="action.type === 'healing' ? 'green' : 'red'">
							<hk-animated-integer :value="totalActionValue(action, action_index)" onMount />
						</div>
					</div>
				</div>

				<!-- The target's damage modifiers: reductions to switch on (off by default), and what's
				applied by itself (Evasion, Absorb) or only reminded of -->
				<div
					v-if="damageModifierToggles.length || damageModifierNotes().length"
					class="damage-modifiers"
				>
					<q-checkbox
						v-for="toggle in damageModifierToggles"
						:key="toggle.id"
						:value="damageToggles[toggle.id] !== undefined"
						:label="damageToggleLabel(toggle)"
						:dark="$store.getters.theme === 'dark'"
						dense
						@input="setDamageToggle(toggle, $event)"
					>
						<q-tooltip v-if="toggle.notes.length" anchor="top middle" self="bottom middle">
							{{ toggle.notes.join(", ") }}
						</q-tooltip>
					</q-checkbox>
					<div v-for="(note, n) in damageModifierNotes()" :key="`damage-note-${n}`" class="neutral-2">
						{{ note }}
					</div>
				</div>

				<!-- TOTALS OF ALL ACTIONS -->
				<div v-for="dmg_type in ['damage', 'healing']" :key="dmg_type">
					<template v-if="totalValue(dmg_type) !== undefined">
						<div
							class="total-damage cursor-pointer"
							v-if="!edit_total[dmg_type]"
							@click="toggleOverride(dmg_type)"
						>
							<div>
								<span class="mr-2">Total {{ dmg_type }}</span>
								<i
									aria-hidden="true"
									class="fas fa-pencil-alt neutral-3"
									style="font-size: 14px"
									tabindex="0"
									@focus="toggleOverride(dmg_type)"
								>
									<q-tooltip anchor="top middle" self="center middle">
										Override rolled value.
									</q-tooltip>
								</i>
							</div>
							<div class="total" :class="dmg_type === 'healing' ? 'green' : 'red'">
								<hk-animated-integer :value="totalValue(dmg_type)" onMount />
							</div>
						</div>
						<template v-else>
							<q-input
								v-if="dmg_type === 'damage'"
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								clearable
								autofocus
								@clear="toggleOverride(dmg_type)"
								:label="`Total ${dmg_type}`"
								v-model="overrideDamage"
								type="number"
								autocomplete="off"
								name="duration"
								class="my-2 full-width"
								title="Override"
								min="0"
								@keydown.backspace.stop
							>
								<strong slot="append" class="pl-3 red">{{ overrideDamage }}</strong>
							</q-input>
							<q-input
								v-else
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								clearable
								autofocus
								@clear="toggleOverride(dmg_type)"
								:label="`Total ${dmg_type}`"
								v-model="overrideHealing"
								type="number"
								autocomplete="off"
								name="duration"
								class="my-2 full-width"
								title="Override"
								min="0"
								@keydown.backspace.stop
							>
								<strong slot="append" class="pl-3 red">{{ overrideHealing }}</strong>
							</q-input>
						</template>
					</template>
				</div>
			</div>

			<div
				v-if="roll.target"
				slot="footer"
				class="card-footer"
				:class="{
					'step-highlight': demo && follow_tutorial && get_step('run', 'apply'),
				}"
			>
				<template v-if="allMiss">
					<q-btn
						color="neutral-9"
						class="full-width neutral-1"
						label="Missed"
						no-caps
						@click="apply(1)"
					/>
				</template>
				<template v-else>
					<q-btn
						color="neutral-9"
						class="full-width neutral-1"
						label="Full"
						no-caps
						@click="apply(1)"
					/>
					<q-btn
						color="neutral-9"
						class="full-width neutral-1"
						label="Half"
						no-caps
						@click="apply(0.5)"
					/>
					<q-btn
						color="neutral-9"
						class="full-width neutral-1"
						label="Double"
						no-caps
						@click="apply(2)"
					/>
				</template>
				<q-btn color="neutral-9" class="full-width neutral-1" no-caps @click="removeRoll(index)">
					<i aria-hidden="true" class="fas fa-times" />
				</q-btn>

				<TutorialPopover
					v-if="demo && index === 0"
					tutorial="run"
					step="apply"
					position="right"
					:offset="[10, 0]"
				/>
			</div>
		</hk-card>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { damage_types, damage_type_icons } from "src/utils/generalConstants";
import { dice } from "src/mixins/dice";
import { setHP } from "src/mixins/HpManipulations";
import { experience } from "src/mixins/experience.js";
import TutorialPopover from "src/components/demo/TutorialPopover.vue";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import { calc_mod } from "src/utils/generalFunctions";
import { displayStats } from "src/utils/entityFunctions";
import { rollPlan, applyDamageModifiers, damageTypeMatches } from "src/utils/effectFunctions";
import { action_outcomes, outcomesFor } from "src/utils/effectsConstants";

export default {
	name: "hk-single-roll",
	components: {
		TutorialPopover,
		BasicEntity,
	},
	props: {
		value: {
			type: Object,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
	},
	mixins: [dice, setHP, experience],
	data() {
		return {
			// The target's effective defense lists when the dialog opened (resistances)
			targetDefenses: this.targetDefenseLists(),
			edit_total: {
				damage: false,
				healing: false,
			},
			override: {
				damage: undefined,
				healing: undefined,
			},

			damage_types: damage_types,
			damage_type_icons: damage_type_icons,
			defenses: {
				v: { name: "Vulnerable", value: "damage_vulnerabilities", modifier: "double" },
				r: { name: "Resistant", value: "damage_resistances", modifier: "half" },
				i: { name: "Immune", value: "damage_immunities", modifier: "no" },
			},
			crit_description: {
				undefined: "Rolled dice twice",
				double: "Doubled rolled values",
				max: "Added max damage to roll",
				disabled: "Auto crits are disabled",
			},
			savingThrowResult: {},
			rolledSaves: {},
			saveNotes: {},
			hitOrMiss: {},
			// Switched-on damage modifier toggles of the target: { [id]: rolled amount | true }
			damageToggles: {},
			animateRoll: undefined,
			resultColumns: {
				total: {
					maxContent: true,
				},
				type: {
					truncate: true,
				},
			},
		};
	},
	computed: {
		...mapGetters("tutorial", ["follow_tutorial", "get_step"]),
		roll() {
			return this.value;
		},
		overrideDamage: {
			get() {
				if (this.override.damage === undefined) {
					return this.totalValue("damage");
				}
				return this.override.damage;
			},
			set(value) {
				this.override.damage = value;
			},
		},
		overrideHealing: {
			get() {
				if (this.override.healing === undefined) {
					return this.totalValue("healing");
				}
				return this.override.healing;
			},
			set(value) {
				this.override.healing = value;
			},
		},
		resistances() {
			if (this.roll.target) {
				const resistances = {};
				// The target's defenses with its effects' (Petrified, Stoneskin), as when the
				// dialog opened: a snapshot, so the DM's overrides (setDefense) aren't recomputed away
				const target = this.targetDefenses || this.roll.target;

				// Resistances
				for (const [key, defense] of Object.entries(this.defenses)) {
					if (target[defense.value]) {
						for (const damage_type of target[defense.value]) {
							resistances[damage_type] = key;
						}
					}
				}
				return resistances;
			}
			return {};
		},
		critSettings() {
			if (this.$store.getters.userSettings && this.$store.getters.userSettings.encounter) {
				return this.$store.getters.userSettings.encounter.critical; // Double rolled values
			}
			return undefined; // Default = undefined = roll twice
		},
		allMiss() {
			if (Object.values(this.hitOrMiss).length === 0) return false;
			return Object.values(this.hitOrMiss).every((value) => value === "miss");
		},
		/**
		 * The target's damage modifiers, with the attacker as the other party (Uncanny Dodge)
		 */
		targetDamageModifiers() {
			const key = this.roll.target?.key;
			if (!key || !this.$store.getters.entities?.[key]) return undefined;
			return this.$store.getters.damage_modifiers(key, this.roll.current?.key);
		},
		/**
		 * Reduce / halve / negate toggles that apply to a damage type the roll deals; a roll
		 * without a damage type offers every toggle
		 */
		damageModifierToggles() {
			const damageTypes = this.roll.actions
				.filter((action) => action.type !== "healing")
				.flatMap((action) => action.rolls.map((rolled) => rolled.damage_type));
			if (!damageTypes.length) return [];
			return (this.targetDamageModifiers?.toggles || []).filter((toggle) =>
				damageTypes.some((damageType) => !damageType || damageTypeMatches(toggle, damageType))
			);
		},
	},
	mounted() {
		this.checkHitOrMiss();
	},
	methods: {
		...mapActions(["removeActionRoll", "fire_trigger", "set_bonus"]),
		...mapActions("tutorial", ["completeStep"]),
		/**
		 * Fires on_hit / on_hit_taken, on_crit / on_crit_taken (natural 20 hit)
		 * and on_save_success / on_save_fail for every action of the applied roll
		 */
		fireRollTriggers() {
			const attackerKey = this.roll.current?.key;
			const targetKey = this.roll.target?.key;
			if (!targetKey) return;

			this.roll.actions.forEach((action, index) => {
				const naturalRoll = this.naturalOf(action.toHit);
				const attackTypes = {
					melee_weapon: ["melee_weapon", "melee", "weapon"],
					ranged_weapon: ["ranged_weapon", "ranged", "weapon"],
					spell_attack: ["spell", "melee_spell", "ranged_spell"],
				}[action.type];
				const fire = (trigger, entityKey, sourceKey) => {
					if (!entityKey) return;
					this.fire_trigger({
						trigger,
						entityKey,
						event: { sourceKey, attackTypes, naturalRoll },
					});
				};

				if (action.toHit && this.hitOrMiss[index] === "hit") {
					fire("on_hit", attackerKey, targetKey);
					fire("on_hit_taken", targetKey, attackerKey);
					if (this.isCrit(action, index)) {
						fire("on_crit", attackerKey, targetKey);
						fire("on_crit_taken", targetKey, attackerKey);
					}
				}
				if (action.type === "save" && this.savingThrowResult[index]) {
					fire(
						this.savingThrowResult[index] === "save" ? "on_save_success" : "on_save_fail",
						targetKey,
						attackerKey
					);
				}
			});
		},
		checkHitOrMiss() {
			this.roll.actions.forEach((action, index) => {
				if (action.toHit) {
					// A critical hit hits: a natural 20, or a natural roll in an effect's crit range
					if (action.crit || this.naturalOf(action.toHit) === 20) this.$set(this.hitOrMiss, index, "hit");
					else if (this.naturalOf(action.toHit) === 1) this.$set(this.hitOrMiss, index, "miss");
					else if (this.roll.target) {
						if (displayStats(this.effectiveTarget()).ac <= action.toHit.total)
							this.$set(this.hitOrMiss, index, "hit");
						else this.$set(this.hitOrMiss, index, "miss");
					}
				}
			});
		},
		/**
		 * Whether an attack is a critical hit: a natural 20 or a natural roll in an effect's crit
		 * range (action.crit), or a hit against a target whose effects make hits critical
		 * (action.critOnHit, Paralyzed within 5 ft)
		 */
		isCrit(action, index) {
			if (!action?.toHit) return false;
			if (action.crit || this.naturalOf(action.toHit) === 20) return true;
			return !!action.critOnHit?.length && this.hitOrMiss[index] === "hit";
		},
		/**
		 * The d20 as rolled: a floor (Reliable Talent) can raise throwsTotal, not the natural roll
		 */
		naturalOf(toHit) {
			if (!toHit) return undefined;
			return toHit.natural ?? toHit.throwsTotal;
		},
		/**
		 * The effects linked to a rolled action that fit its type, and whether each applies with
		 * the chosen hit or miss and failed or successful save: true, false, or undefined while
		 * the result isn't chosen (with a hint in `pending`)
		 *
		 * @returns {{ name: string, when: string, applies: boolean|undefined, pending?: string }[]}
		 */
		linkedEffects(action, action_index) {
			const effects = action.effects || {};
			const hitOrMiss = this.hitOrMiss[action_index];
			const save = this.savingThrowResult[action_index];
			// The result an outcome needs, the chosen result it's compared with, and the hint without one
			const outcomes = {
				on_hit: { needs: "hit", chosen: hitOrMiss, pending: "Hit or miss?" },
				on_miss: { needs: "miss", chosen: hitOrMiss, pending: "Hit or miss?" },
				on_fail: { needs: "fail", chosen: save, pending: "Fail or save?" },
				on_success: { needs: "save", chosen: save, pending: "Fail or save?" },
				always: { needs: "always", chosen: "always" },
			};
			return outcomesFor(action.type).flatMap((outcome) =>
				(Array.isArray(effects[outcome]) ? effects[outcome] : []).map((link) => {
					const { needs, chosen, pending } = outcomes[outcome];
					return {
						name: link.effect?.name || link.effect?.source_key || "Effect",
						when: action_outcomes[outcome].label,
						applies: chosen ? chosen === needs : undefined,
						pending,
					};
				})
			);
		},
		/**
		 * A bonus die of an effect in the to-hit line: "+ 3", "- 2"
		 */
		bonusRollText({ total }) {
			return total < 0 ? `- ${Math.abs(total)}` : `+ ${total}`;
		},
		/**
		 * Its tooltip: "Bless +1d4: 3"
		 */
		bonusRollDetail({ name, dice, sign, throws = [] }) {
			return `${name} ${sign < 0 ? "−" : "+"}${dice}: ${throws.join(", ")}`;
		},
		/**
		 * The notes of an attack's to-hit: why it's critical and the roll modifiers' notes
		 * (Advantage sources, flat bonuses, reminders, assumed distance)
		 */
		toHitNotes(action, index) {
			const toHit = action?.toHit;
			if (!toHit) return [];
			const notes = [];
			if (action.critNames?.length) notes.push(`Critical on ${this.naturalOf(toHit)}: ${action.critNames.join(", ")}`);
			if (action.critOnHit?.length) {
				notes.push(
					this.hitOrMiss[index] === "hit"
						? `Critical hit: ${action.critOnHit.join(", ")}`
						: `A hit is critical: ${action.critOnHit.join(", ")}`
				);
			}
			// The bonus dice are shown in the to-hit line itself
			return [...notes, ...(toHit.notes || [])];
		},
		/**
		 * The target's damage defense lists with its effects' (Petrified, Stoneskin), or
		 * undefined without a target
		 */
		targetDefenseLists() {
			// Called from data(): computeds such as roll don't exist yet, so read the prop
			const rollTarget = this.value?.target;
			if (!rollTarget) return undefined;
			const target =
				(rollTarget.key && this.$store.getters.effective_entity?.(rollTarget.key)) || rollTarget;
			return {
				damage_vulnerabilities: target.damage_vulnerabilities,
				damage_resistances: target.damage_resistances,
				damage_immunities: target.damage_immunities,
			};
		},
		/**
		 * The target now, with the values its active effects give it (AC, ability scores);
		 * roll.target is a snapshot from when the roll was made
		 */
		effectiveTarget() {
			const key = this.roll.target?.key;
			return (key && this.$store.getters.effective_entity?.(key)) || this.roll.target;
		},
		rollSave(e, action_index, action) {
			const entity = this.effectiveTarget();
			const ability = action.save_ability;

			let proficiency;
			if (entity.entityType === "player") {
				proficiency = this.returnProficiency(
					entity.level ? entity.level : this.calculatedLevel(entity.experience)
				);
			} else {
				proficiency = entity.proficiency;
			}
			const modifier = entity.saving_throws?.includes(ability)
				? parseInt(calc_mod(entity[ability])) + proficiency
				: parseInt(calc_mod(entity[ability]));

			// The target's roll modifiers; a spell is magical, other sources are unknown
			const key = this.roll.target?.key;
			const modifiers =
				key && this.$store.getters.entities?.[key]
					? this.$store.getters.roll_modifiers(key, { kind: "save", ability, source: this.roll.source })
					: undefined;
			// hk-roll emits { e, advantage_disadvantage }: the DM's own choice
			const plan = rollPlan(modifiers, {
				modifier,
				advantage: { ...(e?.advantage_disadvantage || {}) },
			});

			// Automatic failure or success: no roll
			if (plan.auto) {
				const failed = plan.auto.result === "fail";
				this.$set(this.rolledSaves, action_index, failed ? "Auto fail" : "Auto save");
				this.$set(this.savingThrowResult, action_index, failed ? "fail" : "save");
				this.$set(this.saveNotes, action_index, plan.roll_notes);
				return;
			}

			const roll = this.rollD(
				e?.e || {},
				20,
				1,
				plan.m,
				`${entity.name?.capitalizeEach()}: ${ability} saving throw`,
				undefined,
				false,
				plan.advantage,
				null,
				{ bonus_dice: plan.bonus_dice, notes: plan.roll_notes, floor: plan.floor, rerolls: plan.rerolls }
			);
			// The total counts against the DC, not only the dice
			this.$set(this.rolledSaves, action_index, roll.total);
			if (action.save_dc !== undefined) {
				this.$set(this.savingThrowResult, action_index, roll.total >= action.save_dc ? "save" : "fail");
			}
			// The roll's notes: the plan's, plus a floor that raised the die and reroll offers
			this.$set(this.saveNotes, action_index, [
				...(roll.bonus_rolls || []).map(
					({ name, dice, sign, total }) => `${name} ${sign < 0 ? "−" : "+"}${dice}: ${Math.abs(total)}`
				),
				...(roll.notes || plan.roll_notes),
			]);
			if (plan.consume.length) this.$store.dispatch("consume_roll_modifiers", plan.consume);
		},
		removeRoll(index) {
			this.removeActionRoll(index);
			this.$emit("remove", index);
		},
		advantage(input) {
			const type = Object.keys(input)[0].charAt(0).capitalize();
			const color = type === "A" ? "green" : "red";
			return `<b class="${color}">${type}</b>`;
		},
		/**
		 * Check if the target is resistant do the damage type of a roll
		 * @param {string} damage_type
		 * @param {boolean} magical
		 * @param {string} defense_key v/r/i
		 *
		 * @returns {boolean}
		 */
		checkDefenses(damage_type, magical, defense_key) {
			if (damage_type) {
				if (!magical && ["slashing", "piercing", "bludgeoning"].includes(damage_type)) {
					const non_magical_damage_type = `non_magical_${damage_type}`;
					return (
						this.resistances &&
						(this.resistances[non_magical_damage_type] === defense_key ||
							this.resistances[damage_type] === defense_key)
					);
				}
				return this.resistances && this.resistances[damage_type] === defense_key;
			}
			return false;
		},
		shortkeyApply(e) {
			if (e.shiftKey) {
				this.apply(2);
			} else if (e.ctrlKey) {
				this.apply(0.5);
			} else {
				this.apply(1);
			}
		},
		async apply(multiplier) {
			// Create the info object for the log
			let config = {
				log: true,
				ability: this.roll.name,
				defenses: this.resistances,
				multiplier,
			};
			let actions = [];
			let specials = [];

			this.roll.actions.forEach((action, index) => {
				let new_action = {
					type: action.type,
				};
				if (action.toHit) {
					new_action.hitOrMiss = this.hitOrMiss[index];
					if (this.isCrit(action, index)) new_action.crit = true;
				}
				if (action.type === "save") new_action.savingThrowResult = this.savingThrowResult[index];

				new_action.rolls = [];
				for (const rolled of action.rolls) {
					let roll = {};
					if (action.type !== "healing") roll.damage_type = rolled.damage_type;
					roll.value = Math.floor(this.totalRollValue(action, index, rolled) * multiplier);

					// Special events | only on a hit or failed save
					if (
						rolled.special &&
						(this.savingThrowResult[index] === "fail" || this.hitOrMiss[index] === "hit")
					) {
						for (const event of rolled.special) {
							const special = {};
							special[event] = this.eventValues(event, roll.value).value;
							specials.push(special);
						}
					}

					new_action.rolls.push(roll);
				}
				actions.push(new_action);
			});
			config.actions = actions;

			// Set the total value object
			const totalDamage = this.override.damage ? this.override.damage : this.totalValue("damage");
			const totalHealing = this.override.healing
				? this.override.healing
				: this.totalValue("healing");
			let totalValue = {};

			if (totalDamage !== undefined)
				totalValue.damage = Math.floor(totalDamage * multiplier).min(0);
			if (totalHealing !== undefined)
				totalValue.healing = Math.floor(totalHealing * multiplier).min(0);

			// Apply the rolled damage/healing
			await this.setHP(totalValue, this.roll.target, this.roll.current, config);

			// Effect triggers for hits, crits and saves
			this.fireRollTriggers();

			// Apply the special events
			for (const special of specials) {
				const event = Object.entries(special)[0];
				if (event[0].includes("siphon")) {
					const event_config = {
						log: true,
						ability: `${this.roll.name}: Siphon`,
						actions: [
							{
								type: "healing",
								rolls: [{ value: event[1] }],
							},
						],
					};
					await this.setHP(
						{ healing: event[1] },
						this.roll.current,
						this.roll.current,
						event_config
					);
				} else if (event[0] === "drain") {
					// A maximum hit point reduction, labelled with the ability that drained it
					if (event[1] > 0) {
						this.set_bonus({
							key: this.roll.target.key,
							stat: "max_hp",
							amount: -event[1],
							label: this.roll.name,
						});
					}
				}
			}
			if (this.get_step("run", "apply", "monster")) {
				this.completeStep({ tutorial: "run" });
			}
			// Remove the roll
			this.removeRoll(this.index);
		},
		/**
		 * The share of a roll a failed attack or successful save leaves: its missSave
		 */
		missSaveFactor(action, action_index, roll) {
			let factor = 1;
			if (action.type === "save" && this.savingThrowResult[action_index] === "save") {
				factor = factor * (roll.missSave || 0);
			}
			if (action.toHit && this.hitOrMiss[action_index] === "miss") {
				factor = factor * roll.missSave;
			}
			return factor;
		},
		/**
		 * Multiplier of the target's defenses for a damage type: vulnerable ×2, resistant ×½,
		 * immune 0 (the DM's overrides included)
		 */
		defenseMultiplier(damage_type, magical) {
			if (this.checkDefenses(damage_type, magical, "i")) return 0;
			let multiplier = 1;
			if (this.checkDefenses(damage_type, magical, "v")) multiplier *= 2;
			if (this.checkDefenses(damage_type, magical, "r")) multiplier /= 2;
			return multiplier;
		},
		/**
		 * The damage of every damage roll after the target's damage modifiers and defenses
		 * (applyDamageModifiers): the parts by "action:roll", the damage, absorbed healing and
		 * notes. A method, not a computed: setDefense changes a non-reactive object.
		 */
		damageResult() {
			const parts = [];
			this.roll.actions.forEach((action, action_index) => {
				if (action.type === "healing") return;
				const result = this.savingThrowResult[action_index];
				const save =
					action.type === "save" && result && action.save_ability
						? { ability: action.save_ability, result }
						: undefined;
				action.rolls.forEach((rolled, rolled_index) => {
					parts.push({
						key: `${action_index}:${rolled_index}`,
						damageType: rolled.damage_type,
						magical: rolled.magical,
						amount: parseInt(rolled.rollResult.total) || 0,
						factor: this.missSaveFactor(action, action_index, rolled),
						saveHalf: action.type === "save" && rolled.missSave === 0.5,
						save,
					});
				});
			});
			return applyDamageModifiers({
				parts,
				modifiers: this.targetDamageModifiers || {},
				active: this.damageToggles,
				defenseOf: (damage_type, part) => this.defenseMultiplier(damage_type, part.magical),
			});
		},
		/**
		 * What the target's damage modifiers did or only remind of (Evasion, Absorb, transfer);
		 * the toggles show their own amounts
		 */
		damageModifierNotes() {
			if (!this.roll.actions.some((action) => action.type !== "healing")) return [];
			const toggleNames = this.damageModifierToggles.map((toggle) => `${toggle.name}:`);
			return [
				...this.damageResult().notes.filter((note) => !toggleNames.some((name) => note.startsWith(name))),
				...(this.targetDamageModifiers?.reminders || []),
			];
		},
		damageToggleLabel(toggle) {
			const rolled = this.damageToggles[toggle.id];
			return toggle.kind === "reduce" && typeof rolled === "number" ? `${toggle.text} (rolled ${rolled})` : toggle.text;
		},
		/**
		 * Switches a damage modifier on or off; a reduction rolls its amount when switched on
		 */
		setDamageToggle(toggle, on) {
			if (!on) return this.$delete(this.damageToggles, toggle.id);
			if (toggle.kind !== "reduce") return this.$set(this.damageToggles, toggle.id, true);
			const amount = toggle.roll
				? this.rollD({}, toggle.roll.dice_type, toggle.roll.dice_count, toggle.roll.fixed_val || 0, toggle.name).total
				: toggle.value || 0;
			this.$set(this.damageToggles, toggle.id, amount);
		},
		/**
		 * A damage roll after the target's damage modifiers and defenses (damageResult)
		 */
		damagePart(action_index, rolled_index) {
			if (this.roll.actions[action_index]?.type === "healing") return undefined;
			return this.damageResult().parts.find(({ key }) => key === `${action_index}:${rolled_index}`);
		},
		totalRollValue(action, action_index, roll) {
			// Damage: after the target's damage modifiers and defenses
			if (action.type !== "healing") {
				const part = this.damagePart(action_index, action.rolls.indexOf(roll));
				if (part) return part.amount;
			}
			let total = parseInt(roll.rollResult.total) * this.missSaveFactor(action, action_index, roll);
			total = total * this.defenseMultiplier(roll.damage_type, roll.magical);
			return Math.floor(total);
		},
		totalActionValue(action, action_index) {
			let total = 0;
			action.rolls.forEach((roll) => {
				total = total + this.totalRollValue(action, action_index, roll);
			});
			return total;
		},
		totalValue(type) {
			let total = undefined;
			let actions = [];

			if (type === "healing") {
				// Separate damage and healing
				actions = this.roll.actions.filter((action, index) => {
					action.index = index;
					return action.type === "healing";
				});
			} else {
				actions = this.roll.actions.filter((action, index) => {
					action.index = index;
					return action.type !== "healing";
				});
			}

			if (type === "damage") {
				return actions.length > 0 ? this.damageResult().damage : undefined;
			}
			// Healing, plus damage the target absorbs (Acid Absorption)
			const absorbed = this.roll.actions.some((action) => action.type !== "healing")
				? this.damageResult().healing
				: 0;
			if (actions.length > 0) {
				total = absorbed;
				for (const action of actions) {
					total = total + this.totalActionValue(action, action.index);
				}
			} else if (absorbed) {
				total = absorbed;
			}
			return total;
		},
		setDefense(type, resistance, key) {
			if (!this.resistances) this.$set(this.resistances, key, {});
			if (this.resistances[type] === resistance) {
				this.$delete(this.resistances, type);
			} else {
				this.$set(this.resistances, type, resistance);
			}
			if (this.get_step("run", "defenses", "monster")) {
				this.completeStep({ tutorial: "run" });
			}
			this.$forceUpdate();
		},
		reroll(e, roll, throw_index, crit) {
			const add = (a, b) => a + b;
			const newRoll = this.rollD(e, roll.d, 1, 0, `Reroll 1d${roll.d}`);

			this.$set(roll.throws, throw_index, newRoll.total);
			this.$set(roll, "throwsTotal", roll.throws.reduce(add));
			let new_total = roll.throwsTotal + roll.m;
			// Add total thrown to total when crit
			if (crit && this.critSettings === "double") {
				new_total = new_total + roll.throwsTotal;
			}
			// Add the max damage output of the roll to the total when crit and setting is max
			if (crit && this.critSettings === "max") {
				new_total = new_total + roll.n * roll.d;
			}

			this.$set(roll, "total", new_total);
		},
		missSaveEffect(effect, type) {
			if (type === "text") {
				if (effect === 1) return "full damage";
				if (effect === 0.5) return "half damage";
				if (effect === 0) return "no damage";
			} else {
				if (effect === 1) return "";
				if (effect === 0.5) return "/ 2";
				if (effect === 0) return "no effect";
			}
		},
		eventValues(event, value) {
			let returnObj = {
				name: "",
				value,
			};

			if (event) {
				// Drain = reduce Max HP
				if (event === "drain") {
					returnObj.name = "Drain";
				}
				// Siphon = caster heals for damage done
				if (event.includes("siphon")) {
					returnObj.name = "Siphon";
					returnObj.value = event === "siphon_half" ? Math.floor(value / 2) : value;
				}
			}
			return returnObj;
		},
		toggleOverride(dmg_type) {
			this.override[dmg_type] = undefined;
			this.edit_total[dmg_type] = !this.edit_total[dmg_type];
		},
	},
};
</script>

<style lang="scss" scoped>
.single-roll {
	outline: none;
	// Never wider than the rolls column (300px): long lines shrink (bonus names are cut off)
	// instead of stretching the card
	width: 100%;
	max-width: 300px;
	min-width: 0;

	.hk-card {
		min-width: 0;
		max-width: 100%;
	}

	&:focus {
		.hk-card {
			outline: $neutral-2 solid 1px;
		}
	}
}
.hk-card {
	pointer-events: auto;

	.card-body {
		h2 {
			text-transform: none !important;
			font-size: 20px;
		}
		h3 {
			font-size: 15px;
		}

		&::v-deep {
			.basic-entity__wrapper {
				margin-bottom: 15px;
				background-color: $neutral-8;
			}
		}

		.save {
			a {
				margin-left: 5px;
			}
		}
		.save-notes {
			font-size: 12px;
			line-height: 16px;
		}
		.toHit {
			position: relative;
			display: flex;
			justify-content: space-between;
			gap: 10px;
			min-width: 0;
			font-size: 18px;
			margin-bottom: 10px;
			line-height: 30px;
			padding: 0 5px;
			z-index: 99;

			// The roll and its bonus dice on one line; bonus names shrink first (Bless → Ble…)
			&__roll {
				display: flex;
				align-items: baseline;
				gap: 5px;
				min-width: 0;
				white-space: nowrap;
			}
			&__base {
				flex-shrink: 0;
			}
			.bonus-roll {
				display: flex;
				align-items: baseline;
				gap: 4px;
				min-width: 0;

				&__value {
					flex-shrink: 0;
				}
				&__name {
					display: flex;
					min-width: 0;
					font-size: 13px;

					.truncate {
						min-width: 0;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
			}

			.total {
				font-size: 25px;
				font-weight: bold;
			}
		}
		.total-damage,
		.total-action-damage {
			display: flex;
			justify-content: space-between;
			line-height: 30px;
			padding: 0 5px;

			.total {
				font-weight: bold;
			}
		}
		// Several actions in one roll (a bite, then a save against its poison): a divider between them
		.rolled-action + .rolled-action {
			margin-top: 20px;
			padding-top: 15px;
			border-top: solid 1px $neutral-5;
		}
		// The effects linked to an action, and whether they apply with the chosen result
		.linked-effects {
			margin-top: 10px;
			padding: 0 5px;
			font-size: 13px;
			line-height: 20px;

			&__effect {
				display: flex;
				justify-content: space-between;
				gap: 10px;
				min-width: 0;

				> span:last-child {
					flex-shrink: 0;
				}
			}		}
		// The target's damage modifiers: toggles and notes
		.damage-modifiers {
			display: flex;
			flex-direction: column;
			gap: 4px;
			margin-top: 10px;
			padding: 0 5px;
			font-size: 13px;
		}
		.total-damage {
			font-size: 20px;
			margin-top: 10px;

			.total {
				font-size: 28px;
			}
		}
		.defenses {
			display: grid;
			grid-template-columns: 18px 18px 18px auto;
			grid-column-gap: 5px;
			user-select: none;
			line-height: 28px;
			border-radius: $border-radius;

			.type {
				padding-left: 10px;

				&__icon-wrapper {
					position: relative;

					.magical {
						position: absolute;
						top: -3px;
						left: -5px;
						color: $blue-light;
						font-size: 12px;
					}
				}
			}

			.option {
				cursor: pointer;
				position: relative;
				width: 18px;
				font-size: 18px;
				text-align: center;
				line-height: 28px;
				color: $neutral-2;

				span {
					font-size: 12px;
					text-align: center;
					font-weight: bold;
					position: absolute;
					width: 18px;
					line-height: 28px;
					top: 0;
					left: 0;
					color: $neutral-9;
				}

				&.active {
					&.i,
					&.r {
						color: $green;
					}
					&.v {
						color: $red;
					}
					span {
						color: $white;
					}
				}
			}
		}
		.throws {
			display: flex;
			flex-wrap: wrap;
			margin-top: 5px;
			margin-right: 5px;

			.throw {
				border: solid 1px $neutral-4;
				padding: 1px 0;
				width: 23px;
				text-align: center;
				margin-right: 2px;
				cursor: pointer;
				user-select: none;
				border-radius: $border-radius-small;

				&:hover {
					border-color: $neutral-3;
				}
				&.rotate {
					animation: spin 0.2s linear;
				}
				&.green {
					font-weight: bold;
				}
			}
		}
		.throws-modifier,
		.throws-total {
			padding: 0 10px;
			align-self: center;
		}
		.throws-total {
			font-weight: bold;
			font-size: 18px;
			padding-right: 0;
		}
	}
	.card-footer {
		padding: 0;

		&.step-highlight {
			margin: 4px;
			border-radius: 2px;
		}

		.q-btn {
			border-radius: 0;
		}
	}
}
.animate__heartBeat {
	animation-delay: 0.2s;
}
.animate__hinge {
	animation-delay: 0.5s;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
</style>
