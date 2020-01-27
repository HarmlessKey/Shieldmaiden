<template>
	<div class="pb-5">
		<h2>Transform</h2>
		<b-row class="mb-2">
			<b-col sm="2"><label>AC</label></b-col>
			<b-col>
				<b-form-input 
					type="number" 
					name="ac" 
					v-model="transAc"
					v-validate="'required'"
					placeholder="Armor Class"></b-form-input>
					<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
			</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="2"><label>Hit Points</label></b-col>
			<b-col>
				<b-form-input 
					type="number" 
					name="maxHp" 
					v-model="transHp"
					v-validate="'required'"
					placeholder="maxHp"></b-form-input>
					<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
			</b-col>
		</b-row>
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
