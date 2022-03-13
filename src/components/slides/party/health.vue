<template>
	<div>
		<h2>Health Modifiers</h2>
		<ValidationObserver v-slot="{ handleSubmit, valid }">
			<q-form @submit="handleSubmit(setHpModifiers)">
				<div class="row q-col-gutter-md">
					<div class="col">
						<ValidationProvider rules="between:0,999" name="Temp HP" v-slot="{ errors, invalid, validated }">
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							label="Temporary HP"
							type="number" 
							name="tempHp" 
							v-model="tempHp"
							:error="invalid && validated"
							:error-message="errors[0]"
						/>
						</ValidationProvider>
					</div>
					<div class="col">
						<ValidationProvider rules="between:-999,999" name="Max HP mod" v-slot="{ errors, invalid, validated }">
							<q-input 
								:dark="$store.getters.theme === 'dark'" filled square
								label="Max HP mod" 
								type="number" 
								name="maxHpMod" 
								v-model="maxHpMod"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
					</div>
				</div>
				
				<h3 class="mt-3">Set HP changes for:</h3>
				<div v-for="(player, key) in players" :key="key">
					<q-checkbox 
						:dark="$store.getters.theme === 'dark'"
						v-model="setFor" 
						:val="key" 
						:label="player.character_name"
					/>
				</div>

				<div class="d-flex items-center mt-3">
					<q-btn class="full-width" type="submit" color="primary" no-caps>
						Update health
					</q-btn>
					<q-icon v-if="!valid" name="error" color="red" size="md" class="ml-2">
						<q-tooltip anchor="top middle" self="bottom right">
							There are validation errors
						</q-tooltip>
					</q-icon>
				</div>
			</q-form>
		</ValidationObserver>
	</div>
</template>

<script>
	import { mapActions } from 'vuex'

	export default {
		data() {
			return {
				user: this.$store.getters.user,
				campaignId: this.$route.params.campid,
				campaign: {},
				allPlayers: [],
				players: {},
				tempHp: undefined,
				maxHpMod: undefined,
				awardHp: undefined
			}
		},
		computed: {
			setFor: {
				get() {
					return (this.awardHp) ? this.awardHp : this.allPlayers;
				},
				set(newValue) {
					this.awardHp = newValue;
				}
			}
		},
		async mounted() {
			this.campaign = await this.get_campaign({
				uid: this.user.uid,
				id: this.campaignId
			});
			for(const id in this.campaign.players) {
				this.allPlayers.push(id);
				this.players[id] = await this.get_player({ uid: this. user.uid, id });
			}
		},
		watch: {
			setFor(newVal) {
				// Handle changes in individual player checkboxes
				if (newVal.length === 0) {
					this.indeterminate = false
					this.allSelected = false
				} else if (newVal.length === this.allPlayers.length) {
					this.indeterminate = false
					this.allSelected = true
				} else {
					this.indeterminate = true
					this.allSelected = false
				}
			}
		},
		methods: {
			...mapActions(["setSlide"]),
			...mapActions("campaigns", ["get_campaign", "update_campaign_entity"]),
			...mapActions("players", ["get_player"]),
			async setHpModifiers() {
				if(this.tempHp !== undefined) {
					for(let key of this.setFor) {
						await this.update_campaign_entity({ 
							uid: this.user.uid,
							campaignId: this.campaignId,
							type: "players",
							id: key,
							property: "tempHp",
							value: this.tempHp
						});
					}
				}
				if(this.maxHpMod !== undefined) {
					for(const key of this.setFor) {
						let maxHpMod = parseInt(this.maxHpMod);
						const player = this.players[key];
						let entity = {...this.campaign.players[key]};

						// If the MaxHpMod is negative and larger than the maxHp
						if(maxHpMod < 0 && Math.abs(maxHpMod) > player.maxHp) {
							maxHpMod = -player.maxHp;
						}

						//Modify curHP with maxHpMod
						if(entity.maxHpMod === 0) {
							//If there was no current mod
							//only modify curHp if maxHpMod = positive
							if(maxHpMod > 0) {
								entity.curHp = parseInt(parseInt(entity.curHp) + maxHpMod);
							}
						} else if(maxHpMod === 0) {
							//if the new mod is 0, check if the old mod was positive
							//If so, remove it from the curHp
							if(entity.maxHpMod > 0) {
								entity.curHp = parseInt(parseInt(entity.curHp) - entity.maxHpMod);
							}
						} else {
							//If the new mod is positive
							if(maxHpMod > 0) {
								//check if the current mod was positive to 0
								if(entity.maxHpMod > 0) {
									//if so, first substract current mod, then add new
									entity.curHp = parseInt(parseInt(entity.curHp) - entity.maxHpMod + maxHpMod);
								} else {
									//else only add the new mod
									entity.curHp = parseInt(parseInt(entity.curHp) + maxHpMod);
								}
							} else if(maxHpMod < 0) {
								//if the new mod is negative,
								//but the current is positive, still substract current
								if(entity.maxHpMod > 0) {
									entity.curHp = parseInt(parseInt(entity.curHp) - entity.maxHpMod);
								}
							}
						}
						entity.maxHpMod = maxHpMod; //to store new in firebase

						//CurHp can never be > maxHp
						if(entity.curHp > (player.maxHp + entity.maxHpMod)) {
							entity.curHp = parseInt(player.maxHp + entity.maxHpMod);
						}

						// Update curHp & maxHpMod
						for(const property of ["curHp", "maxHpMod"]) {
							await this.update_campaign_entity({ 
								uid: this.user.uid,
								campaignId: this.campaignId,
								type: "players",
								id: key,
								property,
								value: entity[property]
							});
						}
					}
				}
				this.tempHp = undefined;
				this.maxHpMod = undefined;
				this.setSlide(false);
			}
		}
	};
</script>