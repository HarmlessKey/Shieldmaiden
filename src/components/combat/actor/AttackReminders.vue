<template>
	<div v-if="chips.length" class="attack-reminders">
		<div
			v-for="(chip, index) in chips"
			:key="`chip-${index}`"
			class="attack-reminders__chip"
			:class="{ 'attack-reminders__chip--reaction': chip.reaction }"
		>
			<!-- Advantage: a green A, Disadvantage: a red D -->
			<b v-if="chip.advantage" class="green">A</b>
			<b v-if="chip.disadvantage" class="red">D</b>
			<hk-icon v-if="chip.icon" :icon="chip.icon" />
			<span v-if="chip.text" class="truncate">{{ chip.text }}</span>
			<q-tooltip anchor="top middle" self="bottom middle" max-width="300px">
				<div v-for="(line, l) in chip.lines" :key="`line-${l}`">{{ line }}</div>
			</q-tooltip>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { damageBonusLines, hasReactionUsed, hitTakenDamageLines } from "src/utils/effectFunctions";

/**
 * The actor's Reaction Used (first, red), restrictions and extra actions, and what its effects do to its attacks:
 * Advantage/Disadvantage, bonuses, critical hits and damage bonuses, with the single targeted
 * creature's "attacks against it" and the damage it takes when the actor hits it (Hex) when one
 * is targeted; that damage on creatures that aren't targeted is a reminder. For players, whose attacks aren't
 * rolled in the tracker, and NPCs alike. Melee/ranged isn't known here, so filters are named
 * and distance rules stay reminders; an NPC's rolls apply them for the actual attack.
 */
export default {
	name: "AttackReminders",
	props: {
		actor: {
			type: Object,
			required: true,
		},
	},
	computed: {
		...mapGetters(["targeted", "entities", "effective_entity", "effect_definition"]),
		// The other party, when exactly one other creature is targeted
		targetKey() {
			const [key] = this.targeted || [];
			return this.targeted?.length === 1 && key !== this.actor.key ? key : undefined;
		},
		modifiers() {
			if (!this.entities?.[this.actor.key]) return undefined;
			return this.$store.getters.attack_modifiers({
				attackerKey: this.actor.key,
				targetKey: this.targetKey,
			})?.modifiers;
		},
		/**
		 * One chip per restriction kind ("Can't take actions", "Can't attack Lyra", "Can't move"),
		 * the effects and their descriptions in the tooltip; "May not" when it can't be checked
		 */
		restrictionChips() {
			const list = this.$store.getters.restrictions?.(this.actor.key) || [];
			const verbs = {
				action: "take actions",
				bonus_action: "take bonus actions",
				reaction: "take reactions",
				movement: "move",
				speech: "speak",
				concentration: "concentrate",
			};
			const groups = {};
			for (const restriction of list) {
				// Attacks against a named creature (the charmer) are their own chip
				const group = restriction.kind === "attack" ? `attack:${restriction.againstKey || ""}` : restriction.kind;
				(groups[group] = groups[group] || []).push(restriction);
			}
			return Object.values(groups).map((items) => {
				const { kind, againstKey } = items[0];
				const possible = items.every((item) => item.possible) && !againstKey;
				const against = againstKey ? this.entities[againstKey]?.name?.capitalizeEach() : undefined;
				const verb =
					kind === "attack" ? (against ? `attack ${against}` : "attack") : verbs[kind] || kind.replace(/_/g, " ");
				return {
					icon: "fas fa-ban",
					text: `${possible ? "May not" : "Can't"} ${verb}`,
					lines: items.map(({ name, description }) => (description ? `${name}: ${description}` : name)),
				};
			});
		},
		/**
		 * One chip per extra-action kind ("Extra action"), the effects, descriptions and allowed
		 * actions in the tooltip (Haste)
		 */
		extraActionChips() {
			const list = this.$store.getters.extra_actions?.(this.actor.key) || [];
			const labels = {
				extra_action: "Extra action",
				extra_attack: "Extra attack",
				extra_bonus_action: "Extra bonus action",
				extra_reaction: "Extra reaction",
				bonus_action_option: "Bonus action option",
				extra_turn: "Extra turn",
			};
			const groups = {};
			for (const item of list) (groups[item.kind] = groups[item.kind] || []).push(item);
			return Object.entries(groups).map(([kind, items]) => ({
				icon: "fas fa-plus",
				text: labels[kind],
				lines: items.map(({ name, description, allowedActions }) => {
					const allowed = allowedActions.length ? ` (${allowedActions.join(", ").replace(/_/g, " ")})` : "";
					return `${name}: ${description || labels[kind]}${allowed}`;
				}),
			}));
		},
		damageLines() {
			const entity = this.effective_entity(this.actor.key) || this.actor;
			return damageBonusLines({ entity, definitionOf: this.effect_definition });
		},
		// Damage other creatures take when it hits them (Hex), targeted or not
		hitTakenLines() {
			return hitTakenDamageLines({
				attackerKey: this.actor.key,
				targetKey: this.targetKey,
				entities: this.entities,
				definitionOf: this.effect_definition,
			});
		},
		chips() {
			const chips = [];
			// Always first
			if (hasReactionUsed(this.actor)) {
				chips.push({
					reaction: true,
					icon: "fas fa-reply",
					text: "Reaction Used",
					lines: ["Reaction used, regained at the start of its next turn"],
				});
			}
			// What its effects stop it from doing, after Reaction Used, then its extra actions
			chips.push(...this.restrictionChips);
			chips.push(...this.extraActionChips);
			// Its effects the tracker only reminds of (compel, senses, limits, transfer…)
			const effectReminders = this.$store.getters.effect_reminders?.(this.actor.key) || [];
			const m = this.modifiers;
			if (!m) {
				if (effectReminders.length) chips.push(this.remindersChip(effectReminders));
				return chips;
			}
			const targetName = this.targetKey ? this.entities[this.targetKey]?.name?.capitalizeEach() : undefined;
			const against = targetName ? ` (against ${targetName})` : "";

			// Advantage (A) and Disadvantage (D); both shown when they cancel
			if (m.advantage.length || m.disadvantage.length) {
				const lines = [
					...(m.advantage.length ? [`Attacks with Advantage${against}: ${m.advantage.join(", ")}`] : []),
					...(m.disadvantage.length ? [`Attacks with Disadvantage${against}: ${m.disadvantage.join(", ")}`] : []),
				];
				if (m.advantage.length && m.disadvantage.length) lines.push("They cancel: roll normally");
				chips.push({ advantage: !!m.advantage.length, disadvantage: !!m.disadvantage.length, lines });
			}

			// Bonuses to hit: flat (manual and effects) and dice (Bless)
			const bonuses = [
				...m.flat.map(({ name, value }) => ({ name, text: value > 0 ? `+${value}` : `${value}` })),
				...m.dice.map(({ name, dice_count, dice_type, sign }) => ({
					name,
					text: `${sign < 0 ? "−" : "+"}${dice_count}d${dice_type}`,
				})),
			];
			if (bonuses.length) {
				chips.push({
					text: `To hit ${bonuses.map((b) => b.text).join(" ")}`,
					icon: "fas fa-dice-d20",
					// Effects' bonus lines name their filters ("+1 (weapon)"); manual bonuses aren't lines
					lines: [
						...m.lines
							.filter((line) => line.applied && /^[+−-]/.test(line.text))
							.map((line) => `${line.name}: ${line.text}`),
						...m.flat
							.filter((bonus) => bonus.bonusId !== undefined)
							.map(({ name, value }) => `${name}: ${value > 0 ? `+${value}` : value}`),
					],
				});
			}

			// Critical hits
			const crit = [
				...(m.critRange ? [`Critical on ${m.critRange}–20: ${m.critRangeNames.join(", ")}`] : []),
				...(m.critOnHit.length ? [`Hits are critical${against}: ${m.critOnHit.join(", ")}`] : []),
			];
			if (crit.length) {
				chips.push({ text: m.critRange ? `Crit ${m.critRange}–20` : "Hits crit", icon: "fas fa-crosshairs", lines: crit });
			}

			// Damage bonuses on hits: its own, and what the target takes when it hits it (Hex)
			const targetedHitTaken = this.hitTakenLines.filter((line) => line.targeted);
			const damageLines = [
				...this.damageLines.map((line) => ({ ...line, tooltip: `${line.name}: ${line.text}` })),
				...targetedHitTaken.map((line) => ({ ...line, tooltip: `${line.name}: ${line.text}${against}` })),
			];
			if (damageLines.length) {
				chips.push({
					text: `Damage ${damageLines.map((line) => line.text.split(" (")[0]).join(" ")}`,
					icon: "fas fa-sword",
					lines: damageLines.map((line) => line.tooltip),
				});
			}

			// What the tracker can't check (sight, distance, filters), single-use modifiers, the
			// effects it only reminds of, and creatures it hits harder that aren't targeted (Hex)
			const hitTakenReminders = this.hitTakenLines
				.filter((line) => !line.targeted)
				.map((line) => {
					const holder = (this.entities[line.holderKey]?.name || "").capitalizeEach();
					return `${line.name} on ${holder}: ${line.text} when you hit it`;
				});
			const reminders = [...new Set([...m.reminders, ...m.usedUp, ...effectReminders, ...hitTakenReminders])];
			if (reminders.length) chips.push(this.remindersChip(reminders));
			return chips;
		},
	},
	methods: {
		remindersChip(reminders) {
			return {
				text: `${reminders.length} reminder${reminders.length === 1 ? "" : "s"}`,
				icon: "fas fa-info-circle",
				lines: reminders,
			};
		},
	},
};
</script>

<style lang="scss" scoped>
// One line in the details bar; what doesn't fit is cut off
.attack-reminders {
	display: flex;
	align-items: center;
	gap: 4px;
	min-width: 0;
	overflow: hidden;
	white-space: nowrap;

	&__chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
		max-width: 180px;
		padding: 0 6px;
		line-height: 22px;
		border-radius: $border-radius-small;
		font-size: 12px;
		font-weight: normal;
		background-color: $neutral-5;

		b {
			font-size: 14px;
		}
		.truncate {
			min-width: 0;
		}
		.hk-icon {
			font-size: 12px;
		}

		&--reaction {
			background-color: $red;
			color: $white;
			font-weight: bold;
		}
	}
}
</style>
