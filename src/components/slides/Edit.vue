<template>
	<div class="pb-5" v-if="entity">
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
			<b-col>
				<label class="text-center">Init.</label>
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

			<b-col>
				<label class="text-center">AC Bonus</label>
				<b-form-input 
					type="number" 
					name="ac_bonus" 
					v-model="entity.ac_bonus"
					placeholder="AC Bonus"></b-form-input>
			</b-col>

			<b-col>
				<label class="text-center">Temp HP</label>
				<b-form-input 
					type="number" 
					name="tempHp" 
					v-model="entity.tempHp"
					placeholder="Temporary Hit Points"></b-form-input>
			</b-col>
		</b-row>

		<template v-if="entity.npc">
			<hr>
			<h2 class="mb-0">Override</h2>
			<p><small>Only for this encounter.</small></p>
			<b-row class="my-2">
				<b-col>
					<label>AC</label>
					<b-form-input 
						type="number" 
						name="ac" 
						min="1"
						v-model="entity.ac"
						v-validate="'required|numeric'"
						data-vv-as="Amor Class"
						placeholder="Armor Class"></b-form-input>
						<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
				</b-col>

				<b-col>
					<label>Max HP</label>
					<b-form-input 
						type="number" 
						name="maxHp" 
						min="1"
						v-model="entity.maxHp"
						v-validate="'required|numeric'"
						data-vv-as="Maximum HP"
						placeholder="Maximum Hit Points"></b-form-input>
						<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
				</b-col>

				<b-col>
					<label>Cur HP</label>
					<b-form-input 
						type="number" 
						name="maxHp" 
						min="1"
						v-model="entity.curHp"
						v-validate="'required|numeric'"
						data-vv-as="Current HP"
						placeholder="Current Hit Points"></b-form-input>
						<p class="validate red" v-if="errors.has('curHp')">{{ errors.first('curHp') }}</p>
				</b-col>
			</b-row>
		</template>

		<button class="btn btn-block my-3" @click="edit()">Save</button>
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
					source: db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}`),
					asObject: true
				}
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
						delete this.entity['.key']

						this.entity.initiative = parseInt(this.entity.initiative)
						if(this.entity.ac_bonus) {
							this.entity.ac_bonus = parseInt(this.entity.ac_bonus)
						}
						else { this.entity.ac_bonus = false }
						if(this.entity.tempHp) {
							this.entity.tempHp = parseInt(this.entity.tempHp)
						}
						else { this.entity.tempHp = false }

						this.entity.ac = parseInt(this.entity.ac)
						this.entity.maxHp = parseInt(this.entity.maxHp)
						this.entity.curHp = parseInt(this.entity.curHp)

						if(this.entity.curHp > this.entity.maxHp) {
							this.entity.curHp = this.entity.maxHp
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
