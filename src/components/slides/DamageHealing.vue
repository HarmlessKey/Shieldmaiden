<template>
	<div class="pb-5">
		<h2>Damage / heal <span class="blue">{{ target.name }}</span></h2>

		<select class="form-control" 
			v-model="doneBy" 
			name="doneBy"
			v-validate="'required'">
			<option value="">Done by...</option>
			<option v-for="entity in _active" :value="entity">{{ entity.name }}</option>
		</select>
		<p class="validate red" v-if="errors.has('doneBy')">{{ errors.first('doneBy') }}</p>

		<p class="mt-3">Target: <b class="blue">{{ target.name }}</b><br/>
		Target AC: <b class="blue">{{ target.ac }}</b></p>
		<b-form-checkbox class="mb-2" name="crit" v-model="crit">Critical hit</b-form-checkbox>
		<b-form-checkbox class="mb-2" name="log" v-model="log">Log</b-form-checkbox>

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
	</div>
</template>

<script>
	import { db } from '@/firebase'
	import { mapActions, mapGetters } from 'vuex'
	import { setHP } from '@/mixins/HpManipulations.js'

	export default {
		name: 'damageHealing',
		mixins: [setHP],
		props: [
		'target',
		],
		data() {
			return {
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				doneBy: '',
				manualAmount: '',
				damageType: '',
				crit: false,
				log: true,
			}
		},
		computed: {
			...mapGetters([
				'entities',
			]),
			_active: function() {
				return _.chain(this.entities)
				.filter(function(entity, key) {
					entity.key = key
					return !entity.down;
				})
				.sortBy('name' , 'asc')
				.value()
			},
		},
		methods: {
			...mapActions([
				'set_hp',
			]),
			setManual(target, type) {
				this.$validator.validateAll().then((result) => {
					if(result && this.manualAmount != '') {

						//Update HP
						this.setHP(this.manualAmount, this.crit, target, this.doneBy, type, this.log)

						//Reset input fields
						this.manualAmount = '';
						this.doneBy = '';
						this.damageType = '';
						this.crit = false;
						this.$validator.reset();
					}
					else {
						//console.log('Not Valid');
					}
				})
			},
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
	}
	
</style>
