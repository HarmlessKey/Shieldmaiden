<template>
	<div class="player-health" :class="{ 'player-health--inline': inline }">
		<div v-if="playerName" class="player-health__title">{{ playerName }}</div>
		<hk-input
			v-model.number="amount"
			type="number"
			min="0"
			label="Amount"
			:autofocus="!inline"
			class="mb-2"
			@keydown.enter.prevent="damage"
		/>
		<div class="d-flex gap-1 items-center mb-2">
			<hk-dmg-type-select
				v-model="damageType"
				label="Damage type"
				class="player-health__type"
				short
				clearable
			/>
			<q-checkbox
				v-model="magical"
				:dark="$store.getters.theme === 'dark'"
				class="player-health__magical"
			>
				<span class="pl-1">
					Magical
					<hk-icon icon="fas fa-sparkles" class="ml-1" />
				</span>
			</q-checkbox>
		</div>
		<div class="d-flex gap-1">
			<q-btn class="full-width" color="red" no-caps :disable="!amount" @click="damage">
				Damage <i aria-hidden="true" class="hki-sword-break ml-2" />
			</q-btn>
			<q-btn class="full-width" color="green" no-caps :disable="!amount" @click="heal">
				Heal <i aria-hidden="true" class="hki-heal ml-2" />
			</q-btn>
		</div>
	</div>
</template>

<script>
import { startCase } from "lodash";
import { showNotices } from "src/utils/generalFunctions";
import { effectRolls } from "src/mixins/effectRolls";

/**
 * Manual damage and healing for one of the campaign's players outside an encounter (effects 8),
 * with the tracker's calculations (campaigns/campaign_player_damage and campaign_player_heal):
 * defenses from its effects, temporary hit points first, healing capped at its maximum
 */
export default {
	name: "PlayerHealth",
	// effectToast: the tracker's effect notification, with the effect's icon
	mixins: [effectRolls],
	props: {
		campaignId: { type: String, required: true },
		playerId: { type: String, required: true },
		playerName: { type: String, default: undefined },
		// { basePlayers, definitionOf } for the campaign's actions
		context: { type: Object, required: true },
		// In a drawer instead of a popover: no fixed width, no autofocus
		inline: { type: Boolean, default: false },
	},
	data() {
		return {
			amount: undefined,
			damageType: undefined,
			magical: false,
		};
	},
	methods: {
		async damage() {
			if (!this.amount) return;
			const { notices, prompts } = await this.$store.dispatch("campaigns/campaign_player_damage", {
				campaignId: this.campaignId,
				playerId: this.playerId,
				amount: this.amount,
				damageType: this.damageType,
				magical: this.magical,
				context: this.context,
			});
			prompts.forEach(this.showConcentrationSave);
			this.done(notices);
		},
		/**
		 * Concentration save after damage, as the tracker's (EffectTriggerNotifier): the DC from
		 * the damage, Succeeded keeps it, Failed ends it (and what is linked to it). No Roll:
		 * outside an encounter there's no roll dialog.
		 */
		showConcentrationSave(prompt) {
			const ability = startCase(prompt.ability);
			const dc = prompt.dc !== undefined ? ` DC ${prompt.dc}` : "";
			const title = `${prompt.holderName || "Unknown"}: ${prompt.effectName} save${dc}`;
			const body =
				prompt.dc !== undefined
					? [`Took ${prompt.damage} damage.`, `${ability} saving throw, DC ${prompt.dc}.`].join("\n")
					: prompt.dcText || `Make a ${ability} saving throw or lose ${prompt.effectName}.`;
			const resolve = async (toast, success) => {
				this.$snotify.remove(toast.id);
				if (success) return;
				const notices = await this.$store.dispatch("campaigns/remove_campaign_effect", {
					campaignId: this.campaignId,
					playerId: prompt.holderKey,
					effectKey: prompt.effectKey,
					context: this.context,
				});
				showNotices(this.$q, notices);
			};
			this.effectToast("warning", {
				title,
				body,
				instance: prompt.instance,
				config: {
					timeout: 0,
					buttons: [
						{ text: "Succeeded", action: (toast) => resolve(toast, true), bold: true },
						{ text: "Failed", action: (toast) => resolve(toast, false), bold: false },
					],
				},
			});
		},
		async heal() {
			if (!this.amount) return;
			const notices = await this.$store.dispatch("campaigns/campaign_player_heal", {
				campaignId: this.campaignId,
				playerId: this.playerId,
				amount: this.amount,
				context: this.context,
			});
			this.done(notices);
		},
		done(notices) {
			showNotices(this.$q, notices);
			this.amount = undefined;
			this.$emit("done");
		},
	},
};
</script>

<style lang="scss" scoped>
.player-health {
	width: 340px;
	max-width: 100%;
	padding: 10px;

	&--inline {
		width: auto;
		padding: 0;
	}
	// Magical and its icon on one line; the damage type select takes the rest, and can shrink
	// when it opens with its search input
	&__type {
		flex: 1 1 0;
		min-width: 0;

		// Quasar's field parts would grow with the selected value and the search input side by
		// side; they keep the field's width and the input takes what's left
		::v-deep {
			.q-field__inner,
			.q-field__control,
			.q-field__control-container,
			.q-field__native {
				min-width: 0;
			}
			.q-field__native {
				flex-wrap: nowrap;
				overflow: hidden;
			}
			.q-field__input {
				min-width: 20px !important;
				flex: 1 1 0;
			}
		}
	}
	&__magical {
		flex-shrink: 0;
		white-space: nowrap;
	}
	&__title {
		font-weight: bold;
		margin-bottom: 8px;
	}
}
</style>
