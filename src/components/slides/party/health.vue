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
				v-model="awardTo"
				stacked
			>
				<b-form-checkbox :value="key" v-for="(player, key) in campaign.players" :key="key">			
					{{ players[key].character_name  }} 
					<span v-if="awardTo.includes(key)" class="ml-2 gray-hover">
						({{ ((awardPlayer() < 0) ? "" : "+") + awardPlayer() }})
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
	import { mapGetters } from 'vuex'

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
			awardTo: {
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
			toggleAll(checked) {
				this.awardTo = checked ? this.allPlayers : [];
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