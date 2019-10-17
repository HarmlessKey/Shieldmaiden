<template>
    <div class="loot">
        <h3>Currency</h3>
        <div class="currency">
            <div v-for="(currency, key) in currencies" :key="key">
                <span class="coins" :class="currency.color" v-b-tooltip.hover :title="currency.name">
                    <svg width="30px" height="30px" viewBox="0 0 192 192" :class="currency.color">
                        <g>
                            <path :d="currency.icon"/>
                        </g>
                    </svg>
                  </span>
                <b-form-input class="text-center" autocomplete="off" type="number" size="sm" min="0" name="name" v-model="loot[key]" :placeholder="currency.name"/>
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
                    pp: { name: 'Platinum', color: 'platinum', icon: 'M174.229,78.853l-62.412-62.697H80.184L17.771,79.993v30.208l62.697,63.838h29.638l64.123-64.125V78.853z' },
                    gp: { name: 'Gold', color: 'gold', icon: 'M175.611,36.502V15.768H16.496v20.736c17.552,3.475,31.17,28.477,31.17,58.823c0,30.346-13.618,55.348-31.17,58.822v20.736 h159.115v-20.736c-17.551-3.475-31.17-28.477-31.17-58.824C144.441,64.979,158.061,39.978,175.611,36.502z' },
                    ep: { name: 'Electrum', color: 'electrum', icon: 'M148.316,20.327H42.705C19.071,36.956,3.613,64.423,3.613,95.518c0,31.091,15.458,58.558,39.092,75.187h105.611 c23.634-16.629,39.092-44.096,39.092-75.187C187.408,64.423,171.95,36.956,148.316,20.327z M95.511,142.814 c-6.683,0-12.101-5.418-12.101-12.1c0-6.684,5.418-12.102,12.101-12.102c6.684,0,12.103,5.418,12.103,12.102 C107.613,137.396,102.194,142.814,95.511,142.814z' },
                    sp: { name: 'Silver', color: 'silver', icon: 'M97.369,16.444L2.671,175.561h186.543L97.369,16.444z M95.942,134.695c-7.057,0-12.778-5.723-12.778-12.778 c0-7.057,5.722-12.778,12.778-12.778c7.058,0,12.778,5.722,12.778,12.778C108.721,128.973,103,134.695,95.942,134.695z' },
                    cp: { name: 'Copper', color: 'copper', icon: 'M139.727,32.555H55.134L33.602,53.703v86.516l21.532,19.227h84.593l20.765-19.227V53.703L139.727,32.555z M97.868,109.073 c-6.901,0-12.496-5.596-12.496-12.496c0-6.902,5.595-12.497,12.496-12.497s12.498,5.595,12.498,12.497 C110.366,103.478,104.77,109.073,97.868,109.073z' }
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
        max-width: 400px;
        text-align: center;

        svg {
            margin-bottom: 10px;
        }
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