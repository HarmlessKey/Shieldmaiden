<template>
	<div>
		<hk-card header="Ability Scores">
			<div class="card-body">
				<div class="row q-col-gutter-md mb-3" v-for="(ability, index) in abilities" :key="index">
					<div class="col-4 col-md-3">
						<q-input 
							:dark="$store.getters.theme === 'dark'" filled square
							:label="ability.capitalize()"
							autocomplete="off"  
							type="number" 
							v-model.number="npc[ability]" 
							:name="ability"
							@input="parseToInt($event, npc, ability)"
							:rules="[
								val => !!val || 'Required',
								val => val <= 99 || 'Max is 99'
							]"
						>
							<template #append>
								{{ npc[ability] !== undefined 
								? calcMod(npc[ability]) &lt;= 0 ? calcMod(npc[ability]) : `+${calcMod(npc[ability])}` 
								: '' }}
							</template>
						</q-input>
					</div>
					<div class="col pt-4">
						<q-checkbox 
							:dark="$store.getters.theme === 'dark'" 
							v-model="npc.saving_throws" 
							:val="ability"
							:false-value="null" 
							indeterminate-value="something-else" 
							label="Saving throw proficiency"
							@input="$forceUpdate()"
						>
							<q-tooltip anchor="top middle" self="center middle">
								Saving throw proficiency
							</q-tooltip>
						</q-checkbox>
					</div>
				</div>
			</div>
		</hk-card>
	</div>
</template>

<script>
	import { general } from '@/mixins/general.js';
	import { abilities } from '@/mixins/abilities.js';

	export default {
		name: 'npc-AbilityScores',
		props: ['value'],
		mixins: [
			general,
			abilities
		],
		data() {
			return {
			}
		},
		computed: {
			npc: {
				get() {
					let value = this.value;
					if(!value.saving_throws) value.saving_throws = [];
					return value;
				},	
				set(newValue) {
					this.$emit('input', newValue);
				}
			}
		},
		methods: {
			parseToInt(value, object, property) {
			if(value === undefined || value === "") {
					this.$delete(object, property);
				} else {
					this.$set(object, property, parseInt(value));
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>