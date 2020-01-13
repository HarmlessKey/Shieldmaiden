<template>
	<div>
		<p v-if="targeted.length === 0">No target selected</p>
		<template v-else>
			<p v-if="targeted.length === 1"><i class="fas fa-crosshairs gray-hover"></i> Target: <b class="blue">{{ entities[targeted[0]].name }}</b><br/>
				<i class="fas fa-shield gray-hover"></i> Armor Class: 
				<b class="blue">
					<span :class="{ 
							'green': entities[targeted[0]].ac_bonus > 0, 
							'red': entities[targeted[0]].ac_bonus < 0 
						}" v-b-tooltip.hover :title="'Armor Class + ' + entities[targeted[0]].ac_bonus" v-if="entities[targeted[0]].ac_bonus">
						{{ displayStats(entities[targeted[0]]).ac + entities[targeted[0]].ac_bonus}}
					</span>
					<span v-else>{{ displayStats(entities[targeted[0]]).ac }}</span>
				</b>
			</p>
			<b-form-checkbox class="mb-2" name="crit" v-model="crit">Critical hit</b-form-checkbox>

			<!-- <select class="form-control mb-2" v-model="damageType" name="damageType">
				<option value="">Type of damage...</option>
				<option value="acid">Acid</option>
				<option value="bludgeoning">Bludgeoning</option>
				<option value="cold">Cold</option>
				<option value="fire">Fire</option>
				<option value="force">Force</option>
				<option value="lightning">Lightning</option>
				<option value="necrotic">Necrotic</option>
				<option value="piercing">Piercing</option>
				<option value="poison">Poison</option>
				<option value="psychic">Psychic</option>
				<option value="radiant">Radiant</option>
				<option value="slashing">Slashing</option>
				<option value="thunder">Thunder</option>
			</select> -->

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
					@click="setManual('damage')"
				>
					Attack
					<img src="@/assets/_img/styles/sword-break.png" />
				</button>
				<button class="btn heal bg-green" 
					:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
					@click="setManual('healing')"
				>
					Heal
					<img src="@/assets/_img/styles/heal.png" />
				</button>
			</div>
			<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p>
			<h2 class="mt-2 text-center">{{ manualAmount }}</h2>
			
			<ul class="select-amount">
				<li v-for="key in targeted" :key="`target-${key}`">
					<div class="name truncate">{{ entities[key].name }}</div>
					<div class="selections">
						<div 
							class="select bg-gray-hover" 
							:class="{'bg-blue': intensity[key] === 'half'}"
							@click="setIntensity(key, 'half')"
						>
							Half
						</div>
						<div 
							class="select bg-gray-hover" 
							:class="{'bg-blue': intensity[key] === 'full'}"
							@click="setIntensity(key, 'full')"
						>
							Full
						</div>
						<div 
							class="select bg-gray-hover"
							:class="{'bg-blue': intensity[key] === 'double'}"
							@click="setIntensity(key, 'double')"
						>
							Double
						</div>
					</div>
				</li>
			</ul>
		</template>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';

	export default {

		name: 'Actions',
		mixins: [setHP],
		props: ['current'],
		data: function() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				manualAmount: '',
				damageType: '',
				crit: false,
				log: undefined,
				intensitySetter: undefined
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
			]),
			intensity: {
				get() {		
					let returnValue = {}
					for(let i in this.targeted) {
						returnValue[this.targeted[i]] = 'full';
					}
					return (this.intensitySetter) ? this.intensitySetter : returnValue;
				},
				set(newValue) {
					this.intensitySetter = newValue;
					return newValue;
				}	
			}
		},
		watch: {
			targeted(newTargets) {
				let newIntensity = this.intensity;

				//Add new targets to intensity list
				for(let i in newTargets) {
					let key = newTargets[i];

					if(!Object.keys(this.intensity).includes(key)) {
						this.$set(newIntensity, key, 'full')
					}
					this.intensity = newIntensity;
				}
				//Remove untargeted from intensity list
				for(let key in newIntensity) {

					if(!newTargets.includes(key)) {
						delete newIntensity[key];
					}
					this.intensity = newIntensity;
				}
			}
		},
		methods: {
			displayStats(entity) {
				var stats;
				if(entity.transformed == true) {
					stats = {
						ac: entity.transformedAc,
						maxHp: entity.transformedMaxHp,
						curHp: entity.transformedCurHp,
					}
				}
				else {
					stats = {
						ac: entity.ac,
						maxHp: entity.maxHp,
						curHp: entity.curHp,
					}
				}
				return stats
			},
			setIntensity(key, intensity) {
				let newIntensity = this.intensity;
				newIntensity[key] = intensity;

				this.intensity = newIntensity;
			},
			submitManual(e) {
				if(e.key === 'Enter' && e.shiftKey) {
					this.setManual('healing');
				} else if(e.key === 'Enter') {
					this.setManual('damage');
				}
			},
			setManual(type) {
				this.$validator.validateAll().then((result) => {
					if(result && this.manualAmount != '') {

						//Update HP
						for(let i in this.targeted) {
							let key = this.targeted[i];
							let amount = parseInt(this.manualAmount);

							//Half or doulbe amount
							if(this.intensity[key] === 'half') {
								amount = Math.floor(amount / 2);
							}
							if(this.intensity[key] === 'double') {
								amount = amount * 2;
							}

							this.setHP(amount, this.crit, this.entities[key], this.current, type)
						}

						//Reset input fields
						this.manualAmount = '';
						this.damageType = '';
						this.crit = false;
					}
					else {
						//console.log('Not Valid');
					}
				})
			},
		},
	}
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
ul.select-amount {
	list-style: none;
	padding: 0;

	li {
		display: grid;
		grid-template-columns: 1fr max-content;
		background-color: #191919;
		margin-bottom: 1px;

		.name {
			padding: 5px;
		}
		.selections {
			display: flex;
			justify-content: flex-end;

			.select {
				padding: 0 5px;
				margin-right: 1px;
				line-height: 28px;
				color: #fff;
				user-select: none;
				cursor: pointer;

				&:last-child {
					margin: 0;
				}
			}
		}
	}
}
</style>