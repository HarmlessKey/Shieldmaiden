<template>
	<div>
		<h2>Damage / heal</h2>

		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>

		<label>Damage done by</label>
		<select class="form-control" 
			v-model="doneBy" 
			name="doneBy"
			v-validate="'required'">
			<option value="" disabled>Done by...</option>
			<option :value="environment">Environment</option>
			<option v-for="(entity, index) in _active" :value="entity" :key="index">{{ entity.name }}</option>
		</select>
		<p class="validate red" v-if="errors.has('doneBy')">{{ errors.first('doneBy') }}</p>
		
		<Actions class="mt-3" v-if="doneBy" :settings="settings" :current="doneBy" location="side"/>
	</div>
</template>

<script>
	import _ from 'lodash';
	import { mapActions, mapGetters } from 'vuex';
	import { setHP } from '@/mixins/HpManipulations.js';
	import Actions from '@/components/combat/actions/Actions.vue';
	import TargetItem from '@/components/combat/TargetItem.vue';

	export default {
		name: 'damageHealing',
		mixins: [setHP],
		components: {
			Actions: Actions,
			TargetItem
		},
		props: [
		'data',
		],
		data() {
			return {
				target: this.data,
				userId: this.$store.getters.getUser.uid,
				campaignId: this.$route.params.campid,
				encounterId: this.$route.params.encid,
				doneBy: '',
				manualAmount: '',
				damageType: '',
				crit: false,
				log: true,
				environment: {
					key: 'environment'
				},
			}
		},
		computed: {
			...mapGetters([
				'entities',
				'targeted'
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
	ul.targets {
		list-style: none;
		padding: 0;

		li {
			margin-bottom: 2px !important;
			border: solid 1px transparent;
			background: #191919;
		}
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
