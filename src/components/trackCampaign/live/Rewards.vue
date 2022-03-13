<template>
	<div class="rewards">
		<q-scroll-area :dark="$store.getters.theme === 'dark'" :thumb-style="{ width: '5px'}">
			<div>
				<h2>Rewards</h2>
				<template v-if="encounter.xp_awarded">
					<h2 class="white">Experience Points</h2>
					<div class="xp animated bounceIn" >
						<span class="green">{{ xpAmount }} </span> <span class="neutral-2">XP</span>
					</div>
				</template>

				<template v-if="encounter.currency_awarded">
					<h2>Currency</h2>
					<div class="currency-wrapper">
						<div class="currency animated bounceIn">
							<div v-for="(coin, key) in currencies" :key="key">
								<img :src="require(`src/assets/_img/currency/${coin.color}.svg`)" />
								<q-input 
									:dark="$store.getters.theme === 'dark'" filled square dense
									disable
									:label="coin.name"
									class="text-center"
									autocomplete="off" 
									type="number" min="0" 
									name="name" 
									:value="encounter.currency[key]"
								/>
							</div>
						</div>
					</div>
				</template>
				
				<h2>Items</h2>
				<hk-table 
					:items="items"
					:columns="itemColumns"
					:showHeader="false"
					:collapse="true"
				>
					<div slot="collapse" slot-scope="data">
						<h3>{{ data.row.public_name }}</h3>
						{{ data.row.public_description }}
					</div>
				</hk-table>
			</div>
		</q-scroll-area>
	</div>
</template>

<script>
	import { db } from 'src/firebase';
	import { currencyMixin } from 'src/mixins/currency.js';

	export default {
		name: 'app',
		mixins: [currencyMixin],
		props: [
			'encounter'
		],
		data() {
			return {
				userId: this.$route.params.userid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				itemColumns: {
					public_name: {
						label: 'Name',
						truncate: true,
					}
				}
			}
		},
		firebase() {
			return {
				players: {
					source: db.ref(`players/${this.userId}`),
					asObject: true,
				},
				items: db.ref(`campaigns/${this.userId}/${this.campaignId}/inventory/items`).orderByChild('encounter_id').equalTo(this.encounter.key)
			}
		},
		computed: {
			xpAmount() {
				return this.encounter.xp.overwrite || this.encounter.xp.calculated;
			},
		},
		methods: {
			
		},
	}
</script>

<style lang="scss" scoped>
.rewards {
	height: 100%;
	overflow: hidden;
	
	.q-scrollarea { 
		height: calc(100% - 30px);

		> div {
			padding-right: 6px;
		}

		h2 {
			color: $white;
			text-shadow: 0 0 3px $black;
			text-transform: none !important;
			margin-bottom: 10px;
		}
		.xp {
			padding: 30px 0;
			margin-bottom: 20px;
			font-size: 35px;
			text-align: center;
			background: $neutral-8-transparent-8;
			color: $neutral-1;
		}

		.currency-wrapper {
			background: $neutral-8-transparent-8;
			margin-bottom: 20px;
			padding: 30px 0;

			.currency {
				padding-top: 10px;
				margin: auto;
				display: flex;
				justify-content: center;
				max-width: 400px;
				text-align: center;

				img {
					height: 25px;
					margin-bottom: 10px;
				}
				input {
					background: none !important;
					border: none !important;
					font-weight: bold;
					font-size: 18px;
					color: $neutral-1 !important;
					opacity: 1 !important;
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
}
@media only screen and (max-width: 720px) { 
		.rewards {
			overflow: visible !important;

			.q-scrollarea {
				overflow: visible !important;
			}
		}
	}
</style>
