<template>
  <div>
		<q-input
			dark filled square dense
			label="Name"
			autocomplete="off"
			class="mb-2"
			v-validate="'required'" 
			data-vv-as="Encounter Name" 
			type="text" 
			name="name" 
			v-model="encounter.encounter"/>
		<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>

		<div class="background">
			<div 
				v-if="encounter.background" 
				class="img pointer" 
				:style="{ backgroundImage: 'url(\'' + encounter.background + '\')' }"
				@click="image = true"
			>
			</div>
			<div class="img" v-else>
				<q-icon name="fas fa-image"/>
			</div>
			<div>
				<q-input 
					dark filled square
					label="Background"
					autocomplete="off" 
					v-validate="'url'" type="text" 
					name="background" 
					data-vv-as="Background"
					v-model="encounter.background" 
					placeholder="Background URL"/>
				<p class="validate red" v-if="errors.has('background')">{{ errors.first('background') }}</p>
			</div>
		</div>

		<button class="btn mt-2" @click="edit()">Save Name & Background</button>

		<q-dialog v-model="image">
			<img :src="encounter.background" />
		</q-dialog>
	</div>
</template>1

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
				image: false
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
.background {
		display: grid;
		grid-template-columns: 56px 1fr;
		grid-column-gap: 10px;
		font-size: 35px;
		text-align: center;

		.img {
			border: solid 1px #b2b2b2;
			display: block;
			width: 56px;
			height: 56px;
			background-size: cover;
			background-position: center top;
		}
	}
</style>