<template>
	<div>
		<div class="type d-flex justify-content-between">
			<button class="btn bg-neutral-4 mb-3" :class="{ 'bg-red': type === 'damage' }" @click="type = 'damage'">
				Damage <i aria-hidden="true" class="hki-sword-break" />
			</button>
			<button class="btn bg-neutral-4 mb-3" :class="{ 'bg-green': type === 'healing' }" @click="type = 'healing'">
				Healing <i aria-hidden="true" class="hki-heal" />
			</button>
		</div>

		<template v-if="type === 'damage'">
			<ValidationObserver v-slot="{ valid }">
				<div class="damage_inputs">
					<div>Amount</div>
					<div>Type</div>
					<a @click="addInput()" class="handle"><i aria-hidden="true" class="fas fa-plus green"></i></a>
					<template v-for="(input, i) in damage">
						<ValidationProvider rules="required|numeric|min_value:0" :name="`amount-${i}`" v-slot="{ errors, invalid, validated }" :key="`damage-${i}`">
							<q-input
								:dark="$store.getters.theme === 'dark'" filled square dense
								label="Amount"		
								class="amount"
								autocomplete="off"
								type="number" 
								v-model="damage[i].amount" 
								min="0"
								:error="invalid && validated"
								:error-message="errors[0]"
							/>
						</ValidationProvider>
											
						<hk-dmg-type-select 
							v-model="damage[i].damage_type" 
							label="Damage type" 
							dense 
							:key="`type-${i}`"
							@input="$forceUpdate()"
							:class="{'no-delete': i === 0}"
						/>			
						<a v-if="i > 0" @click="removeInput(i)" class="handle" :key="`remove-${i}`"><i aria-hidden="true" class="fas fa-trash-alt red"></i></a>
					</template>
				</div>
				<button 
					class="btn btn-block" 
					@click="valid ? sendRequest(): null"
					:disabled="!valid"
					:class="{disabled: !valid}"
				>
					Send Request
				</button>
			</ValidationObserver>
		</template>

		<ValidationObserver v-if="type === 'healing'" v-slot="{ valid }">
			<ValidationProvider rules="required|numeric|min_value:0" name="Manual input`" v-slot="{ errors, invalid, validated }">
				<q-input 
					:dark="$store.getters.theme === 'dark'" filled square
					autocomplete="off"
					type="number" 
					v-model="healingAmount" 
					min="0"
					class="healing-input"
					:error="invalid && validated"
					:error-message="errors[0]"
				/>
			</ValidationProvider>
			<button 
				class="btn btn-block" 
				@click="valid ? sendRequest() : null"
				:class="{disabled: !valid}">
				Send Request
			</button>
		</ValidationObserver>


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
