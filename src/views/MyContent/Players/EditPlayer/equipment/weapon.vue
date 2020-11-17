<template>
	<div class="weapon">
		<q-input
			dark filled square dense
			label="Name"
			v-model="weapon.name"
			class="mb-2"
		/>

		<q-select 
			dark filled square dense
			label="Ability"
			emit-value
			map-options
			:options="abilities"
			v-model="weapon.ability"
			class="mb-3"
		/>

		<div class="mb-2">Base damage</div>
		<div class="row q-col-gutter-md mb-2">
			<div class="col">
				<q-input
					dark filled square dense
					placeholder="Base damage"
					v-model="weapon.damage"
				/>
			</div>
			<div class="col">
				<q-select 
					dark filled square dense
					placeholder="Damage type"
					emit-value
					map-options
					:options="weapon_damage_types"
					v-model="weapon.damage_type"
				/>
			</div>
		</div>

		<q-input
			dark filled square dense
			label="Versatile damage"
			v-model="weapon.versatile"
			class="mb-2"
		/>
		

		<template v-if="weapon.weapon_type.split('_')[1] === 'ranged'">
			<div class="mb-2">Range</div>
			<div class="row q-col-gutter-md mb-2">
				<div class="col">
					<q-input
						dark filled square dense
						type="number"
						label="Normal range"
						:value="weapon.range ? weapon.range.split('/')[0] : undefined"
					/>
				</div>
				<div class="col">
					<q-input
						dark filled square dense
						type="number"
						label="Long range"
						:value="weapon.range ? weapon.range.split('/')[1] : undefined"
					/>
				</div>
			</div>
		</template>

		<template v-else>
			<div class="mb-2">Thrown</div>
			<div class="row q-col-gutter-md mb-2" v-if="!weapon.range">
				<div class="col">
					<q-input
						dark filled square dense
						type="number"
						label="Normal range"
						:value="weapon.thrown ? weapon.thrown.split('/')[0] : undefined"
					/>
				</div>
				<div class="col">
					<q-input
						dark filled square dense
						type="number"
						label="Long range"
						:value="weapon.thrown ? weapon.thrown.split('/')[1] : undefined"
					/>
				</div>
			</div>
		</template>

		<div>
			<q-checkbox 
				dark 
				size="sm"
				v-model="weapon.light"
				:disable="weapon.heavy"
				:false-value="null" 
				indeterminate-value="something-else"
				label="Light"
			/>
		</div>
		<q-checkbox 
			dark 
			size="sm"
			v-model="weapon.heavy"
			:disable="weapon.light" 
			:false-value="null" 
			indeterminate-value="something-else"
			label="Heavy"
		/>		
	</div>
</template>

<script>
	import { abilities } from '@/mixins/abilities.js';
	import { damageTypes } from '@/mixins/damageTypes.js';

	export default {
		name: 'Weapon',
		mixins: [abilities, damageTypes],
		props: {
			value: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
			}
		},
		computed: {
			weapon() {
				return this.value;
			},
			weapon_damage_types() {
				return this.damage_types.filter(type => {
					return ["piercing", "slashing", "bludgeoning"].includes(type.value);
				});
			}
		},
		watch: {
			weapon: {
				deep: true,
				handler(newVal) {
					this.$emit('input', newVal);
				}
			}
		},
		methods: {
			
		},
	}
</script>

<style lang="scss" scoped>
	
</style>