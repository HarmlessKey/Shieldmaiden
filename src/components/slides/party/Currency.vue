<template>
	<div>
		<h2>Update currency</h2>
		<div v-if="currentValue >= maxCurrencyAmount" class="red text-center mb-2">Max amount reached</div>
		<div class="currency">
			<div v-for="(coin, key) in currencies" :key="key">
					<span class="coins" :class="coin.color">
						<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" :alt="coin.name" />
						<q-tooltip anchor="top middle" self="center middle">
							{{ coin.name }}
						</q-tooltip>
					</span>
					<q-input 
						:dark="$store.getters.theme === 'dark'" filled square dense
						:label="coin.name"
						class="text-center"
						autocomplete="off" 
						type="number" min="0" 
						name="name" 
						v-model="add[key]" 
					/>
			</div>
		</div>

		<p class="red text-center mt-2" v-if="error != ''">{{ error }}</p>

		<div class="actions">
			<button class="btn btn-sm" @click="setCurrency('add')">Add</button>
			<button class="btn btn-sm bg-red" @click="setCurrency('remove')">Remove</button>
		</div>
	</div>
</template>

<script>
	import { currencyMixin } from "@/mixins/currency.js";
	import { mapActions } from "vuex";

	export default {
		mixins: [currencyMixin],
		props: ["data"],
		data() {
			return {
				user: this.$store.getters.user,
				campaignId: this.$route.params.campid,
				add: {},
				error: undefined,
				currentValue: this.data.current
			}
		},
		methods: {
			...mapActions("campaigns", ["set_campaign_currency"]),
			setCurrency(type) {
				let newValue;
				let amount = this.currencyToCopper(this.add);
				let validated = true;

				if(type === "add") {
					newValue = this.currentValue + amount;
					this.error = undefined;
				} else {
					newValue = this.currentValue - amount;
					this.error = undefined;
					if(newValue < 0) {
						validated = false;
						this.error = "Party doesn't own enough";
					}
				}
				newValue = (newValue > this.maxCurrencyAmount) ? this.maxCurrencyAmount : newValue;

				if(validated) {	
					this.set_campaign_currency({
						campaignId: this.campaignId,
						value: newValue
					});
					this.add = {};
					this.currentValue = newValue;
				}
			}

		}
	};
</script>

<style lang="scss" scoped>
	
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
</style>