<template>
	<div class="pb-5">
		<h2>Transform <span class="blue">{{ entity.name }}</span></h2>
		<a v-if="entity.transformed" @click="remove()" class="btn btn-block bg-red">Remove transformation</a>
		<template v-else>
			<q-input 
				dark square filled dense
				label="Armor class"
				type="number" 
				name="ac" 
				v-model="transAc"
				v-validate="'required'"
			/>
			<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>

			<q-input 
				dark square filled dense
				label="Hit points"
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
				userId: this.$store.getters.getUser.uid,
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
