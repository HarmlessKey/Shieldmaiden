<template>
    <div class="loot">
        <h2>Currency</h2>
        <b-row class="mb-5 text-center">
            <b-col>
                <label class="coins mr-2 white" v-b-tooltip.hover title="Platinum"><i class="fas fa-coins"></i></label>
                <input class="form-control text-center" autocomplete="off" type="number" min="0" name="name" v-model="loot.pp" placeholder="Platinum"/>
            </b-col>
            <b-col>
                <label class="coins mr-2 yellow" v-b-tooltip.hover title="Gold"><i class="fas fa-coins"></i></label>
                <input class="form-control text-center" autocomplete="off" type="number" min="0" name="name" v-model="loot.gp" placeholder="Gold"/>
            </b-col>
            <b-col>
                <label class="coins mr-2" v-b-tooltip.hover title="Silver"><i class="fas fa-coins"></i></label> 
                <input class="form-control text-center" autocomplete="off" type="number" min="0" name="name" v-model="loot.sp" placeholder="Silver"/>
            </b-col>
            <b-col>
                <label class="coins mr-2 orange" v-b-tooltip.hover title="Copper"><i class="fas fa-coins"></i></label>
                <input class="form-control text-center" autocomplete="off" type="number" min="0" name="name" v-model="loot.cp" placeholder="Copper"/>
            </b-col>
        </b-row>

        <h2 class="d-flex justify-content-between">
            Items
            <a class="gray-hover" @click="addItem()">
                <i class="fas fa-plus green"></i>
                <span class="d-none d-md-inline ml-1">Add</span>
            </a>
        </h2>
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
.loot {
	h2 {
		a {
			font-size: 15px;
		}
	}
}
.coins {
	line-height: 40px !important;
	font-size: 20px;
}

</style>