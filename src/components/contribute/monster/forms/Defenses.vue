<template>
	<div>
		<hk-card header="Resistances & Vulnerabilities">
			<q-select 
				v-for="type in ['damage_vulnerabilities', 'damage_resistances', 'damage_immunities']"
				dark filled square
				:label="`Damage ${type.split('_')[1]}`"
				autocomplete="off"  
				class="mb-3" 
				multiple
				:options="damage_types"
				v-model="npc[type]" 
				:key="type"
				:hint="resistanceInfo(type)"
			>
				<template v-slot:option="scope">
					<q-item
						clickable
						v-ripple
						:active="npc[type] && npc[type].includes(scope.opt)"
						@click="setResistance(type, scope.opt)"
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

			<q-select 
				dark filled square
				label="Condition immunities"
				autocomplete="off"  
				type="text" 
				class="mb-2" 
				multiple
				:options="condition_list"
				v-model="npc.condition_immunities" 
				name="condition_immunities" 
			/>
		</hk-card>
	</div>
</template>

<script>
	import { conditions } from '@/mixins/conditions.js';
	import { damage_types } from '@/mixins/damageTypes.js';

	export default {
		name: 'npc-Defenses',
		props: ['value'],
		mixins: [
			conditions,
			damage_types
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
			},
			condition_list() {
				return this.conditionList.map(item => {
					return item.value;
				});
			}
		},
		methods: {
			resistanceInfo(type) {
				if(type === "damage_resistances") {
					return "Half of the damage is taken for these damage types"
				}
				if(type === "damage_vulnerabilities") {
					return "Double damage is taken for these damage types"
				}
				return "No damage is taken for these damage types"
			},
			setResistance(type, value) {
				if(!this.npc[type]) {
					this.$set(this.npc, type, [value]);
				} else if(this.npc[type].includes(value)) {
					this.$delete(this.npc[type], this.npc[type].indexOf(value));
				} else {
					this.npc[type].push(value);
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
</style>