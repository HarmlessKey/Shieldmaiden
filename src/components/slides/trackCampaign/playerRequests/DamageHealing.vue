<template>
	<div>
		<h2>Damage / heal</h2>
		<div class="manual">
			<input type="text" 
				v-model="manualAmount" 
				v-validate="'numeric'" 
				name="Manual Input" 
				min="0"
				class="form-control manual-input"
				@keypress="submitManual($event)"
				v-b-tooltip.hover
				title="Enter=Damge, Shift+Enter=Healing"
			>
			<button class="btn dmg bg-red" 
				:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
				@click="sendRequest('damage')"
			>
				Attack
				<img src="@/assets/_img/styles/sword-break.png" />
			</button>
			<button class="btn heal bg-green" 
				:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
				@click="sendManual('healing')"
			>
				Heal
				<img src="@/assets/_img/styles/heal.png" />
			</button>
		</div>
			<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p>
		
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapActions, mapGetters } from 'vuex';
	import Manual from '@/components/combat/actions/Manual.vue';
	
	export default {
		name: 'damageHealing',
		components: {
			Manual,
		},
		props: [
		'targeted',
		'player'
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				doneBy: '',
				manualAmount: '',
				damageType: '',
				crit: false,
				log: true
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
			]),
		},
		methods: {
			submitManual(e) {
				if(e.key === 'Enter' && e.shiftKey) {
					this.sendRequest('healing');
				} else if(e.key === 'Enter') {
					this.sendRequest('damage');
				}
			},
			sendRequest(type) {
				//Create a request
				const request = {
					username: this.userInfo.username,
					round: this.round,
					turn: this.turn,
					player: this.player,
					targets: this.targeted,
					amount: this.manualAmount,
					type
				};

				console.log(request)

			},
			displayNPCField(field, entity) {
				const defaults = {name: true, health: false, ac: false};
				if (entity.settings && entity.settings[field] !== undefined) 
					return entity.settings[field];

				else if (this.npcSettings[field] == undefined)
					return defaults[field]; // Default value

				else 
					return this.npcSettings[field];
			}
		}
	};
</script>

<style lang="scss" scoped>
	.manual {
		display:grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 40px 40px;
		grid-gap: 10px;
		grid-template-areas: 
		"input btn-dmg"
		"input btn-heal";

		.manual-input {
			height:90px;
			font-size:50px;
			text-align: center;
			grid-area: input;
		}
		.heal {
			grid-area: btn-heal;
		}
		.dmg {
			grid-area: btn-dmg;
		}
		.dmg, .heal {
			position: relative;
			padding: 5px 35px 5px 5px;

			img {
				position: absolute;
				height: 25px;
				right: 5px;
			}
		}
	}
	
</style>
