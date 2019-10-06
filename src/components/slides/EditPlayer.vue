<!-- EDIT PLAYER -->

<template>
	<div class="pb-5" v-if="entity">
		<h2>Edit <span class="blue">{{ playerBase.character_name }}</span></h2>
		<b-row v-if="location == 'encounter'" class="mb-3">
			<b-col class="col-4">
				<label>Initiative</label>
			</b-col>
			<b-col>
				<b-form-input 
					class="text-center"
					type="number" 
					name="initiative"
					min="0"
					v-model="initiative['.value']"
					:class="{'input': true, 'error': errors.has('initiative') }"
					v-validate="'numeric|required'"
					placeholder="Initiative"></b-form-input>
					<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>
			</b-col>
		</b-row>

		<h2>Temporary</h2>
		<b-row class="mb-2">
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

			<b-col class="text-center">
				<label>Max HP Mod</label>
				<b-form-input 
					class="text-center"
					type="number" 
					name="maxHpMod" 
					v-model="maxHpMod"
					placeholder="Max HP modifier"></b-form-input>
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

		<div v-if="advancement['.value'] != 'milestone'" class="pt-2">
			<hr>
			<h2>Experience Points</h2>
			{{ setNumber(playerBase.experience) }}
			<h2 class="text-center xp">{{ animatedNumber }}</h2>

			<div class="level">
				<div class="current">{{ calculatedLevel(playerBase.experience) }}</div>
				<div class="progress">
					<div class="progress-bar bg-blue"
						role="progressbar" 
						:style="{ width: levelAdvancement(playerBase.experience) + '%' }" aria-valuemin="0" aria-valuemax="100">
					</div>
				</div>
				<div class="next" v-if="calculatedLevel(playerBase.experience) < 20">{{ calculatedLevel(playerBase.experience) + 1 }}</div>
			</div>

				<b-form-input 
					class="text-center"
					type="number" 
					name="xp" 
					v-model="xp"
					placeholder="Award XP">
				</b-form-input>

				<button class="btn btn-block my-3" @click="addXp()">Award {{ xp }} XP</button>
		</div>
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions } from 'vuex'
	import { experience } from '@/mixins/experience.js'

	export default {
		name: 'EditEntity',
		mixins: [experience],
		props: [
			'data',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				entityKey: this.data.key,
				location: this.data.location,
				entity: undefined,
				maxHpMod: undefined,
				xp: undefined,
				number: 0,
				tweenedNumber: 0
			}
		},
		mounted() {
			var entity = db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}`)
			entity.on('value', async (snapshot) => {
				this.entity = snapshot.val();
				this.maxHpMod = snapshot.val().maxHpMod;
			});
		},
		firebase() {
			return {
				playerBase: {
					source:	db.ref(`players/${this.userId}/${this.entityKey}`),
					asObject: true
				},
				initiative: {
					source:	db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}/initiative`),
					asObject: true
				},
				advancement: {
					source:	db.ref(`campaigns/${this.userId}/${this.campaignId}/advancement`),
					asObject: true
				},
			}
		},
		computed: {
			animatedNumber: function() {
				return this.tweenedNumber.toFixed(0);
			}
		},
		watch: {
			number: function(newValue) {
				// eslint-disable-next-line
				TweenLite.to(this.$data, 1, { tweenedNumber: newValue });
			}
		},
		methods: {
			...mapActions([
				'setSlide',
				'edit_player',
			]),
			setNumber(value) {
				this.number = value
			},
			addXp() {
				if(this.xp) {
					let newXp = parseInt(this.playerBase.experience) + parseInt(this.xp);

					if(newXp < 0) { newXp = 0; }
					if(newXp > 355000) { newXp = 355000; }

					db.ref(`players/${this.userId}/${this.entityKey}/experience`).set(
						newXp
					)
					this.xp = undefined;
				}
			},
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						delete this.entity['.key'] // can't be entered in Firebase
						delete this.playerBase['.key'] // can't be entered in Firebase

						if(this.location == 'encounter') {
							this.initiative['.value'] = parseInt(this.initiative['.value']);
						}

						//Parse to INT
						this.entity.ac_bonus = (this.entity.ac_bonus) ? parseInt(this.entity.ac_bonus) : 0;
						this.entity.tempHp = (this.entity.tempHp) ? parseInt(this.entity.tempHp) : 0;
						this.maxHpMod = (this.maxHpMod) ? parseInt(this.maxHpMod) : 0;
						this.entity.maxHpMod = (this.entity.maxHpMod) ? parseInt(this.entity.maxHpMod) : 0;
						this.playerBase.ac = parseInt(this.playerBase.ac);
						this.playerBase.maxHp = parseInt(this.playerBase.maxHp);

						//Modify curHP with maxHpMod
						if(this.entity.maxHpMod === 0) {
							//If the there was no current mod
							//only modify curHp if maxHpMod = positive
							if(this.maxHpMod > 0) {
								this.entity.curHp = parseInt(parseInt(this.entity.curHp) + this.maxHpMod);
							}
						} else if(this.maxHpMod === 0) {
							//if the new mod is 0, check if the old mod was positive
							//If so, remove it from the curHp
							if(this.entity.maxHpMod > 0) {
								this.entity.curHp = parseInt(parseInt(this.entity.curHp) - this.entity.maxHpMod);
							}
						} else {
							//If the new mod is positive
							if(this.maxHpMod > 0) {
								//check if the current mod was positive to0
								if(this.entity.maxHpMod > 0) {
									//if so, first substract current mod, then add new
									this.entity.curHp = parseInt(parseInt(this.entity.curHp) - this.entity.maxHpMod + this.maxHpMod);
								} else {
									//else only add the new mod
									this.entity.curHp = parseInt(parseInt(this.entity.curHp) + this.maxHpMod);
								}
							} else if(this.maxHpMod < 0) {
								//if the new mod is negative,
								//but the current is positive, still substract current
								if(this.entity.maxHpMod > 0) {
									this.entity.curHp = parseInt(parseInt(this.entity.curHp) - this.entity.maxHpMod);
								}
							}
						}
						this.entity.maxHpMod = this.maxHpMod; //to store new in firebase

						//CurHp can never be > maxHp
						if(this.entity.curHp > (this.playerBase.maxHp + this.entity.maxHpMod)) {
							this.entity.curHp = parseInt(this.playerBase.maxHp + this.entity.maxHpMod)
						}

						//Update Firebase apart from store, cause it can be edited where there is no store.
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}`).update(this.entity)
						db.ref(`players/${this.userId}/${this.entityKey}`).update(this.playerBase)

						//Only update in an encounter
						if(this.location == 'encounter') {
							
							//create full object to send to store
							this.entity.initiative = this.initiative['.value'];
							this.entity.ac = this.playerBase.ac;
							this.entity.maxHp = this.playerBase.maxHp;

							//Update store
							this.edit_player({key: this.entityKey, entity: this.entity});
						}
						
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
	label {
		font-size: 12px;
	}
	h2.xp {
		font-weight: bold;
		font-size: 28px;
	}
	.level {
		display: grid;
		grid-template-columns: 25px auto 25px;
		height: 15px;
		line-height: 15px;
		margin-bottom: 20px;

		.next {
			text-align: right;
		}

		.progress {
			height: 15px;
		}
	}
</style>
