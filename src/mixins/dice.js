import { mapActions, mapGetters } from "vuex";
import { rollPlan } from "src/utils/effectFunctions";

export const escapeHtml = (text) =>
	String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// A reroll condition for a natural 1 (Luck): "natural 1", "a 1" or "1"
export const isNaturalOne = (condition) => /^(a |natural )?1$/i.test(String(condition || "").trim());

export const dice = {
	data() {
		return {
			animateTrigger: false,
			rolled: 0,
		};
	},
	computed: {
		...mapGetters(["broadcast"]),
		critSettings() {
			if (this.$store.getters.userSettings && this.$store.getters.userSettings.encounter) {
				return this.$store.getters.userSettings.encounter.critical;
			}
			return undefined; // Default = undefined = roll twice
		},
		dice_types() {
			return [
				{ value: 4, text: "d4", average: this.calcAverage(4) },
				{ value: 6, text: "d6", average: this.calcAverage(6) },
				{ value: 8, text: "d8", average: this.calcAverage(8) },
				{ value: 10, text: "d10", average: this.calcAverage(10) },
				{ value: 12, text: "d12", average: this.calcAverage(12) },
			];
		},
	},
	watch: {
		animateTrigger() {
			this.animateValue("roll", 0, this.rolled, 500);
			this.rolled = 0;
		},
	},
	methods: {
		...mapActions(["setRoll"]),
		...mapActions("campaigns", ["set_share"]),
		/**
		 * The notification of a roll: its total, the dice and modifier, Advantage/Disadvantage,
		 * bonus dice and notes. With buttons (reroll offers) it stays a little longer.
		 */
		rollToast(roll, buttons = []) {
			let advantage;
			if (roll.ignored) {
				const type = Object.keys(roll.advantage_disadvantage)[0].charAt(0).capitalize();
				const color = type === "A" ? "green" : "red";
				advantage = `<b class="${color}">${type}</b> <span class="neutral-2">${roll.ignored}</span> `;
			}
			const bonus_rolls = roll.bonus_rolls || [];
			// Effect bonus dice and notes; labels can be the DM's own text, so escaped
			const bonusText = bonus_rolls
				.map(({ name, dice, sign, total }) => `${escapeHtml(name)} ${sign < 0 ? "−" : "+"}${dice}: ${Math.abs(total)}`)
				.join("<br />");
			const notesText = (roll.notes || []).map(escapeHtml).join("<br />");
			const extraText =
				bonusText || notesText
					? `<div class="roll_notes neutral-2">${[bonusText, notesText].filter(Boolean).join("<br />")}</div>`
					: "";
			const bonusSum = bonus_rolls.reduce((total, bonus) => total + bonus.total, 0);
			const bonusMod = bonusSum ? (bonusSum > 0 ? `+${bonusSum}` : `${bonusSum}`) : "";

			this.animateTrigger = !this.animateTrigger;
			this.$snotify.html(
				`<div class="snotifyToast__body roll">
					<div class="roll_title truncate">${roll.entity_name ? `${roll.entity_name}: ` : ``}${roll.title}</div>
					<div class="rolled" id="roll">${roll.total}</div>
					<div class="roll_footer">${advantage ? advantage : ""}${roll.throwsTotal}${roll.mod}${bonusMod}</div>
					${extraText}
				</div> `,
				{
					timeout: buttons.length ? 8000 : 3000,
					closeOnClick: !buttons.length,
					...(buttons.length ? { buttons } : {}),
				}
			);
			this.rolled = roll.total;
		},
		/**
		 * Rolls the d20 of a roll again for a reroll offer (Luck, Indomitable): the same modifier
		 * plus the reroll's bonus, with Advantage when it says so, and keeps the new, higher or
		 * lower roll. A single-use reroll is used up. Shows the kept roll.
		 *
		 * @param {object} roll The first roll (rollD's result)
		 * @param {object} reroll The offer: { name, keep, bonus, withAdvantage, consume, holderKey, effectKey }
		 */
		rerollD(roll, reroll, { title, entity_name, extras = {} } = {}) {
			const again = this.rollD(
				{},
				20,
				1,
				(parseInt(roll.m) || 0) + (reroll.bonus || 0),
				title,
				entity_name,
				false,
				reroll.withAdvantage ? { advantage: true } : {},
				null,
				{ ...extras, rerolls: [], notes: [] }
			);
			let kept = again;
			if (reroll.keep === "higher" && roll.total > again.total) kept = roll;
			if (reroll.keep === "lower" && roll.total < again.total) kept = roll;
			const keptText = { higher: "higher kept", lower: "lower kept", choice: "DM's choice" }[reroll.keep] || "new roll kept";
			const shown = {
				...kept,
				notes: [`${reroll.name}: rerolled ${roll.total} → ${again.total} (${keptText})`, ...(again.notes || [])],
			};
			if (reroll.consume && reroll.effectKey) {
				this.$store.dispatch("consume_roll_modifiers", [{ holderKey: reroll.holderKey, effectKey: reroll.effectKey }]);
			}
			this.rollToast(shown);
			return kept;
		},
		rollD(
			e,
			d = 20,
			n = 1,
			m = 0,
			title,
			entity_name = undefined,
			notify = false,
			advantage_disadvantage = {},
			share = null,
			extras = {}
		) {
			m = parseInt(m); //Removes + from modifier
			const add = (a, b) => a + b;
			let throws = [];
			let ignored = undefined;

			//Check for advantage with advantage or disadvantage when a single d20 is rolled
			if (
				n === 1 &&
				d === 20 &&
				(e.shiftKey || e.ctrlKey || Object.keys(advantage_disadvantage).length > 0)
			) {
				if (e.shiftKey || e.ctrlKey) {
					const type = e.shiftKey ? "advantage" : "disadvantage";
					advantage_disadvantage[type] = true;
				}

				//Only roll with advantage/disadvantage if only 1 is present they cancel each other out
				if (Object.keys(advantage_disadvantage).length === 1) {
					n = 2;
				}
			} else {
				advantage_disadvantage = {};
			}

			//Roll the dice
			for (var i = 0; i < n; i++) {
				throws.push(Math.ceil(Math.random() * d));
			}

			//Roll with advantage/disadvantage
			if (Object.keys(advantage_disadvantage).length === 1) {
				let ignoredRoll = throws[0] < throws[1] ? 0 : 1; //ignore the lowest roll

				//With disadvantage, ignore the highest roll
				if (advantage_disadvantage.disadvantage) {
					ignoredRoll = throws[0] > throws[1] ? 0 : 1;
				}

				ignored = throws[ignoredRoll];
				throws.splice(ignoredRoll, 1);
				n = 1;
			}

			let s = "";
			if (Math.sign(m) >= 0) {
				s = "+";
			}
			// The d20 as rolled (after Advantage/Disadvantage), before a floor raises it
			const isD20 = n === 1 && d === 20;
			const natural = isD20 ? throws[0] : undefined;
			const notes = [...(extras.notes || [])];
			// A minimum die (Reliable Talent): a lower d20 counts as the floor
			const dieFloor = isD20 ? extras.floor?.die : undefined;
			if (dieFloor && throws[0] < dieFloor.value) {
				notes.push(`${dieFloor.name}: ${throws[0]} → ${dieFloor.value}`);
				throws[0] = dieFloor.value;
			}
			const sumThrows = throws.reduce(add);
			let sumTotal = sumThrows + parseInt(m);

			// Bonus dice of effects (Bless +1d4, Bane −1d4), added to the total
			const bonus_rolls = (extras.bonus_dice || [])
				.filter((bonus) => bonus.dice_count > 0 && bonus.dice_type > 0)
				.map(({ name, dice_count, dice_type, sign = 1 }) => {
					const bonus_throws = [];
					for (let j = 0; j < dice_count; j++) bonus_throws.push(Math.ceil(Math.random() * dice_type));
					const total = sign * bonus_throws.reduce(add, 0);
					return { name, dice: `${dice_count}d${dice_type}`, sign, throws: bonus_throws, total };
				});
			for (const bonus of bonus_rolls) sumTotal += bonus.total;

			// A minimum total (Indomitable Might)
			const totalFloor = isD20 ? extras.floor?.total : undefined;
			if (totalFloor && sumTotal < totalFloor.value) {
				notes.push(`${totalFloor.name}: total ${sumTotal} → ${totalFloor.value}`);
				sumTotal = totalFloor.value;
			}

			// Rerolls to offer (Luck): "natural 1" only when the die shows a 1, others always
			const rerolls = isD20
				? (extras.rerolls || []).filter((reroll) => !isNaturalOne(reroll.condition) || natural === 1)
				: [];
			for (const reroll of rerolls) {
				notes.push(
					isNaturalOne(reroll.condition)
						? `${reroll.name}: reroll the 1`
						: `${reroll.name}: reroll${reroll.condition ? ` on ${reroll.condition}` : ""}`
				);
			}

			const showRoll = m !== 0 ? `${n}d${d}${s}${m}` : `${n}d${d}`;

			const roll = {
				title,
				roll: showRoll,
				n,
				d,
				s,
				m,
				mod: s + m,
				throws: throws,
				throwsTotal: sumThrows,
				total: sumTotal,
				advantage_disadvantage,
				ignored,
			};
			if (entity_name) roll.entity_name = entity_name;
			if (bonus_rolls.length) roll.bonus_rolls = bonus_rolls;
			if (notes.length) roll.notes = notes;
			if (natural !== undefined) roll.natural = natural;
			if (rerolls.length) roll.rerolls = rerolls;

			if (notify) {
				// Each reroll offer is a button that rolls the d20 again (Luck)
				const buttons = rerolls.map((reroll) => ({
					text: `Reroll (${reroll.name})`,
					action: (toast) => {
						this.$snotify.remove(toast.id);
						this.rerollD(roll, reroll, { title, entity_name, extras });
					},
				}));
				this.rollToast(roll, buttons);
			}

			//Save the roll in the encounter "shares" object
			if (share && this.broadcast.live) {
				const key = Date.now() + Math.random().toString(36).substring(4);
				let share_roll = { ...roll };

				// Remove unneeded properties
				delete share_roll.throws;
				delete share_roll.throwsTotal;
				delete share_roll.d;
				delete share_roll.mod;
				delete share_roll.ignored;
				delete share_roll.bonus_rolls;
				delete share_roll.notes;
				delete share_roll.natural;
				delete share_roll.rerolls;
				if (!roll.ignored) {
					delete share_roll.advantage_disadvantage;
				} else {
					share_roll.advantage_disadvantage = Object.keys(advantage_disadvantage)[0].charAt(0);
				}

				let share_object = {
					key,
					type: "roll",
					notification: share_roll,
				};

				if (share.encounter_id) share_object.encounter_id = share.encounter_id;
				if (share.entity_key) share_object.entity_key = share.entity_key;

				// Share the roll
				this.set_share({ id: this.broadcast.live, share: share_object });
			}

			this.setRoll(roll);
			return roll;
		},
		rollD6(n = 1, m = 0) {
			return this.rollD(6, n, m);
		},
		rollD8(n = 1, m = 0) {
			return this.rollD(8, n, m);
		},
		rollD10(n = 1, m = 0) {
			return this.rollD(10, n, m);
		},
		rollD20(n = 1, m = 0) {
			return this.rollD(20, n, m);
		},
		rollD100(n = 1, m = 0) {
			return this.rollD(100, n, m);
		},
		/**
		 * Roll any spell or monster action
		 *
		 * @param {object} e Event, holds info for advantage/disadvantage
		 * @param {object} ability Full ability object
		 * @param {object} config Holds configuration options {type, cast_level, caster_level, toHitModifier, versatile}
		 *
		 * @returns {object}
		 */
		rollAction(e, ability, config = {}) {
			let returnRoll = {
				name: this.getAbilityName(ability, config),
				actions: [],
			};
			// Spells are magical (for roll modifiers against magic); other actions are unknown
			if (config.type === "spell") returnRoll.source = { magical: true };

			if (config.option !== undefined) {
				if (ability.options && ability.options.length) {
					returnRoll.name = `${ability.name} (${config.option})`;
				} else if (ability.versatile) {
					returnRoll.name =
						config.option === 0
							? `${ability.name} (${ability.versatile_one || "Option 1"})`
							: `${ability.name} (${ability.versatile_two || "Option 2"})`;
				}
			}

			// Check for advantage/disadvantage in the $event
			let advantage_object = e.advantage_disadvantage ? e.advantage_disadvantage : {};
			if (e.e.shiftKey) {
				advantage_object["advantage"] = true;
			}
			if (e.e.ctrlKey) {
				advantage_object["disadvantage"] = true;
			}

			const actions = ability.action_list; // All actions in the ability
			// Single-use modifiers used by this roll (and earlier rolls of the same action, via config)
			const consumed = config.consumed || [];

			let i = 0;
			// LOOP OVER ALL ACTIONS
			for (let action of actions) {
				let type = action.type;
				let attack_bonus = action.attack_bonus || config.attack_bonus;
				let toHit = false;
				let crit = false;
				// Damage bonuses of the attacker's effects and manual damage bonuses, for attacks
				let damageBonuses = [];
				returnRoll.actions[i] = { type, rolls: [] };
				// Effects linked to the action, shown in the roll result (applying them is step 7)
				if (action.effects) returnRoll.actions[i].effects = action.effects;

				// If the action type is a spell attack, melee weapon or ranged weapon, roll to hit
				if (type === "melee_weapon" || type === "ranged_weapon" || type === "spell_attack") {
					// The attacker's and the target's effects, when rolled in the tracker
					const effects = config.attackerKey
						? this.$store.getters.attack_modifiers?.({
								attackerKey: config.attackerKey,
								targetKey: config.targetKey,
								attackType: type,
								source: returnRoll.source,
								consumed,
							})
						: undefined;
					const plan = effects
						? rollPlan(effects.modifiers, { modifier: attack_bonus, advantage: advantage_object })
						: undefined;
					returnRoll.actions[i].toHit = this.rollD(
						e.e,
						20,
						1,
						plan ? plan.m : attack_bonus,
						`${ability.name} to hit`,
						undefined,
						false,
						plan ? plan.advantage : advantage_object,
						null,
						plan
							? {
									bonus_dice: plan.bonus_dice,
									notes: [...plan.roll_notes, ...effects.damage.reminders],
									floor: plan.floor,
									rerolls: plan.rerolls,
								}
							: {}
					);
					// The die as rolled, also when a floor raised it
					const toHitRoll = returnRoll.actions[i].toHit;
					const natural = toHitRoll.natural ?? toHitRoll.throwsTotal;
					const critRange = effects?.modifiers.critRange || 20;
					if (natural >= critRange) {
						returnRoll.actions[i].crit = true;
						crit = true;
						if (natural < 20) returnRoll.actions[i].critNames = effects.modifiers.critRangeNames;
					}
					// A hit on this target is critical (Paralyzed within 5 ft): rolled as critical damage
					if (effects?.modifiers.critOnHit.length) {
						returnRoll.actions[i].critOnHit = effects.modifiers.critOnHit;
						crit = true;
					}
					// Single-use modifiers end now; later rolls of this action skip them
					if (plan?.consume.length) {
						consumed.push(...plan.consume);
						this.$store.dispatch("consume_roll_modifiers", plan.consume);
					}
					damageBonuses = effects?.damage.bonuses || [];
					toHit = true;
				}
				// For a saving throw set the ability and DC for display
				if (type === "save") {
					returnRoll.actions[i].save_ability = action.save_ability;
					returnRoll.actions[i].save_dc = config.save_dc || action.save_dc || 10;
				}

				// A sub-action can be only an attack or a save (its effects are linked to the outcome),
				// and type other has nothing to roll
				const rolls = type === "other" ? [] : action.rolls || [];
				for (const roll of rolls) {
					// Create editable Roll object with important props from roll object via anonymous function
					let editableRoll = (({ damage_type, dice_count, dice_type, fixed_val }) => ({
						damage_type,
						dice_count,
						dice_type,
						fixed_val,
					}))(roll);

					const missSave = toHit ? roll.miss_mod : roll.save_fail_mod; //what happens on miss/failed save
					const special =
						!roll.special || roll.length === 0
							? undefined
							: roll.special && Array.isArray(roll.special)
								? roll.special
								: [roll.special];
					let magical = !!roll.magical;

					// Check for options
					if (ability.options && config.option && roll.options && roll.options[config.option]) {
						const option = roll.options[config.option];
						if (option.ignore) {
							editableRoll = {};
							continue;
						} else {
							editableRoll.damage_type = option.damage_type || editableRoll.damage_type;
							editableRoll.dice_type = option.dice_type || editableRoll.dice_type;
							editableRoll.dice_count = option.dice_count || editableRoll.dice_count;
							editableRoll.fixed_val = option.fixed_val || editableRoll.fixed_val;
							magical = option.magical;
						}
					}
					// Check for versatile. 1 is the alternative option
					// Changes only have to be made if the versatile roll is the alternative (1)
					else if (ability.versatile && config.option === 1) {
						editableRoll.damage_type = roll.versatile_damage_type || editableRoll.damage_type;
						editableRoll.dice_type = roll.versatile_dice_type || editableRoll.dice_type;
						editableRoll.dice_count = roll.versatile_dice_count || editableRoll.dice_count;
						editableRoll.fixed_val = roll.versatile_fixed_val || editableRoll.fixed_val;
						magical = roll.versatile_magical;
					}

					// Check if the action scales with the current roll
					const tiers = roll.scaling;
					if (roll.scaling) {
						editableRoll = this.__levelScaling__(tiers, editableRoll, ability, config);
					}

					// check crits
					editableRoll.dice_count = this.getDiceCount(crit, editableRoll.dice_count);

					// Roll the roll
					let rollResult = undefined;
					if (editableRoll.dice_type && editableRoll.dice_count) {
						rollResult = this.rollD(
							e.e,
							editableRoll.dice_type,
							editableRoll.dice_count,
							editableRoll.fixed_val,
							`${editableRoll.name}`
						);
						// When there is nothing to roll, but only a fixed value
						// still a roll must be created
					} else {
						rollResult = {
							title: editableRoll.name,
							roll: editableRoll.fixed_val,
							mod: editableRoll.fixed_val,
							throws: [],
							throwsTotal: 0,
							total: parseInt(editableRoll.fixed_val),
						};
					}

					// Double the rolled damage (without the modifier [throwsTotal])
					// simply add [throwsTotal] once more to the [total]
					// Only when it's a crit and crit settings are set to double
					if (crit && this.critSettings === "double") {
						rollResult.total = rollResult.total + rollResult.throwsTotal;
						const { n, d, m, s } = rollResult;
						rollResult.roll = m !== 0 ? `2x(${n}d${d})${s}${m}` : `2x(${n}d${d})`;
					}
					// Add the max damage output of the roll to the total when crit and setting is max
					if (crit && this.critSettings === "max") {
						const { n, d, m, s } = rollResult;
						rollResult.total = rollResult.total + n * d;
						rollResult.roll = m !== 0 ? `(${n}d${d}+${n * d})${s}${m}` : `(${n}d${d}+${n * d}) `;
					}

					// Push the rolled modifier to the array with all rolled modifiers
					returnRoll.actions[i].rolls.push({
						rollResult,
						damage_type: editableRoll.damage_type,
						missSave,
						magical,
						special,
					});
				}

				// Damage bonuses of a hit (Divine Favor, Magic Weapon, manual): their own damage rolls,
				// of their damage type or the attack's first, none of it on a miss, crit like the rest
				const firstType = returnRoll.actions[i].rolls[0]?.damage_type;
				for (const bonus of damageBonuses) {
					const damage_type = bonus.damage_type || firstType;
					if (!damage_type) continue;
					let rollResult;
					if (bonus.dice_count && bonus.dice_type) {
						rollResult = this.rollD(
							e.e,
							bonus.dice_type,
							this.getDiceCount(crit, bonus.dice_count),
							bonus.value || 0,
							bonus.name
						);
						if (crit && this.critSettings === "double") {
							rollResult.total += rollResult.throwsTotal;
							const { n, d, m, s } = rollResult;
							rollResult.roll = m !== 0 ? `2x(${n}d${d})${s}${m}` : `2x(${n}d${d})`;
						}
						if (crit && this.critSettings === "max") {
							const { n, d, m, s } = rollResult;
							rollResult.total += n * d;
							rollResult.roll = m !== 0 ? `(${n}d${d}+${n * d})${s}${m}` : `(${n}d${d}+${n * d}) `;
						}
					} else {
						rollResult = {
							title: bonus.name,
							roll: bonus.value,
							mod: bonus.value,
							throws: [],
							throwsTotal: 0,
							total: parseInt(bonus.value),
						};
					}
					returnRoll.actions[i].rolls.push({
						rollResult,
						damage_type,
						missSave: 0,
						magical: !!bonus.magical,
						name: bonus.name,
					});
				}
				i++;
			}
			return returnRoll;
		},
		__levelScaling__(tiers, roll, ability, config) {
			// SPELL SCALE
			if (ability.scaling === "spell_scale") {
				const tier = tiers[0];
				const scale = tier?.level;
				const dice_count = tier?.dice_count;
				const fixed_val = tier?.fixed_val;

				// Calculate the increase based on spell level, on what level the spell is cast and the scale
				const increase = parseInt(Math.floor((config.cast_level - ability.level) / scale));

				// If there is an increase,
				if (increase) {
					roll.dice_count += increase * dice_count;
					if (roll.fixed_val) roll.fixed_val += fixed_val ? increase * fixed_val : 0;
				}
			}
			// CHARACTER LEVEL
			else if (ability.scaling === "character_level") {
				tiers.sort((a, b) => (parseInt(a.level) > parseInt(b.level) ? 1 : -1));

				for (let tier of tiers) {
					if (parseInt(config.caster_level) >= parseInt(tier.level)) {
						roll.dice_count = tier.dice_count;
						roll.fixed_val = tier.fixed_val || 0;
					}
				}
			}
			return roll;
		},
		getAbilityName(ability, config) {
			if (config.cast_level) {
				return `${ability.name} (${config.cast_level.toOrdinal()})`;
			}
			return ability.name;
		},
		animateValue(id, start, end, duration) {
			if (start === end) return;
			const range = end - start;
			let current = start;
			const increment = end > start ? 1 : -1;
			const stepTime = Math.abs(Math.floor(duration / range));
			const obj = document.getElementById(id);
			const timer = setInterval(function () {
				current += increment;
				obj.innerHTML = current;
				if (current == end) {
					clearInterval(timer);
				}
			}, stepTime);
		},
		calcAverage(value, amount = 1) {
			return Math.ceil(((value + 1) / 2) * amount);
		},
		getDiceCount(crit, dice_count) {
			// Crit and setting is roll damage twice
			if (crit && this.critSettings === undefined) {
				return dice_count * 2;
			}

			return dice_count;
		},
	},
};
