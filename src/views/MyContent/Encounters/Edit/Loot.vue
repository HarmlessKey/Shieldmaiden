<template>
    <div class="loot">
        <h3><i class="fas fa-coins"></i> Currency</h3>
        <div class="currency">
            <div v-for="(coin, key) in currencies" :key="key">
                <span class="coins" :class="coin.color" v-b-tooltip.hover :title="coin.name">
                    <img :src="require(`@/assets/_img/currency/${coin.color}.svg`)" />
                  </span>
                <b-form-input class="text-center" autocomplete="off" type="number" size="sm" min="0" name="name" v-model="currency[key]" @change="setCurrency()" :placeholder="coin.name"/>
            </div>
        </div>
        <div class="d-flex justify-content-center mt-3">
            <!-- <button class="btn" @click="setCurrency()">Save currency</button> -->
        </div>

        <h3 class="d-flex justify-content-between mt-3">
            <span>
                <i class="far fa-staff"></i> Items
                <span v-if="loot">( {{ Object.keys(loot).length }} )</span>
            </span>
            <a class="gray-hover" @click="addItem()">
                <i class="fas fa-plus green"></i>
                <span class="d-none d-md-inline ml-1">Add</span>
            </a>
        </h3>
        <hr>
        <template v-if="loot">
            <div v-for="(item, index) in loot" :key="item['.key']">
                <div class="b-card bg-gray mb-3">
                    <b-card-header class="d-flex justify-content-between">
                        {{ index + 1 }}. {{ item.public_name }}
                        <span>
                            <a @click="setEdit(item['.key'])" 
                                class="mr-3 gray-light"
                                v-b-tooltip.hover title="Edit">
                                <i class="fas fa-pencil"></i>
                            </a>
                            <a @click="removeItem(item['.key'])" 
                                class="red"
                                v-b-tooltip.hover title="Remove">
                                <i class="fas fa-trash-alt"></i>
                            </a>
                        </span>
                    </b-card-header>
                    <div v-if="editItem === item['.key']" class="card-body">
                        <label for="name">
                            Public Name
                            <a v-b-popover.hover.top="'The public name is visible for players after you have awarded the item. You decide when you also want to share the information of the linked item.'" title="Public Name"><i class="fas fa-info-circle"></i></a>
                        </label>
                        <b-form-input
                            class="mb-3"
                            id="name"
                            type="text" 
                            v-model="item.public_name" 
                            name="name" 
                            placeholder="Name"></b-form-input>

                        <label for="desc">
                            Public Description
                        </label>
                        <textarea
                            id="desc"
                            class="form-control mb-4" 
                            v-model="item.public_description" 
                            rows="4"
                            name="desc" 
                            placeholder="Description"></textarea>

                            <p>
                                <a 
                                v-if="!item.linked_item"
                                @click="setSlide({
                                    show: true,
                                    type: 'slides/editEncounter/LinkItem',
                                    data: {
                                        key: item['.key']
                                    }
                                })"
                                ><i class="fas fa-link"></i> Link item</a>
                                <template v-else>
                                    <i class="fas fa-link mr-2"></i>
                                    <a @click="setSlide({show: true, type: 'ViewItem', data: items[item.linked_item] })">{{ items[item.linked_item].name }}</a>
                                    <a v-b-tooltip.hover title="Unlink" @click="unlink(item['.key'])"><i class="fas fa-unlink red ml-2"></i></a>
                                </template>
                                 <a 
                                    class="ml-2" 
                                    v-b-popover.hover.top="'The description of the linked item is not immideately shown when the item has been awarded. You can manualy set this to be visible for your players, once they are allowed to see it.'" 
                                    title="Linked Item">
                                    <i class="fas fa-info-circle"></i>
                                </a>
                            </p>

                        <button class="btn mt-3" @click="saveItem(item, item['.key'])">Save</button>
                    </div>
                </div>
            </div>
        </template>
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
				user: this.$store.getters.getUser,
                slide: this.$store.getters.getSlide,
                editItem: undefined
			} 
		},
		firebase() {
			return {
				loot: db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot`),
                currency: {
					source: db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/currency`),
					asObject: true
                }
			}
		},
		mounted() {
            var items = db.ref(`items`);
			items.on('value', async (snapshot) => {
				let items = snapshot.val();

				let custom = db.ref(`custom_items/${this.user.uid}`);
				custom.on('value', async (snapshot) => {
					let customItems = snapshot.val();
					for(let key in customItems) {
						items[key] = customItems[key];
					}
                });
				this.items = items;
				this.loadingItems = false;
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
				this.$snotify.success('Currency saved.', 'Critical hit!', {
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
                this.editItem = undefined;
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