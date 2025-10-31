<template>
	<div>
		<template v-if="!addNew">
			<h2>Party Inventory</h2>
			<div v-if="currency >= maxCurrencyAmount" class="red text-center mb-2">
				Max amount reached
			</div>
			<div class="money" v-if="currency" @click="addCurrency = !addCurrency">
				<template v-for="(coin, key) in copperToPretty(currency)">
					<div v-if="coin" :key="key">
						<template v-if="key === 'pp' && coin >= 1000">{{ $numeral(coin, "0.0a") }} </template>
						<template v-else>{{ coin }} </template>
						<img :src="require(`src/assets/_img/currency/${currencies[key].color}.svg`)" :alt="currencies[key].name" />
					</div>
				</template>
			</div>
			<p v-else class="text-center"><a @click="addCurrency = !addCurrency">Award money</a></p>
			<div class="addCurrency" v-if="addCurrency">
				<div class="currency">
					<div v-for="(coin, key) in currencies" :key="key">
						<span class="coins" :class="coin.color">
							<img :src="require(`src/assets/_img/currency/${coin.color}.svg`)" :alt="coin.name" />
							<q-tooltip anchor="top middle" self="center middle">
								{{ coin.name }}
							</q-tooltip>
						</span>
						<q-input
							:dark="$store.getters.theme === 'dark'"
							filled
							square
							:label="coin.name"
							class="text-center"
							autocomplete="off"
							type="number"
							min="0"
							v-model="add[key]"
						/>
					</div>
				</div>

				<div class="actions">
					<button class="btn btn-sm" @click="setCurrency('add')">Add</button>
					<button class="btn btn-sm bg-red" @click="setCurrency('remove')">Remove</button>
				</div>
			</div>

			<h2 class="my-4 d-flex justify-content-between items-center">
				<span>Items</span>
				<a @click="addNew = true" class="btn btn-sm bg-neutral-5">
					<i aria-hidden="true" class="fas fa-plus green" />
				</a>
			</h2>

			<q-list v-if="items" :dark="$store.getters.theme === 'dark'" class="accordion">
				<q-expansion-item
					v-for="(item, key) in items"
					:dark="$store.getters.theme === 'dark'"
					switch-toggle-side
					group="items"
					name="items"
					:key="key"
				>
					<template v-slot:header>
						<q-item-section avatar>
							<a
								@click.stop="identify(key, !item.identified)"
								v-if="item.linked_item"
								:class="{
									green: item.identified,
									red: !item.identified,
								}"
							>
								<i aria-hidden="true" class="far fa-link"></i>
								<q-tooltip anchor="top middle" self="center middle">
									{{ item.identified ? "Identified" : "Not Identified" }}
								</q-tooltip>
							</a>
							<span v-else class="neutral-3 mr-1">
								<i aria-hidden="true" class="far fa-unlink"></i>
								<q-tooltip anchor="top middle" self="center middle"> No linked item </q-tooltip>
							</span>
						</q-item-section>
						<q-item-section>
							{{ item.public_name }}
						</q-item-section>
						<q-item-section avatar>
							<a @click.stop="deleteItem(key)" class="btn btn-sm bg-neutral-5">
								<i aria-hidden="true" class="fas fa-trash-alt"></i>
								<q-tooltip anchor="top middle" self="center middle"> Remove </q-tooltip>
							</a>
						</q-item-section>
					</template>

					<div class="accordion-body bg-neutral-6">
						<div class="mb-2">
							<b>{{ item.public_name }}</b
							><br />
							{{ item.public_description }}
						</div>
						<LinkedItem v-if="item.linked_item" :linked-item="item.linked_item">
							<a class="btn btn-sm bg-neutral-5 mr-2" @click="identify(key, !item.identified)">
								<i
									aria-hidden="true"
									:class="!item.identified ? 'fas fa-unlink red' : 'fas fa-link green'"
								/>
								<q-tooltip anchor="top middle" self="center middle">
									{{ item.identified ? "Unidentify" : "Identify" }}
								</q-tooltip>
							</a>
						</LinkedItem>
					</div>
				</q-expansion-item>
			</q-list>
		</template>
		<AddItem v-else @close="closeAdd" />
	</div>
</template>

<script>
import { currencyMixin } from "src/mixins/currency.js";
import AddItem from "src/components/drawers/party/AddItem.vue";
import { mapActions } from "vuex";
import LinkedItem from "./LinkedItem";

export default {
	mixins: [currencyMixin],
	components: {
		AddItem,
		LinkedItem,
	},
	data() {
		return {
			user: this.$store.getters.user,
			campaignId: this.$route.params.campid,
			campaign: {},
			add: {},
			addNew: false,
			error: undefined,
			addCurrency: false,
		};
	},
	computed: {
		currency() {
			return this.campaign.inventory && this.campaign.inventory.currency
				? this.campaign.inventory.currency
				: {};
		},
		items() {
			return this.campaign.inventory && this.campaign.inventory.items
				? this.campaign.inventory.items
				: {};
		},
	},
	async mounted() {
		this.campaign = await this.get_campaign({
			uid: this.user.uid,
			id: this.campaignId,
		});
	},
	methods: {
		...mapActions("campaigns", [
			"get_campaign",
			"set_campaign_currency",
			"identify_campaign_item",
			"delete_campaign_item",
		]),
		async setCurrency(type) {
			let newValue;
			let amount = this.currencyToCopper(this.add);
			let validated = true;

			if (type === "add") {
				newValue = this.currency + amount;
				this.error = undefined;
			} else {
				newValue = this.currency - amount;
				this.error = undefined;
				if (newValue < 0) {
					validated = false;
					this.error = "Party doesn't own enough";
				}
			}
			newValue = newValue > this.maxCurrencyAmount ? this.maxCurrencyAmount : newValue;

			if (validated) {
				await this.set_campaign_currency({
					campaignId: this.campaignId,
					value: newValue,
				});
				this.add = {};
			}
		},
		identify(id, value) {
			this.identify_campaign_item({
				campaignId: this.campaignId,
				id,
				value,
			});
		},
		deleteItem(id) {
			this.delete_campaign_item({ campaignId: this.campaignId, id });
		},
		closeAdd() {
			this.addNew = false;
		},
	},
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
	border-top: solid 1px $neutral-4;
	margin-top: 20px;
	padding-top: 20px;

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
