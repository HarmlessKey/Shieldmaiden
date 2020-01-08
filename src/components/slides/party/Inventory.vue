<template>
	<div>
		<template v-if="!addNew">
			<h2>Party Inventory</h2>
			<div class="money" v-if="currency" @click="addCurrency = !addCurrency">
				<template v-for="(coin, key) in copperToPretty(currency['.value'])">
					<div v-if="coin" :key="key">
						<template v-if="key === 'pp' && coin >= 1000">{{ coin | numeral('0.0a') }} </template>
						<template v-else>{{ coin }} </template>
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
			<template>
				<h2 class="my-4 d-flex justify-content-between">
					<span>Items</span>
					<a @click="addNew = true"><i class="fas fa-plus green"></i></a>
				</h2>
				<div class="green mb-2" v-if="notify">{{ notify }}</div>
				<HKtable 
					v-if="items"
					:items="items"
					:columns="itemColumns"
					:showHeader="false"
					:collapse="true"
					:perPage="15"
					:loading="loading"
					:search="['public_name', 'public_description']"
				>
					<div slot="public_name" slot-scope="data">
						<a 
							@click="identify(data.row['.key'], !data.row.identified)"
							v-if="data.row.linked_item"
							:class="{
								green: data.row.identified,
								red: !data.row.identified
							}"
							class="mr-1"
							v-b-tooltip.hover :title="data.row.identified ? 'Identified' : 'Not Identified'"
						>
							<i class="far fa-link"></i>
						</a>
						<span v-else class="gray-hover mr-1" v-b-tooltip.hover title="No linked item">
							<i class="far fa-unlink"></i>
						</span>
						{{ data.item }}
					</div>

					<!-- ACTIONS -->
					<div slot="actions" slot-scope="data" class="actions">
						<a v-b-tooltip.hover title="Delete" class="ml-2" @click="deleteItem(data.row['.key'])"><i class="fas fa-trash-alt"></i></a>
					</div>

					<!-- COLLAPSE -->
					<div slot="collapse" slot-scope="data">
						<div class="mb-2">
							<b>{{ data.row.public_name }}</b><br/>
							{{ data.row.public_description }}
						</div>
						<template v-if="data.row.linked_item">
							<div class="linked-item">
								<a 
									@click="identify(data.row['.key'], !data.row.identified)"
									class="item-name"
									:class="{
										green: data.row.identified,
										red: !data.row.identified
									}"
									v-b-tooltip.hover :title="data.row.identified ? 'Identified' : 'Not Identified'"
									
								>
									<i class="far fa-link"></i>
									{{ data.row.full_linked_item.name }}
								</a>
								<a data-toggle="collapse" class="collapsed" :href="`#full-item-${data.row.linked_item}`">
									<i class="fas fa-caret-down"></i>
								</a>
							</div>
							<div class="collapse full-item" :id="`full-item-${data.row.linked_item}`">
								<ViewItem :data="data.row.full_linked_item"/>
							</div>
						</template>
					</div>
				</HKtable>
			</template>
		</template>
		<AddItem v-else @close="closeAdd" />
	</div>
</template>

<script>
	import { currencyMixin } from '@/mixins/currency.js';
	import { db } from '@/firebase';
	import HKtable from '@/components/hk-components/hk-table.vue';
	import ViewItem from '@/components/ViewItem.vue';
	import AddItem from '@/components/slides/party/AddItem.vue';

	export default {
		mixins: [currencyMixin],
		components: {
			HKtable,
			ViewItem,
			AddItem
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				add: {},
				notify: undefined,
				addNew: false,
				items: undefined,
				loading: true,
				allItems: undefined,
				error: undefined,
				addCurrency: false,
				itemColumns: {
					public_name: {
						label: 'Name',
						truncate: true,
					},
					'actions': {
						label: '',
						noPadding: true
					}
				}
			}
		},
		firebase() {
			return {
				currency: {
					source: db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory/currency`),
					asObject: true
				}
			}
		},
		mounted() {
			const items = db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory/items`);
			items.on('value', async (snapshot) => {
				let items = snapshot.val()

				for(let key in items) {
					let item = items[key];
					items[key].full_linked_item = {};
					items[key]['.key'] = key;

					//Get Linked item
					const linkedItem = db.ref(`items/${item.linked_item}`)
					await linkedItem.on('value', (snapshot) => {
						if(snapshot.val()) {
							items[key].full_linked_item = snapshot.val();
						}
					});
					//Get Linked item
					const linkedCustomItem = db.ref(`custom_items/${this.user.uid}/${item.linked_item}`)
					await linkedCustomItem.on('value', (snapshot) => {
						if(snapshot.val()) {
							items[key].full_linked_item = snapshot.val();
						}
					});
				}
				this.items = Object.values(items);
				this.loading = false;
			});
		},
		methods: {
			setCurrency(type) {
				let newValue;
				let amount = this.currencyToCopper(this.add);
				let validated = true;

				if(type === 'add') {
					newValue = this.currency['.value'] + amount;
					this.error = undefined;
				} else {
					newValue = this.currency['.value'] - amount;
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
			},
			identify(key, value) {
				db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory/items/${key}/identified`).set(value);
			},
			deleteItem(key) {
				db.ref(`campaigns/${this.user.uid}/${this.campaignId}/inventory/items/${key}`).remove();
			},
			closeAdd(value) {
				if(value) {
					this.notify = "New item added."
				}
				this.addNew = false;
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
	.hk-table {
		.linked-item {
			display: grid;
			grid-template-columns: 1fr 10px;

			a.item-name {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			a {
				i {
					transition: transform .2s linear;
				}
				&.collapsed {
					i.fa-caret-down {
						transform: rotate(-90deg);
					}
				}
			}
		}
		.full-item {
			margin-top: 15px;
			font-size: 12px;

			h3 {
				font-size: 15px;
			}
		}
	}
</style>