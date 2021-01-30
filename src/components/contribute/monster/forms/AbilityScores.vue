<template>
	<div>
		<hk-card header="Ability Scores">
			<div class="row q-col-gutter-md">
				<div v-for="(ability, index) in abilities" :key="index" class="col-6 col-md-2 mb-2">
					<q-input 
						dark filled square
						:label="ability.capitalize()"
						autocomplete="off"  
						type="number" 
						v-model="npc[ability]" 
						:name="ability"
						:suffix="
							npc[ability] !== undefined 
							? `(${calcMod(npc[ability]) <= 0 ? calcMod(npc[ability]) : `+${calcMod(npc[ability])}` })` 
							: ''"
					>
						<q-checkbox 
							slot="append"
							size="xs" 
							dark 
							v-model="npc.saving_throws" 
							:val="ability"
							:false-value="null" 
							indeterminate-value="something-else" 
						>
							<q-tooltip anchor="top middle" self="center middle">
								Saving throw proficiency
							</q-tooltip>
						</q-checkbox>
					</q-input>
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
					return this.value;
				},	
				set(newValue) {
					this.$emit('input', newValue);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>