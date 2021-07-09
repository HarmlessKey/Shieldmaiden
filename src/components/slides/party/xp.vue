<template>
	<div>
		<h2>Award Experience</h2>
		<q-input 
			dark filled square
			label="Amount"
			class="text-center mb-3"
			type="number" 
			name="amount" 
			v-model="amount"
		/>

		<h3 class="mt-3">Award experience to:</h3>
		<div v-for="(player, key) in campaign.players" :key="key">
			<q-checkbox 
				dark
				v-model="awardTo" 
				:val="key" 
			>
				{{ players[key].character_name }}
				<span v-if="amount && awardTo.includes(key)" class="ml-2 blue">
					({{ ((awardPlayer() &lt; 0) ? "" : "+") + awardPlayer() }})
				</span>
			</q-checkbox>
		</div>

		<q-btn-toggle
			v-model="awardType"
			spread
			no-caps
			flat
			dark
			:options="options"
			toggle-color="primary"
			class="mt-3"
		/>

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
				user: this.$store.getters.user,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				amount: this.data.amount,
				awardXp: this.data.entities,
				allSelected: true,
				indeterminate: false,
				options: [
					{ label: 'Divide over', value: 'divide' },
					{ label: 'Award to all', value: 'toAll' },
				],
				awardType: 'divide'
			}
		},
		computed: {
			...mapGetters([
				'campaign',
				'players',
				'broadcast'
			]),
			share() {
				return (this.broadcast.shares && this.broadcast.shares.includes("xp")) || false;
			},
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

				// Share
				if(this.share && amount !== 0) {
					const key = Date.now() + Math.random().toString(36).substring(4);
					let share = {
						key,
						type: "xp",
						notification: {
							amount,
							targets: this.awardTo
						}
					};
					if(this.$route.name === 'RunEncounter') share.encounter_id = this.encounterId;

					db.ref(`campaigns/${this.user.uid}/${this.broadcast.live}/shares`).set(share);
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
				//In the finished encounter screen, set xp_awarded to true
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