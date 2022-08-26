<template>
	<div class="weapon">
		<div class="mb-2">
			<i 
				class="mr-1"
				:class="{
					'fas fa-check green': proficient,
					'fas fa-times red': !proficient
				}"
				aria-hidden="true"
			>
				<q-tooltip anchor="top middle" self="bottom middle">
					{{ proficient ? "Proficient" : "Not proficient" }}
				</q-tooltip>
			</i>
			{{ title }}
		</div>
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
		>
			<template v-slot:append>
				<q-icon name="info" class="pointer blue">
					<q-menu square anchor="top middle" self="bottom middle" max-width="250px">
						<q-card dark square>
							<q-card-section class="bg-gray-active">
								<strong>Dexterity maximum</strong>
							</q-card-section>

							<q-card-section>
								What ability does your character use to wield this weapon?<br/>
								The modifier of this ability will be added to both the to hit and the damage roll.
							</q-card-section>
						</q-card>
					</q-menu>
				</q-icon>
			</template>
		</q-select>

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
	import { abilities, damage_types } from 'src/utils/generalConstants';

	export default {
		name: 'Weapon',
		props: {
			value: {
				type: Object,
				required: true
			},
			proficient: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				abilities: abilities,
				damage_types: damage_types
			}
		},
		computed: {
			weapon() {
				return this.value;
			},
			title() {
				const type = this.weapon.weapon_type.split("_");
				return `${type[0].capitalize()} ${type[1]} weapon: ${this.weapon.value.replace("_", " ").capitalize()}`
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