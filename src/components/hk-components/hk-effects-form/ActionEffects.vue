<template>
	<div class="mt-3 action-effects">
		<label class="group justify-content-between">
			<span>
				<i aria-hidden="true" class="fas fa-sparkles" /> {{ trait ? "Trait effects" : "Effects" }}
				<hk-popover v-if="trait" header="Trait effects" class="ml-1">
					<i aria-hidden="true" class="fas fa-info-circle neutral-2" />
					<template #content>
						Effects that are always active on the creature, in every encounter, without
						applying them: a golem's Acid Absorption or Magic Resistance. They have no duration,
						can't be removed and don't show in its list of effects. Every choice is fixed here.
					</template>
				</hk-popover>
			</span>
			<a class="btn btn-sm btn-clear" @click="add">
				<i aria-hidden="true" class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add effect</span>
			</a>
		</label>

		<div v-if="!links.length" class="card-body neutral-3">
			{{ trait ? "No trait effects" : "No effects" }}
		</div>
		<!-- One line per link, like the rolls table -->
		<hk-table v-else :items="links" :columns="columns" :showHeader="false">
			<strong slot="effect" slot-scope="data">
				{{
					data.row.link.effect
						? data.row.link.effect.name || data.row.link.effect.source_key
						: "No effect"
				}}
			</strong>

			<span slot="when" slot-scope="data" :class="{ red: !fits(data.row.outcome) }">
				{{ outcomeLabel(data.row.outcome) }}
				<template v-if="!fits(data.row.outcome)">
					<i aria-hidden="true" class="fas fa-exclamation-triangle ml-1" />
					<q-tooltip anchor="top middle" self="center middle">
						Doesn't fit a {{ actionTypeLabel }} action
					</q-tooltip>
				</template>
			</span>

			<span slot="summary" slot-scope="data" class="neutral-2">
				{{ summary(data.row.link) }}
				<q-tooltip anchor="top middle" self="center middle">{{ summary(data.row.link) }}</q-tooltip>
			</span>

			<div slot="actions" slot-scope="data" class="actions">
				<a class="ml-2 btn btn-sm bg-neutral-5" @click="edit(data.row)">
					<i aria-hidden="true" class="fas fa-pencil-alt"></i>
					<q-tooltip anchor="top middle" self="center middle">Edit</q-tooltip>
				</a>
				<a class="ml-2 btn btn-sm bg-neutral-5" @click="remove(data.row)">
					<i aria-hidden="true" class="fas fa-trash-alt"></i>
					<q-tooltip anchor="top middle" self="center middle">Delete</q-tooltip>
				</a>
			</div>
		</hk-table>

		<q-dialog v-model="dialog">
			<div v-if="editing">
				<ValidationObserver v-slot="{ handleSubmit, valid }">
					<q-form @submit="handleSubmit(save)">
						<hk-card
							:header="editing.from ? 'Edit effect' : 'New effect'"
							class="mb-0 effect-link-dialog"
						>
							<div class="card-body">
								<EffectLinkForm
									:value="editing.link"
									:outcome.sync="editing.outcome"
									:duration-valid.sync="editing.durationValid"
									:action-type="actionType"
									:edition="edition"
									:default-save="defaultSave"
									:trait="trait"
									:spell="spell"
								/>
							</div>
							<div slot="footer" class="card-footer d-flex justify-content-end">
								<q-btn class="mr-1" v-close-popup no-caps>Cancel</q-btn>
								<q-btn
									color="primary"
									type="submit"
									no-caps
									:disabled="
										!valid ||
										!editing.durationValid ||
										!editing.link.effect ||
										(!trait && !editing.outcome) ||
										scalingIncomplete(editing.link)
									"
									:label="editing.from ? 'Save' : 'Add'"
								/>
							</div>
						</hk-card>
					</q-form>
				</ValidationObserver>
			</div>
		</q-dialog>
	</div>
</template>

<script>
import EffectLinkForm from "./EffectLinkForm.vue";
import { choiceField } from "./fieldControls";
import { action_outcomes, outcomesFor, triggers } from "src/utils/effectsConstants";
import { attack_types } from "src/utils/actionConstants";
import { describeDuration, durationScalingIncomplete, spellDuration } from "src/utils/effectFunctions";

/**
 * The effects linked to one action-list entry of an NPC ability ($defs/action_effects),
 * edited in place on `value` (the entry). With `trait`, the always-active trait effects of a
 * special ability instead (`value` is the ability, `value.effects` a list of links without
 * When or Duration, effects 6b). Links are added and edited in a dialog that works on a copy.
 * Emits `change` after every change, so the NPC form can update.
 */
export default {
	name: "ActionEffects",
	components: { EffectLinkForm },
	props: {
		// The action-list entry: { type, rolls?, effects? }, or with `trait` the special ability
		value: { type: Object, required: true },
		// Edition of the NPC
		edition: { type: String, default: undefined },
		// Trait links of a special ability
		trait: { type: Boolean, default: false },
		// Links of a spell's action (effects 6c): the spell, for scaling and defaults
		spell: { type: Object, default: undefined },
	},
	data() {
		return {
			dialog: false,
			// { link, outcome, durationValid, from?: { outcome, index } }
			editing: undefined,
		};
	},
	computed: {
		// Columns of the links table (hk-table), like the rolls table; trait links have no When
		columns() {
			const columns = {
				effect: { truncate: true, maxContent: true },
				when: { truncate: true, maxContent: true },
				summary: { truncate: true },
				actions: { noPadding: true, maxContent: true },
			};
			if (this.trait) delete columns.when;
			return columns;
		},
		actionType() {
			return this.value.type;
		},
		// A repeat save on a save sub-action starts with its ability and DC; a spell's has no DC
		// of its own (the caster's spell save DC)
		defaultSave() {
			if (this.actionType !== "save") return undefined;
			if (this.spell) return { ability: this.value.save_ability };
			return { ability: this.value.save_ability, dc: this.value.save_dc };
		},
		actionTypeLabel() {
			return (attack_types[this.actionType]?.label || this.actionType || "").toLowerCase();
		},
		// Links of all outcome lists, in outcome order; a trait's list as it is
		links() {
			if (this.trait) {
				return (Array.isArray(this.value.effects) ? this.value.effects : []).map((link, index) => ({
					index,
					link,
				}));
			}
			const effects = this.value.effects || {};
			return Object.keys(action_outcomes).flatMap((outcome) =>
				(Array.isArray(effects[outcome]) ? effects[outcome] : []).map((link, index) => ({
					outcome,
					index,
					link,
				}))
			);
		},
	},
	methods: {
		outcomeLabel(outcome) {
			return action_outcomes[outcome]?.label || outcome;
		},
		fits(outcome) {
			return outcomesFor(this.actionType).includes(outcome);
		},
		/**
		 * Duration, escape DC, repeat save, fixed choices, level and magical in one line
		 */
		summary(link) {
			const parts = [];
			const duration = link.duration;
			if (this.trait) {
				// Always active: no duration
			} else if (duration) {
				// A dice or formula amount isn't spelled out
				const value = typeof duration.value === "number" ? duration.value : undefined;
				parts.push(
					describeDuration({ duration: { ...duration, value } }, { casterName: "the creature" })
				);
				if (duration.escape?.dc !== undefined) {
					const dc = typeof duration.escape.dc === "number" ? ` ${duration.escape.dc}` : "";
					parts.push(`escape DC${dc}`);
				}
				if (duration.save) parts.push("repeat save");
				const early = (duration.cancel_triggers || []).map(
					({ trigger }) => triggers[trigger]?.label || trigger
				);
				if (early.length) parts.push(`ends early: ${early.join(", ").toLowerCase()}`);
			} else {
				parts.push("duration chosen when applied");
			}
			for (const [kind, choice] of Object.entries(link.choices || {})) {
				const field = choiceField({ kind });
				const option = (field.options || []).find(({ value }) => value === choice);
				parts.push(`${field.label}: ${option ? option.label : choice}`);
			}
			if (link.level !== undefined) parts.push(`level ${link.level}`);
			if (link.magical) parts.push("magical");
			if (link.scaling?.length) parts.push("scales");
			if (duration && link.duration_scaling?.length) parts.push("longer at higher levels");
			return parts.join(" · ");
		},
		/**
		 * Whether a spell link has a scaling tier without a level, or without a value and level,
		 * or a duration tier that isn't complete
		 */
		scalingIncomplete(link) {
			if (this.spell && durationScalingIncomplete(link, parseInt(this.spell.level) || 0)) return true;
			return (link?.scaling || []).some(
				(tier) =>
					!tier.level ||
					((tier.value === undefined || tier.value === "") &&
						(tier.effect_level === undefined || tier.effect_level === ""))
			);
		},
		/**
		 * A new link: on a spell it's magical, and a Concentration spell's link lasts as long as
		 * the spell's Concentration
		 */
		newLink() {
			if (!this.spell) return {};
			const link = { magical: true };
			if (this.spell.duration_type === "concentration") link.duration = spellDuration(this.spell);
			return link;
		},
		add() {
			const fitting = outcomesFor(this.actionType);
			this.editing = {
				link: this.newLink(),
				// The first fitting outcome: On a hit, On a failed save or Always
				outcome: this.trait ? undefined : fitting[0],
				durationValid: true,
			};
			this.dialog = true;
		},
		edit({ outcome, index, link }) {
			this.editing = {
				link: JSON.parse(JSON.stringify(link)),
				outcome,
				from: { outcome, index },
				durationValid: true,
			};
			this.dialog = true;
		},
		save() {
			const { link, outcome, from } = this.editing;
			if (this.trait) {
				if (!link.effect) return;
				const list = Array.isArray(this.value.effects) ? [...this.value.effects] : [];
				if (from) list.splice(from.index, 1, link);
				else list.push(link);
				this.$set(this.value, "effects", list);
				this.dialog = false;
				this.$emit("change");
				return;
			}
			if (!link.effect || !outcome) return;

			if (from && from.outcome === outcome) {
				this.$set(this.value.effects[outcome], from.index, link);
			} else {
				if (from) this.removeAt(from.outcome, from.index);
				if (!this.value.effects) this.$set(this.value, "effects", {});
				const list = Array.isArray(this.value.effects[outcome]) ? this.value.effects[outcome] : [];
				this.$set(this.value.effects, outcome, [...list, link]);
			}
			this.dialog = false;
			this.$emit("change");
		},
		remove({ outcome, index }) {
			this.removeAt(outcome, index);
			this.$emit("change");
		},
		/**
		 * Removes a link, and its outcome list and the effects object when they are empty
		 */
		removeAt(outcome, index) {
			if (this.trait) {
				const list = (Array.isArray(this.value.effects) ? this.value.effects : []).filter((link, i) => i !== index);
				if (list.length) this.$set(this.value, "effects", list);
				else this.$delete(this.value, "effects");
				return;
			}
			const effects = this.value.effects;
			if (!effects || !Array.isArray(effects[outcome])) return;
			const list = effects[outcome].filter((link, i) => i !== index);
			if (list.length) this.$set(effects, outcome, list);
			else this.$delete(effects, outcome);
			if (!Object.keys(effects).length) this.$delete(this.value, "effects");
		},
	},
};
</script>

<style lang="scss" scoped>
label.group {
	display: flex;
	line-height: 30px;
	border-bottom: solid 1px $neutral-5;
	width: 100%;
}
.action-effects .actions {
	display: flex;
}
.effect-link-dialog {
	width: 600px;
	max-width: 100%;
}
</style>
