<template>
	<div>
		<h2>Health Modifiers</h2>
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(setHpModifiers)">
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

				<!-- Max HP bonuses to add to each selected player, as the tracker's bonuses drawer -->
				<h3 class="mt-2 mb-1">Add a max HP bonus</h3>
				<BonusAddForm :stats="['max_hp']" class="mb-2" @add="addBonus" />
				<ManualBonusRows
					:bonuses="newBonuses"
					empty="No bonuses to add."
					@update="updateBonus"
					@remove="removeBonus"
				/>

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
import BonusAddForm from "src/components/bonuses/BonusAddForm.vue";
import ManualBonusRows from "src/components/bonuses/ManualBonusRows.vue";
import {
	manualBonuses,
	manualBonusTotal,
	withBonus,
	withoutBonus,
	hpAfterMaxHpChange,
} from "src/utils/entityFunctions";

export default {
	components: {
		BonusAddForm,
		ManualBonusRows,
	},
	data() {
		return {
			user: this.$store.getters.user,
			campaignId: this.$route.params.campid,
			campaign: {},
			allPlayers: [],
			players: {},
			tempHp: undefined,
			// Max HP bonuses to add: { max_hp: { <id>: { value, label } } }
			bonuses: {},
			awardHp: undefined,
		};
	},
	computed: {
		newBonuses() {
			return Object.entries(this.bonuses.max_hp || {}).map(([id, bonus]) => ({ id, ...bonus }));
		},
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
		addBonus({ amount, label }) {
			this.bonuses = withBonus({ bonuses: this.bonuses }, "max_hp", { amount, label });
		},
		updateBonus({ bonus, amount, label }) {
			this.bonuses = withBonus({ bonuses: this.bonuses }, "max_hp", { id: bonus.id, amount, label });
		},
		removeBonus(bonus) {
			this.bonuses = withoutBonus({ bonuses: this.bonuses }, "max_hp", bonus.id);
		},
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
			if (this.newBonuses.length) {
				for (const key of this.setFor) {
					const player = this.players[key];
					const entity = this.campaign.players[key] || {};
					const baseMax = parseInt(player.maxHp) || 0;
					const oldMax = baseMax + manualBonusTotal(entity, "max_hp");

					// Adds each bonus with its own id per player, other bonuses are kept
					let bonuses = manualBonuses(entity);
					for (const { value, label } of this.newBonuses) {
						bonuses = withBonus({ bonuses }, "max_hp", { amount: value, label });
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
			this.bonuses = {};
			this.setDrawer(false);
		},
	},
};
</script>
