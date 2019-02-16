<template>
	<div class="pb-5">
		<h2>Transform <span class="blue">{{ entity.name }}</span></h2>
		<template v-if="entity.transformed">
			<a @click="remove()" class="btn btn-block bg-red">Remove transformation</a>
		</template>
		<template v-else>
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
		</template>
	</div>
</template>

<script>
	import { mapActions } from 'vuex'

	export default {
		name: 'Transform',
		props: [
			'entityKey',
			'entity',
		],
		data() {
			return {
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
							key: this.entityKey,
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
					key: this.entityKey,
					remove: true
				})
				this.entity.transformed = false
			},
		}
	};
</script>

<style scoped>

</style>
