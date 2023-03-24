<template>
	<hk-card>
		<div slot="header" class="card-header">
			<div class="truncate">
				{{ roll.name }}
			</div>
			<a class="btn btn-sm btn-clear" @click="removeActionRoll(index)">
				<i aria-hidden="true" class="fas fa-times" />
			</a>
		</div>

		<div class="card-body">
			<!-- TARGET -->
			<div class="target-item" v-if="roll.target">
				<span
					class="img bg-neutral-8"
					:style="{
						'background-image': 'url(' + roll.target.img + ')',
						'border-color': roll.target.color_label ? roll.target.color_label : ``,
						color: roll.target.color_label ? roll.target.color_label : ``,
					}"
				>
					<i
						v-if="!roll.target.img"
						:class="`hki-${roll.target.entityType === 'npc' ? 'monster' : roll.target.entityType}`"
						aria-hidden="true"
					/>
				</span>
				<div class="ac_wrapper">
					<i aria-hidden="true" class="fas fa-shield"></i>
					<span
						v-if="roll.target.ac_bonus"
						class="ac"
						:class="{
							green: roll.target.ac_bonus > 0,
							red: roll.target.ac_bonus < 0,
						}"
					>
						{{ displayStats(roll.target).ac + roll.target.ac_bonus }}
					</span>
					<span class="ac" v-else>
						{{ displayStats(roll.target).ac }}
					</span>
				</div>
				<div class="pl-2 truncate">
					{{ roll.target.name }}
				</div>
			</div>

			<!-- ALL ROLLED ACTIONS -->
			<div v-for="(action, action_index) in roll.actions" :key="`action-${index}-${action_index}`">
				<!-- TO HIT ROLL -->
				<template v-if="action.toHit">
					<div class="toHit">
						<div>
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
						</div>
						<transition
							v-if="action.toHit.throwsTotal == 1"
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
							v-else-if="action.toHit.throwsTotal == 20"
							name="heartBeat"
							enter-active-class="animated animate__heartBeat"
							appear
						>
							<div class="total crit green">
								Crit
								<b><hk-animated-integer :value="20" onMount /></b>
							</div>
						</transition>
						<div v-else class="total">
							<hk-animated-integer :value="action.toHit.total" onMount />
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
					<q-btn-toggle
						v-model="savingThrowResult[action_index]"
						class="mb-3 neutral-1"
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
					/>
				</template>

				<!-- DAMAGE / HEALING ROLLS -->
				<q-list :dark="$store.getters.theme === 'dark'" square :class="`accordion`">
					<q-expansion-item
						v-for="(rolled, rolled_index) in action.rolls"
						:key="`rolled-${rolled_index}`"
						:dark="$store.getters.theme === 'dark'"
						switch-toggle-side
						:group="`rolled-${index}`"
					>
						<template #header>
							<q-item-section v-if="action.type === 'healing'">
								<span class="type truncate green">
									<i aria-hidden="true" class="fas fa-heart" />
									Healing
								</span>
							</q-item-section>
							<q-item-section v-else>
								<div class="defenses">
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
											<i v-if="rolled.magical" class="fas fa-sparkles" aria-hidden="true">
												<q-tooltip anchor="top middle" self="center middle">Magical</q-tooltip>
											</i>
										</span>
										{{ rolled.damage_type }}
									</span>
								</div>
							</q-item-section>
							<q-item-section avatar :class="action.type === 'healing' ? 'green' : 'red'">
								<q-item-label>
									<b
										><hk-animated-integer :value="totalRollValue(action, action_index, rolled)"
									/></b>
								</q-item-label>
								<q-tooltip anchor="top middle" self="center middle">
									{{ rolled.modifierRoll.roll }}
								</q-tooltip>
							</q-item-section>
						</template>
						<div class="accordion-body">
							<div>
								<b>Rolls: </b>
								<template v-if="action.toHit && action.toHit.throwsTotal === 20">
									<b class="green">Crit!</b>
									{{ crit_description[critSettings] }} </template
								><br />
								{{ rolled.modifierRoll.roll }}
								<div class="d-flex justify-content-between">
									<div class="throws">
										<div
											v-for="(Throw, throw_index) in rolled.modifierRoll.throws"
											:key="`throw-${Throw}-${throw_index}`"
											class="throw"
											:class="{
												red: Throw === 1,
												green: Throw == rolled.modifierRoll.d,
												rotate: animateRoll === roll.key + rolled_index + throw_index,
											}"
											@click="
												(animateRoll = roll.key + rolled_index + throw_index),
													reroll(
														$event,
														rolled.modifierRoll,
														throw_index,
														action.toHit.throwsTotal === 20
													)
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
										<template v-if="parseInt(rolled.modifierRoll.mod)">
											<q-separator vertical :dark="$store.getters.theme === 'dark'" />
											<div class="throws-modifier">
												{{ rolled.modifierRoll.mod }}
											</div>
										</template>
										<q-separator vertical :dark="$store.getters.theme === 'dark'" />
										<div class="throws-total">
											<hk-animated-integer :value="rolled.modifierRoll.total" />
										</div>
									</div>
								</div>
							</div>
							<!-- <div v-if="rolled.scaledRoll" class="mt-3">
								Scale ({{ roll.cast_level }}): {{ rolled.scaledRoll.roll }} =
								<b>{{ rolled.scaledRoll.total }}</b
								><br />
								{{ rolled.scaledRoll.throws }}
							</div> -->
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
								(<hk-animated-integer :value="rolled.modifierRoll.total" /><span
									v-if="rolled.scaledRoll"
								>
									+ {{ rolled.scaledRoll.total }}</span
								>)
								<span
									v-if="
										savingThrowResult[action_index] === 'save' || hitOrMiss[action_index] === 'miss'
									"
								>
									{{ missSaveEffect(rolled.missSave, "calc") }}
								</span>
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
									rolled.special &&
									(savingThrowResult[action_index] === 'fail' || hitOrMiss[action_index] === 'hit')
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

				<!-- TOTAL OF THE ACTION -->
				<div class="total-action-damage" v-if="roll.actions.length > 1">
					<div>Total {{ action.type === "healing" ? "healing" : "damage" }}</div>
					<div class="total" :class="action.type === 'healing' ? 'green' : 'red'">
						<hk-animated-integer :value="totalActionValue(action, action_index)" onMount />
					</div>
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
							<i aria-hidden="true" class="fas fa-pencil-alt neutral-3" style="font-size: 14px">
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
							@clear="toggleOverride(dmg_type)"
							:label="`Total ${dmg_type}`"
							v-model="overrideDamage"
							type="number"
							autocomplete="off"
							name="duration"
							class="my-2 full-width"
							title="Override"
							min="0"
						>
							<strong slot="append" class="pl-3 red">{{ overrideDamage }}</strong>
						</q-input>
						<q-input
							v-else
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							clearable
							@clear="toggleOverride(dmg_type)"
							:label="`Total ${dmg_type}`"
							v-model="overrideHealing"
							type="number"
							autocomplete="off"
							name="duration"
							class="my-2 full-width"
							title="Override"
							min="0"
						>
							<strong slot="append" class="pl-3 red">{{ overrideHealing }}</strong>
						</q-input>
					</template>
				</template>
			</div>
		</div>

		<div slot="footer" class="card-footer" v-if="roll.target">
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
			<q-btn
				color="neutral-9"
				class="full-width neutral-1"
				no-caps
				@click="removeActionRoll(index)"
			>
				<i aria-hidden="true" class="fas fa-times" />
			</q-btn>
		</div>
	</hk-card>
</template>

<script>
import { mapActions } from "vuex";
import { damage_types, damage_type_icons } from "src/utils/generalConstants";
import { dice } from "src/mixins/dice";
import { setHP } from "src/mixins/HpManipulations";

export default {
	name: "hk-single-roll",
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
	mixins: [dice, setHP],
	data() {
		return {
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
			hitOrMiss: {},
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

				// Resistances
				for (const [key, defense] of Object.entries(this.defenses)) {
					if (this.roll.target[defense.value]) {
						for (const damage_type of this.roll.target[defense.value]) {
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
	},
	mounted() {
		this.checkHitOrMiss();
	},
	methods: {
		...mapActions(["removeActionRoll", "edit_entity_prop"]),
		checkHitOrMiss() {
			this.roll.actions.forEach((action, index) => {
				if (action.toHit) {
					if (action.toHit.throwsTotal === 20) this.$set(this.hitOrMiss, index, "hit");
					else if (action.toHit.throwsTotal === 1) this.$set(this.hitOrMiss, index, "miss");
					else if (this.roll.target) {
						if (this.displayStats(this.roll.target).ac <= action.toHit.total)
							this.$set(this.hitOrMiss, index, "hit");
						else this.$set(this.hitOrMiss, index, "miss");
					}
				}
			});
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
					if (action.toHit.throwsTotal === 20) new_action.crit = true;
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
					const value = this.roll.target.maxHpMod
						? this.roll.target.maxHpMod - event[1]
						: -event[1];
					this.edit_entity_prop({
						key: this.roll.target.key,
						entityType: this.roll.target.entityType,
						prop: "maxHpMod",
						value,
					});
				}
			}
			// Remove the roll
			this.removeActionRoll(this.index);
		},
		totalRollValue(action, action_index, rolls) {
			let total = parseInt(rolls.modifierRoll.total);

			if (rolls.scaledRoll) {
				total = total + rolls.scaledRoll.total;
			}
			if (action.type === "save" && this.savingThrowResult[action_index] === "save") {
				total = total * rolls.missSave;
			}
			if (action.toHit && this.hitOrMiss[action_index] === "miss") {
				total = total * rolls.missSave;
			}
			if (this.checkDefenses(rolls.damage_type, rolls.magical, "v")) {
				total = total * 2;
			}
			if (this.checkDefenses(rolls.damage_type, rolls.magical, "r")) {
				total = total / 2;
			}
			if (this.checkDefenses(rolls.damage_type, rolls.magical, "i")) {
				total = 0;
			}
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

			if (actions.length > 0) {
				total = 0;
				for (const action of actions) {
					total = total + this.totalActionValue(action, action.index);
				}
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
		displayStats(target) {
			let stats = "";
			if (target.transformed) {
				stats = {
					ac: target.transformedAc,
					maxHp: target.transformedMaxHp,
					maxHpMod: target.transformedMaxHpMod,
					curHp: target.transformedCurHp,
				};
			} else {
				stats = {
					ac: target.ac,
					maxHp: target.maxHp,
					maxHpMod: target.maxHpMod,
					curHp: target.curHp,
				};
			}
			return stats;
		},
		eventValues(event, value) {
			let returnObj = {
				name: "",
				value,
			};

			if (event) {
				// Drain = redus Max HP
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
			console.log("override", dmg_type);
			this.override[dmg_type] = undefined;
			this.edit_total[dmg_type] = !this.edit_total[dmg_type];
		},
	},
};
</script>

<style lang="scss" scoped>
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

		.target-item {
			margin-bottom: 15px;
			background-color: $neutral-8;

			.ac_wrapper {
				background-color: $neutral-9;
			}
		}

		.save {
			a {
				margin-left: 5px;
			}
		}
		.toHit {
			position: relative;
			display: flex;
			justify-content: space-between;
			font-size: 18px;
			margin-bottom: 10px;
			line-height: 30px;
			padding: 0 5px;
			z-index: 99;

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

			.type {
				padding-left: 10px;

				&__icon-wrapper {
					position: relative;

					.fa-sparkles {
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
