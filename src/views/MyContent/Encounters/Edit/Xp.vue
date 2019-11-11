<template>
    <div>
        <h2>Experience Points</h2>
        <h3 :class="{ strikeTrough: xp.overwrite }">
            Calucated Amount <span class="blue">{{ xp.calculated }}</span>
            <a @click="setOverwrite = !setOverwrite" class="ml-2 red" v-if="!xp.overwrite">Overwrite</a>
        </h3>
        <h3 v-if="xp.overwrite">
            Overwritten Amount <span class="blue">{{ xp.overwrite }}</span>
            <a @click="clearOverwrite" class="ml-2 red">Use calculated</a>
        </h3>
        
        <div class="d-flex justify-content-between" v-if="setOverwrite">
            <div class="input-group mb-3">
                <input type="number" autocomplete="off" v-model="overwriteAmount" @change="setOverwriteAmount" placeholder="Amount of XP" class="form-control"/>
                <div class="input-group-append">
                    <button class="btn">Overwrite XP</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { db } from '@/firebase';

	export default {
        name: 'XP',
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
                user: this.$store.getters.getUser,
                setOverwrite: false,
                overwriteAmount: undefined
			} 
		},
		firebase() {
			return {
				xp: {
					source: db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/xp`),
					asObject: true
                }
			}
		},
		methods: {
            setOverwriteAmount() {
                db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/xp/overwrite').set(this.overwriteAmount);
                this.setOverwrite = false;
                this.overwriteAmount = undefined;
            },
            clearOverwrite() {
                db.ref('encounters/' + this.user.uid + '/' + this.campaignId + '/' + this.encounterId + '/xp/overwrite').remove();
            }
			
		}
	}
</script>

<style lang="scss" scoped>
    .strikeTrough {
        text-decoration: line-through;
    }
</style>