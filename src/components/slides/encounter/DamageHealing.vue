<template>
	<div>
		<h2>Damage / heal</h2>

		<ul class="targets">
			<li v-for="(target, i) in targeted" :key="`target=${i}`">
				<TargetItem  :item="target" :i="i" />
			</li>
		</ul>

		<p>Action performed by:</p>
		<q-select 
			dark filled square dense
			name="doneBy"
			:value="doneBy" 
			:options="_active"
			v-validate="'required'"
		>
			<template v-slot:selected>
				<q-item v-if="doneBy" class="selected">
					<q-item-section avatar>
						<icon v-if="['monster', 'player', 'companion'].includes(entities[doneBy].img)" class="img" :icon="entities[doneBy].img" :fill="entities[doneBy].color_label" :style="entities[doneBy].color_label ? `border-color: ${entities[doneBy].color_label}` : ``" />
						<span 
							v-else 
							class="img" 
							:style="{
								'background-image': 'url(' + entities[doneBy].img + ')',
								'border-color': entities[doneBy].color_label ? entities[doneBy].color_label : ``
							}
						"/>
					</q-item-section>
					<q-item-section>
						<q-item-label v-html="entities[doneBy].name"/>
					</q-item-section>
				</q-item>
				<span v-else>
					Who performs the action?
				</span>
			</template>
			<template v-slot:option="scope">
				<q-item
					clickable
					v-ripple
					v-close-popup
					:active="doneBy === scope.opt.key"
					@click="doneBy = scope.opt.key"
				>
					<q-item-section avatar>
						<icon v-if="['monster', 'player', 'companion'].includes(scope.opt.img)" class="img" :icon="scope.opt.img" :fill="scope.opt.color_label" :style="scope.opt.color_label ? `border-color: ${scope.opt.color_label}` : ``" />
						<span 
							v-else 
							class="img" 
							:style="{
								'background-image': 'url(' + scope.opt.img + ')',
								'border-color': scope.opt.color_label ? scope.opt.color_label : ``
							}
						"/>
					</q-item-section>
					<q-item-section>
						<q-item-label v-html="scope.opt.name"/>
					</q-item-section>
				</q-item>
			</template>
		</q-select>
		<p class="validate red" v-if="errors.has('doneBy')">{{ errors.first('doneBy') }}</p>

		<!-- <select class="form-control" 
			v-model="doneBy" 
			name="doneBy"
			v-validate="'required'">
			<option value="" disabled>Done by...</option>
			<option :value="environment">Environment</option>
			<option v-for="(entity, index) in _active" :value="entity" :key="index">{{ entity.name }}</option>
		</select> -->
		
		<Actions class="mt-3" v-if="doneBy" :settings="settings" :current="entities[doneBy]" location="side"/>
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
					key: "environment",
					name: "Environment"
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

	.q-item.selected {
		padding: 0;
		min-height: 35px !important;
		line-height: 35px !important
	}

	.img {
		display: block;
		width: 35px;
		height: 35px;
		background-size: cover;
		background-position: top center;
		border: solid 1px #b2b2b2;
	}
	
	
	
</style>
