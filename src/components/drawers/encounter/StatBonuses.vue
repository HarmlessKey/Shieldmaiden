<template>
	<div class="pb-5">
		<template v-if="effective">
			<BasicEntity :entity="effective" />
			<h2 class="mt-3">{{ title }}</h2>

			<h3>Add a bonus</h3>
			<q-form class="bonus-list__add mb-3" @submit="add">
				<q-select
					v-if="stats.length > 1"
					v-model="newStat"
					:dark="$store.getters.theme === 'dark'"
					:options="statOptions"
					class="bonus-list__stat"
					filled
					square
					dense
					emit-value
					map-options
					label="For"
				/>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					v-model="newAmount"
					class="bonus-list__amount"
					filled
					square
					dense
					type="number"
					label="Value"
				/>
				<q-input
					:dark="$store.getters.theme === 'dark'"
					v-model="newLabel"
					class="bonus-list__label"
					filled
					square
					dense
					maxlength="50"
					label="Label"
					placeholder="Manual"
				/>
				<button type="submit" class="btn btn-sm" :disabled="!parseInt(newAmount)">
					<i aria-hidden="true" class="fas fa-plus" /> Add
				</button>
			</q-form>

			<div v-for="section in sections" :key="section.stat" class="stat-section">
				<div
					class="stat-section__header"
					:class="{ collapsible: sections.length > 1 }"
					@click="sections.length > 1 && toggle(section)"
				>
					<i
						v-if="sections.length > 1"
						aria-hidden="true"
						class="fas"
						:class="isOpen(section) ? 'fa-chevron-down' : 'fa-chevron-right'"
					/>
					<strong class="truncate">{{ section.label }}</strong>
					<span v-if="section.effective !== undefined" class="stat-section__effective">
						{{ format(section, section.effective) }}
					</span>
				</div>

				<div v-if="isOpen(section)" class="stat-section__body">
					<dl v-if="section.stored !== undefined" class="stat-values">
						<dt>Stored</dt>
						<dd>{{ format(section, section.stored) }}</dd>
						<dt>With bonuses</dt>
						<dd class="effective">{{ format(section, section.effective) }}</dd>
					</dl>

					<template v-if="section.lines.length">
						<h3>From effects</h3>
						<ul class="bonus-list">
							<li
								v-for="(line, index) in section.lines"
								:key="`effect-${index}`"
								:class="{ 'not-applied': !line.applied }"
							>
								<span class="bonus-list__value">{{ line.applied ? line.text : "" }}</span>
								<span class="truncate">
									{{ line.name }}{{ line.applied ? "" : `: ${line.text} (not applied)` }}
								</span>
								<button
									v-if="line.effectKey"
									class="btn btn-sm bg-neutral-5"
									@click="openEffect(line.effectKey)"
								>
									<i aria-hidden="true" class="fas fa-info" />
									<q-tooltip anchor="top middle" self="center middle">Effect details</q-tooltip>
								</button>
							</li>
						</ul>
					</template>

					<h3>Manual bonuses</h3>
					<ul v-if="section.manual.length" class="bonus-list">
						<li v-for="bonus in section.manual" :key="bonus.id">
							<q-input
								:dark="$store.getters.theme === 'dark'"
								:value="bonus.value"
								class="bonus-list__amount"
								filled
								square
								dense
								type="number"
								label="Value"
								@change="update(section.stat, bonus, { amount: $event.target.value })"
							/>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								:value="bonus.label"
								class="bonus-list__label"
								filled
								square
								dense
								maxlength="50"
								label="Label"
								@change="update(section.stat, bonus, { label: $event.target.value })"
							/>
							<button class="btn btn-sm bg-neutral-5" @click="remove(section.stat, bonus)">
								<i aria-hidden="true" class="fas fa-trash-alt red" />
								<q-tooltip anchor="top middle" self="center middle">Remove</q-tooltip>
							</button>
						</li>
					</ul>
					<p v-else class="neutral-2">No manual bonuses.</p>
				</div>
			</div>

		</template>
		<p v-else class="mt-3">This entity is no longer in the encounter.</p>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import { BONUS_LABELS, skillBonusKey } from "src/utils/entityFunctions";
import { calc_mod, calc_skill_mod } from "src/utils/generalFunctions";
import { abilities, skills } from "src/utils/generalConstants";
import {
	damageBonusLines,
	passivePerceptionOf,
	proficiencyBonus,
	rollPlan,
} from "src/utils/effectFunctions";

/**
 * The bonuses of one or more values of an entity: per value its stored value, its effect
 * modifiers (read-only), its manual bonuses (edit, remove) and its effective value, with
 * one form to add a manual bonus to any of them.
 *
 * data: { entityKey, stat } or { entityKey, stats: [..] }, BONUS_VALUES keys
 */
export default {
	name: "StatBonuses",
	components: {
		BasicEntity,
	},
	props: ["data"],
	data() {
		return {
			newStat: undefined,
			newAmount: undefined,
			newLabel: undefined,
			open: {},
		};
	},
	computed: {
		...mapGetters(["entities", "effective_entity", "roll_modifiers"]),
		stats() {
			return this.data?.stats?.length ? this.data.stats : [this.data?.stat].filter(Boolean);
		},
		title() {
			return this.stats.length === 1 ? `${this.label(this.stats[0])} bonuses` : "Bonuses";
		},
		statOptions() {
			return this.stats.map((stat) => ({ label: this.label(stat), value: stat }));
		},
		entity() {
			return this.entities[this.data?.entityKey];
		},
		effective() {
			return this.entity ? this.effective_entity(this.data.entityKey) : undefined;
		},
		sections() {
			return this.stats.map((stat) => this.section(stat));
		},
	},
	watch: {
		stats: {
			handler(stats) {
				this.newStat = stats[0];
			},
			immediate: true,
		},
	},
	methods: {
		...mapActions(["setDrawer", "set_bonus", "remove_bonus"]),
		label(stat) {
			return BONUS_LABELS[stat] || stat;
		},
		/**
		 * One value: { stat, label, roll, stored, effective, lines, manual }
		 */
		section(stat) {
			const manual = Object.entries(this.entity?.bonuses?.[stat] || {}).map(([id, bonus]) => ({
				id,
				...bonus,
			}));
			const base = { stat, label: this.label(stat), manual, lines: [] };
			// Attacks and their damage: no single stored value (it's per action and target);
			// the entity's own effect modifiers, with their filters
			if (stat === "attack") {
				const modifiers = this.roll_modifiers(this.data.entityKey, { kind: "attack" });
				return { ...base, roll: true, lines: modifiers?.lines || [] };
			}
			if (stat === "damage") {
				const lines = damageBonusLines({
					entity: this.effective,
					definitionOf: this.$store.getters.effect_definition,
				});
				return { ...base, roll: true, lines };
			}
			const roll = this.rollOf(stat);

			// A roll value: the modifier without and with effects and manual bonuses
			if (roll) {
				const stored = this.baseModifier(roll);
				const modifiers = this.roll_modifiers(this.data.entityKey, roll);
				const plan = rollPlan(modifiers, { modifier: stored });
				return { ...base, roll: true, stored, effective: plan.m, lines: modifiers?.lines || [] };
			}
			// Bonuses on all checks or saves, and death saves: manual bonuses only
			if (/^(check|save)_all$|^death_save$/.test(stat)) {
				return { ...base, roll: true };
			}
			// A number (3b): its field on the effective entity
			const field = this.fieldOf(stat);
			const e = this.effective || {};
			const stored = this.fallback(stat, e.stored && field in e.stored ? e.stored[field] : e[field]);
			const lines = (e.effect_modifiers?.[field] || []).filter((line) => line.bonusId === undefined);
			return { ...base, stored, effective: this.fallback(stat, e[field]), lines };
		},
		// The d20 roll a roll-bonus key belongs to, or undefined
		rollOf(stat) {
			if (stat === "concentration_save") return { kind: "concentration", ability: "constitution" };
			const skill = Object.values(skills).find((s) => skillBonusKey(s.value) === stat);
			if (skill) return { kind: "skill", skill: skill.value };
			const match = stat.match(/^(check|save)_(\w+)$/);
			if (match && abilities.includes(match[2])) return { kind: match[1], ability: match[2] };
			return undefined;
		},
		// The roll's modifier without effects and manual bonuses (as the entity card computes it)
		baseModifier(roll) {
			const e = this.effective || {};
			const proficiency = proficiencyBonus(e);
			if (roll.kind === "skill") {
				const skill = skills[roll.skill];
				return calc_skill_mod(
					calc_mod(e[skill.ability] || 10),
					proficiency,
					e.skill_modifiers?.[roll.skill] || 0,
					!!e.skills?.includes(roll.skill),
					!!e.skills_expertise?.includes(roll.skill),
					e.skills_jack_of_all_trades
				);
			}
			const mod = parseInt(calc_mod(e[roll.ability] || 10));
			// A Concentration save is a save of its ability
			const isSave = roll.kind === "save" || roll.kind === "concentration";
			if (isSave && e.saving_throws?.includes(roll.ability)) return mod + proficiency;
			return mod;
		},
		// Field of the entity a number is shown from
		fieldOf(stat) {
			const e = this.effective || {};
			switch (stat) {
				case "ac":
					return e.transformed ? "transformedAc" : "ac";
				case "max_hp":
					return "maxHp";
				case "speed":
					return e.speed !== undefined ? "speed" : "walk_speed";
				case "initiative":
					return "initiative_modifier";
				case "spell_save_dc":
					return e.caster_save_dc !== undefined ? "caster_save_dc" : "innate_save_dc";
				case "spell_attack":
					return e.caster_spell_attack !== undefined ? "caster_spell_attack" : "innate_spell_attack";
				default:
					return stat;
			}
		},
		// Numbers that aren't stored: initiative from Dexterity, passive Perception from the card
		fallback(stat, value) {
			if (value !== undefined && value !== null) return value;
			if (stat === "initiative") return calc_mod(this.effective?.dexterity || 10);
			if (stat === "passive_perception") return passivePerceptionOf(this.effective || {});
			return value;
		},
		format(section, value) {
			if (value === undefined || value === null || value === "") return "—";
			const signed = section.roll || ["initiative", "spell_attack"].includes(section.stat);
			if (signed && value > 0) return `+${value}`;
			return value;
		},
		// Sections open by default when there's only one, or when they have lines or bonuses
		isOpen(section) {
			if (this.open[section.stat] !== undefined) return this.open[section.stat];
			return this.sections.length === 1 || section.lines.length > 0 || section.manual.length > 0;
		},
		toggle(section) {
			this.$set(this.open, section.stat, !this.isOpen(section));
		},
		update(stat, bonus, { amount = bonus.value, label = bonus.label }) {
			this.set_bonus({ key: this.data.entityKey, stat, id: bonus.id, amount, label });
		},
		remove(stat, bonus) {
			this.remove_bonus({ key: this.data.entityKey, stat, id: bonus.id });
		},
		async add() {
			if (!parseInt(this.newAmount) || !this.newStat) return;
			await this.set_bonus({
				key: this.data.entityKey,
				stat: this.newStat,
				amount: this.newAmount,
				label: this.newLabel,
			});
			this.$set(this.open, this.newStat, true);
			this.newAmount = undefined;
			this.newLabel = undefined;
		},
		openEffect(effectKey) {
			this.setDrawer({
				show: true,
				type: "drawers/encounter/effects/ActiveEffect",
				data: { entityKey: this.data.entityKey, effectKey },
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.stat-section {
	border-bottom: solid 1px $neutral-5;
	padding: 5px 0;

	&__header {
		display: flex;
		align-items: center;
		gap: 8px;
		line-height: 30px;

		&.collapsible {
			cursor: pointer;
		}
		strong {
			flex-grow: 1;
			min-width: 0;
		}
	}
	&__effective {
		font-weight: bold;
	}
	&__body {
		padding: 5px 0 10px 0;
	}
}
dl.stat-values {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 5px 15px;
	margin-bottom: 10px;

	dt {
		color: $neutral-2;
	}
	dd {
		margin: 0;

		&.effective {
			font-weight: bold;
		}
	}
}
h3 {
	margin: 10px 0 5px 0;
}
.bonus-list {
	list-style: none;
	padding: 0;
	margin: 0 0 10px 0;

	li {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-bottom: 5px;
		min-width: 0;

		&.not-applied {
			opacity: 0.6;
		}
	}
	&__value {
		min-width: 40px;
		font-weight: bold;
	}
	&__amount {
		width: 80px;
		flex-shrink: 0;
	}
	&__label {
		flex-grow: 1;
		min-width: 0;
	}
	&__stat {
		width: 150px;
		flex-shrink: 0;
	}
	&__add {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 5px;
	}
}
</style>
