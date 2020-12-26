<template>
	<div class="pb-5">
		<h2>Transform <span class="blue">{{ entity.name }}</span></h2>
		<a v-if="entity.transformed" @click="remove()" class="btn btn-block bg-red">Remove transformation</a>
		<template v-else>
			<div class="row q-col-gutter-md">
				<div class="col">
					<q-input 
						dark square filled
						label="Armor class"
						autocomplete="off"
						type="number" 
						name="ac"
						class="mb-2"
						v-model="transAc"
						v-validate="'required'"
					/>
				</div>
				
				<div class="col">
					<q-input 
						dark square filled
						label="Hit points"
						autocomplete="off"
						type="number" 
						name="maxHp" 
						v-model="transHp"
						v-validate="'required'"
					/>
				</div>

			</div>
			<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
			<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
			<button class="btn btn-block mb-3" @click="edit()">Transform</button>

			<small>
				Transform the entity into another creature. You can use this for a druid's Wild Shape, or for the Polymorph spell. 
				Damage and healing is handled as the Player's Handbook describes it should work for Wild Shape (phb 67).
			</small>
		</template>
	</div>
</template>

<script>
	import { mapActions } from 'vuex'

	export default {
		name: 'Transform',
		props: [
			'data',
		],
		data() {
			return {
				entity: this.data,
				userId: this.$store.getters.user.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				transAc: '',
				transHp: ''
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'transform_entity',
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						let transform = {
							ac: parseInt(this.transAc),
							maxHp: parseInt(this.transHp),
							curHp: parseInt(this.transHp)
						}

						this.transform_entity({
							key: this.entity.key,
							entity: transform
						})
						this.setSlide(false);
					}
					else {
						//console.log('Not valid');
					}
				})
			},
			remove() {
				this.transform_entity({
					key: this.entity.key,
					remove: true
				})
				this.entity.transformed = false
			},
		}
	};
</script>

<style scoped>

</style>
