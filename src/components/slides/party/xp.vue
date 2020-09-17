<template>
	<div>
		<h2>Award Experience</h2>
		<b-form-input 
			class="text-center mb-3"
			type="number" 
			name="amount" 
			v-model="amount"
			placeholder="Amount">
		</b-form-input>
		
		<b-form-group label="Award experience to:">
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
				v-model="awardTo"
				stacked
			>
				<b-form-checkbox :value="key" v-for="(player, key) in campaign.players" :key="key">			
					{{ players[key].character_name  }} 
					<span v-if="amount && awardTo.includes(key)" class="ml-2 gray-hover">
						({{ ((awardPlayer() &lt; 0) ? "" : "+") + awardPlayer() }})
					</span>
				</b-form-checkbox>
			</b-form-checkbox-group>
		</b-form-group>

		<b-form-group>
			<b-form-radio-group
				id="btn-radios-1"
				v-model="awardType"
				:options="options"
				buttons
				name="radios-btn-default"
			></b-form-radio-group>
		</b-form-group>

		<button class="btn btn-block my-3" @click="awardXP()">Award XP</button>
	</div>
</template>

<script>
	import { db } from '@/firebase';
	import { mapGetters, mapActions } from 'vuex'

	export default {
		props: {
			data: {
				type: Object,
				default: function () {
					return {
						amount: undefined,
						entities: undefined
					}
				}
			},
		},
		data() {
			return {
				user: this.$store.getters.getUser,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				amount: this.data.amount,
				awardXp: this.data.entities,
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
			awardTo: {
				get() {
					return (this.awardXp) ? this.awardXp : this.allPlayers;
				},
				set(newValue) {
					this.awardXp = newValue;
					return newValue;
				}
			}
		},
		watch: {
			awardTo(newVal) {
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
			awardPlayer() {
				let amount = this.amount;

				if(this.awardType === 'divide') {
					amount = Math.floor(this.amount / this.awardTo.length)
				}
				return parseInt(amount);
			},
			awardXP() {
				let amount = parseInt(this.amount);

				if(this.awardType === 'divide') {
					amount = Math.floor(this.amount / this.awardTo.length)
				}

				// AWARD XP
				for(let index in this.awardTo) {
					let key = this.awardTo[index];
					let currentAmount = (this.players[key].experience) ? parseInt(this.players[key].experience) : 0;
					let newAmount = currentAmount + amount;
					
					if(newAmount < 0) {
						newAmount = 0;
					}
					if(newAmount > 355000) {
						newAmount = 355000;
					}
					db.ref(`players/${this.user.uid}/${key}/experience`).set(newAmount);
				}
				//In the finished encounter screen, set xp_awared to true
				//And update the amount awarded if it was changed
				if(this.$route.name === 'RunEncounter') {
					if(this.amount !== this.data.amount) {
						db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/xp/overwrite`).set(this.amount);
					}
					db.ref(`encounters/${this.user.uid}/${this.campaignId}/${this.encounterId}/xp_awarded`).set(true);
				}
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