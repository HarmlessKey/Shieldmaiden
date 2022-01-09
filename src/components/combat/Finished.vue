<template>
	<div class="content">
		<h2 class="head">Encounter finished</h2>
		<div class="container">
			<div class="actions">
				<router-link 
					v-if="$route.name == 'RunEncounter'" 
					class="btn btn-sm btn-clear" 
					:to="'/content/campaigns/' + $route.params.campid"
				>
					<i class="fas fa-chevron-left"></i> Leave
				</router-link>

				<span class="right">
					<a class="btn btn-sm bg-neutral-5" @click="reset(hard=false)">
						<i class="fas fa-trash-restore-alt"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Unfinish
						</q-tooltip>
					</a>
					<a class="btn btn-sm bg-neutral-5" @click="reset()">
						<i class="fas fa-undo"></i>
						<q-tooltip anchor="top middle" self="center middle">
							Reset
						</q-tooltip>
					</a>
				</span>
			</div>

			<q-slide-transition v-if="!tier || tier.name === 'Free'">
				<a href="https://www.patreon.com/join/harmlesskey" target="_blank" rel="noopener"  class="patreon bg-patreon-red" v-show="patreon">
					Enjoying Harmless Key? <b>Please support us on <q-icon name="fab fa-patreon black" /> Patreon.</b>
					<a class="close red" @click.prevent="patreon = false">
						<q-icon name="fas fa-times" size="small" />
					</a>
				</a>
			</q-slide-transition>
			
			<div class="row q-col-gutter-md">
				<div class="col-12 col-md-7">
					<hk-card header="Overview">
						<div class="card-body">
							<q-tabs
								v-model="tab"
								:dark="$store.getters.theme === 'dark'"
								indicator-color="transparent"
								no-caps
								dense
								align="left"
								inline-label
							>
								<q-tab :name="key" :icon="tab.icon" :label="tab.name" v-for="(tab, key) in tabs" :key="key" />
							</q-tabs>

							<q-tab-panels v-model="tab" class="bg-neutral-6">
								<q-tab-panel name="loot" class="px-0">
									<h3>Encounter rewards</h3>
									<!-- XP -->
									<div class="xp bg-neutral-8" v-if="campaign.advancement === 'experience' && encounter.xp">
										<span class="amount">
											{{ xpAmount }}
											<span class="neutral-3">XP</span>
										</span>
										<a 
											v-if="!encounter.xp_awarded"
											class="btn" 
											@click="setSlide({
												show: true,
												type: 'slides/party/xp',
												data: {
													amount: xpAmount,
													entities: players
												}
										})">
											Award <i class="far fa-chevron-double-right"></i>
										</a>
										<div v-else class="green">
											<i class="fas fa-check"></i> Awarded
										</div>
									</div>

									<!-- CURRENCY -->
									<div class="currency bg-neutral-8 mb-3" v-if="encounter.currency">
										<div class="currency-form">
											<div v-for="(coin, key) in currencies" :key="key">
												<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
												<q-input
													:dark="$store.getters.theme === 'dark'" filled square dense
													class="text-center"
													:disable="encounter.currency_awarded"
													autocomplete="off" 
													type="number" 
													size="sm"
													min="0" 
													name="currency" 
													v-validate="'numeric'"
													data-vv-as="Currency"
													v-model="encounter.currency[key]" :placeholder="coin.name"/>
											</div>
										</div>
										<div class="validate red mt-2 text-center" v-if="errors.has('currency')">{{ errors.first('currency') }}</div>
										<div class="d-flex justify-content-center mt-3">
											<a
												v-if="!encounter.currency_awarded"
												class="btn" 
												:class="{ disabled: errors.has('currency') }" 
												@click="awardCurrency"
											>
												Award <i class="far fa-chevron-double-right"></i>
											</a>
											<div v-else class="green">
												<i class="fas fa-check"></i> Awarded
											</div>
										</div>
									</div>
									
									<template v-if="encounter.loot">
										<h3 class="d-flex justify-content-between">
											Items
											<a @click="awardItems(items)">Award all <i class="far fa-chevron-double-right"></i></a>
										</h3>
										<hk-table 
											:items="items"
											:columns="itemColumns"
											:showHeader="false"
										>
											<template slot="actions" slot-scope="data">
												<a class="btn m-1" @click="awardItems([data.row])">Award <i class="far fa-chevron-double-right"></i></a>
											</template>
										</hk-table>
									</template>
									<template v-if="awardedItems">
										<h3>Awarded Items</h3>
										<hk-table 
											:items="awardedItems"
											:columns="itemColumns"
											:showHeader="false"
										>
										</hk-table>
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
					<Players :userId="userId" :campaignId="campaignId" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import { db } from '@/firebase';
	import Dmg from '@/components/combat/side/Dmg.vue';
	import Log from '@/components/combat/side/Log.vue';
	import { currencyMixin } from '@/mixins/currency.js';
	import { mapGetters } from 'vuex';

	export default {
		name: 'app',
		props: [
			'encounter'
		],
		mixins: [currencyMixin],
		components: {
			Dmg,
			Log,
			Players: () => import('@/components/campaign/Players.vue')
		},
		data() {
			return {
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				patreon: true,
				tab: "loot",
				itemColumns: {
					public_name: {
						label: 'Name',
						truncate: true,
					},
					'actions': {
						label: '',
						noPadding: true,
						maxContent: true
					}
				}
			}
		},
		firebase() {
			return {
				campaign: {
					source: db.ref(`campaigns/${this.userId}/${this.campaignId}`),
					asObject: true
				},
				awardedItems: db.ref(`campaigns/${this.userId}/${this.campaignId}/inventory/items`).orderByChild('encounter_id').equalTo(this.encounterId)
			}
		},
		computed: {
			...mapGetters([
				'tier'
			]),
			tabs() {
				let tabs = {};
				tabs.loot = { name: 'Loot', icon: 'fas fa-treasure-chest', selected: true };
				tabs.dmg = { name: 'Damage', icon: 'fas fa-swords' };
				
				return tabs;
			},
			players() {
				// Return and array with the keys of all players in the encounter
				let entities = Object.values(this.encounter.entities);
				let playerKeys = [];
				let players = entities.filter( function(entity) {
					let entityType = entity.entityType;
					entity = [];
					return entityType === 'player'
				});
				for(let i in players) {
					playerKeys.push(players[i].id);
				}
				return playerKeys;
			},
			xpAmount() {
				return this.encounter.xp.overwrite || this.encounter.xp.calculated;
			},
			items() {
				let items = [];
				for(let key in this.encounter.loot) {
					let item = this.encounter.loot[key];
					item.key = key;

					items.push(item);
				}
				return items;
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'init_Encounter',
				'reset_store'
			]),
			...mapActions("encounters", [
				"reset_encounter",
				"finish_encounter"
			]),
			awardCurrency() {
				let oldValue = 0;
				if(this.campaign.inventory && this.campaign.inventory.currency) {
					oldValue = this.campaign.inventory.currency;
				}
				let newValue = parseInt(oldValue) + this.currencyToCopper(this.encounter.currency);

				newValue = (newValue > this.maxCurrencyAmount) ? this.maxCurrencyAmount : newValue;

				if(!this.errors.has('currency')) {
					db.ref(`campaigns/${this.userId}/${this.campaignId}/inventory/currency`).set(newValue);
					db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/currency_awarded`).set(true);
				}
			},
			awardItems(items) {
				const vm = this;
				items.forEach( function(item) {
					item.encounter_id = vm.encounterId;
					db.ref(`campaigns/${vm.userId}/${vm.campaignId}/inventory/items`).push(item);
					db.ref(`encounters/${vm.userId}/${vm.campaignId}/${vm.encounterId}/loot/${item.key}`).remove();
				});
				
			},
			reset(hard=true) {
				const id = this.encounterId;
				if(hard) {
					this.reset_encounter({campaignId: this.campaignId, id});
				} else {
					this.finish_encounter({ campaignId: this.campaignId, id, finished: false });
				}
			},
		}
	}
</script>

<style lang="scss" scoped>

	h2.head {
		color: $white;
		margin-top: 20px;
		text-shadow: 0 0 8px $black;
		font-size: 25px !important;
		text-align: center;
	}
	.patreon {
		display: block;
		padding: 10px;
		text-align: center;
		font-size: 30px;
		margin-bottom: 25px;
		position: relative;
		color: $neutral-1;

		.close {
			background: $black;
			position: absolute;
			top: 0;
			right: 0;
			padding: 5px;
			height: 25px;
			line-height: 10px;
		}
	}
	.actions {
		display: flex;
		justify-content: space-between;
		border-bottom: solid 1px $neutral-1;
		margin-bottom: 20px;
		padding-bottom: 5px;
		color: $neutral-1;

		.right {
			a {
				margin-left: 5px;
			}
		}
	}

	.q-tabs {
		.q-tab {
			&.q-tab--active {
				background: $neutral-6 !important;
				color: $blue;
			}
		}
	}

	.nav {
		.nav-link.active {
			background-color: $neutral-8-transparent !important;
		}
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
