<!-- EDIT PLAYER -->

<template>
	<div class="pb-5" v-if="entity && !demo">
		<h2 class="d-flex justify-content-between">
			<span>Edit {{ playerBase.character_name }}</span>
			<a @click="setTransform = !setTransform">
				<i v-if="setTransform" class="fas fa-times red"></i>
				<i v-else class="fas fa-paw-claws green"></i>
				<q-tooltip anchor="top middle" self="center middle">
					Transform
				</q-tooltip>
			</a>
		</h2>
		
		<a v-if="entity.transformed" @click="removeTransform()" class="btn btn-block bg-red mb-3">Remove transformation</a>
		
		<Transform :data="entityKey" @close="closeTransform" v-if="setTransform" />
		<template v-else>
			<div v-if="location == 'encounter'" class="mb-3">
				<q-input 
					dark filled square dense
					label="initiative"
					type="number" 
					name="initiative"
					min="0"
					v-model="initiative['.value']"
					v-validate="'required'"
				/>
				<p class="validate red" v-if="errors.has('initiative')">{{ errors.first('initiative') }}</p>
			</div>
			<template v-else-if="entity.curHp === 0 && !entity.stable && !entity.dead">
				<div class="px-1 my-3 d-flex justify-content-between">
					<div v-for="(n, index) in 5" :key="index">
						<template v-if="Object.keys(entity.saves).length === n">
							<a v-show="entity.saves[n] === 'succes'" class="green" @click="set_save('unset', n)">
								<i class="fas fa-check"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Change
								</q-tooltip>
							</a>
							<a v-show="entity.saves[n] === 'fail'" class="red" @click="set_save('unset', n)">
								<i class="fas fa-times"></i>
								<q-tooltip anchor="top middle" self="center middle">
									Change
								</q-tooltip>
							</a>
						</template>
						<template v-else>
							<span v-show="entity.saves[n] === 'succes'" class="green"><i class="fas fa-check"></i></span>
							<span v-show="entity.saves[n] === 'fail'" class="red"><i class="fas fa-times"></i></span>
						</template>
						<span v-show="!entity.saves[n]" class="gray-hover"><i class="fas fa-dot-circle"></i></span>
					</div>
				</div>
				<div v-if="Object.keys(entity.saves).length < 5" class="d-flex justify-content-between">
					<button class="btn save bg-green" @click="set_save('succes', Object.keys(entity.saves).length)"><i class="fas fa-check"></i></button>
					<button class="btn save bg-red" @click="set_save('fail', Object.keys(entity.saves).length)"><i class="fas fa-times"></i></button>
				</div>
				<a v-if="death_fails >= 3" class="btn btn-block bg-red my-3" @click="kill()"><i class="fas fa-skull"></i> Player died</a>
				<a class="btn btn-block my-3" @click="stabilize()"><i class="fas fa-heartbeat"></i> Stabilize</a>
			</template>
			<a v-else-if="entity.dead" class="btn bg-green btn-block my-3" @click="revive()"><i class="fas fa-hand-holding-magic"></i> Revive</a>

			<h2>Temporary</h2>
			<div class="row q-col-gutter-md mb-2">
				<div class="col">
					<q-input 
						dark filled square dense
						label="AC bonus"
						type="number" 
						name="ac_bonus" 
						v-model="entity.ac_bonus"
						clearable
					/>
				</div>

				<div class="col">
					<q-input 
						dark filled square dense
						label="Temp HP"
						type="number" 
						name="tempHp" 
						v-model="entity.tempHp"
						clearable
					/>
				</div>

				<div class="col" v-if="!entity.transformed">
					<q-input 
						dark filled square dense
						label="Max HP Mod"
						type="number" 
						name="maxHpMod" 
						v-model="maxHpMod"
						clearable
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
								label="Cur HP"
								type="number" 
								name="t-curHp" 
								min="1"
								v-model="entity.transformed.curHp"
								v-validate="'required|numeric|min:1'"
								data-vv-as="Current HP"
								placeholder="Current Hit Points"
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
								label="Cur HP"
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
								class="text-center"
								type="number" 
								name="maxHp" 
								min="1"
								v-model="playerBase.maxHp"
								v-validate="'required|numeric'"
								data-vv-as="Maximum HP"
							/>
							<p class="validate red" v-if="errors.has('maxHp')">{{ errors.first('maxHp') }}</p>
						</template>
					</div>
				</div>
				<div class="row q-col-gutter-md">
					<div class="col">
						<template v-if="entity.transformed">
							<q-input 
								dark filled square dense
								label="Armor class"
								class="text-center"
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
								class="text-center"
								type="number" 
								name="ac" 
								min="1"
								v-model="playerBase.ac"
								v-validate="'required|numeric'"
								data-vv-as="Amor Class"
								placeholder="Armor Class"/>
							<p class="validate red" v-if="errors.has('ac')">{{ errors.first('ac') }}</p>
						</template>
					</div>
					<div class="col">
						<q-input 
							dark filled square dense
							label="Level"
							class="text-center"
							type="number" 
							name="level" 
							min="1"
							max="20"
							v-model="playerBase.level"
							v-validate="isXpAdvancement() ? 'numeric|between:1,20' : 'required|numeric|between:1,20'"
							data-vv-as="Level"
							:clearable="isXpAdvancement()"
						>
							<span slot="append" v-if="isXpAdvancement()" :class="{ red: playerBase.level  }">
								{{ calculatedLevel(playerBase.experience) }}
								<q-tooltip anchor="top left" self="center left">
									Level based on XP
								</q-tooltip>
							</span>
						</q-input>
						<p class="validate red" v-if="errors.has('level')">{{ errors.first('level') }}</p>
					</div>
				</div>
			</template>

			<button class="btn btn-block my-3" @click="edit()">Save</button>

			<div v-if="isXpAdvancement()" class="pt-2">
				<hr>
				<h2>Experience Points</h2>
				{{ setNumber(playerBase.experience) }}
				<h2 class="text-center xp">{{ animatedNumber }}</h2>

				<div class="level">
					<div class="current">{{ calculatedLevel(playerBase.experience) }}</div>
					<q-linear-progress size="25px" :value="levelAdvancement(playerBase.experience)" color="primary">
						<div class="absolute-full flex flex-center">
							<div class="white">
								{{ Math.floor(levelAdvancement(playerBase.experience) * 100) }}%
							</div>
						</div>
					</q-linear-progress>
					<div class="next" v-if="calculatedLevel(playerBase.experience) < 20">{{ calculatedLevel(playerBase.experience) + 1 }}</div>
				</div>

				<q-input 
					dark square filled dense
					class="text-center"
					type="number" 
					name="xp" 
					v-model="xp"
					label="Award XP"
				/>

				<button class="btn btn-block my-3" @click="addXp()">Award {{ xp }} XP</button>
			</div>
		</template>
	</div>
	<div v-else-if="demo">
		<h2>Edit Player</h2>
		<p>In the demo you can't edit players. Sign up to get access to all the features our app has to offer, like creating players and monsters and of course your own encounters.</p>

		<router-link to="/sign-up" class="btn btn-block btn-lg bg-green">Create Account</router-link>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapActions } from 'vuex';
	import { experience } from '@/mixins/experience.js';
	import Transform from './party/Transform.vue';

	export default {
		name: 'EditEntity',
		mixins: [experience],
		components: {
			Transform
		},
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
				xp: undefined,
				number: 0,
				tweenedNumber: 0,
				setTransform: false
			}
		},
		mounted() {
			if(!this.demo) {
				var entity = db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}`)
				entity.on('value', async (snapshot) => {
					this.entity = snapshot.val();
					this.entity.saves = (snapshot.val().saves) ? snapshot.val().saves : {};
					this.maxHpMod = snapshot.val().maxHpMod;
				});
			}
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
			},
			death_fails() {
				let fails = 0;
				for(let key in this.entity.saves) {
					if(this.entity.saves[key] === 'fail') {
						fails++
					}
				}
				return fails;
			},
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
			isXpAdvancement() {
				let adv =  this.advancement['.value'] != 'milestone';
				return adv
			},
			set_save(check, index) {
				if(check === 'unset') {
					// delete this.entity.saves[index];
					db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/saves/${index}`).remove();
				}
				else {
					var i = parseInt(index + 1);
					db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/saves/${i}`).set(check);
				}
			},
			closeTransform() {
				this.setTransform = false;
			},
			removeTransform() {
				if(this.location === 'encounter') {
					this.transform_entity({
						key: this.entity.key,
						remove: true
					})
					this.entity.transformed = false;
				} else {
					db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/transformed`).remove();
				}
			},
			stabilize() {
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/dead`).remove();
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/saves`).remove();
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/stable`).set(true);
			},
			kill() {
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/stable`).remove();
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/dead`).set(true);
			},
			revive() {
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/dead`).remove();
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/saves`).remove();
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/stable`).remove();
				db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/curHp`).set(1);
			},
			edit() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						delete this.entity['.key'] // can't be entered in Firebase
						delete this.playerBase['.key'] // can't be entered in Firebase

						if(this.location == 'encounter') {
							this.initiative['.value'] = Number(this.initiative['.value']);
						}

						//Parse to INT
						this.entity.ac_bonus = (this.entity.ac_bonus) ? parseInt(this.entity.ac_bonus) : 0;
						this.entity.tempHp = (this.entity.tempHp) ? parseInt(this.entity.tempHp) : 0;
						this.maxHpMod = (this.maxHpMod) ? parseInt(this.maxHpMod) : 0;
						this.entity.maxHpMod = (this.entity.maxHpMod) ? parseInt(this.entity.maxHpMod) : 0;
						this.playerBase.ac = parseInt(this.playerBase.ac);
						this.playerBase.maxHp = parseInt(this.playerBase.maxHp);
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
						if(this.entity.curHp > (this.playerBase.maxHp + this.entity.maxHpMod)) {
							this.entity.curHp = parseInt(this.playerBase.maxHp + this.entity.maxHpMod);
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
						db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}`).set(this.entity);
						db.ref(`players/${this.userId}/${this.entityKey}`).update(this.playerBase);

						//If the new curHp > 0, remove stable and dead conditions
						if(this.entity.curHp > 0) {
							db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/saves`).remove();
							db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/stable`).remove();
							db.ref(`campaigns/${this.userId}/${this.campaignId}/players/${this.entityKey}/dead`).remove();
						}


						//Only update in an encounter
						if(this.location === 'encounter') {
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
		height: 25px;
		line-height: 25px;
		margin-bottom: 20px;

		.next {
			text-align: right;
		}
		.q-linear-progress {
			font-size: 15px !important;
			height: 25px;
		}
	}
	.btn.save {
		width: 49.5%;
	}
</style>
