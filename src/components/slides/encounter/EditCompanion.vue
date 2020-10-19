<!-- EDIT COMPANION -->

<template>
	<div class="pb-5" v-if="entity && !demo">
		<h2 class="d-flex justify-content-between">
			<span>Edit {{ npcBase.name }}</span>
		</h2>	

		<q-input 
			dark filled square dense
			label="initiative"
			type="number" 
			name="initiative"
			min="0"
			v-model="initiative['.value']"
			:class="{'input': true, 'error': errors.has('initiative') }"
			v-validate="'required'"
		/>
		<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>

		<h2 class="mt-2">Temporary</h2>
		<div class="row q-col-gutter-md mb-2">
			<div class="col">
				<q-input 
					dark filled square dense
					label="AC Bonus"
					type="number" 
					name="ac_bonus" 
					v-model="entity.ac_bonus"
				/>
			</div>

			<div class="col">
				<q-input 
					dark filled square dense
					label="Temp HP"
					type="number" 
					name="tempHp" 
					v-model="entity.tempHp"
				/>
			</div>

			<div class="col" v-if="!entity.transformed">
				<q-input 
					dark filled square dense
					label="Max HP mod"
					type="number" 
					name="maxHpMod" 
					v-model="maxHpMod"
				/>
			</div>
		</div>

		<template>
			<hr>
			<h2 class="mb-0">Override</h2>
			<div class="row q-col-gutter-md my-2">
				<div class="col">
					<template v-if="entity.transformed">
						<q-input 
							dark filled square dense
							label="Current HP"
							class="text-center"
							type="number" 
							name="t-curHp" 
							min="1"
							v-model="entity.transformed.curHp"
							v-validate="'required|numeric|min:1'"
							data-vv-as="Current HP"
						>
							<q-icon slot="prepend" name="fas fa-paw-claws green">
								<q-tooltip anchor="top middle" self="center middle">
									Transformed
								</q-tooltip>
							</q-icon>
						</q-input>
						<p class="validate red" v-if="errors.has('t-curHp')">{{ errors.first('t-curHp') }}</p>
					</template>
					<template v-else>
						<q-input 
							dark filled square dense
							label="Current HP"
							class="text-center"
							type="number" 
							name="curHp" 
							min="0"
							v-model="entity.curHp"
							v-validate="'required|numeric'"
							data-vv-as="Current HP"
						/>
						<p class="validate red" v-if="errors.has('curHp')">{{ errors.first('curHp') }}</p>
					</template>
				</div>

				<div class="col">
					<template v-if="entity.transformed">
						<q-input
							dark filled square dense
							label="Max HP"
							class="text-center"
							type="number" 
							name="t-maxHp" 
							min="1"
							v-model="entity.transformed.maxHp"
							v-validate="'required|numeric'"
							data-vv-as="Maximum HP"
						>
							<q-icon slot="prepend" name="fas fa-paw-claws green">
								<q-tooltip anchor="top middle" self="center middle">
									Transformed
								</q-tooltip>
							</q-icon>
						</q-input>
						<p class="validate red" v-if="errors.has('t-maxHp')">{{ errors.first('t-maxHp') }}</p>
					</template>
					<template v-else>
						<q-input 
							dark filled square dense
							label="Max HP"
							type="number" 
							name="maxHp" 
							min="1"
							v-model="npcBase.maxHp"
							v-validate="'required|numeric'"
							data-vv-as="Maximum HP"
						/>
						<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
					</template>
				</div>
				<div class="col">
					<template v-if="entity.transformed">
						<q-input 
							dark filled square dense
							label="Armor class"
							type="number" 
							name="t-ac" 
							min="1"
							v-model="entity.transformed.ac"
							v-validate="'required|numeric'"
							data-vv-as="Amor Class"
						>
							<q-icon slot="prepend" name="fas fa-paw-claws green">
								<q-tooltip anchor="top middle" self="center middle">
									Transformed
								</q-tooltip>
							</q-icon>
						</q-input>
						<p class="validate red" v-if="errors.has('t-ac')">{{ errors.first('t-ac') }}</p>
					</template>
					<template v-else>
						<q-input 
							dark filled square dense
							label="Armor class"
							type="number" 
							name="ac" 
							min="1"
							v-model="npcBase.ac"
							v-validate="'required|numeric'"
							data-vv-as="Amor Class"
						/>
						<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
					</template>
				</div>
			</div>
		</template>

		<button class="btn btn-block my-3" @click="edit()">Save</button>

	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions } from 'vuex';

	export default {
		name: 'EditCompanion',
		props: [
			'data',
		],
		data() {
			return {
				demo: this.$route.name === "Demo",
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				entityKey: this.data.key,
				location: this.data.location,
				entity: undefined,
				maxHpMod: undefined,
			}
		},
		mounted() {
			if(!this.demo) {
				let entity = db.ref(`campaigns/${this.userId}/${this.campaignId}/companions/${this.entityKey}`);
				entity.on('value', async (snapshot) => {
					this.entity = snapshot.val();
					this.entity.saves = (snapshot.val().saves) ? snapshot.val().saves : {};
					this.maxHpMod = snapshot.val().maxHpMod;
				});
			}
		},
		firebase() {
			return {
				npcBase: {
					source:	db.ref(`npcs/${this.userId}/${this.entityKey}`),
					asObject: true
				},
				initiative: {
					source:	db.ref(`encounters/${this.userId}/${this.campaignId}/${this.encounterId}/entities/${this.entityKey}/initiative`),
					asObject: true
				},
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
						delete this.npcBase['.key'] // can't be entered in Firebase

						if(this.location == 'encounter') {
							this.initiative['.value'] = Number(this.initiative['.value']);
						}

						//Parse to INT
						this.entity.ac_bonus = (this.entity.ac_bonus) ? parseInt(this.entity.ac_bonus) : 0;
						this.entity.tempHp = (this.entity.tempHp) ? parseInt(this.entity.tempHp) : 0;
						this.maxHpMod = (this.maxHpMod) ? parseInt(this.maxHpMod) : 0;
						this.entity.maxHpMod = (this.entity.maxHpMod) ? parseInt(this.entity.maxHpMod) : 0;
						this.npcBase.ac = parseInt(this.npcBase.ac);
						this.npcBase.maxHp = parseInt(this.npcBase.maxHp);
						this.entity.curHp = parseInt(this.entity.curHp);


						//Modify curHP with maxHpMod
						if(this.entity.maxHpMod === 0) {
							//If the there was no current mod
							//only modify curHp if maxHpMod = positive
							if(this.maxHpMod > 0) {
								this.entity.curHp = parseInt(this.entity.curHp + this.maxHpMod);
							}
						} else if(this.maxHpMod === 0) {
							//if the new mod is 0, check if the old mod was positive
							//If so, remove it from the curHp
							if(this.entity.maxHpMod > 0) {
								this.entity.curHp = parseInt(this.entity.curHp - this.entity.maxHpMod);
							}
						} else {
							//If the new mod is positive
							if(this.maxHpMod > 0) {
								//check if the current mod was positive too
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
						if(this.entity.curHp > (this.npcBase.maxHp + this.entity.maxHpMod)) {
							this.entity.curHp = parseInt(this.npcBase.maxHp + this.entity.maxHpMod);
						}
						if(this.entity.transformed) {
							if(this.entity.transformed.curHp > this.entity.transformed.maxHp) {
								this.entity.transformed.curHp = this.entity.transformed.maxHp;
							}
							if(this.entity.transformed.curHp <= 0) {
								this.$delete(this.entity, 'transformed');
							}
						}
								

						//Update Firebase apart from store, cause it can be edited where there is no store.
						db.ref(`campaigns/${this.userId}/${this.campaignId}/companions/${this.entityKey}`).set(this.entity);
						db.ref(`npcs/${this.userId}/${this.entityKey}`).update(this.npcBase);

						//If the new curHp > 0, remove stable and dead conditions
						if(this.entity.curHp > 0) {
							db.ref(`campaigns/${this.userId}/${this.campaignId}/companions/${this.entityKey}/saves`).remove();
							db.ref(`campaigns/${this.userId}/${this.campaignId}/companions/${this.entityKey}/stable`).remove();
							db.ref(`campaigns/${this.userId}/${this.campaignId}/companions/${this.entityKey}/dead`).remove();
						}


						//Only update in an encounter
						if(this.location === 'encounter') {
							//create full object to send to store
							this.entity.initiative = this.initiative['.value'];
							this.entity.ac = this.npcBase.ac;
							this.entity.maxHp = this.npcBase.maxHp;

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
	.btn.save {
		width: 49.5%;
	}
</style>
