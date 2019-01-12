<template>
	<div class="pb-5">
		<h2>Edit <span class="blue">{{ entity.name }}</span></h2>
		<b-form-input 
			type="text" 
			name="name" 
			v-model="entity.name"
			:class="{'input': true, 'error': errors.has('name') }"
			v-validate="'required'"
			placeholder="Name"></b-form-input>
			<p class="validate red" v-if="errors.has('name')">{{ errors.first('name') }}</p>
		<hr>
		<b-row class="mb-2">
			<b-col sm="2"><label>INT</label></b-col>
			<b-col>
				<b-form-input 
					type="number" 
					name="initiative"
					min="0"
					v-model="entity.initiative"
					:class="{'input': true, 'error': errors.has('initiative') }"
					v-validate="'numeric|required'"
					placeholder="Initiative"></b-form-input>
					<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>
			</b-col>
		</b-row>
		<hr>
		<b-row class="mb-2">
			<b-col sm="2"><label>AC Bonus</label></b-col>
			<b-col>
				<b-form-input 
					type="number" 
					name="ac_bonus" 
					v-model="entity.ac_bonus"
					placeholder="AC Bonus"></b-form-input>
			</b-col>
		</b-row>
		<b-row class="mb-2">
			<b-col sm="2"><label>Temp HP</label></b-col>
			<b-col>
				<b-form-input 
					type="number" 
					name="tempHp" 
					v-model="entity.tempHp"
					placeholder="Temp HP"></b-form-input>
			</b-col>
		</b-row>
		<button class="btn btn-block mb-3" @click="edit()">Save</button>
		<small>
			Edit this entity only for the current encounter.<br/>
			<span class="red">Warning!</span> only change the initiative if you really have to. It can mess up the order during a game so stay away from it as much as possible.
		</small>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions } from 'vuex'

	export default {
		name: 'EditEntity',
		props: [
			'entityKey',
			'entity',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'edit_entity',
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						this.entity.initiative = parseInt(this.entity.initiative)
						if(this.entity.ac_bonus) {
							this.entity.ac_bonus = parseInt(this.entity.ac_bonus)
						} 
						if(this.entity.tempHp) {
							this.entity.tempHp = parseInt(this.entity.tempHp)
						}

						this.edit_entity({key: this.entityKey, entity: this.entity})
						this.setSlide(false);
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
