<template>
	<div class="loot">
		<h3><i class="fas fa-coins"></i> Currency</h3>
		<div class="currency">
			<div v-for="(coin, key) in currencies" :key="key">
				<span class="coins" :class="coin.color">
					<img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
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
					v-model="currency[key]"
					@change="setCurrency()"
				/>
			</div>
		</div>

		<h3 class="d-flex justify-content-between mt-3">
			<span>
				<i class="far fa-staff"></i> Items
				<span v-if="items">( {{ Object.keys(items).length }} )</span>
			</span>
			<a class="btn btn-sm bg-neutral-5" @click="addItem()">
				<i class="fas fa-plus green"></i>
				<span class="d-none d-md-inline ml-1">Add</span>
			</a>
		</h3>
		<hr>
		<q-list v-if="items" :dark="$store.getters.theme === 'dark'" class="accordion">
			<ValidationObserver v-for="(item, index) in items" :key="item['.key']" v-slot="{ handleSubmit, validate, valid }">
				<q-form @submit="valid ? handleSubmit(saveItem(item, item['.key'])) : validate()" greedy>
					<q-expansion-item
						:dark="$store.getters.theme === 'dark'" switch-toggle-side
						group="items"
						name="items"
					>	
						<template v-slot:header>
							<q-item-section>
								{{ index + 1 }}. {{ item.public_name }}
							</q-item-section>
							<q-item-section avatar>
								<span>
									<a  @click="setEdit(item['.key'])" class="btn btn-sm bg-neutral-5 mr-1">
										<i class="fas fa-pencil"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Edit
										</q-tooltip>
									</a>
									<a @click="removeItem(item['.key'])" class="btn btn-sm bg-neutral-5">
										<i class="fas fa-trash-alt"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Remove
										</q-tooltip>
									</a>
								</span>
							</q-item-section>
						</template>

						<div class="accordion-body">
							<ValidationProvider rules="required|max:100" name="Name" v-slot="{ errors, invalid, validated }">
								<q-input
									:dark="$store.getters.theme === 'dark'" filled square
									label="Public name *"
									class="mb-3"
									id="name"
									type="text" 
									v-model="item.public_name" 
									name="name" 
									:error="invalid && validated"
									:error-message="errors[0]"
								>
									<hk-popover 
										slot="append" 
										header="Public name" 
										content="The public name is visible for players after you have awarded the item. You decide when you also want to share the information of the linked item."
										>
											<q-icon name="info" @click.stop class="pointer" />
									</hk-popover>
								</q-input>
							</ValidationProvider>

							<ValidationProvider rules="max:2000" name="Dscription" v-slot="{ errors, invalid, validated }">
								<q-input
									:dark="$store.getters.theme === 'dark'" filled square
									autogrow
									label="Public description"
									id="desc"
									class="mb-4" 
									v-model="item.public_description" 
									rows="4"
									name="desc"
									maxlength="2000"
									:error="invalid && validated"
									:error-message="errors[0]"
								/>
							</ValidationProvider>
							<p>
								<a 
									v-if="!item.linked_item"
									class="btn btn-clear"
									@click="setSlide({
										show: true,
										type: 'slides/editEncounter/LinkItem',
										data: {
											item: item
										}
									})"
								>
									<i class="far fa-link"></i> Link item
								</a>
								<template v-else>
									<a class="btn btn-clear" @click="setSlide({show: true, type: 'ViewItem', data: item.full_linked_item })">
										<i class="far fa-link mr-1"></i>
										{{ item.full_linked_item.name }}
									</a>
									<a class="btn btn-clear mx-1" @click="unlink(item['.key'])">
										<i class="fas fa-unlink red"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Unlink
										</q-tooltip>
									</a>
								</template>
								<hk-popover 
									header="Linked item" 
									content="The description of the linked item is not immideately shown when the item has been awarded. You can manualy set this to be visible for your players, once they are allowed to see it."
								>
									<q-icon name="info" class="blue pointer" />
								</hk-popover>
							</p>
							<div class="d-flex items-center">
								<q-btn no-caps color="primary" type="submit">Save</q-btn>
								<q-icon v-if="!valid" name="error" color="red" size="md" class="ml-2">
									<q-tooltip anchor="top middle" self="center middle">
										There are validation errors
									</q-tooltip>
								</q-icon>
							</div> 
						</div>
					</q-expansion-item>
				</q-form>
			</ValidationObserver>
		</q-list>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions } from 'vuex';
	import { currencyMixin } from '@/mixins/currency.js';

	export default {
		name: 'Loot',
		mixins: [currencyMixin],
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.user,
				slide: this.$store.getters.getSlide,
				items: {},
				editItem: undefined
			} 
		},
		firebase() {
			return {
				currency: {
					source: db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/currency`),
					asObject: true
				}
			}
		},
		mounted() {
				const items = db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot`);
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
				if (items !== null) {
					this.items = Object.values(items);
				} else {
					this.items = [];
				}
				this.loading = false;
			});
			this.fetchEncounter({
				cid: this.campaignId, 
				eid: this.encounterId, 
			}),
			this.fetchCampaign({
				cid: this.campaignId, 
						})
		},
		methods: {
			...mapActions([
				'fetchEncounter',
					'fetchCampaign',
					'setSlide'
			]),
			setCurrency() {
				delete this.currency['.key'];
				delete this.currency['.value'];

				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/currency`).set(
					this.currency
				);
				this.$snotify.success('Currency was successfully saved.', 'Currency saved!', {
					position: "rightTop"
				});
			},
			setEdit(key) {
				this.editItem = (this.editItem === key) ? undefined : key;
			},
			saveItem(item, key) {
				item = JSON.parse(JSON.stringify(item));
				delete item['.key'];
				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot/${key}`).set(item);
				this.$snotify.success('Your item was successfully saved.', 'Item saved!', {
					position: "rightTop"
				});
			},
			addItem() {
				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot`).push({
					public_name: 'New Item'
				});
			},
			removeItem(key) {
				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot/${key}`).remove();
			},
			unlink(key) {
				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot/${key}/linked_item`).remove();
			}
		}
	}
</script>

<style lang="scss" scoped>
// Remove arrows from number field
input[type="number"]::-webkit-outer-spin-button, input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
}
 
input[type='number'] {
		-moz-appearance: textfield;
}

.loot {
	h2 {
		a {
			font-size: 15px;
		}
	}

		.currency {
				margin: auto;
				display: flex;
				justify-content: center;
				max-width: 400px;
				text-align: center;

				img {
						height: 30px;
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

</style>