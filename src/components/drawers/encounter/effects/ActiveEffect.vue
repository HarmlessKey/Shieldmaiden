<template>
	<div class="pb-5">
		<BasicEntity v-if="entity && !campaign" :entity="entity" />
		<h3 v-else-if="campaign" class="mb-0">{{ campaign.playerName }}</h3>
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
					<dd>{{ appliedText }}</dd>
				</template>
				<template v-if="instance.caster_key || instance.caster_name">
					<dt>Caster</dt>
					<dd>{{ casterLabel }}</dd>
				</template>
				<template v-for="(value, kind) in instance.choices || {}">
					<dt :key="`choice-kind-${kind}`">{{ startCase(kind) }}</dt>
					<!-- A chosen value keeps its sign ("-2"); startCase would drop it -->
					<dd :key="`choice-value-${kind}`">{{ kind === "value" ? value : startCase(value) }}</dd>
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

			<!-- Escapes are rolled in an encounter, not on the campaign screen -->
			<div v-if="escape && !campaign" class="escape mb-3">
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

			<button class="btn btn-block bg-red mt-3" @click="remove">Remove effect</button>
		</template>
		<p v-else class="mt-3">This effect is no longer active.</p>
	</div>
</template>

<script>
import { startCase } from "lodash";
import { mapActions, mapGetters } from "vuex";
import BasicEntity from "src/components/combat/entities/BasicEntity.vue";
import EffectDetails from "src/components/drawers/encounter/effects/EffectDetails.vue";
import { describeDuration, findSrdDefinition, isSrdCondition } from "src/utils/effectFunctions";
import { EXHAUSTION_LEVELS } from "src/utils/generalConstants.js";
import { showNotices } from "src/utils/generalFunctions";
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
	// { entityKey, effectKey } in the tracker, or { campaign, effectKey } for a campaign
	// player's effect outside an encounter (effects 8):
	// campaign: { campaignId, playerId, playerName, names (players' names by id), edition,
	// context ({ basePlayers, definitionOf } for the campaign's actions) }
	props: ["data"],
	data() {
		return {
			// A campaign player's custom effect definition, false when not found
			customDefinition: undefined,
		};
	},
	computed: {
		...mapGetters({ entities: "entities", encounterEdition: "edition", effect_definition: "effect_definition" }),
		campaign() {
			return this.data?.campaign;
		},
		edition() {
			return this.campaign ? this.campaign.edition : this.encounterEdition;
		},
		entity() {
			if (this.campaign) {
				const uid = this.$store.getters.user?.uid;
				const player =
					this.$store.state.campaigns.cached_campaigns[uid]?.[this.campaign.campaignId]?.players?.[
						this.campaign.playerId
					];
				return player ? { ...player, key: this.campaign.playerId, name: this.campaign.playerName } : undefined;
			}
			return this.entities[this.data.entityKey];
		},
		instance() {
			return this.entity?.effects?.[this.data.effectKey];
		},
		definition() {
			if (!this.instance) return undefined;
			if (!this.campaign) return this.effect_definition(this.instance);
			if (this.instance.source === "srd") {
				const other = this.edition === "5e" ? "5.5e" : "5e";
				return (
					findSrdDefinition(this.edition, this.instance.source_key) ||
					findSrdDefinition(other, this.instance.source_key)
				);
			}
			return this.customDefinition || undefined;
		},
		appliedText() {
			if (this.instance.applied_round) return `Round ${this.instance.applied_round}`;
			return this.campaign ? "Outside an encounter" : "Before combat";
		},
		name() {
			return (this.definition?.name || this.instance.name || "").capitalize();
		},
		icon() {
			return isSrdCondition(this.instance.source, this.instance.source_key)
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
			if (this.campaign) {
				const name = this.campaign.names?.[this.instance.caster_key];
				return name ? { name } : undefined;
			}
			return this.entities[this.instance.caster_key];
		},
		casterLabel() {
			if (this.caster) return this.caster.name;
			if (this.campaign) return this.instance.caster_name || "Not in this campaign";
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
			// An escape is a skill or ability check
			const modifier = skill
				? this.effectSkillModifier(this.entity, ability, skill)
				: this.effectCheckModifier(this.entity, ability);
			const { total, auto } = this.rollEffectCheck({
				entity: this.entity,
				title: `Escape ${this.name}: ${startCase(skill || ability)}`,
				modifier,
				roll: skill ? { kind: "skill", skill } : { kind: "check", ability },
			});
			// Automatic results resolve the attempt without a roll
			if (auto) return this.resolveEscape(auto === "success");
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
			if (this.campaign) {
				this.notify(
					await this.$store.dispatch("campaigns/set_campaign_effect_level", {
						campaignId: this.campaign.campaignId,
						playerId: this.campaign.playerId,
						effectKey: this.data.effectKey,
						level,
						context: this.campaign.context,
					})
				);
				return;
			}
			await this.apply_effect({
				key: this.data.entityKey,
				instance: { ...this.instance, level },
			});
		},
		async remove() {
			if (this.campaign) {
				this.notify(
					await this.$store.dispatch("campaigns/remove_campaign_effect", {
						campaignId: this.campaign.campaignId,
						playerId: this.campaign.playerId,
						effectKey: this.data.effectKey,
						context: this.campaign.context,
					})
				);
			} else {
				await this.remove_effect({ key: this.data.entityKey, effectKey: this.data.effectKey });
			}
			if (!this.instance) this.setDrawer({ show: false });
		},
		/**
		 * The campaign actions' notices: what the tracker would prompt for (effects 8)
		 */
		notify(notices) {
			showNotices(this.$q, notices);
		},
		/**
		 * A campaign player's custom effect definition, loaded once (the tracker's are resolved
		 * when the encounter loads)
		 */
		async loadCustomDefinition() {
			const uid = this.$store.getters.user?.uid;
			if (!this.campaign || this.instance?.source !== "custom" || !uid) return;
			try {
				const definition = await this.$store.dispatch("effects/get_effect", {
					uid,
					id: this.instance.source_key,
				});
				this.customDefinition = definition || false;
			} catch (error) {
				this.customDefinition = false;
			}
		},
	},
	mounted() {
		this.loadCustomDefinition();
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
