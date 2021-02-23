<template>
	<div>
		<p v-if="targeted.length === 0" class="red">No target selected</p>
		<template v-else>
			<q-checkbox dark v-model="crit" label="Critical hit" indeterminate-value="something-else" />

				<q-select 
					dark filled square dense
					clearable
					map-options
					emit-value
					placeholder="Damage type"
					:options="damage_types"
					v-model="damage_type"
					class="mb-2"
				>
					<template v-slot:selected>
						<span v-if="damage_type">
							<i :class="[damage_type_icons[damage_type], damage_type]"/>
							{{ damage_type.capitalize() }} damage
						</span>
						<span v-else>
							Damage type
						</span>
					</template>
					<template v-slot:option="scope">
						<q-item
							clickable
							v-ripple
							v-close-popup
							:active="damage_type === scope.opt"
							@click="damage_type = scope.opt"
						>
							<q-item-section avatar>
								<q-icon :name="damage_type_icons[scope.opt]" :class="scope.opt"/>
							</q-item-section>
							<q-item-section>
								<q-item-label v-html="scope.opt.capitalize()"/>
							</q-item-section>
						</q-item>
					</template>
				</q-select>

			<div class="manual">
				<q-input 
					dark filled square
					type="number" 
					v-model="manualAmount" 
					v-validate="'numeric'" 
					name="Manual Input" 
					min="0"
					class="manual-input"
					@keypress="submitManual($event)"
					autocomplete="off" 
				/>
				<button class="btn dmg bg-red" 
					:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
					@click="setManual('damage')"
				>
					Attack
					<img src="@/assets/_img/styles/sword-break.png" />
					<q-tooltip anchor="center right" self="center left">
						Enter
					</q-tooltip>
				</button>
				<button class="btn heal bg-green" 
					:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
					@click="setManual('healing')"
				>
					Heal
					<img src="@/assets/_img/styles/heal.png" />
					<q-tooltip anchor="center right" self="center left">
						Shift + Enter
					</q-tooltip>
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
	import { damage_types } from '@/mixins/damageTypes.js';

	export default {
		name: 'Manual',
		mixins: [setHP, damage_types],
		props: ['current', 'targeted'],
		data: function() {
			return {
				userId: this.$store.getters.user ? this.$store.getters.user.uid : undefined,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				manualAmount: '',
				damage_type: '',
				crit: false,
				log: undefined,
				intensitySetter: undefined
			}
		},
		computed: {
			...mapGetters([
				'entities'
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
							let amount = {};
							amount[type] = parseInt(this.manualAmount);

							//Half or doulbe amount
							if(this.intensity[key] === 'half') {
								amount = Math.floor(amount / 2);
							}
							if(this.intensity[key] === 'double') {
								amount = amount * 2;
							}

							// Set config for HpManipulation and log
							const config = {
								crit: this.crit,
								ability: "hk-manual",
								log: true,
								actions: [
									{
										type,
										manual: true,
										rolls: [
											{
												damage_type: this.damage_type,
												value: amount[type]
											}
										]
									}
								]
							};

							this.setHP(amount, this.entities[key], this.current, config)
						}

						//Reset input fields
						this.manualAmount = '';
						this.damage_type = '';
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
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 40px 40px;
	grid-gap: 10px;
	grid-template-areas: 
	"input btn-dmg"
	"input btn-heal";

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
		background-color:$gray-dark;
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
				color:$white;
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