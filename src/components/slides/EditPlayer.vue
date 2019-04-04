<!-- EDIT PLAYER -->

<template>
	<div class="pb-5" v-if="entity">
		<h2>Edit <span class="blue">{{ playerBase.character_name }}</span></h2>
		<b-row class="mb-2">
			<b-col v-if="location == 'encounter'" class="text-center">
				<label>Init.</label>
				<b-form-input 
					class="text-center"
					type="number" 
					name="initiative"
					min="0"
					v-model="entity.initiative"
					:class="{'input': true, 'error': errors.has('initiative') }"
					v-validate="'numeric|required'"
					placeholder="Initiative"></b-form-input>
					<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>
			</b-col>

			<b-col class="text-center">
				<label>AC Bonus</label>
				<b-form-input 
					class="text-center"
					type="number" 
					name="ac_bonus" 
					v-model="entity.ac_bonus"
					placeholder="AC Bonus"></b-form-input>
			</b-col>

			<b-col class="text-center">
				<label>Temp HP</label>
				<b-form-input 
					class="text-center"
					type="number" 
					name="tempHp" 
					v-model="entity.tempHp"
					placeholder="Temporary Hit Points"></b-form-input>
			</b-col>
		</b-row>

		<template>
			<hr>
			<h2 class="mb-0">Override</h2>
			<b-row class="my-2">
				<b-col class="text-center">
					<label>AC</label>
					<b-form-input 
						class="text-center"
						type="number" 
						name="ac" 
						min="1"
						v-model="playerBase.ac"
						v-validate="'required|numeric'"
						data-vv-as="Amor Class"
						placeholder="Armor Class"></b-form-input>
						<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
				</b-col>

				<b-col class="text-center">
					<label>Cur HP</label>
					<b-form-input 
						class="text-center"
						type="number" 
						name="maxHp" 
						min="1"
						v-model="entity.curHp"
						v-validate="'required|numeric'"
						data-vv-as="Current HP"
						placeholder="Current Hit Points"></b-form-input>
						<p class="validate red" v-if="errors.has('curHp')">{{ errors.first('curHp') }}</p>
				</b-col>

				<b-col class="text-center">
					<label>Max HP</label>
					<b-form-input 
						class="text-center"
						type="number" 
						name="maxHp" 
						min="1"
						v-model="playerBase.maxHp"
						v-validate="'required|numeric'"
						data-vv-as="Maximum HP"
						placeholder="Maximum Hit Points"></b-form-input>
						<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
				</b-col>
			</b-row>
		</template>

		<button class="btn btn-block my-3" @click="edit()">Save</button>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions } from 'vuex'

	export default {
		name: 'EditEntity',
		props: [
			'entityKey',
			'location',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
			}
		},
		firebase() {
			return {
				entity: {
					source:	db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}`),
					asObject: true
				},
				playerBase: {
					source:	db.ref(`players/${this.userId}/${this.entityKey}`),
					asObject: true
				}
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'edit_player',
			]),
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						delete this.entity['.key'] // can't be entered in Firebase
						delete this.playerBase['.key'] // can't be entered in Firebase

						if(this.location == 'encounter') {
							this.entity.initiative = parseInt(this.entity.initiative);
						} else {
							delete this.entity.initiative
						}

						//Parse to INT
						this.entity.initiative = (this.entity.initiative) ? parseInt(this.entity.initiative) : false;
						this.entity.ac_bonus = (this.entity.ac_bonus) ? parseInt(this.entity.ac_bonus) : false;
						this.entity.tempHp = (this.entity.tempHp) ? parseInt(this.entity.tempHp) : false;
						this.playerBase.ac = parseInt(this.playerBase.ac)
						this.playerBase.maxHp = parseInt(this.playerBase.maxHp)
						this.entity.curHp = parseInt(this.entity.curHp)

						// curHp can never be larger than maxHp
						if(this.entity.curHp > this.entity.maxHp) {
							this.entity.curHp = this.entity.maxHp
						}
						
						//Update Firebase apart from store, cause it can be edited where there is no store.
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}`).update(this.entity)
						db.ref(`players/${this.userId}/${this.entityKey}`).update(this.playerBase)

						//Update store
						// this.edit_player({key: this.entityKey, entity: this.entity})
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

<style lang="scss" scoped>

</style>
