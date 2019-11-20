<template>
	<div class="container-fluid">
		<h2 class="head">Encounter finished</h2>
		<div class="container">
			<div class="actions">
				<router-link v-if="$route.name == 'RunEncounter'" :to="'/encounters/' + $route.params.campid"><i class="fas fa-chevron-left"></i> Leave</router-link>
			</div>
			<b-row>
				<b-col md="7">
					<ul class="nav nav-tabs" id="myTab" role="tablist">
						<li class="nav-item" v-for="(tab, key) in tabs" :key="key">
							<a class="nav-link" :class="{ active: tab.selected }" id="entities-tab" data-toggle="tab" :href="`#${key}`" role="tab" :aria-controls="key" :aria-selected="tab.selected">
								<i v-if="tab.icon" :class="tab.icon"></i> {{ tab.name }}
							</a>
						</li>
					</ul>

					<div class="tab-content bg-gray px-3 py-4">
						<div class="tab-pane fade show active" id="loot" role="tabpanel" aria-labelledby="loot-tab">
							<h3>Encounter rewards</h3>
							<!-- XP -->
							<div class="xp bg-gray-dark" v-if="encounter.xp">
								<span>
									{{ encounter.xp.overwrite || encounter.xp.calculated }}
									<span class="gray-hover">XP</span>
								</span>
								<a class="btn" @click="awardXp">Award</a>
							</div>

							<!-- CURRENCY -->
							<div class="currency bg-gray-dark" v-if="encounter.currency">
								<div class="currency-form">
									<div v-for="(coin, key) in currencies" :key="key">
										<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
										<b-form-input
											class="text-center"
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
								<a class="btn" @click="awardCurrency">Award</a>
							</div>
							<p class="validate red mt-2" v-if="errors.has('currency')">{{ errors.first('currency') }}</p>
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
	import { db } from '@/firebase';
	import Dmg from '@/components/combat/side/Dmg.vue';
	import Log from '@/components/combat/side/Log.vue';
	import Players from '@/components/campaign/Players.vue';
	import { currencyMixin } from '@/mixins/currency.js';

	export default {
		name: 'app',
		props: [
			'encounter'
		],
		mixins: [currencyMixin],
		components: {
			Dmg,
			Log,
			Players
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid
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
				if(this.campaign.advancement === 'experience') {
					tabs.loot = { name: 'Loot', icon: 'fas fa-treasure-chest', selected: true };
				}
				tabs.dmg = { name: 'Damage', icon: 'fas fa-swords' }
				
				
				return tabs;
			}
		},
		methods: {
			awardCurrency() {

			},
			awardXp() {

			}
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
		}


		.xp {
			display: flex;
			justify-content: space-between;
			padding: 10px;
			margin-bottom: 30px;
			font-size: 25px;
		}

		.currency {
			padding: 30px 10px 10px 10px;

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
