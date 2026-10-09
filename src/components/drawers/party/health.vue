<template>
	<div>
		<h2>Health Modifiers</h2>
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(setHpModifiers)">
				<div class="row q-col-gutter-md">
					<div class="col">
						<ValidationProvider
							rules="between:0,999"
							name="Temp HP"
							v-slot="{ errors, invalid, validated }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								label="Temporary HP"
								type="number"
								name="tempHp"
								v-model="tempHp"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
					<div class="col">
						<ValidationProvider
							rules="between:-999,999"
							name="Max HP mod"
							v-slot="{ errors, invalid, validated }"
						>
							<q-input
								:dark="$store.getters.theme === 'dark'"
								filled
								square
								label="Manual max HP bonus"
								hint="Sets the bonus labelled Manual; other bonuses are kept"
								type="number"
								name="maxHpMod"
								v-model="maxHpMod"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</div>

				<h3 class="mt-3">Set HP changes for:</h3>
				<div v-for="(player, key) in players" :key="key">
					<q-checkbox
						:dark="$store.getters.theme === 'dark'"
						v-model="setFor"
						:val="key"
						:label="player.character_name"
					/>
				</div>

				<div class="d-flex items-center mt-3">
					<q-btn class="full-width" type="submit" color="primary" no-caps> Update health </q-btn>
					<q-icon v-if="!valid" name="error" color="red" size="md" class="ml-2">
						<q-tooltip anchor="top middle" self="bottom right">
							There are validation errors
						</q-tooltip>
					</q-icon>
				</div>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
import { mapActions } from "vuex";
import { manualBonusTotal, withManualBonus, hpAfterMaxHpChange } from "src/utils/entityFunctions";

export default {
	data() {
		return {
			user: this.$store.getters.user,
			campaignId: this.$route.params.campid,
			campaign: {},
			allPlayers: [],
			players: {},
			tempHp: undefined,
			maxHpMod: undefined,
			awardHp: undefined,
		};
	},
	computed: {
		setFor: {
			get() {
				return this.awardHp ? this.awardHp : this.allPlayers;
			},
			set(newValue) {
				this.awardHp = newValue;
			},
		},
	},
	async mounted() {
		this.campaign = await this.get_campaign({
			uid: this.user.uid,
			id: this.campaignId,
		});
		for (const id in this.campaign.players) {
			this.allPlayers.push(id);
			this.players[id] = await this.get_player({ uid: this.user.uid, id });
		}
	},
	watch: {
		setFor(newVal) {
			// Handle changes in individual player checkboxes
			if (newVal.length === 0) {
				this.indeterminate = false;
				this.allSelected = false;
			} else if (newVal.length === this.allPlayers.length) {
				this.indeterminate = false;
				this.allSelected = true;
			} else {
				this.indeterminate = true;
				this.allSelected = false;
			}
		},
	},
	methods: {
		...mapActions(["setDrawer"]),
		...mapActions("campaigns", ["get_campaign", "update_campaign_entity"]),
		...mapActions("players", ["get_player"]),
		async setHpModifiers() {
			if (this.tempHp !== undefined) {
				for (let key of this.setFor) {
					await this.update_campaign_entity({
						uid: this.user.uid,
						campaignId: this.campaignId,
						type: "players",
						id: key,
						property: "tempHp",
						value: this.tempHp,
					});
				}
			}
			if (this.maxHpMod !== undefined) {
				for (const key of this.setFor) {
					const player = this.players[key];
					const entity = this.campaign.players[key] || {};
					const baseMax = parseInt(player.maxHp) || 0;
					const oldMax = baseMax + manualBonusTotal(entity, "max_hp");

					// Sets the "Manual" maximum HP bonus, other bonuses are kept
					let bonuses = withManualBonus(entity, "max_hp", this.maxHpMod);
					// The maximum can't go below 0
					const newTotal = manualBonusTotal({ bonuses }, "max_hp");
					if (baseMax + newTotal < 0) {
						bonuses = withManualBonus(
							{ bonuses },
							"max_hp",
							(bonuses.max_hp?.manual?.value || 0) - (baseMax + newTotal)
						);
					}
					const newMax = baseMax + manualBonusTotal({ bonuses }, "max_hp");
					const curHp = hpAfterMaxHpChange(entity.curHp, oldMax, newMax);

					// Update curHp and the bonuses; the old single-value bonuses are removed
					for (const [property, value] of [
						["curHp", curHp],
						["bonuses", Object.keys(bonuses).length ? bonuses : null],
						["ac_bonus", null],
						["maxHpMod", null],
					]) {
						await this.update_campaign_entity({
							uid: this.user.uid,
							campaignId: this.campaignId,
							type: "players",
							id: key,
							property,
							value,
						});
					}
				}
			}
			this.tempHp = undefined;
			this.maxHpMod = undefined;
			this.setDrawer(false);
		},
	},
};
</script>
