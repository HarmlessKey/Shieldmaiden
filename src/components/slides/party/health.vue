<template>
	<div>
		<h2>Health Modifiers</h2>
		<b-row>
			<b-col class="text-center">
				<label>Temp HP</label>
				<b-form-input 
					class="text-center"
					type="number" 
					name="tempHp" 
					v-model="tempHp"
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
		
		<b-form-group label="Change for:">
				<b-form-checkbox
				v-model="allSelected"
				:indeterminate="indeterminate"
				aria-describedby="flavours"
				aria-controls="flavours"
				@change="toggleAll"
				>
					{{ allSelected ? "Un-select All" : "Select All" }}
				</b-form-checkbox>

			<b-form-checkbox-group
				class="ml-4"
				id="players"
				name="players"
				v-model="setFor"
				stacked
			>
				<b-form-checkbox :value="key" v-for="(player, key) in campaign.players" :key="key">			
					{{ players[key].character_name  }} 
				</b-form-checkbox>
			</b-form-checkbox-group>
		</b-form-group>

		<button class="btn btn-block my-3" @click="setHpModifiers()">Update health</button>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapGetters, mapActions } from 'vuex'

	export default {
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				tempHp: undefined,
				maxHpMod: undefined,
				awardHp: undefined,
				allSelected: true,
				indeterminate: false,
				options: [
					{ text: 'Divide over', value: 'divide' },
					{ text: 'Award to all', value: 'toAll' },
				],
				awardType: 'divide'
			}
		},
		computed: {
			...mapGetters([
				'campaign',
				'players'
			]),
			allPlayers() {
				let returnArray = [];
	
				for(let key in this.campaign.players) {
					returnArray.push(key)
				}
				return returnArray;
			},
			setFor: {
				get() {
					return (this.awardHp) ? this.awardHp : this.allPlayers;
				},
				set(newValue) {
					this.awardHp = newValue;
					return newValue;
				}
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
			...mapActions([
				'setSlide',
			]),
			toggleAll(checked) {
				this.awardTo = checked ? this.allPlayers : [];
			},
			setHpModifiers() {
				if(this.tempHp !== undefined) {
					for(let i in this.setFor) {
						let key = this.setFor[i];
						db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}/tempHp`).set(this.tempHp);
					}
				}
				if(this.maxHpMod !== undefined) {
					this.maxHpMod = parseInt(this.maxHpMod);
					for(let i in this.setFor) {
						let key = this.setFor[i];
						let entity = this.campaign.players[key];

						//Modify curHP with maxHpMod
						if(entity.maxHpMod === 0) {
							//If the there was no current mod
							//only modify curHp if maxHpMod = positive
							if(this.maxHpMod > 0) {
								entity.curHp = parseInt(parseInt(entity.curHp) + this.maxHpMod);
							}
						} else if(this.maxHpMod === 0) {
							//if the new mod is 0, check if the old mod was positive
							//If so, remove it from the curHp
							if(entity.maxHpMod > 0) {
								entity.curHp = parseInt(parseInt(entity.curHp) - entity.maxHpMod);
							}
						} else {
							//If the new mod is positive
							if(this.maxHpMod > 0) {
								//check if the current mod was positive to0
								if(entity.maxHpMod > 0) {
									//if so, first substract current mod, then add new
									entity.curHp = parseInt(parseInt(entity.curHp) - entity.maxHpMod + this.maxHpMod);
								} else {
									//else only add the new mod
									entity.curHp = parseInt(parseInt(entity.curHp) + this.maxHpMod);
								}
							} else if(this.maxHpMod < 0) {
								//if the new mod is negative,
								//but the current is positive, still substract current
								if(entity.maxHpMod > 0) {
									entity.curHp = parseInt(parseInt(entity.curHp) - entity.maxHpMod);
								}
							}
						}
						entity.maxHpMod = this.maxHpMod; //to store new in firebase

						//CurHp can never be > maxHp
						if(entity.curHp > (this.players[key].maxHp + entity.maxHpMod)) {
							entity.curHp = parseInt(this.players[key].maxHp + entity.maxHpMod);
						}

						//Update Firebase apart from store, cause it can be edited where there is no store.
						db.ref(`campaigns/${this.user.uid}/${this.campaignId}/players/${key}`).update(entity);
					}
				}
				this.tempHp = undefined;
				this.maxHpMod = undefined;
				this.setSlide(false);
			}
		}
	};
</script>

<style lang="scss">
	.btn-group {
		width: 100%;

		label.btn {
			width: 50% !important;
		}
	}
</style>