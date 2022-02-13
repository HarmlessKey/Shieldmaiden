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
			<ValidationObserver v-for="(item, key) in items" :key="key" v-slot="{ handleSubmit, validate, valid }">
				<q-form @submit="valid ? handleSubmit(saveItem(item, key)) : validate()" greedy>
					<q-expansion-item
						:dark="$store.getters.theme === 'dark'" switch-toggle-side
						group="items"
						name="items"
					>	
						<template v-slot:header>
							<q-item-section>
								{{ item.public_name }}
							</q-item-section>
							<q-item-section avatar>
								<span>
									<a  @click="setEdit(key)" class="btn btn-sm bg-neutral-5 mr-1">
										<i class="fas fa-pencil"></i>
										<q-tooltip anchor="top middle" self="center middle">
											Edit
										</q-tooltip>
									</a>
									<a @click.stop="removeItem(key)" class="btn btn-sm bg-neutral-5">
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
							<div>
								<a 
									v-if="!item.linked_item"
									class="btn btn-clear"
									@click="setSlide({
										show: true,
										type: 'slides/editEncounter/LinkItem',
										data: { item, key }
									})"
								>
									<i class="far fa-link"></i> Link item
								</a>
								<template v-else>
									<LinkedItem :linked-item="item.linked_item" />
									<a class="btn btn-clear mx-1" @click="unlink(key)">
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
									<q-icon name="info" class="ml-1 pointer" size="sm" />
								</hk-popover>
							</div>
							<div class="d-flex items-center mt-4">
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
	import { mapActions } from "vuex";
	import { currencyMixin } from "@/mixins/currency.js";
	import LinkedItem from "./LinkedItem";

	export default {
		name: "Loot",
		components: {
			LinkedItem
		},
		props: {
			encounter: {
				type: Object,
				required: true
			},
			campaign: {
				type: Object,
				required: true
			},
		},
		mixins: [currencyMixin],
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.user,
				slide: this.$store.getters.getSlide,
				editItem: undefined,
				currency: this.encounter.currency || {},
				items: this.encounter.loot || {},
				linked_items: {}
			} 
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions(
				"encounters", [
					"update_encounter_prop", 
					"add_encounter_loot",
					"update_encounter_loot",
					"delete_encounter_loot",
					"delete_encounter_item_link"
				]),
			...mapActions("items", ["get_item"]),
			...mapActions("api_items", ["get_api_item"]),
			async setCurrency() {
				await this.update_encounter_prop({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					property: "currency",
					value: this.currency
				});
				this.$snotify.success('Currency was successfully saved.', 'Currency saved!', {
					position: "rightTop"
				});
			},
			async getItem(id, custom) {
				let item;
				if(custom) {
					item = await this.get_item({ uid: this.user.uid, id });
				} else {
					item = await this.get_api_item(id);
				}
				return item;
			},
			setEdit(key) {
				this.editItem = (this.editItem === key) ? undefined : key;
			},
			saveItem(item, key) {
				delete item['.key'];

				this.update_encounter_loot({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					id: key,
					item
				});
				this.$snotify.success('Your item was successfully saved.', 'Item saved!', {
					position: "rightTop"
				});
			},
			addItem() {
				this.add_encounter_loot({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					item: { public_name: "New item" }
				});
			},
			async removeItem(id) {
				await this.delete_encounter_loot({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					id
				});
			},
			async unlink(parent_item) {
				await this.delete_encounter_item_link({
					campaignId: this.campaignId,
					encounterId: this.encounterId,
					parent_item
				});
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