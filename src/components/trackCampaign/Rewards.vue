<template>
	<div class="rewards">
		<h2>Rewards</h2>
		<template v-if="encounter.xp_awarded">
			<div class="xp animated bounceIn" >
				<span class="green">{{ xpAmount }} </span> <span class="gray-hover">XP</span>
			</div>
			<hr>
		</template>

		<template v-if="encounter.currency_awarded">
			<div class="currency animated bounceIn">
				<div v-for="(coin, key) in currencies" :key="key">
					<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
					<b-form-input
						class="text-center"
						:disabled="true"
						autocomplete="off" 
						type="text" 
						size="sm"
						min="0"
						v-model="encounter.currency[key]"
					/>
				</div>
			</div>
			<hr>
		</template>
		
		<HKtable 
			:items="items"
			:columns="itemColumns"
			:showHeader="false"
		>
			
		</HKtable>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { currencyMixin } from '@/mixins/currency.js';
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		name: 'app',
		mixins: [currencyMixin],
		components: {
			HKtable
		},
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
	.xp {
		margin-bottom: 20px;
		font-size: 35px;
		text-align: center;
	}

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
		}
		div {
			margin-right: 5px;

			&:last-child {
				margin-right: 0;
			}
		}
	}
</style>
