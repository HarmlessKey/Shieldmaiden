<template>
	<div class="content">
		<h2 class="head">Encounter finished</h2>
		<div class="container">
			<q-slide-transition v-if="!tier || tier.name === 'Free'">
				<a
					v-show="patreon"
					href="https://www.patreon.com/join/harmlesskey"
					target="_blank"
					rel="noopener"
					class="neutral-1"
				>
					<q-banner rounded inline-actions class="bg-neutral-8 mb-3">
						<q-icon slot="avatar" name="fab fa-patreon patreon-red" />
						Enjoying Shieldmaiden? <b>Please support us on Patreon.</b>
						<template slot="action">
							<q-btn
								color="patreon-red"
								no-caps
								label="Support"
								target="_blank"
								href="https://www.patreon.com/join/harmlesskey"
							/>
							<q-btn
								flat
								color="white"
								class="ml-1"
								no-caps
								icon="fas fa-times"
								size="sm"
								padding="sm"
								@click.prevent="patreon = false"
							/>
						</template>
					</q-banner>
				</a>
			</q-slide-transition>

			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-7">
					<hk-card>
						<div slot="header" class="card-header">
							<router-link
								v-if="$route.name == 'RunEncounter'"
								class="btn btn-sm btn-clear"
								:to="'/content/campaigns/' + $route.params.campid"
							>
								<i aria-hidden="true" class="fas fa-chevron-left"></i> Leave
							</router-link>

							<span class="right">
								<a class="btn btn-sm bg-neutral-5" @click="reset((hard = false))">
									<i aria-hidden="true" class="fas fa-trash-restore-alt"></i>
									<q-tooltip anchor="top middle" self="center middle">
										Unfinish encounter
									</q-tooltip>
								</a>
								<a class="btn btn-sm bg-neutral-5 ml-1" @click="reset()">
									<i aria-hidden="true" class="fas fa-undo"></i>
									<q-tooltip anchor="top middle" self="center middle"> Reset encounter </q-tooltip>
								</a>
							</span>
						</div>

						<q-tabs
							v-model="tab"
							:dark="$store.getters.theme === 'dark'"
							no-caps
							inline-label
							outside-arrows
							mobile-arrows
							align="justify"
							class="bg-neutral-9"
						>
							<q-tab
								:name="key"
								:icon="tab.icon"
								:label="tab.name"
								v-for="(tab, key) in tabs"
								:key="key"
							/>
						</q-tabs>

						<div class="card-body">
							<q-tab-panels v-model="tab" class="bg-neutral-6">
								<q-tab-panel name="loot" class="px-0">
									<h3>Encounter rewards</h3>
									<!-- XP -->
									<div
										class="xp bg-neutral-8"
										v-if="campaign.advancement === 'experience' && encounter.xp"
									>
										<span class="amount">
											{{ xpAmount }}
											<span class="neutral-3">XP</span>
										</span>
										<a
											v-if="!encounter.xp_awarded"
											class="btn"
											@click="
												setDrawer({
													show: true,
													type: 'drawers/party/xp',
													data: {
														amount: xpAmount,
														entities: players,
													},
												})
											"
										>
											Award <i aria-hidden="true" class="far fa-chevron-double-right"></i>
										</a>
										<div v-else class="green">
											<i aria-hidden="true" class="fas fa-check"></i> Awarded
										</div>
									</div>

									<!-- CURRENCY -->
									<div class="currency mb-3" v-if="encounter.currency">
										<div class="currency-form">
											<div v-for="(coin, key) in currencies" :key="key">
												<img :src="require(`src/assets/_img/currency/${coin.color}.svg`)" />
												<q-input
													:dark="$store.getters.theme === 'dark'"
													filled
													square
													dense
													class="text-center"
													:disable="encounter.currency_awarded"
													autocomplete="off"
													type="number"
													size="sm"
													min="0"
													v-model="editableEncounter.currency[key]"
													:placeholder="coin.name"
												/>
											</div>
										</div>
									</div>
									<div class="d-flex justify-content-center mb-4">
										<a v-if="!encounter.currency_awarded" class="btn" @click="awardCurrency">
											Award <i aria-hidden="true" class="far fa-chevron-double-right"></i>
										</a>
										<div v-else class="green">
											<i aria-hidden="true" class="fas fa-check"></i> Currency awarded
										</div>
									</div>

									<template v-if="encounter.loot && Object.keys(encounter.loot).length">
										<h3 class="d-flex justify-content-between">
											Items
											<a @click="awardAllItems" class="btn">
												Award all <i aria-hidden="true" class="far fa-chevron-double-right" />
											</a>
										</h3>
										<q-list>
											<q-item v-for="(item, key) in encounter.loot" :key="key">
												<q-item-section>
													{{ item.public_name }}
												</q-item-section>
												<q-item-section avatar>
													<q-btn flat no-caps @click="awardItem(item, key)">
														Award <i aria-hidden="true" class="far fa-chevron-double-right ml-2" />
													</q-btn>
												</q-item-section>
											</q-item>
										</q-list>
									</template>

									<template v-if="awardedItems && Object.keys(awardedItems).length">
										<h3>Awarded Items</h3>
										<q-list>
											<q-item v-for="(item, key) in awardedItems" :key="key">
												<q-item-section>
													{{ item.public_name }}
												</q-item-section>
												<q-item-section avatar>
													<i aria-hidden="true" class="fas fa-check green" />
												</q-item-section>
											</q-item>
										</q-list>
									</template>
								</q-tab-panel>

								<q-tab-panel name="dmg">
									<div class="row q-col-gutter-md">
										<div class="col-12 col-md-6">
											<Dmg />
										</div>
										<div class="col-12 col-md-6">
											<h2>Log</h2>
											<Log />
										</div>
									</div>
								</q-tab-panel>
							</q-tab-panels>
						</div>
					</hk-card>
				</div>
				<div class="col-12 col-md-5">
					<Players
						:userId="userId"
						card-view
						:campaign="campaign"
						:campaignId="campaignId"
						:players="campaignPlayers"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Dmg from "src/components/combat/side/Dmg.vue";
import Log from "src/components/combat/side/Log.vue";
import { currencyMixin } from "src/mixins/currency.js";
import { mapActions, mapGetters } from "vuex";

export default {
	name: "FinishedEncounter",
	props: ["encounter"],
	mixins: [currencyMixin],
	components: {
		Dmg,
		Log,
		Players: () => import("src/components/campaign/Players.vue"),
	},
	data() {
		return {
			userId: this.$store.getters.user.uid,
			campaignId: this.$route.params.campid,
			encounterId: this.$route.params.encid,
			campaignPlayers: {},
			campaign: {},
			patreon: true,
			tab: "loot",
			editableEncounter: this.encounter,
		};
	},
	computed: {
		...mapGetters(["tier"]),
		tabs() {
			const tabs = {};
			tabs.loot = { name: "Loot", icon: "fas fa-treasure-chest", selected: true };
			tabs.dmg = { name: "Damage", icon: "fas fa-swords" };
			return tabs;
		},
		players() {
			// Return an array with the keys of all players in the encounter
			let entities = Object.values(this.encounter.entities);
			let playerKeys = [];
			let players = entities.filter((entity) => {
				let entityType = entity.entityType;
				return entityType === "player";
			});
			for (let i in players) {
				playerKeys.push(players[i].id);
			}
			return playerKeys;
		},
		xpAmount() {
			return this.encounter.xp.overwrite || this.encounter.xp.calculated;
		},
		awardedItems() {
			const items = {};
			if (this.campaign.inventory && this.campaign.inventory.items) {
				for (let [key, item] of Object.entries(this.campaign.inventory.items)) {
					if (item.encounter_id === this.encounterId) {
						items[key] = item;
					}
				}
			}
			return items;
		},
	},
	async mounted() {
		await this.get_campaign({
			uid: this.userId,
			id: this.campaignId,
		}).then(async (campaign) => {
			this.campaign = campaign;

			const campaignPlayers = {};
			for (const playerId in campaign.players) {
				const player = await this.get_player({ uid: this.userId, id: playerId });
				if (player) {
					campaignPlayers[playerId] = player;
				}
			}
			this.campaignPlayers = campaignPlayers;
		});
	},
	methods: {
		...mapActions(["setDrawer", "init_Encounter", "reset_store"]),
		...mapActions("encounters", [
			"reset_encounter",
			"finish_encounter",
			"update_encounter_prop",
			"delete_encounter_loot",
		]),
		...mapActions("campaigns", ["get_campaign", "set_campaign_currency", "add_campaign_item"]),
		...mapActions("players", ["get_player"]),
		awardCurrency() {
			let oldValue =
				this.campaign.inventory && this.campaign.inventory.currency
					? this.campaign.inventory.currency
					: 0;
			let newValue = parseInt(oldValue) + this.currencyToCopper(this.editableEncounter.currency);
			newValue = newValue > this.maxCurrencyAmount ? this.maxCurrencyAmount : newValue;

			this.set_campaign_currency({
				campaignId: this.campaignId,
				value: newValue,
			});
			this.update_encounter_prop({
				campaignId: this.campaignId,
				encounterId: this.encounterId,
				property: "currency_awarded",
				value: true,
			});
		},
		awardAllItems() {
			for (const [key, item] of Object.entries(this.encounter.loot)) {
				this.awardItem(item, key);
			}
		},
		async awardItem(item, id) {
			item.encounter_id = this.encounterId;

			await this.add_campaign_item({
				campaignId: this.campaignId,
				item,
			});
			await this.delete_encounter_loot({
				campaignId: this.campaignId,
				encounterId: this.encounterId,
				id,
			});
		},
		reset(hard = true) {
			const id = this.encounterId;
			if (hard) {
				this.reset_encounter({ campaignId: this.campaignId, id });
			} else {
				this.finish_encounter({ campaignId: this.campaignId, id, finished: false });
			}
		},
	},
};
</script>

<style lang="scss" scoped>
h2.head {
	color: $white;
	margin-top: 20px;
	text-shadow: 0 0 8px $black;
	font-size: 30px !important;
	text-align: center;
	font-family: "Fredericka the Great", cursive;
}

.xp {
	display: flex;
	justify-content: space-between;
	padding: 10px;
	margin-bottom: 30px;
	line-height: 35px;

	.amount {
		font-size: 25px;
	}
}

.q-item {
	background-color: $neutral-8;
}

.currency {
	padding: 30px 10px 20px 10px;

	.currency-form {
		margin: auto;
		display: flex;
		justify-content: center;
		max-width: 400px;
		text-align: center;

		img {
			height: 25px;
			margin-bottom: 10px;
		}
		div {
			margin-right: 5px;

			&:last-child {
				margin-right: 0;
			}
		}
	}
}
</style>
