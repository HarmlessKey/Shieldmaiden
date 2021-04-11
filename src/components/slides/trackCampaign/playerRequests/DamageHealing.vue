<template>
	<div>
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
					<q-input
						dark filled square dense
						label="Amount"
						:key="`damage-${i}`"
						class="amount"
						autocomplete="off"
						type="number" 
						v-model="damage[i].amount" 
						v-validate="'required|numeric'" 
						:name="`amount-${i}`" 
						data-vv-as="amount"
						min="0"
					/>

					<hk-dmg-type-select 
						v-model="damage[i].damage_type" 
						label="Damage type" 
						dense 
						:key="`type-${i}`"
						@input="$forceUpdate()"
						:class="{'no-delete': i === 0}"
					/>
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
			<q-input 
				dark filled square
				autocomplete="off"
				type="number" 
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
	import { db } from '@/firebase';
	import { mapActions, mapGetters } from 'vuex';
	
	export default {
		name: 'damageHealing',
		props: [
		'targeted',
		'player',
		'encounter'
		],
		data() {
			return {
				userId: this.$store.getters.user.uid,
				dmId: this.$route.params.userid,
				campaignId: this.$route.params.campid,
				damage_types: [
					"acid",
					"bludgeoning",
					"cold",
					"fire",
					"force",
					"lightning",
					"necrotic",
					"piercing",
					"poison",
					"psychic",
					"radiant",
					"slashing",
					"thunder"
				],
				type: 'damage',
				damage: [
					{
						amount: '',
						damage_type: 'acid'
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
			...mapActions([
				'setSlide'
			]),
			addInput() {
				this.damage.push({ amount: '', damage_type: 'acid' });
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
							results = [{
								amount: this.healingAmount,
								damage_type: 'healing'
							}]
						}
						if(this.type === 'damage') {
							results = this.damage;
						}

						//Create a request
						const request = {
							timestamp: Date.now(),
							username: this.userInfo.username,
							round: this.encounter.round,
							turn: this.encounter.turn,
							player: this.player,
							targets: this.targeted,
							results,
							type: this.type
						};

						db.ref(`encounters/${this.dmId}/${this.campaignId}/${this.encounter.key}/requests`).push(request);

						this.$snotify.success(
							`Your ${this.type} request was successfuly sent.`, 
							`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} request`, 
							{ position: "centerTop" }
						);
						this.setSlide({show: false});
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
		font-size:25px;
	}
	
</style>
