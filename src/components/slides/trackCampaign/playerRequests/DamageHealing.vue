<template>
	<div>
		<!-- <div class="manual">
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
				@click="sendRequest('healing')"
			>
				Heal
				<img src="@/assets/_img/styles/heal.png" />
			</button>
		</div>
		<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p> -->

		<div class="type d-flex justify-content-between">
			<button class="btn bg-gray-hover mb-3" :class="{ 'bg-red': type === 'damage' }" @click="type = 'damage'">
				Damage <img src="@/assets/_img/styles/sword-break.png" />
			</button>
			<button class="btn bg-gray-hover mb-3" :class="{ 'bg-green': type === 'healing' }" @click="type = 'healing'">
				Healing <img src="@/assets/_img/styles/heal.png" />
			</button>
		</div>

		<template v-if="type === 'damage'">
			<div class="damage_inputs">
				<div>Amount</div>
				<div>Type</div>
				<a @click="addInput()" class="handle"><i class="fas fa-plus green"></i></a>

				<template v-for="(input, i) in damage">
					<b-form-input
						:key="`damage-${i}`"
						class="amount"
						autocomplete="off"
						type="text" 
						v-model="damage[i].amount" 
						v-validate="'required|numeric'" 
						:name="`amount-${i}`" 
						data-vv-as="amount"
						min="0"
					/>
					<select class="form-control" :class="{'no-delete': i === 0}" v-model="damage[i].damage_type" name="damage_type" :key="`type-${i}`">
						<option v-for="damage_type in damage_types" :key="`${damage_type}-${i}`" :value="damage_type">
							{{ damage_type }}
						</option>
					</select>
					<a v-if="i > 0" @click="removeInput(i)" class="handle" :key="`remove-${i}`"><i class="fas fa-trash-alt red"></i></a>

					<p class="validate red" v-if="errors.has(`amount-${i}`)" :key="`validate-${i}`">{{ errors.first(`amount-${i}`) }}</p>
				</template>
			</div>
			<button 
				class="btn btn-block" 
				@click="sendRequest()"
				:disabled="errors.items && errors.items.length > 0"
				:class="{disabled: errors.items && errors.items.length > 0}"
			>
				Send Request
			</button>
		</template>

		<template v-if="type === 'healing'">
			<b-form-input 
				autocomplete="off"
				type="text" 
				v-model="healingAmount" 
				v-validate="'numeric'" 
				name="Manual Input" 
				min="0"
				class="healing-input"
			/>
			<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p>
			<button 
				class="btn btn-block" 
				@click="sendRequest()"
				:class="{disabled: errors.has('Manual Input') || healingAmount == ''}">
				Send Request
			</button>
		</template>


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
				damage_types: [
				"Acid",
				"Bludgeoning",
				"Cold",
				"Fire",
				"Force",
				"Lightning",
				"Necrotic",
				"Piercing",
				"Poison",
				"Psychic",
				"Radiant",
				"Slashing",
				"Thunder"
				],
				type: 'damage',
				damage: [
					{
						amount: '',
						damage_type: 'Acid'
					}
				],
				healingAmount: '',
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
			addInput() {
				this.damage.push({ amount: '', damage_type: 'Acid' });
			},
			removeInput(i) {
				this.$delete(this.damage, i);
				this.$forceUpdate();
			},
			sendRequest() {
				this.$validator.validateAll().then((result) => {
					if(result && this.manualAmount != '') {
						let results = {};

						if(this.type === 'healing') {
							results = {
								amount: this.healingAmount,
								damage_type: 'healing'
							}
						}
						if(this.type === 'damage') {
							results = this.damage;
						}

						//Create a request
						const request = {
							timestamp: Date.now(),
							username: this.userInfo.username,
							round: this.round,
							turn: this.turn,
							player: this.player,
							targets: this.targeted,
							results,
							type: this.type
						};

						console.log(request);

						this.$snotify.success(
							`Your ${this.type} request was successfuly sent.`, 
							`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} request`, 
							{ position: "centerTop" }
						);
					}
				});
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
	.type {
		.btn {
			width: 48%;
			position: relative;

			img {
				display: inline-block;
				height: 20px;
			}
		}
	}
	.damage_inputs {
		display: grid;
		grid-template-columns: 80px 1fr 25px;
		grid-auto-rows: max-content;
		line-height: 38px;
		grid-gap: 4px;
		margin-bottom: 15px;

		.amount {
			text-align: center;
		}
		.handle {
			text-align: center;
		}
		.no-delete {
			grid-column: span 2;
		}
		.validate {
			grid-column: span 3;
			line-height: 20px;
			margin: 0;
		}
	}
	.healing-input {
		height: 90px;
		margin-bottom: 15px;
		font-size:50px;
		text-align: center;
	}
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
