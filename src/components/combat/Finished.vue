<template>
	<div class="container-fluid">
		<h2 class="head">Encounter finished</h2>
		<div class="container">
			<div class="actions">
				<router-link v-if="$route.name == 'RunEncounter'" :to="'/encounters/' + $route.params.campid"><i class="fas fa-chevron-left"></i> Leave</router-link>

				<span class="right">
					<a v-b-tooltip.hover title="Unfinish" @click="reset(hard=false)"><i class="fas fa-trash-restore-alt"></i></a>
					<a v-b-tooltip.hover title="Reset" @click="reset()"><i class="fas fa-undo"></i></a>
				</span>
			</div>
			<b-row>
				<b-col md="7" class="mb-4">
					<ul class="nav nav-tabs" id="myTab" role="tablist">
						<li class="nav-item" v-for="(tab, key) in tabs" :key="key">
							<a class="nav-link" :class="{ active: tab.selected }" id="entities-tab" data-toggle="tab" :href="`#${key}`" role="tab" :aria-controls="key" :aria-selected="tab.selected">
								<i v-if="tab.icon" :class="tab.icon"></i> {{ tab.name }}
							</a>
						</li>
					</ul>

					<div class="tab-content bg-gray-active px-3 py-4">
						<div class="tab-pane fade show active" id="loot" role="tabpanel" aria-labelledby="loot-tab">
							<h3>Encounter rewards</h3>
							<!-- XP -->
							<div class="xp bg-gray" v-if="campaign.advancement === 'experience' && encounter.xp">
								<span class="amount">
									{{ xpAmount }}
									<span class="gray-hover">XP</span>
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
							<div class="currency bg-gray mb-3" v-if="encounter.currency">
								<div class="currency-form">
									<div v-for="(coin, key) in currencies" :key="key">
										<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
										<b-form-input
											class="text-center"
											:disabled="encounter.currency_awarded"
											autocomplete="off" 
											type="text" 
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
								<HKtable 
									:items="items"
									:columns="itemColumns"
									:showHeader="false"
								>
									<template slot="actions" slot-scope="data">
										<a class="btn m-1" @click="awardItems([data.row])">Award <i class="far fa-chevron-double-right"></i></a>
									</template>
								</HKtable>
							</template>
						</div>
						<div class="tab-pane fade" id="dmg" role="tabpanel" aria-labelledby="dmg-tab">
							<b-row>
								<b-col sm="6">
									<Dmg />
								</b-col>
								<b-col sm="6">
									<h2>Log</h2>
									<Log />
								</b-col>
							</b-row>
						</div>
					</div>
				</b-col>
				<b-col md="5">
					<Players />
				</b-col>
			</b-row>
		</div>
	</div>
</template>

<script>
	import { mapActions } from 'vuex';
	import { db } from '@/firebase';
	import Dmg from '@/components/combat/side/Dmg.vue';
	import Log from '@/components/combat/side/Log.vue';
	import Players from '@/components/campaign/Players.vue';
	import { currencyMixin } from '@/mixins/currency.js';
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		name: 'app',
		props: [
			'encounter'
		],
		mixins: [currencyMixin],
		components: {
			Dmg,
			Log,
			Players,
			HKtable
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
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
				}
			}
		},
		computed: {
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
			awardCurrency() {
				let oldValue = 0;
				if(this.campaign.inventory && this.campaign.inventory.currency) {
					oldValue = this.campaign.inventory.currency;
				}
				let newValue = parseInt(oldValue) + this.currencyToCopper(this.encounter.currency);

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
				if (hard){
					for(let key in this.encounter.entities) {
						let entity = this.encounter.entities[key];

						//Remove values
						delete entity.tempHp;
						delete entity.transformed;
						delete entity.stabilized;
						delete entity.down;
						delete entity.ac_bonus;
						delete entity.meters;
						delete entity.hidden;

						if(entity.entityType == 'npc') {
							entity.curHp = entity.maxHp;
						}
						entity.initiative = 0;


						db.ref(`encounters/${this.userId}/${this.campaignId}/${id}/entities/${key}`).set(entity);

						//CLEAR LOG
						localStorage.removeItem(id);
					}
					db.ref(`encounters/${this.userId}/${this.campaignId}/${id}/turn`).set(0);
					db.ref(`encounters/${this.userId}/${this.campaignId}/${id}/round`).set(0);
					this.reset_store();
					this.init_Encounter({
						cid: this.$route.params.campid, 
						eid: this.$route.params.encid
					})
				}
				db.ref(`encounters/${this.userId}/${this.campaignId}/${id}/finished`).set(false);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container-fluid {
		padding: 20px;

		h2.head {
			color: #fff;
			margin-top: 20px;
			text-shadow: 0 0 8px #000;
			font-size: 25px !important;
			text-align: center;
		}
		.actions {
			display: flex;
			justify-content: space-between;
			border-bottom: solid 1px #b2b2b2;
			margin-bottom: 20px;
			padding-bottom: 10px;

			.right {
				a {
					color: #b2b2b2 !important;
					margin-left: 10px;
				}
			}
		}

		.nav {
			.nav-link.active {
				background-color: #302f2f !important;
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

	}
</style>
