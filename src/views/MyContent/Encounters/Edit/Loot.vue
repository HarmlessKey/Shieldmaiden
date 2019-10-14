<template>
    <div class="loot">
        <h3>Currency</h3>
        <div class="currency">
            <div v-for="(currency, key) in currencies" :key="key">
                <span class="coins" :class="currency.color" v-b-tooltip.hover :title="currency.name"><i class="fas fa-coins"></i></span>
                <b-form-input class="text-right" autocomplete="off" type="number" size="sm" min="0" name="name" v-model="loot[key]" :placeholder="currency.name"/>
            </div>
        </div>

        <h3 class="d-flex justify-content-between">
            Items
            <a class="gray-hover" @click="addItem()">
                <i class="fas fa-plus green"></i>
                <span class="d-none d-md-inline ml-1">Add</span>
            </a>
        </h3>
        <hr>
        <div v-for="(item, index) in loot.items" :key="index">
            <h2 class="d-flex justify-content-between">
                {{ index + 1 }}. {{ item.name }}
                <a @click="removeItem(index)" 
                    class="gray-hover"
                    v-b-tooltip.hover title="Remove">
                    <i class="fas fa-minus red"></i>
                    <span class="d-none d-md-inline ml-1">Remove</span>
                </a>
            </h2>
            <b-row class="mb-2">
                <b-col sm="2">
                    <label for="name">Name</label>
                </b-col>
                <b-col sm="10">
                    <b-form-input
                        id="name"
                        type="text" 
                        v-model="item.name" 
                        name="name" 
                        placeholder="Name"></b-form-input>
                </b-col>
            </b-row>
            <b-row class="mb-2">
                <b-col sm="2">
                    <label for="desc">Description</label>
                </b-col>
                <b-col sm="10">
                    <textarea
                        id="desc"
                        class="form-control" 
                        v-model="item.desc" 
                        rows="4"
                        name="desc" 
                        placeholder="Description"></textarea>
                </b-col>
            </b-row>
        </div>
        <button class="btn mt-2" @click="setLoot()">Save loot</button>
    </div>
</template>

<script>
    import { db } from '@/firebase';
    import { mapActions } from 'vuex';

	export default {
		name: 'Loot',
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.getUser,
				slide: this.$store.getters.getSlide,
                currencies: {
                    pp: { name: 'Platinum', color: 'white' },
                    gp: { name: 'Gold', color: 'yellow' },
                    ep: { name: 'Electrum', color: 'gray-light' },
                    sp: { name: 'Silver', color: 'gray-hover' },
                    cp: { name: 'Copper', color: 'orange' }
                 }
			} 
		},
		firebase() {
			return {
				loot: {
					source: db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot`),
					asObject: true
				},
			}
		},
		mounted() {
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
				'fetchCampaign'
			]),
			setLoot() {
				delete this.loot['.key'];
				delete this.loot['.value'];

				db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/loot`).set(
					this.loot
				);
				this.$snotify.success('Loot saved.', 'Critical hit!', {
					position: "rightTop"
				});
			},
			addItem() {
				if(this.loot.items == undefined) {
					this.loot.items = [];
				}
				this.loot.items.push({
					name: 'New Item',
				});
				this.$forceUpdate(); //IMPORTANT
			},
			removeItem(index) {
				this.$delete(this.loot.items, index);
				this.$forceUpdate(); //IMPORTANT
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
       max-width: 500px;


        div {
            // display: grid;
            // grid-template-columns: 35px auto;
            // grid-template-rows: auto;
            // margin-bottom: 5px;

            // .coins {
            //     display: inline-block;
            //     text-align: left;
            //     line-height: 40px;
            // }
        }
    }
}

</style>