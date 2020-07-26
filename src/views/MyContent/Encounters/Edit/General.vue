<template>
   <b-row class="mt-3">
        <b-col class="mb-2">
            <input class="form-control" 
                autocomplete="off"
                v-validate="'required'" 
                data-vv-as="Encounter Name" 
                type="text" name="name" 
                v-model="encounter.encounter"/>
            <p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

            <input class="form-control mt-2"
                autocomplete="off" 
                v-validate="'url'" type="text" 
                name="backbround" 
                data-vv-as="Background"
                v-model="encounter.background" 
                placeholder="Background URL"/>
            <p class="validate red" v-if="errors.has('background')">{{ errors.first('background') }}</p>

            <button class="btn mt-2" @click="edit()">Save Name & Background</button>
        </b-col>
        <b-col sm="3" v-if="encounter.background">
            <div class="img-container"><img :src="encounter.background" /></div>
        </b-col>
    </b-row>
</template>

<script>
    import { db } from '@/firebase';
    import { mapActions, mapGetters } from 'vuex';

	export default {
		name: 'General',
		data() {
			return {
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				user: this.$store.getters.getUser,
			} 
		},
		computed: {
			...mapGetters([
				'encounter',
			]),
		},
		mounted() {
			this.fetchEncounter({
				cid: this.campaignId, 
				eid: this.encounterId, 
			})
		},
		methods: {
			...mapActions([
				'fetchEncounter'
			]),
      edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}`).update(
							this.encounter
						);
						this.$snotify.success('Saved.', 'Critical hit!', {
							position: "rightTop"
						});
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.img-container {
	width: 100%;

	img {
		width: 100%;
	}
}
</style>