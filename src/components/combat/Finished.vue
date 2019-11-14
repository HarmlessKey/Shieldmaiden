<template>
	<div class="container">	
		<router-link v-if="$route.name == 'RunEncounter'" :to="'/encounters/' + $route.params.campid"><i class="fas fa-chevron-left"></i> Return to overview</router-link>
		<div class="card finished">
			<div class="card-header"><i class="fas fa-treasure-chest"></i> Loot</div>
			<div class="card-body">
				<!-- XP -->
				<div class="xp" v-if="encounter.xp">
					<span class="green">{{ encounter.xp.overwrite || encounter.xp.calculated }}</span>XP
					<a @click="awardXp">Award</a>
				</div>

				<!-- CURRENCY -->
				<div class="d-flex justify-content-start">
					<div class="currency">
						<div v-for="(coin, key) in currencies" :key="key">
							<input 
								autocomplete="off" 
								type="text" 
								min="0" 
								name="currency" 
								v-validate="'numeric'"
								data-vv-as="Currency"
								v-model="encounter.currency[key]" :placeholder="coin.name"/>
							<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
						</div>
					</div>
					<a @click="awardCurrency">Award</a>
				</div>
				<p class="validate red mt-2" v-if="errors.has('currency')">{{ errors.first('currency') }}</p>
			</div>
		</div>
		<b-row v-if="$route.name == 'RunEncounter'">
			<b-col sm="8">
				<b-card header="Damage Meters">
					<Dmg />
				</b-card>
			</b-col>
			<b-col sm="4">
				<b-card header="Combat Log">
					<Log />
				</b-card>
			</b-col>
		</b-row>
	</div>
</template>

<script>
	import Dmg from '@/components/combat/side/Dmg.vue';
	import Log from '@/components/combat/side/Log.vue';
	import { currencyMixin } from '@/mixins/currency.js';

	export default {
		name: 'app',
		props: [
			'encounter'
		],
		mixins: [currencyMixin],
		components: {
			Dmg,
			Log
		},
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
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
	.container {

		h2.head {
			color: #fff;
			margin-top: 20px;
			text-shadow: 0 0 8px #000;
			font-size: 25px !important;
		}

		.finished {
			margin-top: 20px;
			background: rgba(38, 38, 38, .9) !important;

			.xp {
				margin-bottom: 30px;
				font-size: 25px;
			}

			.currency {
				display: flex;
				justify-content: flex-start;
				margin-right: 10px;

				div {
					display: flex;
					justify-content: flex-start;
					font-size: 16px;

					input[type='text'] {
						text-align: right;
						background: none;
						border: none;
						padding: 3px 5px 3px 0;
						min-width: 20px;
						max-width: 35px;
						color: #b2b2b2;
						height: 21px;
						margin-right: 3px;

						&:focus {
							outline: none;
							background:#191919;
						}
					}

					img {
						margin-top: 4px;
						height: 15px;
						margin-right: 3px;
					}

					&:last-child {
						margin: none;
					}
				}
			}
		}
	}
</style>
