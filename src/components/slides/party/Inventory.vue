<template>
	<div>
		<h2>Party Inventory</h2>
		<div class="money" v-if="inventory.currency" @click="addCurrency = !addCurrency">
			<template v-for="(coin, key) in copperToPretty(inventory.currency)">
				<div v-if="coin" :key="key">
					{{ coin }}
					<img :src="require(`@/assets/_img/currency/${currencies[key].color}.svg`)" />
				</div>
			</template>
		</div>
		<p v-else class="text-center"><a @click="addCurrency = !addCurrency">Award money</a></p>
		<div class="addCurrency" v-if="addCurrency">
			<div class="currency">
				<div v-for="(coin, key) in currencies" :key="key">
					<span class="coins" :class="coin.color" v-b-tooltip.hover :title="coin.name">
						<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
					</span>
					<b-form-input class="text-center" autocomplete="off" type="number" size="sm" min="0" name="name" v-model="add[key]" :placeholder="coin.name"/>
				</div>
			</div>

			<p class="red text-center mt-2" v-if="error != ''">{{ error }}</p>

			<div class="actions">
				<button class="btn btn-sm" @click="setCurrency('add')">Add</button>
				<button class="btn btn-sm bg-red" @click="setCurrency('remove')">Remove</button>
			</div>
		</div>

		<template v-if="inventory.items">
			<h2 class="my-4">Items</h2>
			<HKtable 
				:items="Object.values(inventory.items)"
				:columns="itemColumns"
				:showHeader="false"
			>

			</HKtable>
		</template>
	</div>
</template>

<script>
	import { currencyMixin } from '@/mixins/currency.js';
	import { db } from '@/firebase';
	import HKtable from '@/components/hk-components/hk-table.vue';

	export default {
		mixins: [currencyMixin],
		components: {
			HKtable
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				add: {},
				error: undefined,
				addCurrency: false,
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
				inventory: {
					source: db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory`),
					asObject: true
				}
			}
		},
		methods: {
			setCurrency(type) {
				let newValue;
				let amount = this.currencyToCopper(this.add);
				let validated = true;

				if(type === 'add') {
					newValue = this.inventory.currency + amount;
					this.error = undefined;
				} else {
					newValue = this.inventory.currency - amount;
					this.error = undefined;
					if(newValue < 0) {
						validated = false;
						this.error = 'Party doesn\'t own enough';
					}
				}

				if(validated) {	
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory/currency`).set(newValue);
					this.add = {};
				}
			}

		}
	};
</script>

<style lang="scss" scoped>
	.money {
		display: flex;
		justify-content: center;
		cursor: pointer;
		grid-area: money;
		line-height: 15px;

		div {
			margin-right: 10px;
			font-size: 16px;

			img {
				height: 12px;
			}

			&:last-child {
				margin: none;
			}
		}
	}
	.addCurrency {
		border-top: solid 1px #5c5757;
		margin-top: 20px; 
		padding-top: 20px;
			
		.currency {
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
			input[type='number'] {
				-moz-appearance: textfield;
			}
		}
		.actions {
			margin-top: 20px;
			display: flex;
			justify-content: space-between;

			.btn {
				margin-right: 10px;
				width: 100%;

				&:last-child {
					margin-right: 0;
				}
			}
			
		}
	}
</style>