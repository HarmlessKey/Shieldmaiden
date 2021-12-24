<template>
	<div class="pb-5">
		<h2>Transform</h2>
		
		<div class="row q-col-gutter-md mb-2">
			<div class="col">
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square
					label="Armor class"
					autocomplete="off"
					type="number" 
					name="ac" 
					v-model="transAc"
					v-validate="'required'"
				/>
			</div>
			
			<div class="col">
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square
					label="Hit points"
					autocomplete="off"
					type="number" 
					name="maxHp" 
					v-model="transHp"
					v-validate="'required'"
				/>
			</div>
		</div>
		<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
		<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
		<button class="btn btn-block mb-3" @click="edit()">Transform</button>
		<small>
			Transform the entity into another creature. You can use this for a druid's Wild Shape, or for the Polymorph spell. 
			Damage and healing is handled as the Player's Handbook describes it should work for Wild Shape (phb 67).
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
				userId: this.$store.getters.user.uid,
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
