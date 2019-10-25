<template>
	<div>
		<h2>Update currency</h2>
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
</template>

<script>
	import { currencyMixin } from '@/mixins/currency.js';
	import { db } from '@/firebase';

	export default {
		mixins: [currencyMixin],
		props: [
			'data',
		],
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				add: {},
				error: undefined,
				currentValue: this.data.current
			}
		},
		methods: {
			setCurrency(type) {
				let newValue;
				let amount = this.currencyToCopper(this.add);
				let validated = true;

				if(type === 'add') {
					newValue = this.currentValue + amount;
					this.error = undefined;
				} else {
					newValue = this.currentValue - amount;
					this.error = undefined;
					if(newValue < 0) {
						validated = false;
						this.error = 'Party doesn\'t own enough';
					}
				}

				if(validated) {	
					db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory/currency`).set(newValue);
					this.add = {};
					this.currentValue = newValue;
				}
			}

		}
	};
</script>

<style lang="scss" scoped>
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
</style>