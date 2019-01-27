<template>
	<div class="tab-pane fade show active" id="manual" role="tabpanel" aria-labelledby="manual-tab">
		<p v-if="!target" class="red">No target selected</p>
		<template v-else>
			<p>Target: <b class="blue">{{ target.name }}</b></p>
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
				<input type="number" 
					v-model="manualAmount" 
					v-validate="'numeric'" 
					name="Manual Input" 
					min="0"
					class="form-control manual-input">
				<button class="btn dmg bg-red" 
					:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
					@click="setManual(target, 'damage')">
					<i class="fas fa-minus-square"></i>
				</button>
				<button class="btn heal bg-green" 
					:class="{disabled: errors.has('Manual Input') || manualAmount == ''}" 
					@click="setManual(target, 'healing')">
					<i class="fas fa-plus-square"></i>
				</button>
			</div>
			<p class="validate red" v-if="errors.has('Manual Input')">{{ errors.first('Manual Input') }}</p>
		</template>
	</div>
</template>

<script>
	import firebase from 'firebase'
	import { db } from '@/firebase'
	import { mapGetters, mapActions } from 'vuex'

	import { setHP } from '@/mixins/HpManipulations.js'

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
				log: undefined
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted',
			]),
			target: function() {
				return this.entities[this.targeted]
			}
		},
		methods: {
			setManual(target, type) {
				this.$validator.validateAll().then((result) => {
					if(result && this.manualAmount != '') {

						//Update HP
						this.setHP(this.manualAmount, this.crit, target, this.current, type)

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
}
</style>