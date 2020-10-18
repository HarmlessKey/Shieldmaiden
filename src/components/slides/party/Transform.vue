<template>
	<div class="pb-5">
		<h2>Transform</h2>

		<q-input 
			dark filled square dense
			label="Armor class"
			autocomplete="off"
			type="number" 
			name="ac" 
			v-model="transAc"
			v-validate="'required'"
		/>
		<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>

		<q-input 
			dark filled square dense
			label="Hit points"
			autocomplete="off"
			type="number" 
			name="maxHp" 
			v-model="transHp"
			v-validate="'required'"
		/>
		<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
		<button class="btn btn-block mb-3" @click="edit()">Transform</button>
		<small>
			Transform the entity into another creature. You can use this for a druid's Wild Shape, or for the Polymorph spell. 
			Damage and healing is handled as the rulebook describes it should work for Wild Shape.<br/>
		</small>
	</div>
</template>

<script>
	import { db } from '@/firebase';

	export default {
		name: 'Transform',
		props: [
			'data',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				entityKey: this.data,
				transHp: undefined,
				transAc: undefined
			}
		},
		methods: {
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						let transform = {
							ac: parseInt(this.transAc),
							maxHp: parseInt(this.transHp),
							curHp: parseInt(this.transHp)
						}
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/transformed`).set(transform);
						this.$emit('close');
					}
					else {
						//console.log('Not valid');
					}
				})
			}
		}
	};
</script>

<style scoped>

</style>
