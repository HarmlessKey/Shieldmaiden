<template>
	<div class="pb-5">
		<BasicEntity v-if="entity" :entity="entity" />
		<template v-if="instance">
			<h2 class="mt-3">
				<i v-if="icon" aria-hidden="true" :class="`hki-${icon}`" />
				<i v-else aria-hidden="true" class="fas fa-sparkles" />
				{{ name }}
			</h2>

			<dl class="instance">
				<dt>Duration</dt>
				<dd>{{ duration }}</dd>
				<template v-if="instance.applied_round !== undefined">
					<dt>Applied</dt>
					<dd>{{ instance.applied_round ? `Round ${instance.applied_round}` : "Before combat" }}</dd>
				</template>
				<template v-if="instance.caster_key || instance.caster_name">
					<dt>Caster</dt>
					<dd>{{ casterLabel }}</dd>
				</template>
				<template v-for="(value, kind) in instance.choices || {}">
					<dt :key="`choice-kind-${kind}`">{{ startCase(kind) }}</dt>
					<dd :key="`choice-value-${kind}`">{{ startCase(value) }}</dd>
				</template>
				<template v-if="repeatSave">
					<dt>Repeat save</dt>
					<dd>{{ repeatSave }}</dd>
				</template>
				<template v-if="saveProgress">
					<dt>Saves</dt>
					<dd>{{ saveProgress }}</dd>
				</template>
			</dl>

			<div v-if="escape" class="escape mb-3">
				<strong>Escape</strong>
				<div class="neutral-2 mb-2">{{ escapeText }}</div>
				<div class="escape__actions">
					<button
						v-for="check in escape.checks"
						:key="`${check.ability}-${check.skill}`"
						class="btn btn-sm bg-neutral-5"
						@click="rollEscape(check)"
					>
						<i aria-hidden="true" class="fas fa-dice-d20" /> Roll {{ startCase(check.skill || check.ability) }}
					</button>
					<button class="btn btn-sm bg-green" @click="resolveEscape(true)">Escaped</button>
					<button class="btn btn-sm bg-neutral-5" @click="resolveEscape(false)">Failed</button>
				</div>
			</div>

			<table v-if="isExhaustion" class="table">
				<thead>
					<th>Level</th>
					<th>Effect</th>
				</thead>
				<tbody>
					<tr v-for="(effect, i) in exhaustionLevels" :key="`level-${i}`">
						<td>
							<a :class="{ active: instance.level >= i + 1 }" @click="setLevel(i + 1)">
								<i v-if="instance.level >= i + 1" aria-hidden="true" class="fas fa-check" />
								<span v-else>{{ i + 1 }}</span>
							</a>
						</td>
						<td :class="{ 'neutral-2': instance.level < i + 1 }">{{ effect }}</td>
					</tr>
					<tr>
						<td>
							<a @click="remove"><i aria-hidden="true" class="fas fa-times" /></a>
						</td>
						<td>Remove</td>
					</tr>
				</tbody>
			</table>

			<EffectDetails
				:definition="definition"
				:edition="edition"
				:url="instance.source === 'srd' ? instance.source_key : undefined"
				:show-exhaustion-table="false"
			/>

			<button
				v-if="definition?.cancelable !== false"
				class="btn btn-block bg-red mt-3"
				@click="remove"
			>
				Remove effect
			</button>
		</template>
		<p v-else class="mt-3">This effect is no longer active.</p>
	</div>
</template>

<script>
import { startCase } from "lodash";
import { mapActions, mapGetters } from "vuex";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import EffectDetails from "src/components/drawers/encounter/effects/EffectDetails.vue";
import { describeDuration } from "src/utils/effectFunctions";
import { EXHAUSTION_LEVELS } from "src/utils/generalConstants.js";
import { effectRolls } from "src/mixins/effectRolls";

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const DEFAULT_ESCAPE_CHECKS = [
	{ ability: "strength", skill: "athletics" },
	{ ability: "dexterity", skill: "acrobatics" },
];
const ESCAPE_BY = {
	self: "by itself",
	self_or_within_reach: "by itself or a creature within reach",
	any: "by anyone",
};

const SAVE_TRIGGERS = {
	end_turn_target: "at the end of the target's turn",
	start_turn_target: "at the start of the target's turn",
	damage_taken: "when it takes damage",
	start_turn_caster: "at the start of the caster's turn",
	end_turn_caster: "at the end of the caster's turn",
};

export default {
	name: "ActiveEffect",
	components: {
		BasicEntity,
		EffectDetails,
	},
	mixins: [effectRolls],
	// { entityKey, effectKey }
	props: ["data"],
	computed: {
		...mapGetters(["entities", "edition", "effect_definition"]),
		entity() {
			return this.entities[this.data.entityKey];
		},
		instance() {
			return this.entity?.effects?.[this.data.effectKey];
		},
		definition() {
			return this.instance ? this.effect_definition(this.instance) : undefined;
		},
		name() {
			return (this.definition?.name || this.instance.name || "").capitalize();
		},
		icon() {
			return this.instance.source === "srd" && this.definition?.category === "condition"
				? this.instance.source_key
				: undefined;
		},
		isExhaustion() {
			return this.instance.source === "srd" && this.instance.source_key === "exhaustion";
		},
		exhaustionLevels() {
			return EXHAUSTION_LEVELS[this.edition === "5.5e" ? "5.5e" : "5e"];
		},
		caster() {
			return this.entities[this.instance.caster_key];
		},
		casterLabel() {
			if (this.caster) return this.caster.name;
			return this.instance.caster_name
				? `${this.instance.caster_name} (not in this encounter)`
				: "Not in this encounter";
		},
		duration() {
			return describeDuration(this.instance, {
				casterName: this.caster?.name || this.instance.caster_name,
				holderName: this.entity?.name,
			});
		},
		repeatSave() {
			const save = this.instance.duration?.save;
			if (!save?.ability) return undefined;

			const dc = this.instance.save_dc ? ` DC ${this.instance.save_dc}` : "";
			const when = (save.triggers || ["end_turn_target"])
				.map((trigger) => SAVE_TRIGGERS[trigger] || startCase(trigger))
				.join(" and ");
			const auto = save.auto_success_after?.value
				? `; succeeds automatically after ${plural(save.auto_success_after.value, save.auto_success_after.unit || "round")}`
				: "";
			return `${startCase(save.ability)} save${dc}, ${when}${auto}`;
		},
		/**
		 * Progress toward ending or escalating: "Successes 1/3, failures 1/2"
		 */
		saveProgress() {
			const save = this.instance.duration?.save;
			if (!save?.ability) return undefined;
			const parts = [];
			if ((save.successes_to_end || 1) > 1 || this.instance.save_successes) {
				parts.push(`Successes ${this.instance.save_successes || 0}/${save.successes_to_end || 1}`);
			}
			if (save.failures_to_escalate || this.instance.save_failures) {
				const of = save.failures_to_escalate ? `/${save.failures_to_escalate}` : "";
				const becomes = save.escalate?.effect ? ` (then ${save.escalate.effect.name || startCase(save.escalate.effect.source_key)})` : "";
				parts.push(`failures ${this.instance.save_failures || 0}${of}${becomes}`);
			}
			return parts.length ? parts.join(", ") : undefined;
		},
		escape() {
			const escape = this.instance.duration?.escape;
			if (!escape) return undefined;
			return { ...escape, checks: escape.checks?.length ? escape.checks : DEFAULT_ESCAPE_CHECKS };
		},
		escapeText() {
			const checks = this.escape.checks
				.map(({ ability, skill }) => (skill ? `${startCase(ability)} (${startCase(skill)})` : startCase(ability)))
				.join(" or ");
			const dc = this.escape.dc !== undefined ? `DC ${this.escape.dc} · ` : "";
			const cost = startCase(this.escape.cost || "action").toLowerCase();
			return `${dc}${checks} · ${ESCAPE_BY[this.escape.by || "self"]} · costs ${cost === "action" ? "an action" : `a ${cost}`}`;
		},
	},
	methods: {
		...mapActions(["apply_effect", "remove_effect", "setDrawer", "escape_effect"]),
		startCase,
		rollEscape({ ability, skill }) {
			const modifier = skill
				? this.effectSkillModifier(this.entity, ability, skill)
				: this.effectSaveModifier(this.entity, ability);
			const total = this.rollEffectCheck({
				entity: this.entity,
				title: `Escape ${this.name}: ${startCase(skill || ability)}`,
				modifier,
			});
			// Without a numeric DC the roll is only shown; the DM resolves it
			if (typeof this.escape.dc === "number" && total !== undefined) {
				this.resolveEscape(total >= this.escape.dc);
			}
		},
		async resolveEscape(success) {
			await this.escape_effect({ key: this.data.entityKey, effectKey: this.data.effectKey, success });
			if (!this.instance) this.setDrawer({ show: false });
		},
		async setLevel(level) {
			await this.apply_effect({
				key: this.data.entityKey,
				instance: { ...this.instance, level },
				definition: this.definition || { category: "condition" },
			});
		},
		async remove() {
			await this.remove_effect({ key: this.data.entityKey, effectKey: this.data.effectKey });
			if (!this.instance) this.setDrawer({ show: false });
		},
	},
};
</script>

<style lang="scss" scoped>
h2 {
	i {
		vertical-align: -2px;
	}
}
dl.instance {
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 5px 15px;
	margin-bottom: 15px;

	dt {
		color: $neutral-2;
	}
	dd {
		margin: 0;
	}
}
.escape {
	padding: 10px;
	background: $neutral-9;

	&__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
}
.table {
	td {
		background: $neutral-9;

		a {
			color: $neutral-6 !important;
			background: $neutral-2;
			line-height: 30px;
			height: 30px;
			display: block;
			text-align: center;
			cursor: pointer;

			&.active {
				background: $red;
				color: $white !important;
			}
		}
	}
}
</style>
